import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Eye, 
  Mic, 
  Image, 
  Code, 
  FileText, 
  FolderOpen, 
  Zap,
  ChevronLeft,
  CheckCircle,
  Star
} from 'lucide-react';
import { Link } from 'wouter';

const AIFeaturesPage: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'Advanced Text Analysis',
      description: 'AI-powered content analysis for intelligent file naming based on document content, metadata, and context.',
      capabilities: [
        'Document content extraction',
        'Semantic understanding',
        'Context-aware naming',
        'Multi-language support'
      ],
      models: ['GPT-4o', 'Claude Sonnet', 'Gemini Pro'],
      tier: 'Pro'
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: 'OCR & Vision Processing',
      description: 'Extract text from images, PDFs, and scanned documents to create meaningful file names.',
      capabilities: [
        'Text extraction from images',
        'PDF text recognition',
        'Handwriting detection',
        'Multi-format support'
      ],
      models: ['GPT-4o Vision', 'Claude Vision', 'Google Vision'],
      tier: 'Pro'
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: 'Audio Processing',
      description: 'Transcribe audio files and generate descriptive names based on speech content.',
      capabilities: [
        'Speech-to-text conversion',
        'Audio content analysis',
        'Speaker identification',
        'Timestamp extraction'
      ],
      models: ['Whisper', 'Google Speech'],
      tier: 'Enterprise'
    },
    {
      icon: <Image className="h-8 w-8" />,
      title: 'Image Analysis',
      description: 'Analyze image content, objects, and scenes to create descriptive file names.',
      capabilities: [
        'Object detection',
        'Scene recognition',
        'Face detection',
        'Color analysis'
      ],
      models: ['GPT-4o Vision', 'Claude Vision'],
      tier: 'Pro'
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Code Understanding',
      description: 'Analyze code files and generate names based on functionality, language, and purpose.',
      capabilities: [
        'Programming language detection',
        'Function analysis',
        'Dependency mapping',
        'Code quality assessment'
      ],
      models: ['GPT-4o', 'Claude Sonnet', 'Codex'],
      tier: 'Pro'
    },
    {
      icon: <FolderOpen className="h-8 w-8" />,
      title: 'Magic Folders',
      description: 'Automatically organize files into intelligent folder structures based on content analysis.',
      capabilities: [
        'Content-based categorization',
        'Hierarchical organization',
        'Custom folder rules',
        'Batch organization'
      ],
      models: ['GPT-4o', 'Claude Sonnet'],
      tier: 'Pro'
    }
  ];

  const aiModels = [
    {
      name: 'GPT-4o',
      provider: 'OpenAI',
      capabilities: ['Text', 'Vision', 'Code'],
      strengths: 'Excellent reasoning and multimodal understanding',
      contextWindow: '128k tokens'
    },
    {
      name: 'Claude Sonnet',
      provider: 'Anthropic',
      capabilities: ['Text', 'Vision', 'Reasoning'],
      strengths: 'Superior analysis and safety-focused responses',
      contextWindow: '200k tokens'
    },
    {
      name: 'Gemini Pro',
      provider: 'Google',
      capabilities: ['Text', 'Vision', 'Code'],
      strengths: 'Fast processing and multilingual support',
      contextWindow: '1M tokens'
    },
    {
      name: 'Llama 3.2',
      provider: 'Meta',
      capabilities: ['Text', 'Code'],
      strengths: 'Open-source flexibility and customization',
      contextWindow: '128k tokens'
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Free': return 'bg-gray-600';
      case 'Pro': return 'bg-orange-600';
      case 'Enterprise': return 'bg-purple-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <a className="inline-flex items-center text-orange-500 hover:text-orange-400">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </a>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            AI-Powered <span className="text-orange-500">Intelligence</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Discover the advanced AI capabilities that power NameWizard's intelligent file renaming and organization features.
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-orange-500">
                    {feature.icon}
                  </div>
                  <Badge className={`${getTierColor(feature.tier)} text-white`}>
                    {feature.tier}
                  </Badge>
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Capabilities:</h4>
                  <ul className="space-y-1">
                    {feature.capabilities.map((capability, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-300">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">AI Models:</h4>
                  <div className="flex flex-wrap gap-1">
                    {feature.models.map((model, idx) => (
                      <Badge key={idx} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Models Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Supported <span className="text-orange-500">AI Models</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiModels.map((model, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-xl">{model.name}</CardTitle>
                    <Badge variant="outline" className="border-orange-500 text-orange-400">
                      {model.provider}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-400">{model.strengths}</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Capabilities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {model.capabilities.map((capability, idx) => (
                        <Badge key={idx} className="bg-blue-600 text-white text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Context Window:</span>
                    <span className="text-orange-400 font-medium">{model.contextWindow}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Benefits */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">
            Why Choose AI-Powered <span className="text-orange-500">File Management</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Zap className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Process thousands of files in minutes, not hours. AI automation speeds up your workflow dramatically.
              </p>
            </div>
            
            <div className="text-center">
              <Brain className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Intelligent Context</h3>
              <p className="text-gray-400">
                AI understands content meaning, not just file extensions. Get meaningful, descriptive names automatically.
              </p>
            </div>
            
            <div className="text-center">
              <Star className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Continuously Learning</h3>
              <p className="text-gray-400">
                Our AI models improve over time, learning from patterns to provide better suggestions and organization.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Link href="/pricing">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg">
                Explore Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesPage;