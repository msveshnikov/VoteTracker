import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { TopicCard } from "@/components/ui/topic-card";
import { CategoryCard } from "@/components/ui/category-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: topics, isLoading: isLoadingTopics } = useQuery({
    queryKey: ["/api/topics"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Get trending topics (most votes)
  const trendingTopics = topics
    ? [...topics].sort((a, b) => b.voteCount - a.voteCount).slice(0, 3)
    : [];
    
  // Add topic counts to categories
  const categoriesWithCounts = categories
    ? categories.map(category => ({
        ...category,
        topicCount: topics?.filter(topic => topic.categoryId === category.id).length || 0
      }))
    : [];
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-gray-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-br from-primary to-secondary"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
              The Definitive Source for <span className="text-primary">Public Opinion</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              MakeYour.vote unifies all votes into a single source of truth, making the collective sentiment official & visible for all.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create">
                <Button className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-medium shadow-lg hover:shadow-xl vote-btn">
                  Create a Topic
                </Button>
              </Link>
              
              <Link href="/categories">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-3 rounded-full text-primary border-primary font-medium vote-btn">
                  Explore Topics
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-1">{topics?.length || 0}</p>
              <p className="text-gray-600 text-sm">Active Topics</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-1">{categories?.length || 0}</p>
              <p className="text-gray-600 text-sm">Categories</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-1">
                {topics?.reduce((acc, topic) => acc + topic.voteCount, 0) || 0}
              </p>
              <p className="text-gray-600 text-sm">Total Votes</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-1">
                {Math.max(1, topics?.filter(t => t.voteCount > 0).length || 0)}
              </p>
              <p className="text-gray-600 text-sm">Active Discussions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Topics */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Trending Topics</h2>
            <Link href="/categories">
              <a className="text-primary hover:text-primary-dark font-medium text-sm flex items-center transition">
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </Link>
          </div>
          
          {isLoadingTopics ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trendingTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 glass rounded-lg">
              <p className="text-gray-600">No topics available yet. Be the first to create one!</p>
              <Link href="/create">
                <Button className="mt-4 vote-btn">Create Topic</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Category Browser */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Browse by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Explore topics organized by categories that matter to you</p>
          </div>
          
          {isLoadingCategories ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {categoriesWithCounts.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center">
            <Link href="/categories">
              <a className="inline-flex items-center text-primary hover:text-primary-dark font-medium transition">
                View All Categories
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Join the Community and Make Your Voice Heard</h2>
              <p className="text-white text-opacity-90 mb-8">Create an account to vote on topics, start discussions, and track the issues that matter most to you.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth">
                  <Button className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-primary font-medium shadow-lg hover:shadow-xl vote-btn">
                    Sign Up Free
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" className="w-full sm:w-auto px-8 py-3 rounded-full bg-transparent border border-white text-white font-medium vote-btn">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
}
