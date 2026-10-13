import { Cookie, Beacon, SecurityData } from "@shared/schema";

export class DPDPChecker {
  async checkCompliance(data: {
    cookies: Cookie[];
    beacons: Beacon[];
    security?: SecurityData;
    html: string;
  }) {
    const results = {
      dataRetentionIssues: 0,
      consentIssues: 0,
      crossBorderIssues: 0,
      childrenDataIssues: 0,
      score: 0
    };

    // Check data retention compliance (3-year rule)
    results.dataRetentionIssues = this.checkDataRetention(data.html);
    
    // Check consent mechanisms for DPDP requirements
    results.consentIssues = this.checkDPDPConsent(data.html, data.cookies);
    
    // Check cross-border transfers under DPDP
    if (data.security?.crossBorderTransfers) {
      results.crossBorderIssues = data.security.crossBorderTransfers.length;
    }
    
    // Check children's data protection
    results.childrenDataIssues = this.checkChildrenDataProtection(data.html);

    return results;
  }

  private checkDataRetention(html: string): number {
    let issues = 0;
    
    // Check for data retention policy
    const hasRetentionPolicy = html.includes('retention') && 
                              html.includes('delete') &&
                              html.includes('years');
    
    if (!hasRetentionPolicy) {
      issues += 3;
    }
    
    // Check for automated deletion mechanisms
    const hasAutomatedDeletion = html.includes('automatic') && 
                                html.includes('deletion');
    
    if (!hasAutomatedDeletion) {
      issues += 2;
    }

    return issues;
  }

  private checkDPDPConsent(html: string, cookies: Cookie[]): number {
    let issues = 0;
    
    // DPDP requires clear, specific consent
    const hasSpecificConsent = html.includes('specific') && 
                              html.includes('consent');
    
    if (!hasSpecificConsent && cookies.length > 0) {
      issues += 4;
    }
    
    // Check for withdrawal mechanism
    const hasWithdrawal = html.includes('withdraw') || 
                         html.includes('revoke');
    
    if (!hasWithdrawal) {
      issues += 3;
    }
    
    // Check for purpose limitation
    const hasPurposeLimitation = html.includes('purpose') && 
                                html.includes('processing');
    
    if (!hasPurposeLimitation) {
      issues += 2;
    }

    return issues;
  }

  private checkChildrenDataProtection(html: string): number {
    let issues = 0;
    
    // Check for age verification
    const hasAgeVerification = html.includes('age') && 
                              (html.includes('18') || html.includes('verify'));
    
    // Check for parental consent mechanisms
    const hasParentalConsent = html.includes('parent') && 
                              html.includes('consent');
    
    // If site might collect children's data but lacks protections
    const mightCollectChildrenData = html.includes('game') || 
                                   html.includes('child') || 
                                   html.includes('kid') ||
                                   html.includes('educational');
    
    if (mightCollectChildrenData && !hasAgeVerification && !hasParentalConsent) {
      issues += 5; // Major violation for children's data
    }

    return issues;
  }
}
