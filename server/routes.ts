import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analysisRequestSchema } from "@shared/schema";
import { WebsiteAnalyzer } from "./services/analyzer";
import { PDFGenerator } from "./services/pdf-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  const analyzer = new WebsiteAnalyzer();
  const pdfGenerator = new PDFGenerator();

  // Start analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const validatedData = analysisRequestSchema.parse(req.body);
      
      // Create analysis request
      const { id: requestId } = await storage.createAnalysisRequest(validatedData);
      
      // Create initial analysis record
      const analysis = await storage.createAnalysis({
        url: validatedData.url,
        analysisType: validatedData.analysisType,
        status: "running",
        overallScore: null,
        gdprScore: null,
        dpdpScore: null,
        privacyDesignScore: null,
        cookieData: null,
        beaconData: null,
        securityData: null,
        validationData: null,
        recommendations: null,
      });

      // Start analysis in background
      analyzer.analyzeWebsite(validatedData)
        .then(async (results) => {
          await storage.updateAnalysis(analysis.id, {
            status: "completed",
            ...results,
          });
        })
        .catch(async (error) => {
          console.error("Analysis failed:", error);
          await storage.updateAnalysis(analysis.id, {
            status: "failed",
          });
        });

      res.json({ 
        success: true, 
        analysisId: analysis.id,
        message: "Analysis started successfully" 
      });
    } catch (error) {
      console.error("Analysis request failed:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Analysis request failed" 
      });
    }
  });

  // Get analysis status/results
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const analysis = await storage.getAnalysis(req.params.id);
      
      if (!analysis) {
        return res.status(404).json({ 
          success: false, 
          error: "Analysis not found" 
        });
      }
      
      res.json({ success: true, data: analysis });
    } catch (error) {
      console.error("Failed to get analysis:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve analysis" 
      });
    }
  });

  // Get all analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllAnalyses();
      res.json({ success: true, data: analyses });
    } catch (error) {
      console.error("Failed to get analyses:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve analyses" 
      });
    }
  });

  // Generate PDF report
  app.get("/api/analysis/:id/pdf", async (req, res) => {
    try {
      const analysis = await storage.getAnalysis(req.params.id);
      
      if (!analysis) {
        return res.status(404).json({ 
          success: false, 
          error: "Analysis not found" 
        });
      }
      
      if (analysis.status !== "completed") {
        return res.status(400).json({ 
          success: false, 
          error: "Analysis not completed yet" 
        });
      }

      const pdfBuffer = await pdfGenerator.generateReport(analysis);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="gdpr-analysis-${analysis.url.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation failed:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate PDF report" 
      });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      success: true, 
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
