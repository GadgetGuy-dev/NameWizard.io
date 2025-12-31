import { useState } from 'react';
import { File, Clock, FileText, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

interface RenameItem {
  id: string;
  time: string; 
  oldName: string;
  newName: string;
  status: 'pending' | 'renamed' | 'error';
  errorMessage?: string;
}

const BulkRename = () => {
  const [items, setItems] = useState<RenameItem[]>([
    {
      id: '1',
      time: '11:35',
      oldName: 'Document_file_name.pdf',
      newName: 'Document_file_name_very_..._cannot_fit.pdf',
      status: 'pending'
    },
    {
      id: '2',
      time: '11:35',
      oldName: 'Document_file_name.pdf',
      newName: 'Document_file_name_veryveryvery_long_name_long_..._cannot_fit.pdf',
      status: 'pending'
    }
  ]);

  return (
    <div className="bg-[#f3f8fb] p-8 rounded-3xl">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white w-16 h-16 rounded-xl mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4H8C6.89543 4 6 4.89543 6 6V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V6C18 4.89543 17.1046 4 16 4Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 12L14 10M12 12L10 10M12 12L14 14M12 12L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-1 text-gray-800">Bulk Rename</h2>
          <p className="text-gray-600 text-center">Use the Renaming pattern to set up naming configuration for all the bulk</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {items.map((item, index) => (
            <div key={item.id} className={`flex items-start ${index > 0 ? 'mt-4' : ''}`}>
              <div className="w-10 text-xs text-gray-500 pt-1">
                {index === 0 && <span>Doc 1</span>}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="pt-1 text-xs text-gray-500">{item.time}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <File className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-xs font-medium mr-1 text-gray-700">OLD</span>
                      <span className="text-sm text-gray-800">{item.oldName}</span>
                    </div>
                    
                    <div className="flex items-center mt-1">
                      <File className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-xs font-medium mr-1 text-blue-700">NEW</span>
                      <span className="text-sm text-gray-800 bg-blue-50 rounded-sm px-1">{item.newName}</span>
                    </div>
                  </div>
                  
                  <div className="pt-1 flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">PENDING</span>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              <FileText className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-blue-600">Version 2.1:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700 text-sm">File name</span>
              <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700 text-sm">Date</span>
              <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700 text-sm">Purpose</span>
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
    </div>
  );
};

export default BulkRename;