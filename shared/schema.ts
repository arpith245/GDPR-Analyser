import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const analyses = pgTable("analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  analysisType: text("analysis_type").notNull(),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  overallScore: integer("overall_score"),
  gdprScore: integer("gdpr_score"),
  dpdpScore: integer("dpdp_score"),
  privacyDesignScore: integer("privacy_design_score"),
  cookieData: jsonb("cookie_data"),
  beaconData: jsonb("beacon_data"),
  securityData: jsonb("security_data"),
  validationData: jsonb("validation_data"),
  recommendations: jsonb("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analysisRequests = pgTable("analysis_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  analysisType: text("analysis_type").notNull(),
  options: jsonb("options"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const analysisRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  analysisType: z.enum(["full", "gdpr", "dpdp", "quick"]),
  options: z.object({
    cookieAnalysis: z.boolean().default(true),
    beaconDetection: z.boolean().default(true),
    securityCheck: z.boolean().default(true),
    aiConsent: z.boolean().default(true),
  }),
});

export const cookieSchema = z.object({
  name: z.string(),
  type: z.enum(["necessary", "tracking", "marketing", "functional"]),
  domain: z.string(),
  consentStatus: z.enum(["no_consent", "not_required", "implied", "explicit"]),
  gdprCompliant: z.boolean(),
  dpdpCompliant: z.boolean(),
  secure: z.boolean(),
  httpOnly: z.boolean(),
  sameSite: z.string().optional(),
  expires: z.string().optional(),
});

export const beaconSchema = z.object({
  type: z.enum(["pixel", "ai", "marketing", "analytics"]),
  name: z.string(),
  description: z.string(),
  domain: z.string(),
  gdprViolation: z.boolean(),
  dpdpViolation: z.boolean(),
  aiConsentRequired: z.boolean(),
  crossBorder: z.boolean(),
});

export const securitySchema = z.object({
  tlsVersion: z.string(),
  certificateGrade: z.string(),
  hstsEnabled: z.boolean(),
  perfectForwardSecrecy: z.boolean(),
  crossBorderTransfers: z.array(z.object({
    destination: z.string(),
    adequacyStatus: z.string(),
    safeguards: z.array(z.string()),
  })),
});

export const validationSchema = z.object({
  consentManagement: z.enum(["implemented", "partial", "missing"]),
  dataPortability: z.enum(["implemented", "partial", "missing"]),
  rightToErasure: z.enum(["implemented", "partial", "missing"]),
  breachNotification: z.enum(["compliant", "partial", "missing"]),
});

export const recommendationSchema = z.object({
  priority: z.enum(["critical", "high", "medium", "low"]),
  title: z.string(),
  description: z.string(),
  regulation: z.string(),
  article: z.string().optional(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type Cookie = z.infer<typeof cookieSchema>;
export type Beacon = z.infer<typeof beaconSchema>;
export type SecurityData = z.infer<typeof securitySchema>;
export type ValidationData = z.infer<typeof validationSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
