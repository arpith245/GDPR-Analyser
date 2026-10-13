import PDFDocument from 'pdfkit';
import { Analysis } from '@shared/schema';

export class PDFGenerator {
  generateReport(analysis: Analysis): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Header
        doc.fontSize(24).fillColor('#1e40af').text('GDPR Analyzer Pro - Compliance Report', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(14).fillColor('#666').text(`Analysis Date: ${analysis.createdAt?.toLocaleDateString()}`, { align: 'center' });
        doc.text(`Website: ${analysis.url}`, { align: 'center' });
        doc.moveDown(2);

        // Overall Score
        doc.fontSize(18).fillColor('#000').text('Overall Compliance Score');
        doc.moveDown(0.5);
        
        const scoreColor = (analysis.overallScore || 0) >= 80 ? '#10b981' : 
                          (analysis.overallScore || 0) >= 60 ? '#f59e0b' : '#ef4444';
        
        doc.fontSize(48).fillColor(scoreColor).text(`${analysis.overallScore || 0}/100`, { align: 'center' });
        doc.moveDown();

        // Regulation Breakdown
        doc.fontSize(16).fillColor('#000').text('Regulation Compliance Breakdown');
        doc.moveDown(0.5);
        
        doc.fontSize(12);
        doc.text(`GDPR 2025: ${analysis.gdprScore || 0}/100`);
        doc.text(`DPDP Act 2023: ${analysis.dpdpScore || 0}/100`);
        doc.text(`Privacy by Design: ${analysis.privacyDesignScore || 0}/100`);
        doc.moveDown();

        // Cookie Analysis
        if (analysis.cookieData) {
          doc.addPage();
          doc.fontSize(16).text('Cookie Analysis');
          doc.moveDown(0.5);
          
          const cookieData = analysis.cookieData as any;
          if (cookieData.stats) {
            doc.fontSize(12);
            doc.text(`Total Cookies: ${cookieData.stats.total}`);
            doc.text(`Necessary: ${cookieData.stats.necessary}`);
            doc.text(`Tracking: ${cookieData.stats.tracking}`);
            doc.text(`Marketing: ${cookieData.stats.marketing}`);
            doc.text(`GDPR Compliant: ${cookieData.stats.gdprCompliant}`);
            doc.text(`DPDP Compliant: ${cookieData.stats.dpdpCompliant}`);
            doc.moveDown();
          }
          
          if (cookieData.cookies && cookieData.cookies.length > 0) {
            doc.text('Cookie Details:');
            doc.moveDown(0.5);
            
            cookieData.cookies.slice(0, 10).forEach((cookie: any) => {
              doc.text(`• ${cookie.name} (${cookie.type}) - ${cookie.domain}`);
              doc.text(`  GDPR: ${cookie.gdprCompliant ? '✓' : '✗'}, DPDP: ${cookie.dpdpCompliant ? '✓' : '✗'}`);
              doc.moveDown(0.3);
            });
          }
        }

        // Web Beacon Analysis
        if (analysis.beaconData) {
          doc.addPage();
          doc.fontSize(16).text('Web Beacon Analysis');
          doc.moveDown(0.5);
          
          const beaconData = analysis.beaconData as any;
          if (beaconData.stats) {
            doc.fontSize(12);
            doc.text(`Total Beacons: ${beaconData.stats.total}`);
            doc.text(`Pixel Beacons: ${beaconData.stats.pixel}`);
            doc.text(`AI Trackers: ${beaconData.stats.ai}`);
            doc.text(`Cross-Border: ${beaconData.stats.crossBorder}`);
            doc.text(`GDPR Violations: ${beaconData.stats.gdprViolations}`);
            doc.text(`DPDP Violations: ${beaconData.stats.dpdpViolations}`);
            doc.moveDown();
          }
          
          if (beaconData.beacons && beaconData.beacons.length > 0) {
            doc.text('Beacon Details:');
            doc.moveDown(0.5);
            
            beaconData.beacons.forEach((beacon: any) => {
              doc.text(`• ${beacon.name} (${beacon.type})`);
              doc.text(`  ${beacon.description}`);
              doc.text(`  GDPR Violation: ${beacon.gdprViolation ? '✗' : '✓'}, AI Consent Required: ${beacon.aiConsentRequired ? 'Yes' : 'No'}`);
              doc.moveDown(0.3);
            });
          }
        }

        // Security Analysis
        if (analysis.securityData) {
          doc.addPage();
          doc.fontSize(16).text('Security Analysis');
          doc.moveDown(0.5);
          
          const securityData = analysis.securityData as any;
          doc.fontSize(12);
          doc.text(`TLS Version: ${securityData.tlsVersion}`);
          doc.text(`Certificate Grade: ${securityData.certificateGrade}`);
          doc.text(`HSTS Enabled: ${securityData.hstsEnabled ? 'Yes' : 'No'}`);
          doc.text(`Perfect Forward Secrecy: ${securityData.perfectForwardSecrecy ? 'Yes' : 'No'}`);
          doc.moveDown();
          
          if (securityData.crossBorderTransfers && securityData.crossBorderTransfers.length > 0) {
            doc.text('Cross-Border Data Transfers:');
            doc.moveDown(0.5);
            
            securityData.crossBorderTransfers.forEach((transfer: any) => {
              doc.text(`• Destination: ${transfer.destination}`);
              doc.text(`  Adequacy Status: ${transfer.adequacyStatus}`);
              doc.text(`  Safeguards: ${transfer.safeguards.join(', ')}`);
              doc.moveDown(0.3);
            });
          }
        }

        // Recommendations
        if (analysis.recommendations) {
          doc.addPage();
          doc.fontSize(16).text('Recommendations');
          doc.moveDown(0.5);
          
          const recommendations = analysis.recommendations as any[];
          recommendations.forEach((rec, index) => {
            const priorityColor = rec.priority === 'critical' ? '#ef4444' :
                                rec.priority === 'high' ? '#f59e0b' :
                                rec.priority === 'medium' ? '#3b82f6' : '#10b981';
            
            doc.fontSize(14).fillColor(priorityColor).text(`${index + 1}. ${rec.title}`);
            doc.fontSize(12).fillColor('#000').text(rec.description);
            doc.text(`Regulation: ${rec.regulation}`);
            if (rec.article) doc.text(`Article: ${rec.article}`);
            doc.moveDown();
          });
        }

        // Footer
        doc.fontSize(10).fillColor('#666').text(
          'This report was generated by GDPR Analyzer Pro. It provides an assessment based on publicly available information and should not be considered as legal advice.',
          50,
          doc.page.height - 100,
          { align: 'center', width: doc.page.width - 100 }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
