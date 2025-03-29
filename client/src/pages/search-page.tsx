import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { TopicCard } from "@/components/ui/topic-card";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { aiService } from "@/lib/ai-service";

export default function SearchPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Get search query parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
      setSearchTerm(q);
    }
  }, []);

  // Load AI suggestions when component mounts
  useEffect(() => {
    async function loadSuggestions() {
      try {
        setIsLoadingSuggestions(true);
        const topicSuggestions = await aiService.getTopicSuggestions();
        setSuggestions(topicSuggestions);
      } catch (error) {
        console.error("Failed to load suggestions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }
    
    loadSuggestions();
  }, []);

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: [`/api/search?q=${searchTerm}`],
    enabled: searchTerm.length >= 2,
  });

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim().length < 2) {
      toast({
        title: "Search query too short",
        description: "Please enter at least 2 characters to search.",
        variant: "destructive",
      });
      return;
    }
    
    setSearchTerm(searchQuery);
    
    // Update URL with search query
    const params = new URLSearchParams();
    params.set("q", searchQuery);
    navigate(`/search?${params.toString()}`);
  };

  // Use a suggestion as search query
  const useSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSearchTerm(suggestion);
    
    // Update URL with search query
    const params = new URLSearchParams();
    params.set("q", suggestion);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Topics</h1>
            <p className="text-gray-600">
              Find topics and conversations that interest you
            </p>
          </div>
          
          {/* Search Form */}
          <div className="mb-10">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 rounded-lg border-gray-300"
                />
              </div>
              <Button 
                type="submit" 
                className="py-6 px-6 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium vote-btn"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
              </Button>
            </form>
          </div>
          
          {/* Topic Suggestions */}
          {!searchTerm && (
            <Card className="mb-8 glass">
              <CardHeader>
                <CardTitle className="text-xl">Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSuggestions ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left h-auto py-2 px-3 justify-start"
                        onClick={() => useSuggestion(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-2">
                    No suggested topics available at the moment.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Search Results */}
          {searchTerm && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Results for "{searchTerm}"
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : searchResults?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {searchResults.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8 glass">
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      No topics found matching "{searchTerm}".
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button onClick={() => navigate("/categories")} variant="outline" className="vote-btn">
                        Browse Categories
                      </Button>
                      <Button onClick={() => navigate("/create")} className="vote-btn">
                        Create a New Topic
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Quick Categories */}
          {!searchTerm && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Browse by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 text-left justify-start"
                  onClick={() => navigate("/category/1")}
                >
                  Politics
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 text-left justify-start"
                  onClick={() => navigate("/category/2")}
                >
                  Technology
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 text-left justify-start"
                  onClick={() => navigate("/category/3")}
                >
                  Environment
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 text-left justify-start"
                  onClick={() => navigate("/category/4")}
                >
                  Health
                </Button>
              </div>
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  onClick={() => navigate("/categories")}
                  className="text-primary"
                >
                  View All Categories
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
