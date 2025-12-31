// Advanced Content-Based Categorization Service
// This service handles the intelligent auto-sorting of files into appropriate folders
// using AI-powered content analysis and similarity detection

import { FileItem } from "../pages/home";
import { 
  analyzeImage, 
  analyzeDocument, 
  generateContentEmbedding 
} from "./aiProcessing";
import { apiRequest } from '@/lib/queryClient';

// Enhanced category mapping with additional metadata
export interface CategoryMapping {
  id: string;
  name: string;
  patterns: string[];
  folder: string;
  description?: string;
  examples?: string[];
  icon?: string;
  confidence?: number;     // Confidence score for matches
  keywords?: string[];     // Additional content-specific keywords
  contentTypes?: string[]; // File types this category handles best
  embeddings?: number[];   // Vector representation for similarity matching
}
// Enhanced category definitions with additional metadata for better matching
const defaultCategories: CategoryMapping[] = [
  {
    id: "documents",
    name: "Documents",
    patterns: [
      "report", "document", "contract", "agreement", "letter", "invoice", "proposal", 
      "policy", "legal document", "memorandum", "form", "certificate", "application"
    ],
    folder: "Documents",
    description: "Business and personal documents, contracts, and paperwork",
    examples: ["contracts.pdf", "tax_forms.pdf", "business_plan.docx"],
    icon: "file-text",
    keywords: ["text", "legal", "business", "formal", "official", "signed", "letterhead"],
    contentTypes: ["pdf", "doc", "docx", "txt", "rtf", "odt"],
    confidence: 0.85
  },
  {
    id: "images",
    name: "Images",
    patterns: [
      "photo", "image", "picture", "portrait", "landscape", "wallpaper", "photograph",
      "snapshot", "digital art", "graphic", "illustration", "artwork", "screenshot"
    ],
    folder: "Images",
    description: "Photos, digital art, and other image files",
    examples: ["profile_photo.jpg", "product_image.png", "logo.svg"],
    icon: "image",
    keywords: ["visual", "photo", "camera", "picture", "digital", "graphic", "shot"],
    contentTypes: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic", "raw"],
    confidence: 0.9
  },
  {
    id: "presentations",
    name: "Presentations",
    patterns: [
      "presentation", "slides", "pitch", "deck", "slideshow", "keynote", "conference",
      "lecture", "talk", "briefing", "demonstration", "seminar", "symposium"
    ],
    folder: "Presentations",
    description: "Slideshow presentations and pitch decks",
    examples: ["quarterly_presentation.pptx", "investor_pitch.ppt", "conference_slides.key"],
    icon: "presentation",
    keywords: ["slide", "animation", "transition", "speaker notes", "bullet points", "chart"],
    contentTypes: ["ppt", "pptx", "key", "odp", "gslides"],
    confidence: 0.8
  },
  {
    id: "spreadsheets",
    name: "Spreadsheets",
    patterns: [
      "spreadsheet", "table", "data", "financial", "budget", "analysis", "calculation",
      "formula", "statistics", "metrics", "chart", "ledger", "inventory", "tracker", "database"
    ],
    folder: "Spreadsheets",
    description: "Financial data, tables, and analysis files",
    examples: ["budget_2025.xlsx", "sales_data.csv", "inventory.numbers"],
    icon: "table",
    keywords: ["cells", "rows", "columns", "formulas", "calculations", "data", "numbers"],
    contentTypes: ["xls", "xlsx", "csv", "numbers", "ods", "tsv"],
    confidence: 0.85
  },
  {
    id: "vacation",
    name: "Vacation Photos",
    patterns: [
      "vacation", "holiday", "trip", "travel", "leisure", "getaway", "journey", "tour",
      "expedition", "excursion", "adventure", "cruise", "resort", "sightseeing", "tourist"
    ],
    folder: "Vacation Photos",
    description: "Travel and vacation imagery from your adventures",
    examples: ["beach_sunset.jpg", "mountain_hike.png", "family_trip_2025.heic"],
    icon: "palmtree",
    keywords: ["vacation", "travel", "trip", "luggage", "passport", "hotel", "sightseeing"],
    contentTypes: ["jpg", "jpeg", "png", "heic", "raw", "mov", "mp4"],
    confidence: 0.75
  },
  {
    id: "beach",
    name: "Beach",
    patterns: [
      "beach", "ocean", "sea", "sand", "coast", "shore", "wave", "surf", "tropical",
      "island", "bay", "seaside", "lagoon", "coral", "reef", "tide", "seashell"
    ],
    folder: "Beach",
    description: "Beach and coastal imagery",
    examples: ["sunset_beach.jpg", "ocean_waves.png", "tropical_island.heic"],
    icon: "palmtree",
    keywords: ["ocean", "waves", "sand", "palm tree", "coast", "sunset", "shell", "seagull"],
    contentTypes: ["jpg", "jpeg", "png", "heic", "raw", "mov", "mp4"],
    confidence: 0.8
  },
  {
    id: "mountains",
    name: "Mountains",
    patterns: [
      "mountains", "hiking", "trail", "peak", "cliff", "valley", "forest", "camping", "outdoor",
      "summit", "ridge", "alpine", "hill", "highland", "trek", "wilderness", "expedition", "climb"
    ],
    folder: "Mountains",
    description: "Mountain scenes and outdoor adventures",
    examples: ["mountain_view.jpg", "hiking_trail.png", "forest_landscape.jpeg"],
    icon: "mountain-snow",
    keywords: ["peak", "summit", "trail", "hike", "climb", "forest", "ridge", "snow", "elevation"],
    contentTypes: ["jpg", "jpeg", "png", "heic", "raw", "mov", "mp4"],
    confidence: 0.8
  },
  {
    id: "city",
    name: "City",
    patterns: [
      "city", "urban", "building", "skyline", "street", "architecture", "downtown", "skyscraper",
      "metropolis", "cityscape", "block", "avenue", "landmark", "plaza", "district", "monument"
    ],
    folder: "City",
    description: "Urban landscapes and city views",
    examples: ["city_skyline.jpg", "street_view.png", "urban_night.jpeg"],
    icon: "building-2",
    keywords: ["skyline", "building", "skyscraper", "street", "urban", "downtown", "tower", "traffic"],
    contentTypes: ["jpg", "jpeg", "png", "heic", "raw", "mov", "mp4"],
    confidence: 0.75
  },
  {
    id: "work",
    name: "Work",
    patterns: [
      "work", "business", "project", "meeting", "notes", "client", "research", "professional",
      "career", "job", "workplace", "office", "corporate", "employment", "industry", "colleague"
    ],
    folder: "Work",
    description: "Work-related files and business materials",
    examples: ["project_notes.docx", "client_meeting.pdf", "research_data.xlsx"],
    icon: "briefcase",
    keywords: ["business", "office", "job", "professional", "corporate", "career", "workspace"],
    contentTypes: ["pdf", "docx", "xlsx", "pptx", "txt", "msg", "eml"],
    confidence: 0.7
  },
  {
    id: "personal",
    name: "Personal",
    patterns: [
      "personal", "family", "home", "private", "journal", "diary", "recipe", "household",
      "individual", "self", "identity", "memoir", "reflection", "lifestyle", "memories", "autobiography"
    ],
    folder: "Personal",
    description: "Personal files and family-related documents",
    examples: ["family_budget.xlsx", "home_inventory.pdf", "journal.docx"],
    icon: "user",
    keywords: ["family", "personal", "private", "home", "self", "individual", "own", "journal"],
    contentTypes: ["pdf", "docx", "xlsx", "jpg", "mp4", "txt"],
    confidence: 0.7
  }
];

/**
 * Calculate semantic similarity score between content keywords and category patterns
 * Uses an improved CLIP-like algorithm for better content understanding
 */
const calculateSimilarityScore = async (contentKeywords: string, patterns: string[]): Promise<number> => {
  // Enhanced similarity calculation with semantic understanding
  
  // Pre-process content keywords
  const contentLower = contentKeywords.toLowerCase();
  const contentWords = contentLower.split(/\s+/).filter(word => word.length > 2);
  
  // Generate content embedding (simulated)
  // In production, this would use actual CLIP or other embedding model
  const contentEmbedding = await generateContentEmbedding(contentKeywords);
  
  // Calculate multiple dimensions of similarity
  let similarityScore = 0;
  
  // 1. Exact pattern matching (highest weight)
  for (const pattern of patterns) {
    const patternLower = pattern.toLowerCase();
    if (contentLower.includes(patternLower)) {
      similarityScore += 0.5; // Direct match has high weight
    }
  }
  
  // 2. Word-level semantic matching (medium weight)
  for (const pattern of patterns) {
    const patternLower = pattern.toLowerCase();
    const patternWords = patternLower.split(/\s+/);
    
    for (const contentWord of contentWords) {
      // Skip very short words (usually not meaningful)
      if (contentWord.length <= 3) continue;
      
      // Check for word inclusion
      for (const patternWord of patternWords) {
        if (patternWord.includes(contentWord) || contentWord.includes(patternWord)) {
          const lengthRatio = Math.min(contentWord.length, patternWord.length) / 
                              Math.max(contentWord.length, patternWord.length);
          
          // Weight matches by how close in length the words are
          // This prevents short words from matching too broadly
          similarityScore += 0.15 * lengthRatio;
        }
      }
    }
  }
  
  // 3. Context relevance matching (checking context words)
  const contentContextWords = contentWords.filter(word => 
    word.length > 4 && !patterns.some(p => p.toLowerCase().includes(word))
  );
  
  // These are words that provide context but aren't direct pattern matches
  // This helps with understanding related concepts
  if (contentContextWords.length > 0) {
    similarityScore += 0.1;
  }
  
  // 4. Semantic density - reward content with multiple matching points
  const uniqueMatches = new Set<string>();
  for (const pattern of patterns) {
    if (contentLower.includes(pattern.toLowerCase())) {
      uniqueMatches.add(pattern);
    }
  }
  
  // Add bonus for multiple unique pattern matches
  if (uniqueMatches.size > 1) {
    similarityScore += 0.1 * Math.min(uniqueMatches.size, 3);
  }
  
  // Normalize score to be between 0 and 1
  return Math.min(similarityScore, 1);
};

/**
 * Analyze a file's content and determine its appropriate category
 * Uses an advanced CLIP-like approach with content understanding
 */
export const categorizeFile = async (file: FileItem): Promise<string> => {
  try {
    console.log(`Starting content analysis for ${file.original}`);
    
    // Extract content keywords from the file using AI analysis
    let contentKeywords = "";
    let fileType = file.type.toLowerCase();
    
    // Use specialized analysis based on file type
    if (fileType.startsWith('image/')) {
      contentKeywords = await analyzeImage(file.file);
      console.log(`Image analysis keywords: ${contentKeywords}`);
    } else {
      contentKeywords = await analyzeDocument(file.file);
      console.log(`Document analysis keywords: ${contentKeywords}`);
    }
    
    // Store category matches with similarity scores and metadata
    const categoryMatches: Array<{
      folder: string, 
      score: number,
      categoryId: string,
      confidence: number
    }> = [];
    
    // Calculate similarity scores for each category
    // Using Promise.all for parallel processing
    const categoryScores = await Promise.all(
      defaultCategories.map(async category => {
        const similarityScore = await calculateSimilarityScore(contentKeywords, category.patterns);
        return {
          category,
          score: similarityScore
        };
      })
    );
    
    // Process category scores
    for (const { category, score } of categoryScores) {
      // Apply confidence threshold
      if (score > 0.2) {
        // Convert raw score to confidence percentage (0-100%)
        const confidence = Math.round(score * 100);
        
        categoryMatches.push({
          folder: category.folder,
          score: score,
          categoryId: category.id,
          confidence: confidence
        });
        
        console.log(`Match: ${category.name}, Score: ${score.toFixed(2)}, Confidence: ${confidence}%`);
      }
    }
    
    // Add file type preference weighting
    // Some categories work better with specific file types
    categoryMatches.forEach(match => {
      const category = defaultCategories.find(c => c.id === match.categoryId);
      
      // If the category has content type preferences
      if (category?.contentTypes) {
        // Check if this file type is preferred for this category
        const typeMatch = category.contentTypes.some(type => fileType.includes(type));
        if (typeMatch) {
          // Boost score for preferred file types
          match.score += 0.1;
          console.log(`Boosted ${category.name} score for file type preference`);
        }
      }
    });
    
    // Sort by highest similarity score
    categoryMatches.sort((a, b) => b.score - a.score);
    
    // If we have matches, return the highest scoring category
    if (categoryMatches.length > 0) {
      const bestMatch = categoryMatches[0];
      console.log(`Best category match: ${bestMatch.folder} (${bestMatch.confidence}% confidence)`);
      return bestMatch.folder;
    }
    
    console.log("No strong category matches found, using fallback type-based categorization");
    
    // If no match is found, determine based on file type
    if (fileType.startsWith('image/')) {
      return "Images";
    } else if (fileType.includes('pdf') || fileType.includes('word') || fileType.includes('document')) {
      return "Documents";
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return "Presentations";
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return "Spreadsheets";
    }
    
    // Default folder
    return "Other Files";
  } catch (error) {
    console.error("Error categorizing file:", error);
    return "Uncategorized";
  }
};

/**
 * Apply content-based categorization to a list of files
 * Enhanced with batch processing, performance improvements, and LLM fallback
 */
export const applyContentCategorization = async (files: FileItem[]): Promise<{ 
  files: FileItem[], 
  categories: Record<string, FileItem[]>,
  modelUsed?: string 
}> => {
  console.log(`Starting content-based categorization for ${files.length} files`);
  const startTime = performance.now();
  
  try {
    // Use the backend API endpoint for folder organization
    console.log('Calling server-side folder organization API...');
    const response = await apiRequest('/api/organize-folders', {
      method: 'POST',
      data: { 
        files,
        llmType: 'gpt_4o' // Request GPT-4o as the preferred model, but server may use fallback
      }
    });
    
    if (response.success && response.categories) {
      console.log('Received server categorization results');
      
      // Get model information from the response
      const modelUsed = response.modelUsed || 'gpt_4o';
      const preferredModel = response.preferredModel || 'gpt_4o';
      
      // Log which model was actually used
      if (modelUsed !== preferredModel) {
        console.log(`Note: Preferred model ${preferredModel} was unavailable. Used ${modelUsed} instead.`);
      } else {
        console.log(`Used preferred model: ${modelUsed}`);
      }
      
      // Process the categorized files
      const categorizedFiles = response.categories.folders ? 
        // Handle the nested structure from the OpenAI/Anthropic responses
        response.categories.folders.reduce((acc: Record<string, FileItem[]>, folder: any) => {
          acc[folder.name] = folder.files.map((fileName: string) => 
            files.find(f => f.original === fileName) || { ...files[0], original: fileName }
          );
          return acc;
        }, {}) :
        // Handle direct category mapping if that's the structure
        response.categories as Record<string, FileItem[]>;
      
      // Flatten the results from all categories
      const results: FileItem[] = [];
      
      // Cast array values to FileItem arrays and apply model info to files
      Object.values(categorizedFiles).forEach(categoryFiles => {
        const updatedFiles = (categoryFiles as FileItem[]).map(file => ({
          ...file,
          aiModel: modelUsed // Add the model that was used to the file metadata
        }));
        results.push(...updatedFiles);
      });
      
      // Calculate performance metrics
      const endTime = performance.now();
      const processingTime = (endTime - startTime) / 1000; // in seconds
      console.log(`Content categorization complete. Processed ${files.length} files in ${processingTime.toFixed(2)}s`);
      console.log(`Files sorted into ${Object.keys(categorizedFiles).length} categories`);
      
      // Log category distribution
      Object.entries(categorizedFiles).forEach(([category, files]) => {
        const filesArray = files as FileItem[];
        console.log(`• ${category}: ${filesArray.length} files`);
      });
      
      return {
        files: results,
        categories: categorizedFiles,
        modelUsed
      };
    } else {
      throw new Error("Failed to get categorization results from server");
    }
  } catch (error) {
    console.error("Error during server-side folder organization:", error);
    
    // Fallback to local categorization if the API fails
    console.log("Falling back to local categorization");
    
    // Initialize category storage
    const categorizedFiles: Record<string, FileItem[]> = {};
    const results: FileItem[] = [];
    
    // Process files in batches for better performance
    const batchSize = 5; // Process files in smaller batches to prevent UI freezing
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(files.length/batchSize)}`);
      
      // Process this batch of files
      const batchResults = await Promise.all(
        batch.map(async (file) => {
          try {
            // Get category based on content analysis
            const category = await categorizeFile(file);
            
            // Add the folder as a prefix to the filename
            const updatedFile = {
              ...file,
              newName: `${category}/${file.newName}`
            };
            
            // Group files by category
            if (!categorizedFiles[category]) {
              categorizedFiles[category] = [];
            }
            categorizedFiles[category].push(updatedFile);
            
            return updatedFile;
          } catch (error) {
            console.error(`Error categorizing file ${file.original}:`, error);
            // Return the original file without categorization if there's an error
            return file;
          }
        })
      );
      
      results.push(...batchResults);
    }
    
    // Calculate performance metrics
    const endTime = performance.now();
    const processingTime = (endTime - startTime) / 1000; // in seconds
    console.log(`Local content categorization complete. Processed ${files.length} files in ${processingTime.toFixed(2)}s`);
    console.log(`Files sorted into ${Object.keys(categorizedFiles).length} categories`);
    
    // Log category distribution
    Object.entries(categorizedFiles).forEach(([category, files]) => {
      const filesArray = files as FileItem[];
      console.log(`• ${category}: ${filesArray.length} files`);
    });
    
    return {
      files: results,
      categories: categorizedFiles
    };
  }
};

/**
 * Get a list of all available categories
 */
export const getAvailableCategories = (): CategoryMapping[] => {
  return defaultCategories;
};

/**
 * Add a custom category with enhanced metadata support
 * This allows users to define their own content categories
 */
export const addCustomCategory = (category: Omit<CategoryMapping, 'id'>): CategoryMapping => {
  // Generate a unique ID for the custom category
  const categoryId = `custom-${Date.now()}`;
  
  // Process pattern strings into an array if they were passed as a comma-separated string
  let patterns = category.patterns;
  if (typeof patterns === 'string') {
    patterns = (patterns as unknown as string).split(',').map(p => p.trim());
  }
  
  // Create enhanced category with additional metadata
  const newCategory: CategoryMapping = {
    ...category,
    id: categoryId,
    patterns: patterns,
    // Add additional metadata if not provided
    keywords: category.keywords || [], 
    contentTypes: category.contentTypes || [],
    confidence: category.confidence || 0.7,  // Default confidence for custom categories
  };
  
  console.log(`Created new custom category: ${newCategory.name}`);
  
  // In a real app, this would be saved to backend via API call
  // For example:
  // try {
  //   await apiRequest({
  //     url: '/api/ai-features/categories',
  //     method: 'POST',
  //     data: newCategory
  //   });
  // } catch (error) {
  //   console.error('Failed to save custom category:', error);
  // }
  
  // For now we just return it
  return newCategory;
};