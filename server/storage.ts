import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  topics, type Topic, type InsertTopic, type TopicWithOptions, type TopicWithCategoryAndOptions, type TopicWithCategoryAndOptionsAndVotes,
  options, type Option, type InsertOption, type OptionWithVoteCount,
  votes, type Vote, type InsertVote
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private topics: Map<number, Topic>;
  private options: Map<number, Option>;
  private votes: Map<number, Vote>;
  
  sessionStore: session.SessionStore;
  
  currentUserId: number;
  currentCategoryId: number;
  currentTopicId: number;
  currentOptionId: number;
  currentVoteId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.topics = new Map();
    this.options = new Map();
    this.votes = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentTopicId = 1;
    this.currentOptionId = 1;
    this.currentVoteId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
    
    // Seed categories
    this.seedCategories();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Topic operations
  async getTopics(): Promise<TopicWithCategoryAndOptions[]> {
    const allTopics = Array.from(this.topics.values());
    return Promise.all(allTopics.map(topic => this.enrichTopicWithCategoryAndOptions(topic)));
  }
  
  async getTopic(id: number): Promise<TopicWithCategoryAndOptionsAndVotes | undefined> {
    const topic = this.topics.get(id);
    if (!topic) return undefined;
    
    const enrichedTopic = await this.enrichTopicWithCategoryAndOptions(topic);
    return {
      ...enrichedTopic,
      userVote: undefined // This will be populated for a specific user in the API routes
    };
  }
  
  async getTopicsByCategory(categoryId: number): Promise<TopicWithCategoryAndOptions[]> {
    const topicsInCategory = Array.from(this.topics.values())
      .filter(topic => topic.categoryId === categoryId);
    
    return Promise.all(topicsInCategory.map(topic => this.enrichTopicWithCategoryAndOptions(topic)));
  }
  
  async createTopic(topic: InsertTopic, optionTexts: string[]): Promise<TopicWithOptions> {
    const id = this.currentTopicId++;
    const now = new Date();
    const newTopic: Topic = { ...topic, id, createdAt: now, active: true };
    this.topics.set(id, newTopic);
    
    // Create options for the topic
    const createdOptions: Option[] = [];
    for (const text of optionTexts) {
      if (text.trim()) {
        const optionId = this.currentOptionId++;
        const option: Option = { id: optionId, text, topicId: id };
        this.options.set(optionId, option);
        createdOptions.push(option);
      }
    }
    
    return {
      ...newTopic,
      options: createdOptions,
      voteCount: 0
    };
  }
  
  async searchTopics(query: string): Promise<TopicWithCategoryAndOptions[]> {
    const normalizedQuery = query.toLowerCase();
    const matchingTopics = Array.from(this.topics.values())
      .filter(topic => 
        topic.title.toLowerCase().includes(normalizedQuery) || 
        (topic.description && topic.description.toLowerCase().includes(normalizedQuery))
      );
    
    return Promise.all(matchingTopics.map(topic => this.enrichTopicWithCategoryAndOptions(topic)));
  }
  
  // Vote operations
  async getVote(userId: number, topicId: number): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      vote => vote.userId === userId && vote.topicId === topicId
    );
  }
  
  async createVote(vote: InsertVote): Promise<Vote> {
    // Check if user already voted on this topic
    const existingVote = await this.getVote(vote.userId, vote.topicId);
    
    if (existingVote) {
      // Remove existing vote
      this.votes.delete(existingVote.id);
    }
    
    const id = this.currentVoteId++;
    const now = new Date();
    const newVote: Vote = { ...vote, id, createdAt: now };
    this.votes.set(id, newVote);
    return newVote;
  }
  
  async getTopicStats(topicId: number): Promise<OptionWithVoteCount[]> {
    const topicOptions = Array.from(this.options.values())
      .filter(option => option.topicId === topicId);
    
    const topicVotes = Array.from(this.votes.values())
      .filter(vote => vote.topicId === topicId);
    
    const totalVotes = topicVotes.length;
    
    const optionsWithStats: OptionWithVoteCount[] = topicOptions.map(option => {
      const voteCount = topicVotes.filter(vote => vote.optionId === option.id).length;
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      
      return {
        ...option,
        voteCount,
        percentage
      };
    });
    
    return optionsWithStats.sort((a, b) => b.voteCount - a.voteCount);
  }
  
  // Helper methods
  private async enrichTopicWithOptions(topic: Topic): Promise<TopicWithOptions> {
    const topicOptions = Array.from(this.options.values())
      .filter(option => option.topicId === topic.id);
    
    const voteCount = Array.from(this.votes.values())
      .filter(vote => vote.topicId === topic.id).length;
    
    return {
      ...topic,
      options: topicOptions,
      voteCount
    };
  }
  
  private async enrichTopicWithCategoryAndOptions(topic: Topic): Promise<TopicWithCategoryAndOptions> {
    const topicWithOptions = await this.enrichTopicWithOptions(topic);
    const category = await this.getCategory(topic.categoryId || 0);
    
    return {
      ...topicWithOptions,
      category: category || { id: 0, name: 'Uncategorized' }
    };
  }
  
  private seedCategories() {
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
    
    defaultCategories.forEach(category => {
      const id = this.currentCategoryId++;
      this.categories.set(id, { ...category, id });
    });
  }
}

export const storage = new MemStorage();
