import OpenAI from "openai";

// Check if OPENAI_API_KEY is available in environment variables
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

// Initialize OpenAI client if API key is available
const openai = hasOpenAIKey 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

// Helper function to generate a mock response when no API key is available
const generateMockResponse = <T>(responseData: T): Promise<T> => {
  return new Promise(resolve => {
    // Add a small delay to simulate API call
    setTimeout(() => {
      resolve(responseData);
    }, 800);
  });
};

/**
 * Generate name suggestions based on file content
 */
export async function generateNameSuggestions(data: { 
  fileName: string;
  fileType: string;
  content?: string;
  metadata?: Record<string, any>;
}) {
  if (!openai) {
    // Return mock data if OpenAI client is not available
    return generateMockResponse({
      suggestions: [
        `${data.fileType === 'image' ? 'Photo' : 'Document'}_${new Date().toISOString().split('T')[0]}`,
        `${data.fileName.split('.')[0]}_revised`,
        `${data.fileType === 'image' ? 'Image' : 'File'}_${Math.floor(Math.random() * 1000)}`,
        `${data.fileType === 'image' ? 'Picture' : 'Doc'}_${new Date().toLocaleTimeString().replace(/:/g, '')}`,
      ],
      reasoning: "These suggestions are based on the file type and current date/time."
    });
  }

  try {
    const prompt = `
      I need you to suggest better names for this file: "${data.fileName}".
      File type: ${data.fileType}
      ${data.content ? `File content preview: ${data.content.substring(0, 500)}...` : ''}
      ${data.metadata ? `File metadata: ${JSON.stringify(data.metadata)}` : ''}
      
      Please provide 4 appropriate name suggestions that are descriptive and well-organized.
      Return your response as a JSON object with the following format:
      {
        "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"],
        "reasoning": "A brief explanation of your naming approach"
      }
    `;

    if (!openai) {
      throw new Error("OpenAI client not initialized");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating name suggestions:", error);
    throw new Error("Failed to generate name suggestions");
  }
}

/**
 * Analyze content and suggest categories or organization
 */
export async function analyzeContent(data: {
  files: Array<{
    fileName: string;
    fileType: string;
    content?: string;
    metadata?: Record<string, any>;
  }>
}) {
  if (!openai) {
    // Return mock data if OpenAI client is not available
    return generateMockResponse({
      categories: [
        { name: "Documents", files: data.files.filter(f => f.fileType.includes('document') || f.fileType.includes('pdf')).map(f => f.fileName) },
        { name: "Images", files: data.files.filter(f => f.fileType.includes('image')).map(f => f.fileName) },
        { name: "Other", files: data.files.filter(f => !f.fileType.includes('document') && !f.fileType.includes('pdf') && !f.fileType.includes('image')).map(f => f.fileName) }
      ],
      reasoning: "Files have been grouped based on their file types."
    });
  }

  try {
    const fileInfoText = data.files.map(file => {
      return `File: ${file.fileName}, Type: ${file.fileType}${file.content ? `, Content preview: ${file.content.substring(0, 200)}...` : ''}`
    }).join("\n");

    const prompt = `
      I need you to analyze these files and suggest logical categories for organizing them:
      ${fileInfoText}
      
      Please suggest category names and assign each file to the most appropriate category.
      Return your response as a JSON object with the following format:
      {
        "categories": [
          {
            "name": "Category1",
            "files": ["filename1", "filename2"]
          },
          {
            "name": "Category2",
            "files": ["filename3", "filename4"]
          }
        ],
        "reasoning": "A brief explanation of your categorization approach"
      }
    `;

    if (!openai) {
      throw new Error("OpenAI client not initialized");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing content:", error);
    throw new Error("Failed to analyze content");
  }
}

/**
 * Format file names to a specific case style
 */
export async function formatCase(names: string[], caseType: string) {
  if (!openai) {
    // Return mock data for different case formats
    switch(caseType) {
      case 'camelCase':
        return names.map(name => name.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, ''));
      case 'snake_case':
        return names.map(name => name.toLowerCase().replace(/\s+/g, '_'));
      case 'kebab-case':
        return names.map(name => name.toLowerCase().replace(/\s+/g, '-'));
      case 'PascalCase':
        return names.map(name => name.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
          word.toUpperCase()).replace(/\s+/g, ''));
      default:
        return names;
    }
  }

  try {
    const prompt = `
      I need you to format these file names to ${caseType}:
      ${names.join('\n')}
      
      Please convert each name and return only an array of the formatted names, nothing else.
    `;

    if (!openai) {
      throw new Error("OpenAI client not initialized");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    // Parse the response - we expect it to be a list of names
    const content = response.choices[0].message.content;
    if (!content) return names;
    
    // Clean up any extra text and extract just the formatted names
    const formattedNames = content.match(/[^\s"',\[\]]+/g)?.filter(name => name.length > 1) || names;
    
    return formattedNames;
  } catch (error) {
    console.error("Error formatting case:", error);
    throw new Error("Failed to format case");
  }
}

/**
 * Detect duplicate files or potential conflicts
 */
export async function detectDuplicates(files: Array<{
  fileName: string;
  fileType: string;
  content?: string;
  size?: number;
  metadata?: Record<string, any>;
}>) {
  if (!openai) {
    // Return mock duplicate detection
    const duplicateGroups = [];
    const processedFiles = new Set();
    
    for (let i = 0; i < files.length; i++) {
      if (processedFiles.has(i)) continue;
      
      const baseName = files[i].fileName.split('.')[0].toLowerCase();
      const similarFiles = [files[i].fileName];
      
      for (let j = i + 1; j < files.length; j++) {
        if (processedFiles.has(j)) continue;
        
        const currentName = files[j].fileName.split('.')[0].toLowerCase();
        if (currentName.includes(baseName) || baseName.includes(currentName) || 
            Math.abs(currentName.length - baseName.length) <= 3) {
          similarFiles.push(files[j].fileName);
          processedFiles.add(j);
        }
      }
      
      if (similarFiles.length > 1) {
        duplicateGroups.push({
          files: similarFiles,
          recommendation: `These files appear similar. Consider renaming to avoid confusion: ${baseName}_v1, ${baseName}_v2, etc.`
        });
      }
    }
    
    return generateMockResponse({
      duplicateGroups,
      summary: `Found ${duplicateGroups.length} potential duplicate groups among ${files.length} files.`
    });
  }

  try {
    const fileInfoText = files.map(file => {
      return `File: ${file.fileName}, Type: ${file.fileType}${file.size ? `, Size: ${file.size} bytes` : ''}${file.content ? `, Content preview: ${file.content.substring(0, 100)}...` : ''}`
    }).join("\n");

    const prompt = `
      I need you to analyze these files and identify potential duplicates or naming conflicts:
      ${fileInfoText}
      
      Please identify groups of files that might be duplicates or have confusing similar names, 
      and suggest unique naming strategies for each group.
      
      Return your response as a JSON object with the following format:
      {
        "duplicateGroups": [
          {
            "files": ["filename1", "filename2"],
            "recommendation": "Recommendation for how to rename these files uniquely"
          }
        ],
        "summary": "Brief summary of your analysis"
      }
    `;

    if (!openai) {
      throw new Error("OpenAI client not initialized");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error("Error detecting duplicates:", error);
    throw new Error("Failed to detect duplicates");
  }
}

/**
 * Extract metadata from file name or content
 */
export async function extractMetadata(fileName: string, content: string) {
  if (!openai) {
    // Generate mock metadata
    const date = new Date().toISOString().split('T')[0];
    const fileType = fileName.split('.').pop()?.toLowerCase() || 'unknown';
    let mockMetadata: Record<string, any> = {
      date: date,
      fileType: fileType,
      estimatedSize: `${Math.floor(Math.random() * 10) + 1} MB`,
    };
    
    if (fileType === 'jpg' || fileType === 'png') {
      mockMetadata = {
        ...mockMetadata,
        resolution: '1920x1080',
        colorSpace: 'RGB',
        deviceMake: 'Generic Camera',
      };
    } else if (fileType === 'pdf' || fileType === 'docx') {
      mockMetadata = {
        ...mockMetadata,
        pageCount: Math.floor(Math.random() * 20) + 1,
        author: 'John Doe',
        created: date,
        modified: date,
      };
    }
    
    return generateMockResponse({
      metadata: mockMetadata,
      suggestedFilename: `${date}_${fileName.split('.')[0]}.${fileType}`
    });
  }

  try {
    const prompt = `
      I need you to extract relevant metadata from this file:
      Filename: ${fileName}
      Content preview: ${content.substring(0, 500)}...
      
      Please analyze both the filename and content to extract useful metadata like:
      - Creation/modification dates
      - Authors or creators
      - Subject or topic
      - Categories
      - Any other relevant attributes
      
      Also suggest an improved filename based on the metadata.
      
      Return your response as a JSON object with the following format:
      {
        "metadata": {
          "key1": "value1",
          "key2": "value2"
        },
        "suggestedFilename": "improved-filename.ext"
      }
    `;

    if (!openai) {
      throw new Error("OpenAI client not initialized");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error("Error extracting metadata:", error);
    throw new Error("Failed to extract metadata");
  }
}

/**
 * Organize files into folder structures using AI
 */
export async function organizeFoldersWithGPT4o(files: Array<{
  fileName: string;
  fileType: string;
  content?: string;
  metadata?: Record<string, any>;
}>) {
  if (!openai) {
    // Generate mock folder organization
    const mockFolders: { name: string, files: string[] }[] = [
      { name: "Documents", files: [] },
      { name: "Images", files: [] },
      { name: "Spreadsheets", files: [] },
      { name: "Archives", files: [] },
      { name: "Other", files: [] }
    ];
    
    files.forEach(file => {
      const ext = file.fileName.split('.').pop()?.toLowerCase() || '';
      if (['docx', 'pdf', 'txt'].includes(ext)) {
        mockFolders[0].files.push(file.fileName);
      } else if (['jpg', 'png', 'gif'].includes(ext)) {
        mockFolders[1].files.push(file.fileName);
      } else if (['xlsx', 'csv'].includes(ext)) {
        mockFolders[2].files.push(file.fileName);
      } else if (['zip', 'rar', '7z'].includes(ext)) {
        mockFolders[3].files.push(file.fileName);
      } else {
        mockFolders[4].files.push(file.fileName);
      }
    });
    
    // Filter out empty folders
    const filteredFolders = mockFolders.filter(folder => folder.files.length > 0);
    
    return generateMockResponse({
      folders: filteredFolders,
      summary: `Organized ${files.length} files into ${filteredFolders.length} folders based on file types.`
    });
  }

  try {
    const fileInfoText = files.map(file => {
      return `File: ${file.fileName}, Type: ${file.fileType}${file.content ? `, Content preview: ${file.content.substring(0, 200)}...` : ''}`
    }).join("\n");

    const prompt = `
      I need you to organize these files into a logical folder structure:
      ${fileInfoText}
      
      Please create a set of folders and assign each file to the most appropriate folder
      based on its content, type, and any other relevant attributes.
      
      Return your response as a JSON object with the following format:
      {
        "folders": [
          {
            "name": "FolderName",
            "files": ["filename1", "filename2"]
          }
        ],
        "summary": "Brief explanation of your organization approach"
      }
    `;

    if (!openai) {
      throw new Error("OpenAI client not initialized");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error("Error organizing folders:", error);
    throw new Error("Failed to organize folders");
  }
}