import { cn } from "@/lib/utils";

interface MascotAvatarProps {
  className?: string;
  variant?: "default" | "thinking" | "excited" | "confused";
}

export function MascotAvatar({ className, variant = "default" }: MascotAvatarProps) {
  // Determine which expression to show based on variant
  const getExpression = () => {
    switch (variant) {
      case "thinking":
        return (
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-12 h-12", className)}>
            <circle cx="30" cy="30" r="29" fill="#FF8A00" stroke="#000000" strokeWidth="2"/>
            <circle cx="22" cy="25" r="3" fill="#000000"/>
            <circle cx="38" cy="25" r="3" fill="#000000"/>
            <path d="M22 40C22 40 26 37 30 37C34 37 38 40 38 40" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
            <path d="M44 20C44 20 48 22 48 26" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "excited":
        return (
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-12 h-12", className)}>
            <circle cx="30" cy="30" r="29" fill="#FF8A00" stroke="#000000" strokeWidth="2"/>
            <circle cx="22" cy="22" r="3" fill="#000000"/>
            <circle cx="38" cy="22" r="3" fill="#000000"/>
            <path d="M22 38C22 38 26 44 30 44C34 44 38 38 38 38" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 15L18 18" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
            <path d="M45 15L42 18" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "confused":
        return (
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-12 h-12", className)}>
            <circle cx="30" cy="30" r="29" fill="#FF8A00" stroke="#000000" strokeWidth="2"/>
            <circle cx="22" cy="25" r="3" fill="#000000"/>
            <circle cx="38" cy="25" r="3" fill="#000000"/>
            <path d="M25 40C25 40 29 38 33 40" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
            <path d="M46 20L41 25" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return (
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-12 h-12", className)}>
            <circle cx="30" cy="30" r="29" fill="#FF8A00" stroke="#000000" strokeWidth="2"/>
            <circle cx="22" cy="25" r="3" fill="#000000"/>
            <circle cx="38" cy="25" r="3" fill="#000000"/>
            <path d="M22 38C22 38 26 42 30 42C34 42 38 38 38 38" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  return getExpression();
}