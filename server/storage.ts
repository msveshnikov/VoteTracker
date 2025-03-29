import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  topics, type Topic, type InsertTopic, type TopicWithOptions, type TopicWithCategoryAndOptions, type TopicWithCategoryAndOptionsAndVotes,
  options, type Option, type InsertOption, type OptionWithVoteCount,
  votes, type Vote, type InsertVote
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, and, like, sql, desc, count } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Topic operations
  getTopics(): Promise<TopicWithCategoryAndOptions[]>;
  getTopic(id: number): Promise<TopicWithCategoryAndOptionsAndVotes | undefined>;
  getTopicsByCategory(categoryId: number): Promise<TopicWithCategoryAndOptions[]>;
  createTopic(topic: InsertTopic, options: string[]): Promise<TopicWithOptions>;
  searchTopics(query: string): Promise<TopicWithCategoryAndOptions[]>;
  
  // Vote operations
  getVote(userId: number, topicId: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  getTopicStats(topicId: number): Promise<OptionWithVoteCount[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }
  
  // Topic operations
  async getTopics(): Promise<TopicWithCategoryAndOptions[]> {
    const allTopics = await db.select().from(topics);
    return Promise.all(allTopics.map(topic => this.enrichTopicWithCategoryAndOptions(topic)));
  }
  
  async getTopic(id: number): Promise<TopicWithCategoryAndOptionsAndVotes | undefined> {
    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.id, id));
    
    if (!topic) return undefined;
    
    const enrichedTopic = await this.enrichTopicWithCategoryAndOptions(topic);
    return {
      ...enrichedTopic,
      userVote: undefined // This will be populated for a specific user in the API routes
    };
  }
  
  async getTopicsByCategory(categoryId: number): Promise<TopicWithCategoryAndOptions[]> {
    const topicsInCategory = await db
      .select()
      .from(topics)
      .where(eq(topics.categoryId, categoryId));
    
    return Promise.all(topicsInCategory.map(topic => this.enrichTopicWithCategoryAndOptions(topic)));
  }
  
  async createTopic(topic: InsertTopic, optionTexts: string[]): Promise<TopicWithOptions> {
    // Start a transaction
    const [newTopic] = await db.transaction(async (tx) => {
      // Create the topic
      const [createdTopic] = await tx
        .insert(topics)
        .values({ ...topic, active: true })
        .returning();
      
      // Create options for the topic
      const optionsToInsert = optionTexts
        .filter(text => text.trim())
        .map(text => ({ text, topicId: createdTopic.id }));
      
      // Insert all options
      await tx.insert(options).values(optionsToInsert);
      
      return [createdTopic];
    });
    
    // Get the options that were just created
    const topicOptions = await db
      .select()
      .from(options)
      .where(eq(options.topicId, newTopic.id));
    
    return {
      ...newTopic,
      options: topicOptions,
      voteCount: 0
    };
  }
  
  async searchTopics(query: string): Promise<TopicWithCategoryAndOptions[]> {
    const searchPattern = `%${query}%`;
    
    const matchingTopics = await db
      .select()
      .from(topics)
      .where(
        sql`${topics.title} ILIKE ${searchPattern} OR ${topics.description} ILIKE ${searchPattern}`
      );
    
    return Promise.all(matchingTopics.map(topic => this.enrichTopicWithCategoryAndOptions(topic)));
  }
  
  // Vote operations
  async getVote(userId: number, topicId: number): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, userId),
          eq(votes.topicId, topicId)
        )
      );
    return vote;
  }
  
  async createVote(vote: InsertVote): Promise<Vote> {
    // Start a transaction
    return db.transaction(async (tx) => {
      // Check if user already voted on this topic
      const [existingVote] = await tx
        .select()
        .from(votes)
        .where(
          and(
            eq(votes.userId, vote.userId),
            eq(votes.topicId, vote.topicId)
          )
        );
      
      if (existingVote) {
        // If the user is voting for the same option, return the existing vote
        if (existingVote.optionId === vote.optionId) {
          return existingVote;
        }
        
        // Otherwise, delete the existing vote
        await tx
          .delete(votes)
          .where(eq(votes.id, existingVote.id));
      }
      
      // Create the new vote
      const [newVote] = await tx
        .insert(votes)
        .values(vote)
        .returning();
      
      return newVote;
    });
  }
  
  async getTopicStats(topicId: number): Promise<OptionWithVoteCount[]> {
    // Get all options for the topic
    const topicOptions = await db
      .select()
      .from(options)
      .where(eq(options.topicId, topicId));
    
    // Count votes per option
    const voteCountsQuery = db
      .select({
        optionId: votes.optionId,
        count: count(),
      })
      .from(votes)
      .where(eq(votes.topicId, topicId))
      .groupBy(votes.optionId);
    
    const voteCounts = await voteCountsQuery;
    
    // Total votes for this topic
    const totalVotes = voteCounts.reduce((sum, { count }) => sum + Number(count), 0);
    
    // Create the stats object
    const optionsWithStats: OptionWithVoteCount[] = topicOptions.map(option => {
      const voteCount = voteCounts.find(vc => vc.optionId === option.id)?.count || 0;
      const percentage = totalVotes > 0 ? Math.round((Number(voteCount) / totalVotes) * 100) : 0;
      
      return {
        ...option,
        voteCount: Number(voteCount),
        percentage
      };
    });
    
    return optionsWithStats.sort((a, b) => b.voteCount - a.voteCount);
  }
  
  // Helper methods
  private async enrichTopicWithOptions(topic: Topic): Promise<TopicWithOptions> {
    // Get options for this topic
    const topicOptions = await db
      .select()
      .from(options)
      .where(eq(options.topicId, topic.id));
    
    // Count total votes for this topic
    const result = await db
      .select({ voteCount: count() })
      .from(votes)
      .where(eq(votes.topicId, topic.id));
    
    const voteCount = result.length > 0 ? Number(result[0].voteCount) : 0;
    
    return {
      ...topic,
      options: topicOptions,
      voteCount
    };
  }
  
  private async enrichTopicWithCategoryAndOptions(topic: Topic): Promise<TopicWithCategoryAndOptions> {
    const topicWithOptions = await this.enrichTopicWithOptions(topic);
    
    let category: Category | undefined;
    
    if (topic.categoryId) {
      [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, topic.categoryId));
    }
    
    return {
      ...topicWithOptions,
      category: category || { id: 0, name: 'Uncategorized', description: null, icon: null }
    };
  }

  // Seed the database with default categories if none exist
  async seedCategoriesIfNeeded() {
    const existingCategories = await db.select().from(categories);
    
    if (existingCategories.length === 0) {
      const defaultCategories: InsertCategory[] = [
        { name: 'Politics', description: 'Political discussions and polls', icon: 'buildings' },
        { name: 'Technology', description: 'Tech innovations and digital trends', icon: 'laptop' },
        { name: 'Environment', description: 'Climate and environmental issues', icon: 'globe' },
        { name: 'Health', description: 'Healthcare and wellness topics', icon: 'activity' },
        { name: 'Education', description: 'Learning and educational reforms', icon: 'graduation-cap' },
        { name: 'Economy', description: 'Economic policies and financial matters', icon: 'dollar-sign' },
        { name: 'Society', description: 'Social issues and community concerns', icon: 'users' },
        { name: 'Culture', description: 'Arts, entertainment and cultural topics', icon: 'palette' }
      ];
      
      await db.insert(categories).values(defaultCategories);
    }
  }
}

export const storage = new DatabaseStorage();
