import { Cookie, Beacon, SecurityData } from "@shared/schema";

export class GDPRChecker {
  async checkCompliance(data: {
    cookies: Cookie[];
    beacons: Beacon[];
    security?: SecurityData;
    html: string;
  }) {
    const results = {
      cookieViolations: 0,
      consentIssues: 0,
      aiConsentIssues: 0,
      crossBorderIssues: 0,
      dataSubjectRights: 0,
      score: 0
    };

    // Check cookie compliance
    results.cookieViolations = data.cookies.filter(c => !c.gdprCompliant).length;
    
    // Check consent mechanisms (2025 updates)
    results.consentIssues = this.checkConsentMechanisms(data.html, data.cookies);
    
    // Check AI consent requirements (new in 2025)
    results.aiConsentIssues = data.beacons.filter(b => b.aiConsentRequired && b.gdprViolation).length;
    
    // Check cross-border transfers
    if (data.security?.crossBorderTransfers) {
      results.crossBorderIssues = data.security.crossBorderTransfers.filter(
        t => t.adequacyStatus === 'Review Needed'
      ).length;
    }
    
    // Check data subject rights implementation
    results.dataSubjectRights = this.checkDataSubjectRights(data.html);

    return results;
  }

  private checkConsentMechanisms(html: string, cookies: Cookie[]): number {
    let issues = 0;
    
    // Check for consent banner
    const hasConsentBanner = html.includes('cookie') && 
                            (html.includes('accept') || html.includes('consent'));
    
    if (!hasConsentBanner && cookies.some(c => c.type === 'tracking' || c.type === 'marketing')) {
      issues += 5; // Major violation
    }
    
    // Check for granular consent (2025 requirement)
    const hasGranularConsent = html.includes('manage cookies') || 
                              html.includes('cookie settings');
    
    if (!hasGranularConsent) {
      issues += 3;
    }
    
    // Check for opt-out mechanisms
    const hasOptOut = html.includes('opt-out') || html.includes('withdraw consent');
    
    if (!hasOptOut) {
      issues += 2;
    }

    return issues;
  }

  private checkDataSubjectRights(html: string): number {
    let implementedRights = 0;
    
    // Right to access
    if (html.includes('download') && html.includes('data')) {
      implementedRights += 1;
    }
    
    // Right to rectification
    if (html.includes('correct') || html.includes('update')) {
      implementedRights += 1;
    }
    
    // Right to erasure
    if (html.includes('delete') || html.includes('remove')) {
      implementedRights += 1;
    }
    
    // Right to data portability
    if (html.includes('export') || html.includes('download')) {
      implementedRights += 1;
    }
    
    // Right to object
    if (html.includes('object') || html.includes('opt-out')) {
      implementedRights += 1;
    }

    return implementedRights;
  }
}
