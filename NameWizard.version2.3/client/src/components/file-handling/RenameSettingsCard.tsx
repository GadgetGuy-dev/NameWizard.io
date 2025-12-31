import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Braces } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInScale, slideUp, buttonHover, successState, pulse } from "@/utils/animations";

interface RenameSettingsCardProps {
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  onAIRename: () => void;
  isProcessing: boolean;
  hasFiles: boolean;
}

export default function RenameSettingsCard({ 
  selectedPreset, 
  onPresetChange, 
  onAIRename, 
  isProcessing,
  hasFiles
}: RenameSettingsCardProps) {
  const [customPattern, setCustomPattern] = useState("");
  const [showCustomPattern, setShowCustomPattern] = useState(false);
  const [previewOriginal, setPreviewOriginal] = useState("example-file.jpg");
  const [previewNew, setPreviewNew] = useState("example-file.jpg");
  const [useContentPatterns, setUseContentPatterns] = useState(false);

  useEffect(() => {
    if (selectedPreset === "custom" || selectedPreset === "customContent") {
      setShowCustomPattern(true);
    } else {
      setShowCustomPattern(false);
      updatePreview(selectedPreset);
    }
  }, [selectedPreset]);

  useEffect(() => {
    if (showCustomPattern && customPattern) {
      updatePreview(useContentPatterns ? "customContent" : "custom", customPattern);
    }
  }, [customPattern, showCustomPattern, useContentPatterns]);

  const updatePreview = (preset: string, pattern?: string) => {
    const filename = "example-file.jpg";
    const extension = "jpg";
    const nameWithoutExt = "example-file";
    
    let newName = nameWithoutExt;

    // Standard patterns
    if (!preset.startsWith("content")) {
      switch (preset) {
        case "dateSortable":
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          newName = `${year}-${month}-${day}_${nameWithoutExt}`;
          break;
          
        case "numberSequence":
          newName = `001_${nameWithoutExt}`;
          break;
          
        case "categoryPrefix":
          newName = `Photo_${nameWithoutExt}`;
          break;
          
        case "kebabCase":
          newName = nameWithoutExt
            .replace(/\s+/g, "-")
            .replace(/[^a-zA-Z0-9-]/g, "")
            .toLowerCase();
          break;
          
        case "camelCase":
          newName = nameWithoutExt
            .replace(/[\s-_]+(.)/g, (_, c) => c.toUpperCase())
            .replace(/\s/g, "")
            .replace(/^[A-Z]/, c => c.toLowerCase());
          break;
          
        case "cleanSpaces":
          newName = nameWithoutExt.replace(/\s+/g, "_");
          break;
          
        case "custom":
          if (pattern) {
            newName = pattern
              .replace("[Name]", nameWithoutExt)
              .replace("[Counter]", "001")
              .replace("[Date]", new Date().toISOString().split("T")[0])
              .replace("[Type]", "Photo")
              .replace("[ext]", extension);
          }
          break;
        
        default:
          newName = nameWithoutExt;
      }
    } 
    // Content-based patterns
    else {
      switch (preset) {
        case "contentOwnerDate":
          newName = `Author_2023-09-15_${nameWithoutExt}`;
          break;
          
        case "contentDateCategory":
          newName = `2023-09-15_Report_${nameWithoutExt}`;
          break;
          
        case "ownerContentCategory":
          newName = `Author_Research_Report_${nameWithoutExt}`;
          break;
          
        case "dateContentOwner":
          newName = `2023-09-15_Research_Author_${nameWithoutExt}`;
          break;
          
        case "categoryDateContent":
          newName = `Report_2023-09-15_Summary_${nameWithoutExt}`;
          break;
          
        case "firstAuthorYearKeyword":
          newName = `Smith_2023_Research_Journal_${nameWithoutExt}`;
          break;
          
        case "customContent":
          if (pattern) {
            newName = pattern
              .replace("[Name]", nameWithoutExt)
              .replace("[Counter]", "001")
              .replace("[Date]", new Date().toISOString().split("T")[0])
              .replace("[Author]", "Author")
              .replace("[Category]", "Report")
              .replace("[Content]", "Research")
              .replace("[Year]", "2023")
              .replace("[Keyword]", "AI")
              .replace("[Journal]", "Science")
              .replace("[ext]", extension);
          }
          break;
          
        default:
          newName = nameWithoutExt;
      }
    }

    // Add extension back for preview
    if (extension && !newName.endsWith(`.${extension}`)) {
      newName = `${newName}.${extension}`;
    }

    setPreviewOriginal(filename);
    setPreviewNew(newName);
  };

  const handleCustomPatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPattern(e.target.value);
  };
  
  const togglePatternType = (checked: boolean) => {
    setUseContentPatterns(checked);
    // Reset to appropriate default value based on pattern group
    onPresetChange(checked ? 'contentOwnerDate' : 'dateSortable');
  };

  return (
    <Card className="bg-black border-zinc-800">
      <CardContent className="pt-6">
        <motion.h2 
          className="text-lg font-semibold mb-4 text-orange-500"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          Rename Settings
        </motion.h2>
        
        <motion.div 
          className="space-y-4"
          variants={fadeInScale}
          initial="hidden"
          animate="visible"
        >
          {/* Presets Section */}
          <div>
            <div className="mb-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="content-patterns" 
                  checked={useContentPatterns} 
                  onCheckedChange={(checked: boolean | "indeterminate") => {
                    if (checked === true || checked === false) {
                      togglePatternType(checked);
                    }
                  }}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label 
                  htmlFor="content-patterns" 
                  className="text-sm font-medium text-zinc-300 cursor-pointer"
                >
                  Use content-based naming patterns
                </Label>
              </div>
            </div>
            
            <Label htmlFor="preset" className="block text-sm font-medium text-zinc-300 mb-1">
              Naming Pattern
            </Label>
            <Select value={selectedPreset} onValueChange={onPresetChange}>
              <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-zinc-300 focus:ring-orange-500 focus:border-orange-500 [&>*]:text-zinc-300">
                <SelectValue placeholder="Select a pattern" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-300">
                {!useContentPatterns ? (
                  <SelectGroup>
                    <SelectLabel className="text-zinc-400">Standard Patterns</SelectLabel>
                    <SelectItem value="none" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Select a pattern</SelectItem>
                    <SelectItem value="dateSortable" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Date - Sortable (YYYY-MM-DD_Filename)</SelectItem>
                    <SelectItem value="numberSequence" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Numbered Sequence (001_Filename)</SelectItem>
                    <SelectItem value="categoryPrefix" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Category - Filename (Photo_Filename)</SelectItem>
                    <SelectItem value="kebabCase" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">kebab-case (convert-to-kebab-case)</SelectItem>
                    <SelectItem value="camelCase" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">camelCase (convertToCamelCase)</SelectItem>
                    <SelectItem value="cleanSpaces" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Clean Spaces (Replace with underscores)</SelectItem>
                    <SelectItem value="custom" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Custom Pattern...</SelectItem>
                  </SelectGroup>
                ) : (
                  <SelectGroup>
                    <SelectLabel className="text-zinc-400">Content-Based Patterns</SelectLabel>
                    <SelectItem value="contentOwnerDate" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Content_Owner_Date</SelectItem>
                    <SelectItem value="contentDateCategory" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Content_Date_Category</SelectItem>
                    <SelectItem value="ownerContentCategory" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Owner_Content_Category</SelectItem>
                    <SelectItem value="dateContentOwner" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Date_Content_Owner</SelectItem>
                    <SelectItem value="categoryDateContent" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Category_Date_Content</SelectItem>
                    <SelectItem value="firstAuthorYearKeyword" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">FirstAuthor_Year_Keyword_Journal_CorrespondingAuthor</SelectItem>
                    <SelectItem value="customContent" className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300">Custom Content Pattern...</SelectItem>
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* AI Renaming */}
          <motion.div 
            className="bg-zinc-900 p-4 rounded-md border border-zinc-800"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-start gap-3">
              <motion.div 
                className="bg-orange-950/40 p-2 rounded-md"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Braces className="h-5 w-5 text-orange-500" />
              </motion.div>
              <div>
                <motion.h3 
                  className="text-sm font-medium text-zinc-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  AI-Powered Renaming
                </motion.h3>
                <motion.p 
                  className="text-xs text-zinc-500 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Intelligently rename files based on content analysis
                </motion.p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button 
                    size="sm" 
                    className="mt-2 bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={onAIRename}
                    disabled={isProcessing || !hasFiles}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : "Analyze & Rename"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          {/* Custom Pattern (conditional) */}
          {showCustomPattern && (
            <div>
              <Label htmlFor="customPattern" className="block text-sm font-medium text-zinc-300 mb-1">
                Custom Pattern
              </Label>
              <div className="relative">
                <Input 
                  id="customPattern" 
                  value={customPattern}
                  onChange={handleCustomPatternChange}
                  placeholder={useContentPatterns ? 
                    "[Author]_[Year]_[Content]_[Name].[ext]" : 
                    "[Counter]_[Name].[ext]"
                  }
                  className="pr-10 bg-zinc-900 border-zinc-700 text-zinc-300 focus:border-orange-600 focus:ring-orange-600"
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Available tokens: {useContentPatterns ? 
                  "[Name], [Author], [Content], [Category], [Year], [Keyword], [Journal], [Date], [ext]" : 
                  "[Name], [Counter], [Date], [Type], [ext]"
                }
              </p>
            </div>
          )}
          
          {/* Pattern Preview */}
          <motion.div 
            className="bg-zinc-900 p-3 rounded-md border border-zinc-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)" }}
          >
            <motion.h4 
              className="text-xs font-medium text-zinc-500 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Preview
            </motion.h4>
            <div className="mt-1 text-sm">
              <motion.p 
                className="text-zinc-500"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                Original: <span className="text-zinc-400">{previewOriginal}</span>
              </motion.p>
              <motion.p 
                className="text-zinc-500"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                New: <motion.span 
                  className="font-medium text-orange-500"
                  animate={selectedPreset !== "none" ? { 
                    scale: [1, 1.05, 1],
                    color: ["#f97316", "#fb923c", "#f97316"]
                  } : {}}
                  transition={{ 
                    duration: 0.6,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    delay: 0.2,
                    repeatDelay: 1
                  }}
                >
                  {previewNew}
                </motion.span>
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
