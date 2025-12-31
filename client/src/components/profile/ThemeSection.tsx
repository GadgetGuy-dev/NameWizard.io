import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Paintbrush, 
  Moon, 
  Sun, 
  Monitor, 
  Sliders, 
  Check, 
  Circle, 
  ChevronsUpDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ThemeSection: React.FC = () => {
  const { toast } = useToast();
  const [activeTheme, setActiveTheme] = useState('professional');
  const [appearance, setAppearance] = useState('dark');
  const [primaryColor, setPrimaryColor] = useState('#ff5500'); // Orange
  const [radius, setRadius] = useState(8);
  const [themeTab, setThemeTab] = useState('theme');
  
  const colorOptions = [
    { name: 'Orange', value: '#ff5500' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Teal', value: '#14b8a6' },
  ];
  
  const themeOptions = [
    { 
      id: 'professional', 
      name: 'Professional', 
      description: 'Clean, corporate look with less contrast'
    },
    { 
      id: 'tint', 
      name: 'Tint', 
      description: 'Soft, colored backgrounds and modals'
    },
    { 
      id: 'vibrant', 
      name: 'Vibrant', 
      description: 'Bold colors with high contrast'
    },
  ];
  
  const saveTheme = () => {
    // In a real app, this would call an API to save the theme

    toast({
      title: "Theme updated",
      description: "Your theme settings have been saved",
      variant: "default",
    });
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Theme Settings</h2>
        <p className="text-zinc-400 text-sm">Customize the appearance of the application</p>
      </div>

      <div className="mb-6">
        <Tabs 
          defaultValue={themeTab} 
          value={themeTab} 
          onValueChange={setThemeTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-[400px] mb-6">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="theme">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {themeOptions.map(theme => (
                <div 
                  key={theme.id}
                  className={`bg-zinc-950 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                    activeTheme === theme.id 
                      ? 'border-orange-500 ring-2 ring-orange-500/20' 
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                  onClick={() => setActiveTheme(theme.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{theme.name}</h3>
                      <p className="text-zinc-400 text-sm">{theme.description}</p>
                    </div>
                    {activeTheme === theme.id && (
                      <div className="bg-orange-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Theme preview */}
                  <div 
                    className={`h-24 rounded mt-2 overflow-hidden flex flex-col ${
                      theme.id === 'professional' 
                        ? 'bg-zinc-900' 
                        : theme.id === 'tint' 
                          ? `bg-orange-950/30` 
                          : `bg-zinc-950`
                    }`}
                  >
                    <div className={`p-2 ${theme.id === 'vibrant' ? 'bg-orange-500 mb-1' : 'bg-transparent'}`}>
                      <div className="w-24 h-2 bg-zinc-700 rounded-full" />
                    </div>
                    <div className="flex-1 p-2 flex gap-2">
                      <div className="w-12 h-12 rounded bg-zinc-800" />
                      <div>
                        <div className="w-20 h-2 bg-zinc-700 rounded-full mb-1" />
                        <div className="w-16 h-2 bg-zinc-800 rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-end p-2">
                      <div className={`rounded-full w-6 h-6 ${
                        theme.id === 'vibrant' 
                          ? 'bg-orange-500' 
                          : theme.id === 'tint' 
                            ? 'bg-orange-400/80' 
                            : 'bg-orange-600/90'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800">
                <Label className="block mb-3">Appearance</Label>
                <RadioGroup 
                  value={appearance} 
                  onValueChange={setAppearance}
                  className="grid grid-cols-3 gap-2"
                >
                  <div>
                    <RadioGroupItem 
                      value="light" 
                      id="light-mode" 
                      className="sr-only peer" 
                    />
                    <Label
                      htmlFor="light-mode"
                      className="flex flex-col items-center justify-between p-4 rounded-md border-2 border-zinc-800 hover:border-zinc-700 peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:ring-2 [&:has([data-state=checked])]:ring-orange-500/20 cursor-pointer"
                    >
                      <Sun className="mb-2 h-5 w-5" />
                      <span>Light</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="dark" 
                      id="dark-mode" 
                      className="sr-only peer" 
                    />
                    <Label
                      htmlFor="dark-mode"
                      className="flex flex-col items-center justify-between p-4 rounded-md border-2 border-zinc-800 hover:border-zinc-700 peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:ring-2 [&:has([data-state=checked])]:ring-orange-500/20 cursor-pointer"
                    >
                      <Moon className="mb-2 h-5 w-5" />
                      <span>Dark</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="system" 
                      id="system-mode" 
                      className="sr-only peer" 
                    />
                    <Label
                      htmlFor="system-mode"
                      className="flex flex-col items-center justify-between p-4 rounded-md border-2 border-zinc-800 hover:border-zinc-700 peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:ring-2 [&:has([data-state=checked])]:ring-orange-500/20 cursor-pointer"
                    >
                      <Monitor className="mb-2 h-5 w-5" />
                      <span>System</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800">
                <Label className="block mb-3">Primary Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      className={`relative rounded-md p-1 cursor-pointer ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                        primaryColor === color.value 
                          ? 'ring-2 ring-orange-500/50' 
                          : ''
                      }`}
                      onClick={() => setPrimaryColor(color.value)}
                      style={{ 
                        backgroundColor: color.value,
                      }}
                      title={color.name}
                    >
                      {primaryColor === color.value && (
                        <Check className="h-4 w-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                      )}
                      <span className="sr-only">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800 mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Sliders className="w-5 h-5 mr-2" />
                Advanced Customization
              </h3>
              
              <div className="mb-6">
                <Label className="mb-2 block">Border Radius</Label>
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-zinc-400">0</span>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="1"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-zinc-400">16</span>
                </div>
                
                <div className="flex justify-between mt-2">
                  <div className="flex gap-2 items-center">
                    <div 
                      className="w-8 h-8 bg-zinc-800 border border-zinc-700"
                      style={{ borderRadius: '0px' }}
                    />
                    <span className="text-xs text-zinc-400">Square</span>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <div 
                      className="w-8 h-8 bg-zinc-800 border border-zinc-700"
                      style={{ borderRadius: `${radius}px` }}
                    />
                    <span className="text-xs text-zinc-400">{radius}px</span>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <div 
                      className="w-8 h-8 bg-zinc-800 border border-zinc-700"
                      style={{ borderRadius: '9999px' }}
                    />
                    <span className="text-xs text-zinc-400">Round</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <Label className="mb-2 block">Typography</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900 rounded-md p-4 border border-zinc-800">
                    <h4 className="font-medium mb-1">Headings</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-zinc-400 text-xs">
                        <span>Font Family</span>
                        <span>Inter</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400 text-xs">
                        <span>Weight</span>
                        <span>600-700</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400 text-xs">
                        <span>Line Height</span>
                        <span>1.2</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900 rounded-md p-4 border border-zinc-800">
                    <h4 className="font-medium mb-1">Body Text</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-zinc-400 text-xs">
                        <span>Font Family</span>
                        <span>Inter</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400 text-xs">
                        <span>Weight</span>
                        <span>400-500</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400 text-xs">
                        <span>Line Height</span>
                        <span>1.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Animations & Effects</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-md border border-zinc-800">
                    <span>Enable transitions</span>
                    <div 
                      role="checkbox" 
                      aria-checked="true"
                      className="relative h-5 w-9 cursor-pointer rounded-full bg-orange-500 transition-colors data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-zinc-700"
                      data-state="checked"
                    >
                      <span 
                        className="block h-4 w-4 rounded-full bg-white transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 absolute top-[2px] left-[2px]" 
                        data-state="checked"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-md border border-zinc-800">
                    <span>Reduce motion</span>
                    <div 
                      role="checkbox" 
                      aria-checked="false"
                      className="relative h-5 w-9 cursor-pointer rounded-full bg-zinc-700 transition-colors data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-zinc-700"
                      data-state="unchecked"
                    >
                      <span 
                        className="block h-4 w-4 rounded-full bg-white transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 absolute top-[2px] left-[2px]" 
                        data-state="unchecked"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800">
              <h3 className="text-lg font-bold mb-4">Theme Export/Import</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  Export Theme JSON
                </Button>
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  Import Theme
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800 mb-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Paintbrush className="w-5 h-5 mr-2" />
          Preview
        </h3>
        
        <div className={`rounded-lg border border-zinc-800 overflow-hidden ${
          activeTheme === 'professional' 
            ? 'bg-zinc-900' 
            : activeTheme === 'tint' 
              ? `bg-opacity-30 bg-blend-multiply` 
              : `bg-zinc-950`
        }`}
          style={{
            backgroundColor: activeTheme === 'tint' ? `${primaryColor}33` : undefined,
            borderRadius: `${radius}px`,
          }}
        >
          <div className={`p-4 ${activeTheme === 'vibrant' ? `text-white` : ''}`}
            style={{
              backgroundColor: activeTheme === 'vibrant' ? primaryColor : undefined,
            }}
          >
            <h3 className="text-lg font-semibold mb-1">Theme Preview</h3>
            <p className="text-sm opacity-80">This is how your theme will look</p>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div 
                  className={`w-24 h-8 flex items-center justify-center text-sm`}
                  style={{
                    backgroundColor: primaryColor,
                    color: '#fff',
                    borderRadius: `${radius}px`,
                  }}
                >
                  Primary
                </div>
                
                <div 
                  className="w-24 h-8 bg-zinc-800 flex items-center justify-center text-sm"
                  style={{
                    borderRadius: `${radius}px`,
                  }}
                >
                  Secondary
                </div>
              </div>
              
              <div className="flex gap-2">
                <div 
                  className="h-8 w-8 flex items-center justify-center"
                  style={{
                    backgroundColor: primaryColor,
                    color: '#fff',
                    borderRadius: '9999px',
                  }}
                >
                  <Check className="h-4 w-4" />
                </div>
                
                <div 
                  className="h-8 w-8 flex items-center justify-center bg-zinc-800"
                  style={{
                    borderRadius: '9999px',
                  }}
                >
                  <Circle className="h-4 w-4" />
                </div>
              </div>
              
              <div 
                className="border border-zinc-800 p-2 flex items-center justify-between"
                style={{
                  borderRadius: `${radius}px`,
                }}
              >
                <span>Dropdown</span>
                <ChevronsUpDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={saveTheme}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Save Theme Settings
        </Button>
      </div>
    </div>
  );
};

export default ThemeSection;