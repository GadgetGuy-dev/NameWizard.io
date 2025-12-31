import React from 'react';
import { UserIcon, UploadIcon, AnalyzeIcon, IntelligentIcon, MultilingualIcon, EfficiencyIcon, DownloadIcon, LockIcon } from '@/components/icons';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: 'Create an Account',
      icon: <UserIcon className="h-6 w-6" />,
      description: 'Sign up for a free account to get started. Premium accounts get access to advanced features like AI-powered renaming and batch processing.',
      isPremium: false,
    },
    {
      id: 2,
      title: 'Upload your files',
      icon: <UploadIcon className="h-6 w-6" />,
      description: 'Simply drag and drop your files (PDF, Doc, Docx, ODT, RTF, Txt, JPG, JPEG, PNG, PPT, etc.) into the demo box. NameWizard.io accepts a wide range of file formats, so you can organize all your documents, images, presentations, and more.',
      isPremium: false,
    },
    {
      id: 3,
      title: 'Manage Your File Selection',
      icon: <AnalyzeIcon className="h-6 w-6" />,
      description: 'Use checkboxes to select multiple files for batch operations. Remove individual files with the delete button, or use \'Delete Selected\' to remove multiple files at once. All changes are previewed before renaming.',
      isPremium: false,
    },
    {
      id: 4,
      title: 'AI Analyzes the Content',
      icon: <AnalyzeIcon className="h-6 w-6" />,
      description: 'Our powerful AI engine goes to work, using advanced techniques like Optical Character Recognition (OCR) to extract text and understand the context of your files. It identifies key information like dates, names, titles, and keywords to determine the most relevant and descriptive file names.',
      isPremium: true,
    },
    {
      id: 5,
      title: 'Intelligent Renaming',
      icon: <IntelligentIcon className="h-6 w-6" />,
      description: 'Based on its analysis, NameWizard.io generates new file names that are clear, concise, and consistent. We utilize intelligent patterns and conventions to ensure your files are perfectly organized and easy to find.',
      isPremium: true,
    },
    {
      id: 6,
      title: 'Multilingual Support',
      icon: <MultilingualIcon className="h-6 w-6" />,
      description: 'NameWizard.io understands and processes text in multiple languages, making it a truly global solution for file organization.',
      isPremium: true,
    },
    {
      id: 7,
      title: 'Fine-tuned for Efficiency',
      icon: <EfficiencyIcon className="h-6 w-6" />,
      description: 'Our AI models are trained on a massive dataset of files and continuously refined to ensure optimal performance. You can trust NameWizard.io to deliver the best possible results for your file management needs.',
      isPremium: true,
    },
    {
      id: 8,
      title: 'Download and Enjoy!',
      icon: <DownloadIcon className="h-6 w-6" />,
      description: 'Once the renaming process is complete, simply download your perfectly organized files and experience the joy of effortless file management.',
      isPremium: false,
    },
  ];

  return (
    <div className="mt-20">
      <h2 className="text-orange-500 text-3xl font-bold text-center mb-12">How NameWizard.io Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div key={step.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative">
            <div className="absolute top-4 right-4">
              {step.isPremium && (
                <div className="bg-zinc-800 p-1 rounded-md">
                  <LockIcon className="h-4 w-4 text-orange-500" />
                </div>
              )}
            </div>
            
            <div className="bg-orange-500 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold mb-4">
              {step.id}
            </div>
            
            <div className="flex items-center mb-3">
              <div className="text-orange-500 mr-2">
                {step.icon}
              </div>
              <h3 className="font-semibold">{step.title}</h3>
            </div>
            
            <p className="text-zinc-400 text-sm">
              {step.description}
            </p>
            
            <div className="mt-4 flex justify-between">
              <a href="#" className="text-orange-500 text-sm hover:text-orange-400">
                View Details
              </a>
              
              {step.isPremium && (
                <button className="bg-transparent border border-orange-500 text-orange-500 hover:bg-orange-500/10 px-3 py-1 rounded-md text-xs transition-colors duration-200">
                  Upgrade
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorksSection;