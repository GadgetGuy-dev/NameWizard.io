import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

// Define theme options
export const themeOptions = [
  { name: "Black & Orange", value: "black-orange", primary: "#ff7e33" },
  { name: "Dark", value: "dark", primary: "#6366f1" },
  { name: "Light", value: "light", primary: "#3b82f6" },
  { name: "Black & Blue", value: "black-blue", primary: "#3b82f6" },
  { name: "Black & Red", value: "black-red", primary: "#ef4444" },
  { name: "Blue & Black", value: "blue-black", primary: "#1d4ed8" },
  { name: "White & Dark Blue", value: "white-darkblue", primary: "#1e40af" },
];

export default function ThemeChanger() {
  const { currentTheme, changeTheme } = useTheme();

  const handleThemeChange = (theme: string) => {
    changeTheme(theme);
  };

  // Find the current theme object
  const activeTheme = themeOptions.find((theme) => theme.value === currentTheme) || themeOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: activeTheme.primary }}
            ></div>
            <span>{activeTheme.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {themeOptions.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: theme.primary }}
                ></div>
                <span>{theme.name}</span>
              </div>
              {currentTheme === theme.value && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}