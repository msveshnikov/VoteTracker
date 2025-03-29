import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTopicSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Seed the database with default categories if needed
  if ('seedCategoriesIfNeeded' in storage) {
    await (storage as any).seedCategoriesIfNeeded();
  }

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all topics with category and options
  app.get("/api/topics", async (req, res) => {
    try {
      const topics = await storage.getTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Get topics by category
  app.get("/api/categories/:id/topics", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const topics = await storage.getTopicsByCategory(categoryId);
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topics by category" });
    }
  });

  // Get single topic with details
  app.get("/api/topics/:id", async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      if (isNaN(topicId)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }

      const topic = await storage.getTopic(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      // Get vote statistics for this topic
      const stats = await storage.getTopicStats(topicId);

      // If user is authenticated, check if they have already voted
      let userVote;
      if (req.isAuthenticated()) {
        userVote = await storage.getVote(req.user!.id, topicId);
      }

      res.json({
        ...topic,
        options: stats,
        userVote
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topic" });
    }
  });

  // Create a new topic
  app.post("/api/topics", async (req, res) => {
    // User must be authenticated to create a topic
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to create a topic" });
    }

    try {
      const createTopicSchema = insertTopicSchema.extend({
        options: z.array(z.string().min(1)).min(2).max(10)
      });

      const validation = createTopicSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid topic data", errors: validation.error.format() });
      }

      const { options, ...topicData } = validation.data;
      const newTopic = await storage.createTopic(
        { 
          ...topicData,
          userId: req.user!.id 
        },
        options
      );

      res.status(201).json(newTopic);
    } catch (error) {
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  // Search topics
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }

      const results = await storage.searchTopics(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search topics" });
    }
  });

  // Cast a vote on a topic
  app.post("/api/vote", async (req, res) => {
    // User must be authenticated to vote
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to vote" });
    }

    try {
      // Create a client-side vote schema that doesn't require userId
      const clientVoteSchema = z.object({
        optionId: z.number(),
        topicId: z.number()
      });
      
      // Validate the client input
      const clientValidation = clientVoteSchema.safeParse(req.body);
      if (!clientValidation.success) {
        return res.status(400).json({ message: "Invalid vote data", errors: clientValidation.error.format() });
      }
      
      const { optionId, topicId } = clientValidation.data;

      // Check if option belongs to topic
      const topic = await storage.getTopic(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      const optionBelongsToTopic = topic.options.some((o: any) => o.id === optionId);
      if (!optionBelongsToTopic) {
        return res.status(400).json({ message: "Option does not belong to this topic" });
      }

      // Make sure we have a valid user ID
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User session is invalid" });
      }

      // Create the vote with the user ID from the session
      const vote = await storage.createVote({
        userId: req.user.id,
        optionId,
        topicId
      });

      // Get updated stats
      const updatedStats = await storage.getTopicStats(topicId);

      res.status(201).json({ vote, stats: updatedStats });
    } catch (error) {
      console.error("Vote error:", error);
      res.status(500).json({ message: "Failed to cast vote" });
    }
  });

  // Get AI topic suggestions
  app.get("/api/suggestions", (req, res) => {
    // Simplified implementation for AI topic suggestions
    // In a production environment, this would integrate with a real AI service
    const suggestions = [
      "Should remote work become the new standard for office jobs?",
      "Is universal basic income a viable economic policy?",
      "Should social media platforms be regulated like public utilities?",
      "Are electric vehicles the best solution for reducing transportation emissions?",
      "Should voting be mandatory in democratic countries?"
    ];

    res.json({ suggestions });
  });

  const httpServer = createServer(app);
  return httpServer;
}
