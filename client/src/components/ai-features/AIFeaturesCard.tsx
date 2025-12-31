import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BadgeCheck, AlertTriangle, XCircle, CircleHelp, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type AIFeature = {
  id: number;
  featureId: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'problem';
  requiredLlmType?: string;
};

interface AIFeaturesCardProps {
  features: AIFeature[];
  onToggleFeature: (id: number, status: 'active' | 'inactive') => void;
  isLoading?: boolean;
}

// Status indicator with the correct colors based on status for the AI features page
function StatusIndicator({ status }: { status: 'active' | 'inactive' | 'problem' }) {
  if (status === 'active') {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
        <span>Active</span>
      </div>
    );
  } else if (status === 'inactive') {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
        <span>Inactive</span>
      </div>
    );
  } else {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
        <span>Problem</span>
      </div>
    );
  }
}

export default function AIFeaturesCard({
  features,
  onToggleFeature,
  isLoading = false
}: AIFeaturesCardProps) {
  return (
    <Card className="w-full bg-black border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">AI Features</CardTitle>
        <CardDescription>Enable or disable AI features for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-6 border border-zinc-800 rounded-lg bg-zinc-950 animate-pulse">
                <div className="space-y-2">
                  <div className="h-5 bg-zinc-800 rounded w-[180px]"></div>
                  <div className="h-4 bg-zinc-900 rounded w-[250px]"></div>
                </div>
                <div className="h-6 w-12 bg-zinc-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : features.length === 0 ? (
          <div className="text-center py-6 text-zinc-400">
            <p>No AI features available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.id} className="p-6 border border-zinc-800 rounded-lg bg-zinc-950">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{feature.name}</h3>
                      {feature.requiredLlmType && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-400">
                              <Info className="h-3 w-3 mr-1" />
                              {({
                                'claude_3_5_sonnet': 'Claude',
                                'gpt_4o': 'GPT-4o',
                                'llama_3': 'Llama 3',
                                'inflection_2_5': 'Inflection',
                                'gemini_1_5_pro': 'Gemini',
                              })[feature.requiredLlmType] || feature.requiredLlmType}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Requires {feature.requiredLlmType} API key</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">{feature.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={feature.status} />
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-zinc-400">Enabled</span>
                      <Switch 
                        id={`feature-${feature.id}`}
                        checked={feature.status === 'active'}
                        disabled={feature.status === 'problem'}
                        onCheckedChange={(checked) => {
                          onToggleFeature(feature.id, checked ? 'active' : 'inactive');
                        }}
                        className="data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor={`feature-${feature.id}`} className="sr-only">
                        {feature.status === 'active' ? 'Disable' : 'Enable'} {feature.name}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}