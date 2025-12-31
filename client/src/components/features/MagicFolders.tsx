import { useState } from 'react';
import { Settings, FileArchive, Calendar, FileText, Folder, Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface MagicFolder {
  id: string;
  path: string;
  fileCount: number;
  renamedCount: number;
  isActive: boolean;
}

const MagicFolders = () => {
  const [folders, setFolders] = useState<MagicFolder[]>([
    {
      id: '1',
      path: '/User/Desktop/New folder/Mess/MagicFolder',
      fileCount: 35,
      renamedCount: 15,
      isActive: true
    }
  ]);
  
  const toggleFolderActive = (id: string) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === id ? { ...folder, isActive: !folder.isActive } : folder
      )
    );
  };
  
  return (
    <div className="bg-[#f3f8fb] p-8 rounded-3xl">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white w-16 h-16 rounded-xl mb-4 flex items-center justify-center">
            <Folder className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-1 text-gray-800">Magic Folders</h2>
          <p className="text-gray-600 text-center">Create magic folders to organize files in background mode</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="bg-blue-50 rounded-lg p-2 mb-5">
            <div className="flex items-center font-medium text-blue-900 mb-2">MagicFolder</div>
            
            {folders.map(folder => (
              <div key={folder.id} className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Folder className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-700">{folder.path}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${folder.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {folder.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Switch 
                      checked={folder.isActive} 
                      onCheckedChange={() => toggleFolderActive(folder.id)} 
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-gray-100 rounded-md px-3 py-1 text-sm text-gray-700 flex items-center">
                    <FileArchive className="w-4 h-4 mr-1.5 text-gray-600" />
                    {folder.fileCount} files
                  </div>
                  <div className="bg-gray-100 rounded-md px-3 py-1 text-sm text-gray-700 flex items-center">
                    <FileText className="w-4 h-4 mr-1.5 text-gray-600" />
                    {folder.renamedCount} renamed
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-100">
                    <Activity className="w-4 h-4 mr-1.5" />
                    Activity
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-100">
                    <Settings className="w-4 h-4 mr-1.5" />
                    Change
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-100">
                    <Folder className="w-4 h-4 mr-1.5" />
                    Open
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-700">
                    <Settings className="w-4 h-4 mr-2 text-gray-600" />
                    <span>Settings</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-blue-600">Version 2.1:</span>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700">File name</span>
                      <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700">Date</span>
                      <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700">Purpose</span>
                    </div>
                    
                    <div className="flex">
                      <button className="w-6 h-6 rounded-l flex items-center justify-center bg-gray-100">
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="w-6 h-6 rounded-r flex items-center justify-center bg-gray-100">
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            <Folder className="w-4 h-4 mr-2" />
            Add Magic Folder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MagicFolders;