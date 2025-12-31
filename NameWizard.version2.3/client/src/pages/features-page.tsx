import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { 
  FileText, 
  FolderTree, 
  Layers, 
  Bot, 
  Image, 
  File,
  Sparkles, 
  ScanLine, 
  Text, 
  Repeat, 
  Languages, 
  Share2,
  CloudOff,
  Settings
} from 'lucide-react';

const FeaturesPage: React.FC = () => {
  const featureSections = [
    {
      title: "Core Features",
      features: [
        {
          icon: <Sparkles className="w-5 h-5 text-orange-500" />,
          title: "Content-Aware Naming",
          description: "AI analyzes your file contents to suggest relevant names based on content and context."
        },
        {
          icon: <Layers className="w-5 h-5 text-orange-500" />,
          title: "Batch Processing with Smart Grouping",
          description: "Process multiple files simultaneously with intelligent grouping for similar content."
        },
        {
          icon: <FileText className="w-5 h-5 text-orange-500" />,
          title: "Customizable Naming Templates",
          description: "Create and save your own naming patterns for consistent file organization."
        },
        {
          icon: <ScanLine className="w-5 h-5 text-orange-500" />,
          title: "AI-Powered Metadata Extraction",
          description: "Automatically extract and use metadata from files for more accurate naming."
        },
        {
          icon: <Image className="w-5 h-5 text-orange-500" />,
          title: "Image & Document Content Detection",
          description: "Recognize content within images and documents for context-aware naming."
        },
        {
          icon: <File className="w-5 h-5 text-orange-500" />,
          title: "Preview & Approval Workflow",
          description: "Review suggested names before applying changes to maintain control."
        }
      ]
    },
    {
      title: "Intelligence Features",
      features: [
        {
          icon: <CloudOff className="w-5 h-5 text-orange-500" />,
          title: "Local AI Model Support",
          description: "Use locally-hosted AI models for enhanced privacy and offline capabilities."
        },
        {
          icon: <Text className="w-5 h-5 text-orange-500" />,
          title: "Intelligent Case & Format Handling",
          description: "Apply consistent casing and formatting across your files."
        },
        {
          icon: <Languages className="w-5 h-5 text-orange-500" />,
          title: "Multi-Format and Multi-Language Support",
          description: "Works with all file types and supports multiple languages."
        },
        {
          icon: <Repeat className="w-5 h-5 text-orange-500" />,
          title: "Duplicate & Conflict Resolution",
          description: "Automatically detect and resolve naming conflicts and duplicates."
        }
      ]
    },
    {
      title: "Advanced Features",
      features: [
        {
          icon: <FolderTree className="w-5 h-5 text-orange-500" />,
          title: "Magic Folders",
          description: "Set up folders that automatically organize and rename files as they arrive."
        },
        {
          icon: <Bot className="w-5 h-5 text-orange-500" />,
          title: "AI Agents",
          description: "Create specialized agents that handle specific file types or naming conventions."
        },
        {
          icon: <Share2 className="w-5 h-5 text-orange-500" />,
          title: "Cloud Integration",
          description: "Connect to Dropbox, Google Drive, and other cloud storage services."
        },
        {
          icon: <Settings className="w-5 h-5 text-orange-500" />,
          title: "Customizable Workflows",
          description: "Build your own automated workflows for specific document types."
        }
      ]
    }
  ];
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Powerful AI-Driven File Management</h1>
          <p className="text-xl text-gray-300">
            NameWizard.io combines cutting-edge AI with intuitive design to transform how you organize your files.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-12">
          {featureSections.map((section, sectionIndex) => (
            <div key={`section-${sectionIndex}`}>
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">{section.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.features.map((feature, featureIndex) => (
                  <div 
                    key={`feature-${sectionIndex}-${featureIndex}`}
                    className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6 hover:border-orange-500/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-orange-500/10 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-orange-500/20 to-zinc-900/20 backdrop-blur border border-orange-500/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to transform your file organization?</h2>
          <p className="text-lg text-gray-300 mb-6">
            Join thousands of users who save hours every week with NameWizard.io's intelligent renaming technology.
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
            Get Started Today
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default FeaturesPage;