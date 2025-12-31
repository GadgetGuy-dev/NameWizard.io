import React, { useState } from 'react';
import { 
  BrainIcon, 
  BeachIcon, 
  MountainIcon,
  CityIcon,
  DocumentIcon,
  PresentationIcon,
  SpreadsheetIcon,
  WorkIcon,
  PersonalIcon,
  AddIcon,
  ImageIcon,
  VacationIcon,
  AutoOrganizeIcon
} from '@/components/icons';
import { Info, Check } from 'lucide-react';

interface ContentBasedCategorizationProps {
  onOrganize: () => void;
}

type CategoryTab = 'available' | 'categorized';

interface CategoryOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  patterns: number;
}

const ContentBasedCategorization: React.FC<ContentBasedCategorizationProps> = ({ onOrganize }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<CategoryTab>('available');

  const photoCategories: CategoryOption[] = [
    {
      id: 'images',
      name: 'Images',
      icon: <ImageIcon className="w-5 h-5 text-orange-500" />,
      description: 'Photos, digital art, and other image files',
      patterns: 13
    },
    {
      id: 'vacation',
      name: 'Vacation Photos',
      icon: <VacationIcon className="w-5 h-5 text-orange-500" />,
      description: 'Travel and vacation imagery from your adventures',
      patterns: 15
    },
    {
      id: 'beach',
      name: 'Beach',
      icon: <BeachIcon className="w-5 h-5 text-orange-500" />,
      description: 'Beach and coastal imagery',
      patterns: 17
    },
    {
      id: 'mountains',
      name: 'Mountains',
      icon: <MountainIcon className="w-5 h-5 text-orange-500" />,
      description: 'Mountain scenes and outdoor adventures',
      patterns: 18
    },
    {
      id: 'city',
      name: 'City',
      icon: <CityIcon className="w-5 h-5 text-orange-500" />,
      description: 'Urban landscapes and city views',
      patterns: 16
    }
  ];

  const documentCategories: CategoryOption[] = [
    {
      id: 'documents',
      name: 'Documents',
      icon: <DocumentIcon className="w-5 h-5 text-orange-500" />,
      description: 'Business and personal documents, contracts, and notes',
      patterns: 13
    },
    {
      id: 'presentations',
      name: 'Presentations',
      icon: <PresentationIcon className="w-5 h-5 text-orange-500" />,
      description: 'Slideshow presentations and pitch decks',
      patterns: 13
    },
    {
      id: 'spreadsheets',
      name: 'Spreadsheets',
      icon: <SpreadsheetIcon className="w-5 h-5 text-orange-500" />,
      description: 'Financial data, tables, and analysis reports',
      patterns: 15
    }
  ];

  const organizationCategories: CategoryOption[] = [
    {
      id: 'work',
      name: 'Work',
      icon: <WorkIcon className="w-5 h-5 text-orange-500" />,
      description: 'Work-related files and business materials',
      patterns: 16
    },
    {
      id: 'personal',
      name: 'Personal',
      icon: <PersonalIcon className="w-5 h-5 text-orange-500" />,
      description: 'Personal files and family-related documents',
      patterns: 15
    }
  ];

  const handleToggleEnabled = () => {
    setIsEnabled(!isEnabled);
  };

  // Render category section
  const renderCategorySection = (title: string, categories: CategoryOption[]) => (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="space-y-2">
        {categories.map(category => (
          <div key={category.id} className="bg-zinc-800 rounded-lg p-3 transition-colors hover:bg-zinc-700 cursor-pointer">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                {category.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h4 className="font-medium">{category.name}</h4>
                  <span className="text-zinc-400 text-xs">{category.patterns} patterns</span>
                </div>
                <p className="text-zinc-400 text-xs">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mt-8 relative">
      {/* Info button */}
      <div className="absolute top-5 right-5">
        <button className="text-zinc-400 hover:text-white transition-colors">
          <Info className="h-5 w-5" />
        </button>
      </div>

      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <DocumentIcon className="w-5 h-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-orange-500">Content-Based Categorization</h2>
        </div>
        
        <div className="flex items-center">
          <span className="text-zinc-400 mr-2 text-sm">{isEnabled ? 'Enabled' : 'Disabled'}</span>
          <button 
            className={`relative w-10 h-5 rounded-full transition-colors ${isEnabled ? 'bg-orange-500' : 'bg-zinc-700'}`}
            onClick={handleToggleEnabled}
          >
            <span 
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                isEnabled ? 'transform translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-zinc-400 text-sm mb-5">
        AI-powered auto-sorting organizes files into relevant folders using content analysis — perfect for vacation photos (beach/mountains/city) and more!
      </p>

      {/* Tab navigation */}
      <div className="flex border-b border-zinc-800 mb-4">
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'available' 
              ? 'border-orange-500 text-white' 
              : 'border-transparent text-zinc-500 hover:text-zinc-400'
          }`}
          onClick={() => setActiveTab('available')}
        >
          Available Categories
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'categorized' 
              ? 'border-orange-500 text-white' 
              : 'border-transparent text-zinc-500 hover:text-zinc-400'
          }`}
          onClick={() => setActiveTab('categorized')}
        >
          Categorized Folders
        </button>
      </div>

      {/* Tab content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Categories */}
        <div className="flex-1 md:w-1/2">
          {activeTab === 'available' ? (
            <div className="overflow-y-auto max-h-[60vh]">
              {renderCategorySection('Photo Categories', photoCategories)}
              {renderCategorySection('Document Categories', documentCategories)}
              {renderCategorySection('Organization Categories', organizationCategories)}
              
              {/* Add Custom Category */}
              <div className="mb-6">
                <button className="flex items-center justify-center w-full py-3 border border-dashed border-zinc-700 rounded-lg hover:border-orange-500 text-zinc-400 hover:text-orange-500 transition-colors">
                  <AddIcon className="w-4 h-4 mr-2" />
                  <span>Add Custom Category</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-zinc-400">
              <DocumentIcon className="w-10 h-10 mb-4 text-zinc-700" />
              <p>No folders have been categorized yet.</p>
              <p className="text-sm">Select available categories and organize your files to see them here.</p>
            </div>
          )}
        </div>
        
        {/* Right side - Upload area or empty state */}
        <div className="flex-1 md:w-1/2 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-zinc-800 rounded-full p-5 inline-flex items-center justify-center mb-4">
              <DocumentIcon className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-zinc-400 mb-6">No files uploaded</p>
            <p className="text-zinc-500 text-sm mb-4">Get started by uploading some files first.</p>
            
            <button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center"
              onClick={onOrganize}
              disabled={!isEnabled}
            >
              <AutoOrganizeIcon className="w-4 h-4 mr-2" />
              Auto-Organize Into Folders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentBasedCategorization;