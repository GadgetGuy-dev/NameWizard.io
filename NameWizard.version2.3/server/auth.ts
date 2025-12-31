import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import bcrypt from "bcryptjs";

// Adding User type to Express namespace
declare global {
  namespace Express {
    // Extend the User interface with our User type
    interface User {
      id: number;
      username: string;
      email: string;
      password: string;
      fullName?: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Initialize PostgreSQL session store
  const PostgresStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'namewizard-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: new PostgresStore({
      pool,
      tableName: 'session',
      createTableIfMissing: false // Don't create table as it already exists
    })
  };

  // Set trust proxy when in production
  if (process.env.NODE_ENV === 'production') {
    app.set("trust proxy", 1);
  }
  
  // Set up session middleware
  app.use(session(sessionSettings));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Try to find user by username
        let user = await storage.getUserByUsername(username);
        
        // If not found by username, try by email
        if (!user && username.includes('@')) {
          user = await storage.getUserByEmail(username);
        }
        
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user into the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Authentication routes
  
  // Register route
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, fullName } = req.body;
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        fullName,
        role: "user"
      });
      
      // Login the user
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      
      req.login(user, (err: Error | null) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err: Error | null) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user route
  app.get("/api/user", authenticateUser, (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });

  return { authenticateUser };
}