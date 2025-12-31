import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import AIFeaturesCard, { AIFeature } from "./AIFeaturesCard";
import { apiRequest } from "@/lib/queryClient";

export default function AIFeatureList() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch AI features
  const { 
    data: features = [], 
    isLoading,
    error
  } = useQuery<AIFeature[]>({
    queryKey: ['/api/ai-features'],
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Toggle feature status
  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'active' | 'inactive' }) => {
      setIsUpdating(true);
      return apiRequest({
        url: `/api/ai-features/${id}/status`,
        method: 'PATCH',
        data: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-features'] });
      toast({
        title: "Feature updated",
        description: "The feature status has been updated successfully."
      });
    },
    onError: (error) => {
      console.error("Failed to update feature:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the feature status. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  const handleToggleFeature = (id: number, status: 'active' | 'inactive') => {
    toggleFeatureMutation.mutate({ id, status });
  };

  // Handle error state
  if (error) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Error loading AI features</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't load your AI features. Please try again later.
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/ai-features'] })}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AIFeaturesCard 
      features={features} 
      onToggleFeature={handleToggleFeature} 
      isLoading={isLoading || isUpdating} 
    />
  );
}