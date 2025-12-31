import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { themeOptions } from "@/components/theme/ThemeChanger";

type ThemeContextType = {
  currentTheme: string;
  changeTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState("black-orange");

  // Initialize theme from localStorage when component mounts
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme-preference") || "black-orange";
    setCurrentTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  // Apply theme to document
  const applyTheme = (theme: string) => {
    // Remove all theme classes from HTML element
    document.documentElement.classList.remove(
      "theme-black-orange",
      "theme-dark",
      "theme-light",
      "theme-black-blue",
      "theme-black-red",
      "theme-blue-black",
      "theme-white-darkblue"
    );

    // Add the selected theme class
    document.documentElement.classList.add(`theme-${theme}`);

    // Store preference
    localStorage.setItem("theme-preference", theme);

    // Get the selected theme object from theme options
    const selectedTheme = themeOptions.find((t) => t.value === theme);
    
    if (selectedTheme) {
      // Apply CSS variables directly based on theme selection
      document.documentElement.style.setProperty("--primary", selectedTheme.primary);
      
      // Set additional theme colors based on selection
      if (theme === "black-orange") {
        document.documentElement.style.setProperty("--background", "0 0% 0%");
        document.documentElement.style.setProperty("--foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--primary", "24.6 100% 60%");
        document.documentElement.style.setProperty("--primary-foreground", "0 0% 0%");
        document.documentElement.style.setProperty("--card", "0 0% 6%");
        document.documentElement.style.setProperty("--card-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--popover", "0 0% 6%");
        document.documentElement.style.setProperty("--popover-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--secondary", "0 0% 10%");
        document.documentElement.style.setProperty("--secondary-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--muted", "0 0% 15%");
        document.documentElement.style.setProperty("--muted-foreground", "0 0% 65%");
        document.documentElement.style.setProperty("--accent", "24.6 100% 60%");
        document.documentElement.style.setProperty("--accent-foreground", "0 0% 0%");
        document.documentElement.style.setProperty("--border", "0 0% 15%");
        document.documentElement.style.setProperty("--input", "0 0% 15%");
        document.documentElement.style.setProperty("--ring", "24.6 100% 60%");
      } else if (theme === "dark") {
        document.documentElement.style.setProperty("--background", "240 10% 3.9%");
        document.documentElement.style.setProperty("--foreground", "0 0% 98%");
        document.documentElement.style.setProperty("--card", "240 10% 6%");
        document.documentElement.style.setProperty("--card-foreground", "0 0% 98%");
        document.documentElement.style.setProperty("--popover", "240 10% 3.9%");
        document.documentElement.style.setProperty("--popover-foreground", "0 0% 98%");
        document.documentElement.style.setProperty("--primary", "250 95% 65%");
        document.documentElement.style.setProperty("--primary-foreground", "0 0% 98%");
        document.documentElement.style.setProperty("--secondary", "240 3.7% 15.9%");
        document.documentElement.style.setProperty("--secondary-foreground", "0 0% 98%");
        document.documentElement.style.setProperty("--muted", "240 3.7% 15.9%");
        document.documentElement.style.setProperty("--muted-foreground", "240 5% 64.9%");
        document.documentElement.style.setProperty("--accent", "240 3.7% 15.9%");
        document.documentElement.style.setProperty("--accent-foreground", "0 0% 98%");
        document.documentElement.style.setProperty("--border", "240 3.7% 15.9%");
        document.documentElement.style.setProperty("--input", "240 3.7% 15.9%");
        document.documentElement.style.setProperty("--ring", "250 95% 65%");
      } else if (theme === "light") {
        document.documentElement.style.setProperty("--background", "0 0% 100%");
        document.documentElement.style.setProperty("--foreground", "240 10% 3.9%");
        document.documentElement.style.setProperty("--card", "0 0% 98%");
        document.documentElement.style.setProperty("--card-foreground", "240 10% 3.9%");
        document.documentElement.style.setProperty("--popover", "0 0% 100%");
        document.documentElement.style.setProperty("--popover-foreground", "240 10% 3.9%");
        document.documentElement.style.setProperty("--primary", "217 91% 60%");
        document.documentElement.style.setProperty("--primary-foreground", "0 0% 98%");
        document.documentElement.style.setProperty("--secondary", "240 4.8% 95.9%");
        document.documentElement.style.setProperty("--secondary-foreground", "240 5.9% 10%");
        document.documentElement.style.setProperty("--muted", "240 4.8% 95.9%");
        document.documentElement.style.setProperty("--muted-foreground", "240 3.8% 46.1%");
        document.documentElement.style.setProperty("--accent", "240 4.8% 95.9%");
        document.documentElement.style.setProperty("--accent-foreground", "240 5.9% 10%");
        document.documentElement.style.setProperty("--border", "240 5.9% 90%");
        document.documentElement.style.setProperty("--input", "240 5.9% 90%");
        document.documentElement.style.setProperty("--ring", "217 91% 60%");
      } else if (theme === "black-blue") {
        document.documentElement.style.setProperty("--background", "0 0% 0%");
        document.documentElement.style.setProperty("--foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--card", "0 0% 6%");
        document.documentElement.style.setProperty("--card-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--popover", "0 0% 6%");
        document.documentElement.style.setProperty("--popover-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--primary", "217 91% 60%");
        document.documentElement.style.setProperty("--primary-foreground", "0 0% 0%");
        document.documentElement.style.setProperty("--secondary", "0 0% 10%");
        document.documentElement.style.setProperty("--secondary-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--muted", "0 0% 15%");
        document.documentElement.style.setProperty("--muted-foreground", "0 0% 65%");
        document.documentElement.style.setProperty("--accent", "217 91% 60%");
        document.documentElement.style.setProperty("--accent-foreground", "0 0% 0%");
        document.documentElement.style.setProperty("--border", "0 0% 15%");
        document.documentElement.style.setProperty("--input", "0 0% 15%");
        document.documentElement.style.setProperty("--ring", "217 91% 60%");
      } else if (theme === "black-red") {
        document.documentElement.style.setProperty("--background", "0 0% 0%");
        document.documentElement.style.setProperty("--foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--card", "0 0% 6%");
        document.documentElement.style.setProperty("--card-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--popover", "0 0% 6%");
        document.documentElement.style.setProperty("--popover-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--primary", "0 84% 60%");
        document.documentElement.style.setProperty("--primary-foreground", "0 0% 0%");
        document.documentElement.style.setProperty("--secondary", "0 0% 10%");
        document.documentElement.style.setProperty("--secondary-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--muted", "0 0% 15%");
        document.documentElement.style.setProperty("--muted-foreground", "0 0% 65%");
        document.documentElement.style.setProperty("--accent", "0 84% 60%");
        document.documentElement.style.setProperty("--accent-foreground", "0 0% 0%");
        document.documentElement.style.setProperty("--border", "0 0% 15%");
        document.documentElement.style.setProperty("--input", "0 0% 15%");
        document.documentElement.style.setProperty("--ring", "0 84% 60%");
      } else if (theme === "blue-black") {
        document.documentElement.style.setProperty("--background", "224 100% 30%");
        document.documentElement.style.setProperty("--foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--card", "224 100% 35%");
        document.documentElement.style.setProperty("--card-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--popover", "224 100% 35%");
        document.documentElement.style.setProperty("--popover-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--primary", "217 91% 60%");
        document.documentElement.style.setProperty("--primary-foreground", "0 0% 0%");
        document.documentElement.style.setProperty("--secondary", "224 100% 40%");
        document.documentElement.style.setProperty("--secondary-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--muted", "224 100% 40%");
        document.documentElement.style.setProperty("--muted-foreground", "0 0% 80%");
        document.documentElement.style.setProperty("--accent", "217 91% 60%");
        document.documentElement.style.setProperty("--accent-foreground", "0 0% 0%");
        document.documentElement.style.setProperty("--border", "224 100% 40%");
        document.documentElement.style.setProperty("--input", "224 100% 40%");
        document.documentElement.style.setProperty("--ring", "217 91% 60%");
      } else if (theme === "white-darkblue") {
        document.documentElement.style.setProperty("--background", "0 0% 100%");
        document.documentElement.style.setProperty("--foreground", "224 100% 30%");
        document.documentElement.style.setProperty("--card", "0 0% 96%");
        document.documentElement.style.setProperty("--card-foreground", "224 100% 30%");
        document.documentElement.style.setProperty("--popover", "0 0% 96%");
        document.documentElement.style.setProperty("--popover-foreground", "224 100% 30%");
        document.documentElement.style.setProperty("--primary", "224 100% 30%");
        document.documentElement.style.setProperty("--primary-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--secondary", "0 0% 90%");
        document.documentElement.style.setProperty("--secondary-foreground", "224 100% 30%");
        document.documentElement.style.setProperty("--muted", "0 0% 90%");
        document.documentElement.style.setProperty("--muted-foreground", "224 60% 60%");
        document.documentElement.style.setProperty("--accent", "224 100% 30%");
        document.documentElement.style.setProperty("--accent-foreground", "0 0% 100%");
        document.documentElement.style.setProperty("--border", "0 0% 80%");
        document.documentElement.style.setProperty("--input", "0 0% 80%");
        document.documentElement.style.setProperty("--ring", "224 100% 30%");
      }
    }
    
    console.log("Theme updated:", theme);
  };

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};