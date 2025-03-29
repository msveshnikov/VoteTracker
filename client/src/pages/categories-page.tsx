import { MainLayout } from "@/components/layout/main-layout";
import { CategoryCard } from "@/components/ui/category-card";
import { TopicCard } from "@/components/ui/topic-card";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";

export default function CategoriesPage() {
  const params = useParams();
  const [location, navigate] = useLocation();
  const categoryId = params.id ? Number(params.id) : undefined;
  
  // Fetch all categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Fetch all topics
  const { data: allTopics, isLoading: isLoadingAllTopics } = useQuery({
    queryKey: ["/api/topics"],
  });
  
  // Fetch category-specific topics if categoryId is provided
  const { data: categoryTopics, isLoading: isLoadingCategoryTopics } = useQuery({
    queryKey: [`/api/categories/${categoryId}/topics`],
    enabled: !!categoryId,
  });
  
  // Get current category if viewing a specific category
  const currentCategory = categoryId && categories
    ? categories.find(c => c.id === categoryId)
    : undefined;
  
  // Determine which topics to display
  const topicsToDisplay = categoryId ? categoryTopics : allTopics;
  const isLoadingTopics = categoryId ? isLoadingCategoryTopics : isLoadingAllTopics;
  
  // Add topic counts to categories
  const categoriesWithCounts = categories && allTopics
    ? categories.map(category => ({
        ...category,
        topicCount: allTopics.filter(topic => topic.categoryId === category.id).length
      }))
    : [];
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            {categoryId && (
              <Button
                variant="ghost"
                size="sm"
                className="mb-4"
                onClick={() => navigate("/categories")}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                All Categories
              </Button>
            )}
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {currentCategory ? currentCategory.name : "Browse by Category"}
            </h1>
            <p className="text-gray-600">
              {currentCategory 
                ? currentCategory.description
                : "Explore topics organized by categories that matter to you"}
            </p>
          </div>
          
          {/* Categories Grid */}
          {!categoryId && (
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>All Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {categoriesWithCounts.map(category => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Topics List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {categoryId 
                ? `Topics in ${currentCategory?.name}`
                : "All Topics"
              }
            </h2>
            
            {isLoadingTopics ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : topicsToDisplay?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topicsToDisplay.map(topic => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {categoryId 
                      ? `No topics found in this category.`
                      : `No topics available.`
                    }
                  </p>
                  <Button onClick={() => navigate("/create")} className="vote-btn">
                    Create a Topic
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
