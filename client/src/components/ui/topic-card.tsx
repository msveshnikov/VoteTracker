import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoteOption } from "@/components/ui/vote-option";
import { Link } from "wouter";
import { TopicWithCategoryAndOptionsAndVotes, OptionWithVoteCount } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface TopicCardProps {
  topic: TopicWithCategoryAndOptionsAndVotes;
  showFullContent?: boolean;
}

export function TopicCard({ topic, showFullContent = false }: TopicCardProps) {
  // Ensure options has proper type with voteCount and percentage
  const { category, voteCount = 0, userVote } = topic;
  const options = (topic.options || []).map(option => {
    // If option doesn't have percentage or voteCount properties, add defaults
    if (!('percentage' in option) || !('voteCount' in option)) {
      return {
        ...option,
        voteCount: 'voteCount' in option ? option.voteCount : 0,
        percentage: 'percentage' in option ? option.percentage : 0
      } as OptionWithVoteCount;
    }
    return option as OptionWithVoteCount;
  });
  
  const [selectedOption, setSelectedOption] = useState<number | null>(
    userVote ? userVote.optionId : null
  );
  const [isVoting, setIsVoting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleOptionSelect = (optionId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to log in to vote",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setSelectedOption(optionId);
  };

  const handleVote = async () => {
    if (!selectedOption) return;
    
    try {
      setIsVoting(true);
      const response = await apiRequest("POST", "/api/vote", {
        optionId: selectedOption,
        topicId: topic.id
      });
      
      // Get updated stats from response
      const data = await response.json();
      
      // Update local state with new stats
      if (data.stats && Array.isArray(data.stats)) {
        // Find option with current selection and update its percentage
        const updatedOption = data.stats.find((opt: OptionWithVoteCount) => opt.id === selectedOption);
        if (updatedOption) {
          setSelectedOption(updatedOption.id);
        }
      }
      
      // Invalidate topic cache to reload data
      queryClient.invalidateQueries({ queryKey: [`/api/topics/${topic.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      
      toast({
        title: "Vote recorded",
        description: "Your vote has been successfully recorded",
      });
    } catch (error) {
      toast({
        title: "Failed to vote",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const hasVoted = !!userVote;
  
  return (
    <Card className="glass rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl">
      <div className="relative">
        {/* Use a gradient background instead of an image for accessibility */}
        <div 
          className="w-full h-48 bg-gradient-to-br from-primary-light to-secondary"
          aria-hidden="true"
        />
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-3 py-1 rounded-full">
          <Badge variant="outline" className="text-xs font-medium text-gray-700">
            {category?.name || "Uncategorized"}
          </Badge>
        </div>
      </div>
      
      <div className="p-6">
        <Link href={`/topic/${topic.id}`} className="hover:underline">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{topic.title}</h3>
        </Link>
        {(showFullContent || topic.description?.length! < 120) ? (
          <p className="text-gray-600 text-sm mb-6">{topic.description}</p>
        ) : (
          <p className="text-gray-600 text-sm mb-6">
            {topic.description?.substring(0, 120)}...
            <Link href={`/topic/${topic.id}`} className="text-primary ml-1 hover:underline">
              Read more
            </Link>
          </p>
        )}
        
        <div className="mb-6">
          <div className="space-y-4">
            {options.map((option) => (
              <VoteOption
                key={option.id}
                text={option.text}
                percentage={option.percentage}
                isSelected={selectedOption === option.id}
                onClick={() => handleOptionSelect(option.id)}
                disabled={hasVoted && !showFullContent}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
          </div>
          
          {hasVoted ? (
            <span className="text-sm font-medium text-green-600">
              You've voted
            </span>
          ) : (
            <Button
              variant="link" 
              size="sm"
              className="flex items-center text-sm font-medium text-primary hover:text-primary-dark transition"
              onClick={selectedOption ? handleVote : () => navigate(`/topic/${topic.id}`)}
              disabled={isVoting}
            >
              {selectedOption ? "Cast Vote" : "View Topic"}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
