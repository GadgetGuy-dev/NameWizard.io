import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Wand2, Play, Lightbulb, Activity, Loader2 } from 'lucide-react';

interface UIFeature {
  id: string;
  name: string;
  active: boolean;
}

const UIFeaturesSection: React.FC = () => {
  const [showFeatures, setShowFeatures] = useState(true);
  const [features, setFeatures] = useState<UIFeature[]>([
    {
      id: 'theme-customization',
      name: 'One-Click Theme Customization Wizard',
      active: true
    },
    {
      id: 'onboarding-tour',
      name: 'Playful Onboarding Tour with Character Interactions',
      active: true
    },
    {
      id: 'micro-animations',
      name: 'Contextual Micro-Animations for User Feedback',
      active: true
    },
    {
      id: 'progress-indicators',
      name: 'Interactive Progress Indicators for File Operations',
      active: true
    },
    {
      id: 'loading-splash',
      name: 'Animated Loading Splash Screen with Brand Mascot',
      active: true
    }
  ]);

  const toggleFeature = (id: string) => {
    setFeatures(features.map(feature => 
      feature.id === id 
        ? { ...feature, active: !feature.active } 
        : feature
    ));
  };

  const getIconForFeature = (id: string) => {
    switch (id) {
      case 'theme-customization':
        return <Wand2 className="h-4 w-4" />;
      case 'onboarding-tour':
        return <Play className="h-4 w-4" />;
      case 'micro-animations':
        return <Lightbulb className="h-4 w-4" />;
      case 'progress-indicators':
        return <Activity className="h-4 w-4" />;
      case 'loading-splash':
        return <Loader2 className="h-4 w-4" />;
      default:
        return <Wand2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="mt-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <button 
          className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 text-sm font-medium"
          onClick={() => setShowFeatures(!showFeatures)}
        >
          <span>UI & Experience Features</span>
          {showFeatures ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {showFeatures && (
          <div className="p-4">
            <div className="grid grid-cols-1 gap-2">
              {features.map(feature => (
                <div 
                  key={feature.id}
                  className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-md hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="mr-3 text-orange-500">
                      {getIconForFeature(feature.id)}
                    </div>
                    <span className="text-sm">{feature.name}</span>
                  </div>
                  
                  <button
                    onClick={() => toggleFeature(feature.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      feature.active ? 'bg-orange-500' : 'bg-zinc-700'
                    }`}
                    aria-label={feature.active ? `Disable ${feature.name}` : `Enable ${feature.name}`}
                  >
                    <span 
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        feature.active ? 'transform translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UIFeaturesSection;