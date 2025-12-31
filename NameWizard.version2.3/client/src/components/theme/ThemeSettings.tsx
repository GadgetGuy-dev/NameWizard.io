import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeChanger, { themeOptions } from "./ThemeChanger";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ThemeSettings() {
  const [currentTheme, setCurrentTheme] = useState("black-orange");
  const { toast } = useToast();
  
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme-preference") || "black-orange";
    setCurrentTheme(storedTheme);
  }, []);
  
  const resetToDefault = () => {
    // Apply default theme (Black & Orange)
    document.documentElement.classList.remove(
      "theme-black-orange", 
      "theme-dark", 
      "theme-light", 
      "theme-black-blue", 
      "theme-black-red", 
      "theme-blue-black", 
      "theme-white-darkblue"
    );
    document.documentElement.classList.add("theme-black-orange");
    
    // Store preference
    localStorage.setItem("theme-preference", "black-orange");
    setCurrentTheme("black-orange");
    
    // Apply CSS variables
    const defaultTheme = themeOptions.find(t => t.value === "black-orange");
    if (defaultTheme) {
      document.documentElement.style.setProperty("--primary", defaultTheme.primary);
    }
    
    toast({
      title: "Theme Reset",
      description: "Your theme has been reset to the default (Black & Orange)",
    });
  };
  
  // Find active theme
  const activeTheme = themeOptions.find(theme => theme.value === currentTheme) || themeOptions[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>Customize the application appearance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="themes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="themes" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-medium">Select Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from predefined themes to customize the application appearance
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetToDefault}
                  className="h-8 gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
              <ThemeChanger />
            </div>
            
            <div className="border rounded-md p-4 mt-6">
              <h3 className="text-base font-medium mb-2">Current Theme: {activeTheme.name}</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <div 
                    className="w-full h-16 rounded-md" 
                    style={{ background: activeTheme.primary }}
                  />
                  <p className="text-xs text-center">Primary</p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full h-16 rounded-md bg-background border" />
                  <p className="text-xs text-center">Background</p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full h-16 rounded-md bg-card border" />
                  <p className="text-xs text-center">Card</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="border rounded-md p-4">
              <h3 className="text-xl font-bold mb-4">UI Component Preview</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="default">Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                
                <div className="bg-card p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Card Example</h4>
                  <p className="text-sm text-muted-foreground">
                    This is how content will appear in card components with the selected theme.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  <div className="w-4 h-4 rounded-full bg-secondary"></div>
                  <div className="w-4 h-4 rounded-full bg-accent"></div>
                  <div className="w-4 h-4 rounded-full bg-muted"></div>
                  <div className="w-4 h-4 rounded-full bg-destructive"></div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}