import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Plus, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { aiService } from "@/lib/ai-service";

// Create topic form schema
const createTopicSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options are required").max(10, "Maximum 10 options allowed"),
});

export default function CreateTopicPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  const form = useForm<z.infer<typeof createTopicSchema>>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      options: ["", ""],
    },
  });
  
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
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof createTopicSchema>) => {
    try {
      setIsSubmitting(true);
      
      const payload = {
        title: data.title,
        description: data.description,
        categoryId: parseInt(data.categoryId),
        options: data.options.filter(option => option.trim().length > 0),
      };
      
      const response = await apiRequest("POST", "/api/topics", payload);
      const newTopic = await response.json();
      
      // Invalidate topics query to refresh list
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      
      toast({
        title: "Topic created!",
        description: "Your topic has been successfully created.",
      });
      
      // Navigate to the new topic page
      navigate(`/topic/${newTopic.id}`);
    } catch (error) {
      toast({
        title: "Failed to create topic",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add a new option field
  const addOption = () => {
    const currentOptions = form.getValues().options;
    if (currentOptions.length < 10) {
      form.setValue("options", [...currentOptions, ""]);
    } else {
      toast({
        title: "Maximum options reached",
        description: "You can have a maximum of 10 options.",
        variant: "destructive",
      });
    }
  };
  
  // Remove an option field
  const removeOption = (index: number) => {
    const currentOptions = form.getValues().options;
    if (currentOptions.length > 2) {
      const newOptions = [...currentOptions];
      newOptions.splice(index, 1);
      form.setValue("options", newOptions);
    } else {
      toast({
        title: "Minimum options required",
        description: "You need at least 2 options.",
        variant: "destructive",
      });
    }
  };
  
  // Use a suggestion
  const useSuggestion = (suggestion: string) => {
    form.setValue("title", suggestion);
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create a New Topic</h1>
            <p className="text-gray-600">
              Start a conversation, gather opinions, and make collective decisions on issues that matter.
            </p>
          </div>
          
          {/* AI Suggestions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Topic Suggestions</CardTitle>
              <CardDescription>
                Need inspiration? Here are some AI-generated topic ideas you can use.
              </CardDescription>
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
                  No suggestions available at the moment.
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Create Topic Form */}
          <Card className="glass rounded-2xl overflow-hidden shadow-xl">
            <CardContent className="p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Topic Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ask a clear, concise question..." 
                            className="px-4 py-3"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide context to help others understand your topic..." 
                            className="px-4 py-3"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingCategories ? (
                              <div className="flex justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              categories?.map(category => (
                                <SelectItem 
                                  key={category.id} 
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Voting Options */}
                  <div>
                    <FormLabel className="block mb-2">Voting Options</FormLabel>
                    <div className="space-y-3">
                      {form.watch("options").map((_, index) => (
                        <FormField
                          key={index}
                          control={form.control}
                          name={`options.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center">
                                <FormControl>
                                  <Input 
                                    placeholder={`Option ${index + 1}`} 
                                    className="flex-1 px-4 py-3"
                                    {...field} 
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="ml-2 text-gray-500 hover:text-gray-700"
                                  onClick={() => removeOption(index)}
                                  aria-label="Remove option"
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 flex items-center text-primary hover:text-primary-dark text-sm font-medium"
                      onClick={addOption}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      className="px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-medium transition shadow-md hover:shadow-lg vote-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Create Topic
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
