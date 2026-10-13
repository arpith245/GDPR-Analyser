import { Beacon } from "@shared/schema";

export class BeaconDetector {
  async detectBeacons(page: any, html: string) {
    const beacons: Beacon[] = [];
    
    // Detect pixel beacons
    const pixelBeacons = await this.detectPixelBeacons(html);
    beacons.push(...pixelBeacons);
    
    // Detect AI-powered trackers
    const aiBeacons = await this.detectAIBeacons(page, html);
    beacons.push(...aiBeacons);
    
    // Detect marketing beacons
    const marketingBeacons = await this.detectMarketingBeacons(html);
    beacons.push(...marketingBeacons);

    const stats = this.generateBeaconStats(beacons);

    return {
      beacons,
      stats,
      totalViolations: beacons.filter(b => b.gdprViolation || b.dpdpViolation).length
    };
  }

  private async detectPixelBeacons(html: string): Promise<Beacon[]> {
    const beacons: Beacon[] = [];
    
    // Google Analytics detection
    if (html.includes('google-analytics.com') || html.includes('gtag')) {
      beacons.push({
        type: 'pixel',
        name: 'Google Analytics 4 Enhanced Ecommerce',
        description: 'gtag.js - Cross-domain tracking enabled',
        domain: '.google-analytics.com',
        gdprViolation: true, // Assuming no proper consent
        dpdpViolation: false,
        aiConsentRequired: false,
        crossBorder: true
      });
    }
    
    // Facebook Pixel detection
    if (html.includes('facebook.com/tr') || html.includes('fbevents.js')) {
      beacons.push({
        type: 'pixel',
        name: 'Facebook Pixel',
        description: 'Standard conversion tracking pixel',
        domain: '.facebook.com',
        gdprViolation: true,
        dpdpViolation: true,
        aiConsentRequired: false,
        crossBorder: true
      });
    }

    return beacons;
  }

  private async detectAIBeacons(page: any, html: string): Promise<Beacon[]> {
    const beacons: Beacon[] = [];
    
    // Meta Pixel AI-powered targeting
    if (html.includes('fbevents.js') && html.includes('Conversions API')) {
      beacons.push({
        type: 'ai',
        name: 'Meta Pixel AI-Powered Targeting',
        description: 'Advanced conversion API with behavioral prediction',
        domain: '.facebook.com',
        gdprViolation: false, // Assuming consent is properly handled
        dpdpViolation: false,
        aiConsentRequired: true,
        crossBorder: true
      });
    }
    
    // Google Analytics Intelligence
    if (html.includes('gtag') && html.includes('enhanced_ecommerce')) {
      beacons.push({
        type: 'ai',
        name: 'Google Analytics Intelligence',
        description: 'AI-powered audience insights and predictions',
        domain: '.google-analytics.com',
        gdprViolation: true,
        dpdpViolation: false,
        aiConsentRequired: true,
        crossBorder: true
      });
    }

    return beacons;
  }

  private async detectMarketingBeacons(html: string): Promise<Beacon[]> {
    const beacons: Beacon[] = [];
    
    // Generic marketing pixels
    const marketingDomains = [
      'doubleclick.net',
      'adsystem.com',
      'amazon-adsystem.com',
      'twitter.com/i/adsct',
      'linkedin.com/li.lms-analytics'
    ];

    for (const domain of marketingDomains) {
      if (html.includes(domain)) {
        beacons.push({
          type: 'marketing',
          name: `Marketing Beacon (${domain})`,
          description: 'Third-party marketing and retargeting pixel',
          domain: domain,
          gdprViolation: true, // Most don't have proper consent
          dpdpViolation: true,
          aiConsentRequired: false,
          crossBorder: true
        });
      }
    }

    return beacons;
  }

  private generateBeaconStats(beacons: Beacon[]) {
    return {
      total: beacons.length,
      pixel: beacons.filter(b => b.type === 'pixel').length,
      ai: beacons.filter(b => b.type === 'ai').length,
      marketing: beacons.filter(b => b.type === 'marketing').length,
      crossBorder: beacons.filter(b => b.crossBorder).length,
      gdprViolations: beacons.filter(b => b.gdprViolation).length,
      dpdpViolations: beacons.filter(b => b.dpdpViolation).length,
      aiConsentRequired: beacons.filter(b => b.aiConsentRequired).length
    };
  }
}
