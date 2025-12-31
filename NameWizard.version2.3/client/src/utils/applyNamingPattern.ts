import { FileItem } from "../pages/home";
import { getFileExtension } from "./fileUtils";

export function applyNamingPattern(preset: string, files: FileItem[]): FileItem[] {
  return files.map((file, index) => {
    const filename = file.original;
    const extension = getFileExtension(filename);
    const nameWithoutExt = filename.replace(new RegExp(`\\.${extension}$`), '');
    
    let newName = nameWithoutExt;
    
    switch (preset) {
      case 'dateSortable':
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        newName = `${year}-${month}-${day}_${nameWithoutExt}`;
        break;
        
      case 'numberSequence':
        newName = `${String(index + 1).padStart(3, '0')}_${nameWithoutExt}`;
        break;
        
      case 'categoryPrefix':
        newName = `${getFileCategory(file.type)}_${nameWithoutExt}`;
        break;
        
      case 'kebabCase':
        newName = nameWithoutExt
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-]/g, '')
          .toLowerCase();
        break;
        
      case 'camelCase':
        newName = nameWithoutExt
          .replace(/[\s-_]+(.)/g, (_, c) => c.toUpperCase())
          .replace(/\s/g, '')
          .replace(/^[A-Z]/, c => c.toLowerCase());
        break;
        
      case 'cleanSpaces':
        newName = nameWithoutExt.replace(/\s+/g, '_');
        break;
        
      case 'custom':
        // Custom pattern would be handled separately with a different function
        // that accepts the pattern as a parameter
        break;
      
      case 'none':
        newName = nameWithoutExt;
        break;
        
      default:
        newName = nameWithoutExt;
    }
    
    // Add extension back
    if (extension) {
      newName = `${newName}.${extension}`;
    }
    
    return {
      ...file,
      newName
    };
  });
}

function getFileCategory(type: string): string {
  type = type.toLowerCase();
  
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) {
    return 'Photo';
  }
  
  if (type.includes('pdf') || type === 'pdf') {
    return 'Document';
  }
  
  if (type.includes('word') || ['doc', 'docx'].includes(type)) {
    return 'Document';
  }
  
  if (type.includes('presentation') || ['ppt', 'pptx'].includes(type)) {
    return 'Presentation';
  }
  
  if (type.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].includes(type)) {
    return 'Spreadsheet';
  }
  
  if (type.includes('audio') || ['mp3', 'wav', 'ogg'].includes(type)) {
    return 'Audio';
  }
  
  if (type.includes('video') || ['mp4', 'mov', 'avi'].includes(type)) {
    return 'Video';
  }
  
  return 'File';
}

// Apply a custom pattern to files
export function applyCustomPattern(customPattern: string, files: FileItem[]): FileItem[] {
  return files.map((file, index) => {
    const filename = file.original;
    const extension = getFileExtension(filename);
    const nameWithoutExt = filename.replace(new RegExp(`\\.${extension}$`), '');
    
    let newName = customPattern
      .replace('[Name]', nameWithoutExt)
      .replace('[Counter]', String(index + 1).padStart(3, '0'))
      .replace('[Date]', new Date().toISOString().split('T')[0])
      .replace('[Type]', getFileCategory(file.type))
      .replace('[ext]', extension);
    
    // Make sure we don't duplicate the extension
    if (extension && !newName.endsWith(`.${extension}`)) {
      newName = `${newName}.${extension}`;
    }
    
    return {
      ...file,
      newName
    };
  });
}
