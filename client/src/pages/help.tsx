import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Search, FileText, LifeBuoy, Youtube, MessageSquare, Book } from 'lucide-react';

const HelpPage: React.FC = () => {
  const helpCategories = [
    {
      title: 'Getting Started',
      icon: <FileText className="h-6 w-6 text-orange-500" />,
      description: 'Learn the basics of NameWizard.io and how to use our core features.',
      links: [
        { title: 'Quick Start Guide', url: '#' },
        { title: 'Creating Your Account', url: '#' },
        { title: 'Uploading Your First Files', url: '#' },
        { title: 'Understanding AI Renaming', url: '#' },
      ]
    },
    {
      title: 'Video Tutorials',
      icon: <Youtube className="h-6 w-6 text-orange-500" />,
      description: 'Watch step-by-step tutorials on how to use all features of NameWizard.io.',
      links: [
        { title: 'Introduction to NameWizard.io', url: '#' },
        { title: 'Advanced Renaming Techniques', url: '#' },
        { title: 'Batch Processing Tips', url: '#' },
        { title: 'Customizing Your Workflow', url: '#' },
      ]
    },
    {
      title: 'Documentation',
      icon: <Book className="h-6 w-6 text-orange-500" />,
      description: 'Detailed documentation covering all aspects of our platform.',
      links: [
        { title: 'API Reference', url: '#' },
        { title: 'Naming Pattern Guide', url: '#' },
        { title: 'File Format Support', url: '#' },
        { title: 'Troubleshooting', url: '#' },
      ]
    },
    {
      title: 'Contact Support',
      icon: <MessageSquare className="h-6 w-6 text-orange-500" />,
      description: 'Need personalized help? Our support team is ready to assist you.',
      links: [
        { title: 'Submit a Ticket', url: '#' },
        { title: 'Live Chat', url: '#' },
        { title: 'Email Support', url: '#' },
        { title: 'Request a Feature', url: '#' },
      ]
    },
  ];

  const faqItems = [
    {
      question: 'What file formats does NameWizard.io support?',
      answer: 'NameWizard.io supports a wide range of file formats including PDF, DOCX, JPG, PNG, TIFF, MP3, MP4, and many more. Our AI can analyze the content of all these types to provide intelligent renaming suggestions.'
    },
    {
      question: 'How does the AI renaming actually work?',
      answer: 'Our AI uses advanced machine learning algorithms including Optical Character Recognition (OCR) to extract text and understand the content of your files. It identifies key information such as dates, names, topics, and other relevant data to generate meaningful file names that accurately reflect the content.'
    },
    {
      question: 'Is my data secure when using NameWizard.io?',
      answer: 'Yes, security is our top priority. All uploads are encrypted using TLS/SSL, and we process files on secure servers. We don\'t store your files after processing unless you specifically opt to save them to your account. You can review our privacy policy for more detailed information.'
    },
    {
      question: 'Can I customize how the AI names my files?',
      answer: 'Absolutely! While our AI offers intelligent suggestions by default, you can customize the naming patterns to fit your specific needs. You can define patterns using elements like dates, content keywords, categories, and sequential numbering.'
    },
    {
      question: 'How many files can I rename at once?',
      answer: 'The number of files you can process at once depends on your subscription plan. Free users can batch process up to 50 files per month, Pro users can process up to 1,000 files per month, and Enterprise users have unlimited file processing.'
    },
  ];

  return (
    <MainLayout>
      <div className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How Can We Help You?</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Find answers to common questions, learn about our features, or get in touch with our support team.
          </p>

          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="text"
                className="bg-zinc-900 border border-zinc-700 w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Search for help articles..."
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-12">
          {helpCategories.map((category) => (
            <div key={category.title} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                {category.icon}
                <h2 className="text-xl font-medium ml-3">{category.title}</h2>
              </div>
              <p className="text-zinc-400 mb-4">
                {category.description}
              </p>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.title}>
                    <a href={link.url} className="text-orange-500 hover:text-orange-400 flex items-center">
                      <span className="mr-2">→</span>
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <LifeBuoy className="h-6 w-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-zinc-800 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-medium mb-2">{item.question}</h3>
                <p className="text-zinc-400">{item.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-zinc-400 mb-4">
              Didn't find what you're looking for? Get in touch with our support team.
            </p>
            <a 
              href="#" 
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpPage;