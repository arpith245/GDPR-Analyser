import puppeteer from "puppeteer";
import { AnalysisRequest, Cookie, Beacon, SecurityData, ValidationData, Recommendation } from "@shared/schema";
import { CookieAnalyzer } from "./cookie-analyzer.js";
import { BeaconDetector } from "./beacon-detector.js";
import { SecurityAnalyzer } from "./security-analyzer.js";
import { GDPRChecker } from "./gdpr-checker.js";
import { DPDPChecker } from "./dpdp-checker.js";

export class WebsiteAnalyzer {
  private cookieAnalyzer: CookieAnalyzer;
  private beaconDetector: BeaconDetector;
  private securityAnalyzer: SecurityAnalyzer;
  private gdprChecker: GDPRChecker;
  private dpdpChecker: DPDPChecker;

  constructor() {
    this.cookieAnalyzer = new CookieAnalyzer();
    this.beaconDetector = new BeaconDetector();
    this.securityAnalyzer = new SecurityAnalyzer();
    this.gdprChecker = new GDPRChecker();
    this.dpdpChecker = new DPDPChecker();
  }

  async analyzeWebsite(request: AnalysisRequest) {
    // SSRF Protection: Validate URL scheme and hostname
    const url = new URL(request.url);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are allowed');
    }
    
    // Block private/internal network ranges
    const hostname = url.hostname.toLowerCase();
    const privateRanges = [
      'localhost', '127.0.0.1', '0.0.0.0',
      '10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.',
      '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.',
      '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '192.168.',
      '169.254.', 'fe80:', '::1'
    ];
    
    if (privateRanges.some(range => hostname.includes(range))) {
      throw new Error('Private network access is not allowed');
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set page timeout
      page.setDefaultTimeout(30000);
      
      // Navigate to the website
      await page.goto(request.url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      const html = await page.content();
      const cookies = await page.cookies();
      
      // Perform analysis based on options
      const results: any = {};

      if (request.options.cookieAnalysis) {
        results.cookieData = await this.cookieAnalyzer.analyzeCookies(cookies, request.url);
      }

      if (request.options.beaconDetection) {
        results.beaconData = await this.beaconDetector.detectBeacons(page, html);
      }

      if (request.options.securityCheck) {
        results.securityData = await this.securityAnalyzer.analyzeSecurity(request.url);
      }

      // GDPR and DPDP compliance checks
      const gdprResults = await this.gdprChecker.checkCompliance({
        cookies: results.cookieData?.cookies || [],
        beacons: results.beaconData?.beacons || [],
        security: results.securityData,
        html
      });

      const dpdpResults = await this.dpdpChecker.checkCompliance({
        cookies: results.cookieData?.cookies || [],
        beacons: results.beaconData?.beacons || [],
        security: results.securityData,
        html
      });

      // Generate validation data
      results.validationData = await this.generateValidationData(html, page);
      
      // Generate recommendations
      results.recommendations = this.generateRecommendations(gdprResults, dpdpResults, results);

      // Calculate scores
      results.gdprScore = this.calculateGDPRScore(gdprResults);
      results.dpdpScore = this.calculateDPDPScore(dpdpResults);
      results.privacyDesignScore = this.calculatePrivacyDesignScore(results);
      results.overallScore = Math.round((results.gdprScore + results.dpdpScore + results.privacyDesignScore) / 3);

      return results;
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async generateValidationData(html: string, page: any): Promise<ValidationData> {
    // Check for consent management
    const consentManagement = html.includes('cookie') && html.includes('consent') ? 'implemented' : 'missing';
    
    // Check for data portability
    const dataPortability = html.includes('download') && html.includes('data') ? 'partial' : 'missing';
    
    // Check for right to erasure
    const rightToErasure = html.includes('delete') || html.includes('remove') ? 'partial' : 'missing';
    
    // Check breach notification
    const breachNotification = html.includes('privacy') && html.includes('policy') ? 'compliant' : 'missing';

    return {
      consentManagement: consentManagement as any,
      dataPortability: dataPortability as any,
      rightToErasure: rightToErasure as any,
      breachNotification: breachNotification as any
    };
  }

  private generateRecommendations(gdprResults: any, dpdpResults: any, analysisResults: any): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // AI Consent recommendations
    if (analysisResults.beaconData?.beacons?.some((b: Beacon) => b.aiConsentRequired && !b.gdprViolation === false)) {
      recommendations.push({
        priority: 'critical',
        title: 'Implement AI Consent Mechanisms',
        description: '2025 GDPR updates require explicit "unconditional opt-out" rights for AI systems. Your site\'s AI-powered tracking needs updated consent flows.',
        regulation: 'GDPR Article 22',
        article: 'Article 22'
      });
    }

    // Cross-border transfer recommendations
    if (analysisResults.securityData?.crossBorderTransfers?.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Update Cross-Border Transfer Safeguards',
        description: 'Enhanced scrutiny for EU→US transfers requires updated Standard Contractual Clauses (SCCs) and additional safeguards.',
        regulation: 'Chapter V GDPR'
      });
    }

    // DPDP recommendations
    if (dpdpResults.score < 80) {
      recommendations.push({
        priority: 'low',
        title: 'Implement DPDP Data Retention Policies',
        description: 'India\'s DPDP Act requires data deletion after 3 years from last user interaction. Consider implementing automated retention schedules.',
        regulation: 'DPDP Section 8'
      });
    }

    return recommendations;
  }

  private calculateGDPRScore(gdprResults: any): number {
    // Base score calculation for GDPR compliance
    let score = 100;
    
    // Deduct points for violations
    if (gdprResults.cookieViolations > 0) score -= gdprResults.cookieViolations * 5;
    if (gdprResults.consentIssues > 0) score -= gdprResults.consentIssues * 10;
    if (gdprResults.aiConsentIssues > 0) score -= gdprResults.aiConsentIssues * 15;
    if (gdprResults.crossBorderIssues > 0) score -= gdprResults.crossBorderIssues * 8;

    return Math.max(0, score);
  }

  private calculateDPDPScore(dpdpResults: any): number {
    // Base score calculation for DPDP compliance
    let score = 100;
    
    // Deduct points for violations
    if (dpdpResults.dataRetentionIssues > 0) score -= dpdpResults.dataRetentionIssues * 10;
    if (dpdpResults.consentIssues > 0) score -= dpdpResults.consentIssues * 12;
    if (dpdpResults.crossBorderIssues > 0) score -= dpdpResults.crossBorderIssues * 15;

    return Math.max(0, score);
  }

  private calculatePrivacyDesignScore(results: any): number {
    // Calculate privacy by design score
    let score = 100;
    
    // Security factors
    if (results.securityData?.certificateGrade !== 'A+') score -= 10;
    if (!results.securityData?.hstsEnabled) score -= 15;
    if (!results.securityData?.perfectForwardSecrecy) score -= 10;
    
    // Validation factors
    if (results.validationData?.consentManagement === 'missing') score -= 20;
    if (results.validationData?.rightToErasure === 'missing') score -= 15;

    return Math.max(0, score);
  }
}
