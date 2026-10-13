import { Cookie } from "@shared/schema";

export class CookieAnalyzer {
  async analyzeCookies(cookies: any[], url: string) {
    const analyzedCookies: Cookie[] = [];
    
    for (const cookie of cookies) {
      const analyzed = this.analyzeSingleCookie(cookie, url);
      analyzedCookies.push(analyzed);
    }

    const stats = this.generateCookieStats(analyzedCookies);

    return {
      cookies: analyzedCookies,
      stats,
      totalIssues: analyzedCookies.filter(c => !c.gdprCompliant || !c.dpdpCompliant).length
    };
  }

  private analyzeSingleCookie(cookie: any, url: string): Cookie {
    const type = this.determineCookieType(cookie.name, cookie.domain);
    const consentStatus = this.determineConsentStatus(cookie, type);
    
    return {
      name: cookie.name,
      type,
      domain: cookie.domain,
      consentStatus,
      gdprCompliant: this.checkGDPRCompliance(cookie, type, consentStatus),
      dpdpCompliant: this.checkDPDPCompliance(cookie, type),
      secure: cookie.secure || false,
      httpOnly: cookie.httpOnly || false,
      sameSite: cookie.sameSite,
      expires: cookie.expires ? new Date(cookie.expires * 1000).toISOString() : undefined
    };
  }

  private determineCookieType(name: string, domain: string): Cookie['type'] {
    // Analytics cookies
    if (name.includes('_ga') || name.includes('_gid') || name.includes('_gat')) {
      return 'tracking';
    }
    
    // Marketing cookies
    if (name.includes('fb') || name.includes('_fbp') || name.includes('pixel')) {
      return 'marketing';
    }
    
    // Session cookies
    if (name.includes('session') || name.includes('auth') || name.includes('csrf')) {
      return 'necessary';
    }
    
    // Third-party domains are usually tracking/marketing
    if (domain.includes('google') || domain.includes('facebook') || domain.includes('doubleclick')) {
      return 'tracking';
    }
    
    return 'functional';
  }

  private determineConsentStatus(cookie: any, type: Cookie['type']): Cookie['consentStatus'] {
    if (type === 'necessary') {
      return 'not_required';
    }
    
    // Check if it's a tracking cookie without proper consent mechanism
    if (type === 'tracking' || type === 'marketing') {
      // In a real implementation, we'd check for actual consent banners/mechanisms
      return 'no_consent'; // Assuming violation for demo
    }
    
    return 'implied';
  }

  private checkGDPRCompliance(cookie: any, type: Cookie['type'], consentStatus: Cookie['consentStatus']): boolean {
    // GDPR 2025 compliance rules
    if (type === 'necessary') return true;
    
    // Non-essential cookies need explicit consent
    if (type === 'tracking' || type === 'marketing') {
      return consentStatus === 'explicit';
    }
    
    return consentStatus !== 'no_consent';
  }

  private checkDPDPCompliance(cookie: any, type: Cookie['type']): boolean {
    // DPDP Act compliance rules
    if (type === 'necessary') return true;
    
    // Check for secure transmission
    if (!cookie.secure) return false;
    
    // Check for proper domain restrictions
    if (cookie.domain.startsWith('.') && type === 'tracking') {
      return false; // Cross-site tracking restrictions
    }
    
    return true;
  }

  private generateCookieStats(cookies: Cookie[]) {
    return {
      total: cookies.length,
      necessary: cookies.filter(c => c.type === 'necessary').length,
      tracking: cookies.filter(c => c.type === 'tracking').length,
      marketing: cookies.filter(c => c.type === 'marketing').length,
      functional: cookies.filter(c => c.type === 'functional').length,
      gdprCompliant: cookies.filter(c => c.gdprCompliant).length,
      dpdpCompliant: cookies.filter(c => c.dpdpCompliant).length
    };
  }
}
