import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import AnalysisForm from "@/components/analysis-form";
import ComplianceDashboard from "@/components/compliance-dashboard";
import CookieAnalysis from "@/components/cookie-analysis";
import BeaconAnalysis from "@/components/beacon-analysis";
import SecurityAnalysis from "@/components/security-analysis";
import ValidationStatus from "@/components/validation-status";
import ActionItems from "@/components/action-items";

export default function Dashboard() {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const reportsRef = useRef<HTMLElement>(null);
  const settingsRef = useRef<HTMLElement>(null);

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['/api/analysis', currentAnalysisId],
    queryFn: async () => {
      if (!currentAnalysisId) return null;
      const response = await fetch(`/api/analysis/${currentAnalysisId}`);
      const result = await response.json();
      return result;
    },
    enabled: !!currentAnalysisId,
    refetchInterval: (data) => {
      // Continue refetching until we get a completed or failed status
      const status = (data as any)?.data?.status;
      return !status || status === 'running' || status === 'pending' ? 2000 : false;
    },
  });

  const { data: allAnalyses } = useQuery({
    queryKey: ['/api/analyses'],
    staleTime: 60000, // Cache for 1 minute
  });

  const handleAnalysisStarted = (analysisId: string) => {
    setCurrentAnalysisId(analysisId);
  };

  const handleDownloadPDF = async () => {
    if (!currentAnalysisId) return;
    
    try {
      const response = await fetch(`/api/analysis/${currentAnalysisId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gdpr-analysis-report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold">GDPR Analyzer Pro</h1>
                <p className="text-sm text-muted-foreground">2025 Privacy Compliance Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-foreground hover:text-primary transition-colors"
                data-testid="button-nav-dashboard"
              >
                Dashboard
              </button>
              <button 
                onClick={() => reportsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="button-nav-reports"
              >
                Reports
              </button>
              <button 
                onClick={() => settingsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="button-nav-settings"
              >
                Settings
              </button>
              <button 
                onClick={handleDownloadPDF}
                disabled={!currentAnalysisId || !analysis?.data || analysis.data.status !== 'completed'}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                data-testid="button-export-pdf"
              >
                <i className="fas fa-download mr-2"></i>Export PDF
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Analysis Form */}
        <AnalysisForm onAnalysisStarted={handleAnalysisStarted} />

        {/* Show loading animation when analysis is running */}
        {currentAnalysisId && analysis?.data && (analysis.data.status === 'running' || analysis.data.status === 'pending') && (
          <div className="mb-8">
                <div className="bg-card border border-border rounded-lg p-8">
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 relative">
                        <div className="w-full h-full border-4 border-muted rounded-full animate-pulse"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Analyzing Website</h3>
                      <p className="text-muted-foreground mb-4">
                        Performing comprehensive privacy compliance analysis for <span className="font-medium text-primary">{analysis.data.url}</span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-sm text-center">Cookie Analysis</div>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <div className="text-sm text-center">Beacon Detection</div>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-2 h-2 bg-chart-3 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                        <div className="text-sm text-center">Security Check</div>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-2 h-2 bg-chart-4 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                        </div>
                        <div className="text-sm text-center">Compliance Review</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span>This may take a few moments...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show analysis results if available */}
            {analysis?.data && analysis.data.status === 'completed' && (
              <>
                {/* Compliance Dashboard */}
                <ComplianceDashboard 
                  analysis={analysis.data} 
                  isLoading={isLoading || analysis.data.status === 'running'} 
                />

                {/* Analysis Modules */}
                {(analysis as any).data.status === 'completed' && (
                  <section className="space-y-6">
                    {(analysis as any).data.cookieData && (
                      <CookieAnalysis cookieData={(analysis as any).data.cookieData} />
                    )}
                    
                    {(analysis as any).data.beaconData && (
                      <BeaconAnalysis beaconData={(analysis as any).data.beaconData} />
                    )}
                    
                    {(analysis as any).data.securityData && (
                      <SecurityAnalysis securityData={(analysis as any).data.securityData} />
                    )}
                    
                    {(analysis as any).data.validationData && (
                      <ValidationStatus validationData={(analysis as any).data.validationData} />
                    )}
                    
                    {(analysis as any).data.recommendations && (
                      <ActionItems recommendations={(analysis as any).data.recommendations} />
                    )}
                  </section>
                )}
              </>
            )}

        {/* Reports Section */}
        <section data-section="reports" className="mt-12">
          <div className="space-y-6">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Analysis Reports</h2>
              <p className="text-muted-foreground mb-6">
                View and manage your privacy compliance analysis reports
              </p>
              
              {(allAnalyses as any)?.data && (allAnalyses as any).data.length > 0 ? (
                <div className="space-y-4">
                  {(allAnalyses as any).data.map((analysisItem: any) => (
                    <div 
                      key={analysisItem.id}
                      className="border border-border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setCurrentAnalysisId(analysisItem.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      data-testid={`report-${analysisItem.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{analysisItem.url}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>Created: {analysisItem.createdAt && new Date(analysisItem.createdAt).toLocaleDateString()}</span>
                            <span>Type: {analysisItem.analysisType}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              analysisItem.status === 'completed' ? 'bg-chart-1/20 text-chart-1' :
                              analysisItem.status === 'running' ? 'bg-chart-2/20 text-chart-2' :
                              'bg-destructive/20 text-destructive'
                            }`}>
                              {analysisItem.status}
                            </span>
                          </div>
                        </div>
                        {analysisItem.overallScore && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-chart-1">{analysisItem.overallScore}/100</div>
                            <div className="text-sm text-muted-foreground">Overall Score</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-file-alt text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
                  <p className="text-muted-foreground mb-4">Start an analysis to generate your first compliance report</p>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Start Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        </section>

        {/* Settings View */}
        {/* Settings Section */}
        <section ref={settingsRef} data-section="settings" className="mt-12">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-muted-foreground mb-6">
                Configure your privacy compliance analysis preferences
              </p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Default Analysis Options</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Cookie Analysis</label>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Beacon Detection</label>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Security Check</label>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">AI Consent Analysis</label>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Report Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Include Technical Details</label>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Auto-download PDF</label>
                        <input type="checkbox" className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Email Notifications</label>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Application Info</h3>
                      <p className="text-sm text-muted-foreground">GDPR Analyzer Pro v2.0 - 2025 Edition</p>
                    </div>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2025 GDPR Analyzer Pro. Enhanced with 2025 regulatory updates.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fas fa-file-download mr-2"></i>Download Report
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fas fa-cog mr-2"></i>Settings
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fas fa-question-circle mr-2"></i>Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
