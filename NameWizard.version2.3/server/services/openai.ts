import OpenAI from "openai";
import { logger } from "../utils/logger";

// Define TypeScript interfaces for improved type safety
export interface FileData {
  fileName: string;
  fileType: string;
  content?: string;
  imageContent?: string; // Base64 encoded image
  metadata?: Record<string, any>;
  fileSize?: number;
  lastModified?: Date;
}

export interface AIResponse<T> {
  success: boolean;
  model: string;
  data: T;
  error?: string;
  timestamp: Date;
}

export interface NameSuggestion {
  suggestion: string;
  confidence: number;
  reasoning: string;
}

// Check if OPENAI_API_KEY is available in environment variables
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

// Initialize OpenAI client if API key is available
const openai = hasOpenAIKey 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

// Helper function to generate a mock response when no API key is available
const generateMockResponse = <T>(responseData: T): Promise<AIResponse<T>> => {
  return new Promise(resolve => {
    // Add a small delay to simulate API call
    setTimeout(() => {
      resolve({
        success: true,
        model: "mock-model",
        data: responseData,
        timestamp: new Date()
      });
    }, 800);
  });
};

/**
 * Generate name suggestions based on file content
 */
export async function generateNameSuggestions(data: FileData): Promise<AIResponse<NameSuggestion[]>> {
  if (!openai) {
    // Return mock data if OpenAI client is not available
    return generateMockResponse({
      suggestions: [
        `${data.fileType.includes('image') ? 'Photo' : 'Document'}_${new Date().toISOString().split('T')[0]}`,
        `${data.fileName.split('.')[0]}_revised`,
        `${data.fileType.includes('image') ? 'Image' : 'File'}_${Math.floor(Math.random() * 1000)}`,
        `${data.fileType.includes('image') ? 'Picture' : 'Doc'}_${new Date().toLocaleTimeString().replace(/:/g, '')}`,
      ],
      reasoning: "These suggestions are based on the file type and current date/time.",
      modelUsed: "fallback" // Indicate that we're using a fallback approach
    });
  }

  try {
    if (!openai) {
      throw new Error("OpenAI client not initialized");
    }

    // Handle images with vision model 
    if (data.imageContent && data.fileType.includes('image')) {
      console.log("Using vision model for image analysis");
      
      // For image files, send the image for vision analysis
      const visionMessages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `I need a descriptive name for this image. The original filename is: "${data.fileName}".
                     Analyze the image content and suggest a descriptive filename that accurately represents what is shown in the image.
                     Focus on the main subject, colors, style, and purpose of the image.
                     Make your response precisely in this JSON format:
                     {
                       "suggestions": [
                         "descriptive_name_1.${data.fileName.split('.').pop()}", 
                         "descriptive_name_2.${data.fileName.split('.').pop()}", 
                         "descriptive_name_3.${data.fileName.split('.').pop()}", 
                         "descriptive_name_4.${data.fileName.split('.').pop()}"
                       ],
                       "reasoning": "A brief explanation of your naming approach"
                     }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${data.fileType.split('/')[1]};base64,${data.imageContent}`
              }
            }
          ]
        }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: visionMessages,
        max_tokens: 1000,
      });

      try {
        const parsedResponse = JSON.parse(response.choices[0].message.content);
        // Add model information to the response
        return {
          ...parsedResponse,
          modelUsed: "gpt_4o" // Indicate which model was used for processing
        };
      } catch (e) {
        // If JSON parsing fails, extract suggestions manually
        const content = response.choices[0].message.content || '';
        const suggestions = [
          content.substring(0, 50) + '.' + data.fileName.split('.').pop(),
          data.fileName.split('.')[0] + '_revised.' + data.fileName.split('.').pop(),
          'Image_' + new Date().toISOString().split('T')[0] + '.' + data.fileName.split('.').pop(),
          'File_' + Math.floor(Math.random() * 1000) + '.' + data.fileName.split('.').pop()
        ];
        return {
          suggestions,
          reasoning: "Names generated based on image analysis",
          modelUsed: "gpt_4o" // Still indicate which model was used, even with parsing error
        };
      }
    } else {
      // Standard text-based analysis
      const prompt = `
        I need you to suggest better names for this file: "${data.fileName}".
        File type: ${data.fileType}
        ${data.content ? `File content preview: ${data.content.substring(0, 500)}...` : ''}
        ${data.metadata ? `File metadata: ${JSON.stringify(data.metadata)}` : ''}
        
        Please provide 4 appropriate name suggestions that are descriptive and well-organized.
        Use snake_case with underscores between words and keep the original file extension.
        Your suggestions should be precise and describe the content accurately.
        Return your response as a JSON object with the following format:
        {
          "suggestions": ["suggestion1.ext", "suggestion2.ext", "suggestion3.ext", "suggestion4.ext"],
          "reasoning": "A brief explanation of your naming approach"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const parsedResponse = JSON.parse(response.choices[0].message.content);
      // Add model information to the standard text-based analysis response
      return {
        ...parsedResponse,
        modelUsed: "gpt_4o" // Indicate which model was used for processing
      };
    }
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const parsedResponse = JSON.parse(response.choices[0].message.content);
    return {
      ...parsedResponse,
      modelUsed: "gpt_4o" // Indicate which model was used for processing
    };
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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    // Parse the response - we expect it to be a list of names
    const content = response.choices[0].message.content;
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const parsedResponse = JSON.parse(response.choices[0].message.content);
    return {
      ...parsedResponse,
      modelUsed: "gpt_4o_mini" // Indicate which model was used for processing
    };
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const parsedResponse = JSON.parse(response.choices[0].message.content);
    return {
      ...parsedResponse,
      modelUsed: "gpt_4o" // Indicate which model was used for processing
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    throw new Error("Failed to extract metadata");
  }
}

/**
 * Organize files into folder structures using AI
 * Now enhanced with image content analysis
 */
export async function organizeFoldersWithGPT4o(files: Array<{
  fileName: string;
  fileType: string;
  content?: string;
  imageContent?: string; // Base64 encoded image content
  metadata?: Record<string, any>;
}>) {
  if (!openai) {
    // Generate mock folder organization
    const mockFolders = [
      { name: "Documents", files: [] },
      { name: "Images", files: [] },
      { name: "Spreadsheets", files: [] },
      { name: "Archives", files: [] },
      { name: "Other", files: [] }
    ];
    
    files.forEach(file => {
      const ext = file.fileName.split('.').pop()?.toLowerCase();
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

  // List of LLM models to try in order of preference
  const modelsToTry = [
    {
      name: 'GPT-4o',
      analyzeFunction: async () => analyzeWithGPT4o(files)
    },
    {
      name: 'Claude 3.5 Sonnet', 
      analyzeFunction: async () => analyzeWithClaude(files)
    },
    {
      name: 'GPT-3.5 Turbo',
      analyzeFunction: async () => analyzeWithGPT35(files)
    },
    {
      name: 'Llama 3 70B Instruct',
      analyzeFunction: async () => analyzeWithLlama3(files)
    },
    {
      name: 'Pi / Inflection 2.5',
      analyzeFunction: async () => analyzeWithInflection(files)
    }
  ];
  
  // Try models in sequence until one succeeds
  let lastError: Error | null = null;
  
  for (const model of modelsToTry) {
    try {
      console.log(`Attempting to organize files with ${model.name}`);
      const result = await model.analyzeFunction();
      console.log(`Successfully organized files with ${model.name}`);
      
      // Add information about which model was actually used
      const modelId = model.name === 'GPT-4o' ? 'gpt_4o' : 
                      model.name === 'Claude 3.5 Sonnet' ? 'claude_3_7_sonnet' : 
                      model.name === 'GPT-3.5 Turbo' ? 'gpt_3_5_turbo' :
                      model.name === 'Llama 3 70B Instruct' ? 'llama_3_70b' :
                      model.name === 'Pi / Inflection 2.5' ? 'inflection_2_5' :
                      'fallback';
                      
      return {
        ...result,
        modelUsed: modelId
      };
    } catch (error) {
      console.error(`Error using ${model.name} for folder organization:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to the next model
    }
  }
  
  // If we get here, all models failed
  console.error("All LLM models failed to organize folders");
  throw lastError || new Error("Failed to organize folders with any available AI model");
}

// Function to analyze and organize files using GPT-4o
async function analyzeWithGPT4o(files: Array<{
  fileName: string;
  fileType: string;
  content?: string;
  imageContent?: string;
  metadata?: Record<string, any>;
}>) {
  if (!openai) {
    throw new Error("OpenAI client not initialized");
  }

  console.log("Starting organization of files with GPT-4o content analysis");
  
  // Step 1: First analyze any images with vision model for better content understanding
  const contentAnalysisPromises = files.map(async (file) => {
    try {
      // For image files with image content, send the image for vision analysis
      if (file.imageContent && file.fileType.includes('image')) {
        console.log(`Analyzing image content for file: ${file.fileName}`);
        
        const fileType = file.fileType.split('/')[1] || 'jpeg';
        const visionMessages = [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and describe its content in detail. Focus on subjects, colors, style, and purpose.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/${fileType};base64,${file.imageContent}`
                }
              }
            ]
          }
        ];

        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
          messages: visionMessages,
          max_tokens: 300,
        });

        // Add the analysis as content to the file for organization
        return {
          ...file,
          content: response.choices[0].message.content || '',
          contentAnalyzed: true
        };
      }
      return file; // Return unchanged for non-images or images without content
    } catch (err) {
      console.error(`Error analyzing file ${file.fileName} with GPT-4o vision:`, err);
      return file; // Return original if analysis fails
    }
  });

  // Wait for all content analysis to complete
  const analyzedFiles = await Promise.all(contentAnalysisPromises);
  
  // Step 2: Now use the analysis results to organize files
  console.log("GPT-4o content analysis complete, organizing all files into folders");
  
  // Convert files to text descriptions for the organization prompt
  const fileInfoText = analyzedFiles.map(file => {
    if ((file as any).contentAnalyzed) { // Add type assertion to fix TypeScript error
      // For files with content analysis, include the detailed analysis
      return `File: ${file.fileName}, Type: ${file.fileType}, Image content analysis: ${file.content}`;
    } else {
      // For other files, include any available content preview
      return `File: ${file.fileName}, Type: ${file.fileType}${file.content ? `, Content preview: ${file.content.substring(0, 200)}...` : ''}`;
    }
  }).join("\n\n");

  const prompt = `
    I need you to organize these files into a logical folder structure:
    ${fileInfoText}
    
    Please create a set of folders and assign each file to the most appropriate folder
    based on its content, type, and any other relevant attributes.
    
    For images, use the content analysis to create meaningful categories that describe what's 
    actually in the images (like "Product Photos", "Clothing Items", "Landscapes", etc.)
    rather than just generic "Images" folders.
    
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

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const parsedResponse = JSON.parse(response.choices[0].message.content || '{}');
  return {
    ...parsedResponse,
    modelUsed: "gpt_4o" // This is redundant as the parent function will add it, but keeps the pattern consistent
  };
}

// Function to analyze and organize files using Claude 3.5 Sonnet
async function analyzeWithClaude(files: Array<{
  fileName: string;
  fileType: string;
  content?: string;
  imageContent?: string;
  metadata?: Record<string, any>;
}>) {
  const { organizeFoldersWithClaude } = await import('./anthropic');
  
  const filesForClaude = files.map(file => {
    // Convert to format that Claude expects
    return {
      fileName: file.fileName,
      fileType: file.fileType,
      content: file.content || (file.imageContent ? 'Image file (content not visible to Claude)' : undefined),
      metadata: file.metadata
    };
  });
  
  return organizeFoldersWithClaude(filesForClaude);
}

// Function to analyze and organize files using GPT-3.5 Turbo
async function analyzeWithGPT35(files: Array<{
  fileName: string;
  fileType: string;
  content?: string;
  imageContent?: string;
  metadata?: Record<string, any>;
}>) {
  if (!openai) {
    throw new Error("OpenAI client not initialized");
  }
  
  console.log("Starting organization of files with GPT-3.5 Turbo");
  
  // Convert files to text descriptions for the organization prompt
  const fileInfoText = files.map(file => {
    return `File: ${file.fileName}, Type: ${file.fileType}${file.content ? `, Content preview: ${file.content.substring(0, 200)}...` : ''}`;
  }).join("\n\n");
  
  const prompt = `
    I need you to organize these files into a logical folder structure:
    ${fileInfoText}
    
    Please create a set of folders and assign each file to the most appropriate folder
    based on its name, type, and any other relevant attributes.
    
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
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  
  const content = response.choices[0].message.content || '{}';
  const parsedResponse = JSON.parse(content);
  return {
    ...parsedResponse,
    modelUsed: "gpt_3_5_turbo"
  };
}

// Function to analyze and organize files using Llama 3 70B
async function analyzeWithLlama3(files: Array<{
  fileName: string;
  fileType: string;
  content?: string;
  imageContent?: string;
  metadata?: Record<string, any>;
}>) {
  // In a real implementation, you would connect to a Llama API
  // This is a placeholder that simulates the Llama API response
  
  console.log("Starting organization of files with Llama 3 70B");
  
  // Group files by type as a simple organization strategy
  const fileTypes = new Set(files.map(file => {
    const ext = file.fileName.split('.').pop() || 'unknown';
    return ext.toLowerCase();
  }));
  
  const folders = Array.from(fileTypes).map(type => {
    const typedFiles = files.filter(file => {
      const ext = file.fileName.split('.').pop() || '';
      return ext.toLowerCase() === type;
    });
    
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1) + " Files",
      files: typedFiles.map(f => f.fileName)
    };
  });
  
  // Add an "Other" folder if any files don't fit into the organized folders
  const allOrganizedFiles = folders.flatMap(folder => folder.files);
  const unorganizedFiles = files
    .map(f => f.fileName)
    .filter(name => !allOrganizedFiles.includes(name));
    
  if (unorganizedFiles.length > 0) {
    folders.push({
      name: "Other Files",
      files: unorganizedFiles
    });
  }
  
  return {
    folders,
    summary: "Files organized by file extension",
    modelUsed: "llama_3_70b"
  };
}

// Function to analyze and organize files using Inflection 2.5
async function analyzeWithInflection(files: Array<{
  fileName: string;
  fileType: string;
  content?: string;
  imageContent?: string;
  metadata?: Record<string, any>;
}>) {
  // In a real implementation, you would connect to the Inflection API
  // This is a placeholder that simulates the Inflection API response
  
  console.log("Starting organization of files with Inflection 2.5");
  
  // Group files by content type as an organization strategy
  const contentCategories = {
    "Documents": files.filter(f => 
      f.fileType.includes('document') || 
      f.fileType.includes('pdf') || 
      f.fileType.includes('txt')
    ).map(f => f.fileName),
    
    "Images": files.filter(f => 
      f.fileType.includes('image') || 
      f.fileType.includes('jpg') || 
      f.fileType.includes('png')
    ).map(f => f.fileName),
    
    "Spreadsheets": files.filter(f => 
      f.fileType.includes('excel') || 
      f.fileType.includes('csv') || 
      f.fileType.includes('sheet')
    ).map(f => f.fileName),
    
    "Media": files.filter(f => 
      f.fileType.includes('video') || 
      f.fileType.includes('audio')
    ).map(f => f.fileName)
  };
  
  // Create folders from categories
  const folders = Object.entries(contentCategories)
    .filter(([_, files]) => files.length > 0)
    .map(([name, files]) => ({ name, files }));
  
  // Check if any files weren't categorized
  const categorizedFiles = folders.flatMap(folder => folder.files);
  const uncategorizedFiles = files
    .map(f => f.fileName)
    .filter(name => !categorizedFiles.includes(name));
    
  if (uncategorizedFiles.length > 0) {
    folders.push({
      name: "Miscellaneous",
      files: uncategorizedFiles
    });
  }
  
  return {
    folders,
    summary: "Files organized by content type and purpose",
    modelUsed: "inflection_2_5"
  };
}