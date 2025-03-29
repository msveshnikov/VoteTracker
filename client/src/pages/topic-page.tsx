import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { TopicCard } from "@/components/ui/topic-card";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export default function TopicPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const topicId = Number(id);
  
  const { data: topic, isLoading } = useQuery({
    queryKey: [`/api/topics/${topicId}`],
    enabled: !isNaN(topicId),
  });
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: topic?.title || "Check out this topic on MakeYour.vote",
          text: topic?.description || "Join the discussion and cast your vote!",
          url: window.location.href,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          toast({
            title: "Share failed",
            description: "Could not share this topic.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Topic link copied to clipboard.",
      });
    }
  };
  
  if (isNaN(topicId)) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Topic ID</h1>
            <p className="text-gray-600 mb-6">The topic ID provided is not valid.</p>
            <Button onClick={() => navigate("/")} className="vote-btn">
              Return Home
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to topics
        </Button>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !topic ? (
          <div className="max-w-3xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Topic Not Found</h1>
            <p className="text-gray-600 mb-6">
              The topic you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/")} className="vote-btn">
              Browse Topics
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="glass rounded-xl shadow-lg mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-opacity-90">
                    {topic.category?.name || "Uncategorized"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold mt-2">
                  {topic.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-8">{topic.description}</p>
                
                {/* Topic metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {topic.voteCount} {topic.voteCount === 1 ? 'vote' : 'votes'}
                  </div>
                  {topic.createdAt && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created on {new Date(topic.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <TopicCard topic={topic} showFullContent={true} />
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4 flex justify-between">
                {!user && (
                  <p className="text-sm text-gray-500">
                    <a href="/auth" className="text-primary hover:underline">
                      Sign in
                    </a>{" "}
                    to cast your vote
                  </p>
                )}
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Browse More Topics
                  </Button>
                  {user && (
                    <Button 
                      variant="default"
                      onClick={() => navigate("/create")}
                      className="vote-btn"
                    >
                      Create Your Own
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
