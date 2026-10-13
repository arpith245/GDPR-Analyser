import { type User, type InsertUser, type Analysis, type InsertAnalysis, type AnalysisRequest } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: string): Promise<Analysis | undefined>;
  getAnalysesByUrl(url: string): Promise<Analysis[]>;
  updateAnalysis(id: string, updates: Partial<InsertAnalysis>): Promise<Analysis | undefined>;
  getAllAnalyses(): Promise<Analysis[]>;
  
  createAnalysisRequest(request: AnalysisRequest): Promise<{ id: string }>;
  getAnalysisRequest(id: string): Promise<AnalysisRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private analyses: Map<string, Analysis>;
  private analysisRequests: Map<string, AnalysisRequest & { id: string }>;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.analysisRequests = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = randomUUID();
    const now = new Date();
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      status: insertAnalysis.status || "pending",
      overallScore: insertAnalysis.overallScore || null,
      gdprScore: insertAnalysis.gdprScore || null,
      dpdpScore: insertAnalysis.dpdpScore || null,
      privacyDesignScore: insertAnalysis.privacyDesignScore || null,
      cookieData: insertAnalysis.cookieData || null,
      beaconData: insertAnalysis.beaconData || null,
      securityData: insertAnalysis.securityData || null,
      validationData: insertAnalysis.validationData || null,
      recommendations: insertAnalysis.recommendations || null,
      createdAt: now,
      updatedAt: now,
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: string): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAnalysesByUrl(url: string): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).filter(
      (analysis) => analysis.url === url
    );
  }

  async updateAnalysis(id: string, updates: Partial<InsertAnalysis>): Promise<Analysis | undefined> {
    const existing = this.analyses.get(id);
    if (!existing) return undefined;
    
    const updated: Analysis = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.analyses.set(id, updated);
    return updated;
  }

  async getAllAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values());
  }

  async createAnalysisRequest(request: AnalysisRequest): Promise<{ id: string }> {
    const id = randomUUID();
    const requestWithId = { ...request, id };
    this.analysisRequests.set(id, requestWithId);
    return { id };
  }

  async getAnalysisRequest(id: string): Promise<AnalysisRequest | undefined> {
    const request = this.analysisRequests.get(id);
    if (!request) return undefined;
    const { id: _, ...requestWithoutId } = request;
    return requestWithoutId;
  }
}

export const storage = new MemStorage();
