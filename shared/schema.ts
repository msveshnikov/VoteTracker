import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  active: boolean("active").default(true),
});

export const options = pgTable("options", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  topicId: integer("topic_id").references(() => topics.id).notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  optionId: integer("option_id").references(() => options.id).notNull(),
  topicId: integer("topic_id").references(() => topics.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  icon: true,
});

export const insertTopicSchema = createInsertSchema(topics).pick({
  title: true,
  description: true,
  userId: true,
  categoryId: true,
});

export const insertOptionSchema = createInsertSchema(options).pick({
  text: true,
  topicId: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  userId: true,
  optionId: true,
  topicId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type TopicWithOptions = Topic & { options: Option[]; voteCount: number };
export type TopicWithCategoryAndOptions = TopicWithOptions & { category: Category };
export type TopicWithCategoryAndOptionsAndVotes = TopicWithCategoryAndOptions & { userVote?: Vote };

export type Option = typeof options.$inferSelect;
export type InsertOption = z.infer<typeof insertOptionSchema>;
export type OptionWithVoteCount = Option & { voteCount: number; percentage: number };

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
