import { SecurityData } from "@shared/schema";
import * as tls from 'tls';
import * as https from 'https';
import { URL } from 'url';

export class SecurityAnalyzer {
  async analyzeSecurity(targetUrl: string): Promise<SecurityData> {
    const url = new URL(targetUrl);
    const hostname = url.hostname;
    
    try {
      const tlsInfo = await this.getTLSInfo(hostname);
      const crossBorderTransfers = await this.analyzeCrossBorderTransfers(targetUrl);
      
      return {
        tlsVersion: tlsInfo.protocol || 'Unknown',
        certificateGrade: this.calculateCertificateGrade(tlsInfo),
        hstsEnabled: await this.checkHSTS(targetUrl),
        perfectForwardSecrecy: this.checkPFS(tlsInfo),
        crossBorderTransfers
      };
    } catch (error) {
      console.error('Security analysis error:', error);
      return {
        tlsVersion: 'Unknown',
        certificateGrade: 'F',
        hstsEnabled: false,
        perfectForwardSecrecy: false,
        crossBorderTransfers: []
      };
    }
  }

  private getTLSInfo(hostname: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const socket = tls.connect({
        host: hostname,
        port: 443,
        rejectUnauthorized: true
      }, () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();
        
        socket.destroy();
        resolve({ cert, protocol, cipher });
      });
      
      socket.on('error', reject);
      socket.setTimeout(10000, () => {
        socket.destroy();
        reject(new Error('Timeout'));
      });
    });
  }

  private calculateCertificateGrade(tlsInfo: any): string {
    if (!tlsInfo.protocol) return 'F';
    
    // TLS 1.3 gets A+
    if (tlsInfo.protocol === 'TLSv1.3') return 'A+';
    
    // TLS 1.2 with good cipher gets A
    if (tlsInfo.protocol === 'TLSv1.2') {
      if (tlsInfo.cipher && tlsInfo.cipher.name.includes('GCM')) return 'A';
      return 'B';
    }
    
    // Older TLS versions get lower grades
    if (tlsInfo.protocol === 'TLSv1.1') return 'C';
    if (tlsInfo.protocol === 'TLSv1') return 'D';
    
    return 'F';
  }

  private async checkHSTS(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const req = https.request(url, { 
        method: 'HEAD',
        rejectUnauthorized: true, // Enable certificate validation
        timeout: 5000
      }, (res) => {
        const hstsHeader = res.headers['strict-transport-security'];
        resolve(!!hstsHeader);
      });
      
      req.on('error', () => resolve(false));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }

  private checkPFS(tlsInfo: any): boolean {
    if (!tlsInfo.cipher) return false;
    
    const cipherName = tlsInfo.cipher.name.toLowerCase();
    // Check for ECDHE or DHE key exchange
    return cipherName.includes('ecdhe') || cipherName.includes('dhe');
  }

  private async analyzeCrossBorderTransfers(url: string): Promise<SecurityData['crossBorderTransfers']> {
    // This would typically analyze actual third-party requests
    // For now, we'll return common cross-border scenarios
    const transfers = [];
    
    // Common US-based services
    if (url.includes('google') || url.includes('facebook') || url.includes('amazon')) {
      transfers.push({
        destination: 'United States',
        adequacyStatus: 'Data Privacy Framework',
        safeguards: ['Standard Contractual Clauses', 'Privacy Shield Successor']
      });
    }
    
    // Check for other common third-party services
    const thirdPartyServices = [
      { pattern: 'cloudflare', destination: 'United States' },
      { pattern: 'amazonaws', destination: 'United States' },
      { pattern: 'googleapis', destination: 'United States' }
    ];
    
    for (const service of thirdPartyServices) {
      if (url.includes(service.pattern)) {
        transfers.push({
          destination: service.destination,
          adequacyStatus: 'Review Needed',
          safeguards: ['SCCs Required', 'Additional Safeguards']
        });
      }
    }
    
    return transfers;
  }
}
