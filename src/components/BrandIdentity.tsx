import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck, Palette, Type, ImageIcon, DownloadCloud, Search, UploadCloud, AlertTriangle, Lightbulb, CheckCircle2, XCircle, FileText, Settings, RefreshCw, Eye, BarChart2, ListChecks, MessageSquare, Users, Zap, Bot, Edit3, Copy, Trash2, Info, Briefcase, Music2, LayoutGrid, Loader2, ExternalLink, Maximize2, Minimize2, Palette as PaletteIcon, Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Label } from './ui/label';

// BAM Brand Guidelines Definitions
const BAM_COLORS = {
  primary: [
    { name: 'Deep Blue', hex: '#0A1A2F', usage: 'Backgrounds, Dark UI Elements' },
    { name: 'Electric Blue', hex: '#2563EB', usage: 'Primary CTAs, Accents, Highlights' },
    { name: 'White', hex: '#FFFFFF', usage: 'Text on dark backgrounds, UI Elements' },
  ],
  secondary: [
    { name: 'Orange', hex: '#FF6B35', usage: 'Secondary CTAs, Warnings, Energetic Accents' },
    { name: 'Green', hex: '#10B981', usage: 'Success States, Positive Feedback, Eco/Growth themes' },
    { name: 'Purple', hex: '#8B5CF6', usage: 'Creative Accents, Special Features, Youthful Vibe' },
  ],
  neutral: [
    { name: 'Light Gray', hex: '#F3F4F6', usage: 'Light backgrounds, Dividers' },
    { name: 'Medium Gray', hex: '#6B7280', usage: 'Body text, Secondary info' },
    { name: 'Dark Gray', hex: '#1F2937', usage: 'Text on light backgrounds, UI elements' },
  ],
};

const BAM_TYPOGRAPHY = {
  primaryFont: {
    name: 'Inter',
    family: 'sans-serif',
    weights: [
      { weight: 'Bold (700)', usage: 'Main Headings (H1, H2)' },
      { weight: 'SemiBold (600)', usage: 'Subheadings (H3, H4), Important UI Text' },
      { weight: 'Medium (500)', usage: 'Buttons, Navigation Links' },
    ],
  },
  secondaryFont: {
    name: 'Roboto',
    family: 'sans-serif',
    weights: [
      { weight: 'Regular (400)', usage: 'Body copy, Paragraphs, Descriptions' },
      { weight: 'Light (300)', usage: 'Captions, Legal text, Footnotes' },
    ],
  },
};

const BAM_LOGO_RULES = [
  { rule: 'Primary Logo', description: 'Full color logo for general use on light backgrounds.', correct: true, exampleImg: 'https://placehold.co/150x50/F3F4F6/0A1A2F?text=BAM+LOGO' },
  { rule: 'White Logo', description: 'Monochrome white logo for use on dark brand colors (e.g., Deep Blue).', correct: true, exampleImg: 'https://placehold.co/150x50/0A1A2F/FFFFFF?text=BAM+LOGO' },
  { rule: 'Clear Space', description: 'Maintain clear space around the logo, equal to the height of the "B".', correct: true, exampleImg: 'https://placehold.co/200x100/FFFFFF/CCCCCC?text=Clear+Space+Around+BAM' },
  { rule: 'Minimum Size', description: 'Digital: 24px height. Print: 0.5 inch height.', correct: true, exampleImg: 'https://placehold.co/100x24/F3F4F6/0A1A2F?text=BAM' },
  { rule: 'Do NOT Stretch', description: 'Never stretch or distort the logo proportions.', correct: false, exampleImg: 'https://placehold.co/200x50/F3F4F6/FF0000?text=STRETCHED+BAM' },
  { rule: 'Do NOT Alter Colors', description: 'Do not change logo colors outside of approved variations.', correct: false, exampleImg: 'https://placehold.co/150x50/F3F4F6/FF69B4?text=BAM+Pink!?' },
  { rule: 'Do NOT Use on Busy Backgrounds', description: 'Avoid placing the logo on complex or low-contrast backgrounds without proper treatment (e.g., a solid color block behind it).', correct: false, exampleImg: 'https://placehold.co/150x50/00FF00/0000FF?text=BAM+on+Bad+BG' },
];

const BAM_VOICE_TONE = [
  { point: 'Witty & Humorous', description: 'Sarcasm and humor are welcome, but not at the expense of clarity or respect. Think clever, not clownish.' },
  { point: 'Insightful & Authoritative', description: 'Demonstrate expertise and provide valuable takeaways. Back up claims, show you know your stuff.' },
  { point: 'Slightly Irreverent', description: 'Challenge norms, don\'t be afraid to be edgy but stay smart. Question assumptions, but don\'t be contrarian for its own sake.' },
  { point: 'Engaging & Conversational', description: 'Use accessible language, avoid jargon where possible. Speak to the audience, not at them.' },
  { point: 'Confident & Bold', description: 'Strong opinions backed by facts or clear reasoning. Be decisive in your messaging.' },
];

// TypeScript Interfaces
interface BrandColor { name: string; hex: string; usage: string; }
interface FontInfo { name: string; family: string; weights: { weight: string; usage: string; }[]; }
interface LogoRule { rule: string; description: string; correct: boolean; exampleImg: string; }
interface VoiceTonePoint { point: string; description: string; }
interface BrandAsset { id: string; name: string; type: 'Logo' | 'Template' | 'Font' | 'Music' | 'Icon'; format: string; previewImg: string; category: string; }
interface Violation { id: string; type: 'Color' | 'Typography' | 'Logo' | 'Tone'; contentName: string; date: string; severity: 'Low' | 'Medium' | 'High'; description: string; }
interface ValidationResult {
  overallScore: number;
  colorCompliance: { score: number; detectedColors: { hex: string; isBrandColor: boolean; }[]; issues: string[]; suggestions: string[]; };
  typographyCompliance: { score: number; detectedFonts: { name: string; isBrandFont: boolean; }[]; issues: string[]; suggestions: string[]; };
  logoCompliance: { score: number; issues: string[]; suggestions: string[]; };
  toneCompliance: { score: number; issues: string[]; suggestions: string[]; };
}

// Mock Data
const mockRecentViolations: Violation[] = [
  { id: 'v1', type: 'Color', contentName: 'TikTok Ad Q2 Campaign', date: '2025-05-28', severity: 'Medium', description: 'Used an unapproved shade of orange (#FFA500) instead of brand orange (#FF6B35).' },
  { id: 'v2', type: 'Logo', contentName: 'New Partner Deck', date: '2025-05-25', severity: 'High', description: 'Logo stretched horizontally and placed on a busy background.' },
  { id: 'v3', type: 'Typography', contentName: 'Website Banner Update', date: '2025-05-22', severity: 'Low', description: 'Used "Arial" for a subheading instead of "Inter".' },
  { id: 'v4', type: 'Tone', contentName: 'Social Media Post - AI Ethics', date: '2025-05-20', severity: 'Medium', description: 'Tone was overly aggressive and dismissive, not aligning with "Insightful & Authoritative".' },
];

const mockBrandAssets: BrandAsset[] = [
  { id: 'a1', name: 'BAM Primary Logo Kit', type: 'Logo', format: 'SVG, PNG, AI', previewImg: 'https://placehold.co/100x100/0A1A2F/FFFFFF?text=BAM+Logo', category: 'Logos' },
  { id: 'a2', name: 'BAM Presentation Template', type: 'Template', format: 'PPTX, KEY', previewImg: 'https://placehold.co/100x100/2563EB/FFFFFF?text=PPT', category: 'Templates' },
  { id: 'a3', name: 'Inter Font Family', type: 'Font', format: 'OTF, TTF, WOFF2', previewImg: 'https://placehold.co/100x100/1F2937/FFFFFF?text=Inter', category: 'Fonts' },
  { id: 'a4', name: 'Roboto Font Family', type: 'Font', format: 'OTF, TTF, WOFF2', previewImg: 'https://placehold.co/100x100/1F2937/FFFFFF?text=Roboto', category: 'Fonts' },
  { id: 'a5', name: 'BAM Brand Guidelines PDF', type: 'Template', format: 'PDF', previewImg: 'https://placehold.co/100x100/FF6B35/FFFFFF?text=PDF', category: 'Templates' },
  { id: 'a6', name: 'BAM Intro Music Loop', type: 'Music', format: 'MP3, WAV', previewImg: 'https://placehold.co/100x100/10B981/FFFFFF?text=Music', category: 'Music' },
  { id: 'a7', name: 'BAM Social Media Templates', type: 'Template', format: 'PSD, FIG', previewImg: 'https://placehold.co/100x100/8B5CF6/FFFFFF?text=Social', category: 'Templates' },
  { id: 'a8', name: 'BAM Icon Set', type: 'Icon', format: 'SVG', previewImg: 'https://placehold.co/100x100/6B7280/FFFFFF?text=Icons', category: 'Icons' },
];

const BrandIdentity = () => {
  const [overallBrandScore, _setOverallBrandScore] = useState(88);
  const [complianceRate, _setComplianceRate] = useState(92);
  const [recentViolations, _setRecentViolations] = useState<Violation[]>(mockRecentViolations);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [isLoadingValidation, setIsLoadingValidation] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  const [assetSearchTerm, setAssetSearchTerm] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('All');

  const [realTimeText, setRealTimeText] = useState('');
  const [realTimeTone, setRealTimeTone] = useState('neutral');
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulate fetching initial dashboard data
    // In a real app, this would be an API call
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadedFilePreview(URL.createObjectURL(file));
      setValidationResult(null); // Reset previous results
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const analyzeContent = () => {
    if (!uploadedFile) return;
    setIsLoadingValidation(true);
    setValidationResult(null);

    // Simulate AI analysis
    setTimeout(() => {
      const mockDetectedColors = [
        { hex: BAM_COLORS.primary[1].hex, isBrandColor: true }, // Electric Blue
        { hex: '#000000', isBrandColor: false }, // Black (not strictly brand, but common)
        { hex: BAM_COLORS.secondary[0].hex, isBrandColor: true }, // Orange
        { hex: '#FFC0CB', isBrandColor: false }, // Pink (non-brand)
      ];
      const mockDetectedFonts = [
        { name: 'Inter', isBrandFont: true },
        { name: 'Arial', isBrandFont: false },
      ];

      const colorScore = mockDetectedColors.filter(c => c.isBrandColor).length / mockDetectedColors.length * 30;
      const fontScore = mockDetectedFonts.filter(f => f.isBrandFont).length / mockDetectedFonts.length * 25;
      // Simulate other scores
      const logoScore = Math.random() > 0.5 ? 25 : 15; 
      const toneScore = Math.random() > 0.5 ? 20 : 10;

      setValidationResult({
        overallScore: Math.round(colorScore + fontScore + logoScore + toneScore),
        colorCompliance: {
          score: Math.round(colorScore),
          detectedColors: mockDetectedColors,
          issues: mockDetectedColors.filter(c => !c.isBrandColor).map(c => `Non-brand color ${c.hex} detected.`),
          suggestions: ['Consider replacing non-brand colors with alternatives from the secondary palette.', 'Ensure high contrast for text readability.'],
        },
        typographyCompliance: {
          score: Math.round(fontScore),
          detectedFonts: mockDetectedFonts,
          issues: mockDetectedFonts.filter(f => !f.isBrandFont).map(f => `Non-brand font "${f.name}" used.`),
          suggestions: [`Replace "${mockDetectedFonts.find(f=>!f.isBrandFont)?.name || 'non-brand font'}" with "Inter" for headings or "Roboto" for body text.`],
        },
        logoCompliance: {
          score: logoScore,
          issues: logoScore < 25 ? ['Logo appears slightly distorted.', 'Clear space around logo might be insufficient.'] : [],
          suggestions: logoScore < 25 ? ['Re-check logo aspect ratio.', 'Ensure adequate clear space around the logo as per guidelines.'] : ['Logo usage looks good!'],
        },
        toneCompliance: {
          score: toneScore,
          issues: toneScore < 20 ? ['Tone seems a bit too formal for BAM.'] : [],
          suggestions: toneScore < 20 ? ['Inject more wit or an irreverent angle if appropriate for the content.'] : ['Tone aligns well with BAM\'s voice!'],
        },
      });
      setIsLoadingValidation(false);
    }, 2500);
  };

  const downloadAsset = (asset: BrandAsset) => {
    alert(`Simulating download of ${asset.name} (${asset.format})`);
    // In a real app: window.location.href = asset.downloadUrl;
  };

  const filteredAssets = useMemo(() => {
    return mockBrandAssets.filter(asset => 
      (assetCategoryFilter === 'All' || asset.category === assetCategoryFilter) &&
      (asset.name.toLowerCase().includes(assetSearchTerm.toLowerCase()))
    );
  }, [assetSearchTerm, assetCategoryFilter]);

  const analyzeRealTimeText = () => {
    if (!realTimeText.trim()) {
      setRealTimeAnalysis([]);
      return;
    }
    const analysisPoints: string[] = [];
    if (realTimeText.toLowerCase().includes("boring") || realTimeText.toLowerCase().includes("formal")) {
      analysisPoints.push("Tone might be too formal. Consider BAM's witty/irreverent voice.");
    }
    if (realTimeText.length < 50) {
      analysisPoints.push("Content is quite short. Ensure it's impactful.");
    }
    if (realTimeText.length > 500 && realTimeTone === 'social') {
        analysisPoints.push("Content is long for social media. Consider brevity.");
    }
    if (!BAM_VOICE_TONE.some(vt => realTimeText.toLowerCase().includes(vt.point.split(' ')[0].toLowerCase()))) {
        // analysisPoints.push("Consider explicitly hitting one of BAM's voice & tone pillars.");
    }
    if (analysisPoints.length === 0) {
        analysisPoints.push("Looking good! Seems aligned with BAM's general style.");
    }
    setRealTimeAnalysis(analysisPoints);
  };
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        analyzeRealTimeText();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [realTimeText, realTimeTone]);

  const exportGuidelines = () => {
    alert("Simulating export of Brand Guidelines (PDF). In a real app, this would generate and download a file.");
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center">
        <ShieldCheck className="h-8 w-8 mr-3 text-primary" />
        Brand Identity Manager
      </h1>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="validator">Validator</TabsTrigger>
          <TabsTrigger value="styleguide">Style Guide</TabsTrigger>
          <TabsTrigger value="assets">Asset Library</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Brand Score</CardTitle>
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{overallBrandScore}/100</div>
                <Progress value={overallBrandScore} className="mt-2 h-3" />
                <p className="text-xs text-muted-foreground mt-1">Average score of all analyzed content.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{complianceRate}%</div>
                <Progress value={complianceRate} className="mt-2 h-3" />
                <p className="text-xs text-muted-foreground mt-1">Percentage of content meeting key brand guidelines.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Violations</CardTitle>
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{recentViolations.filter(v => v.severity === 'High' || v.severity === 'Medium').length}</div>
                <p className="text-xs text-muted-foreground mt-1">{recentViolations.length} total violations in last 30 days.</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assets Downloaded</CardTitle>
                <DownloadCloud className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">128</div>
                <p className="text-xs text-muted-foreground mt-1">Downloads from Asset Library this month.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Brand Guideline Violations</CardTitle>
              <CardDescription>Overview of recent content that did not meet brand standards.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Violation Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentViolations.map((violation) => (
                      <TableRow key={violation.id}>
                        <TableCell className="font-medium">{violation.contentName}</TableCell>
                        <TableCell><Badge variant="outline">{violation.type}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={violation.severity === 'High' ? 'destructive' : violation.severity === 'Medium' ? 'secondary' : 'outline'}>
                            {violation.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(violation.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs max-w-xs truncate">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="cursor-default">{violation.description}</span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">
                                        <p>{violation.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validator Tab */}
        <TabsContent value="validator" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Content Validator</CardTitle>
                  <CardDescription>Upload image or video frame to check compliance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                    onClick={triggerFileUpload}
                    onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) { setUploadedFile(e.dataTransfer.files[0]); setUploadedFilePreview(URL.createObjectURL(e.dataTransfer.files[0])); setValidationResult(null);}}}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, MP4 (frame) up to 10MB</p>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/png, image/jpeg, video/mp4" className="hidden" />
                  
                  {uploadedFilePreview && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Preview:</h4>
                      <img src={uploadedFilePreview} alt="Uploaded content preview" className="rounded-md max-h-48 w-full object-contain border" />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={analyzeContent} disabled={!uploadedFile || isLoadingValidation} className="w-full">
                    {isLoadingValidation ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Analyze Content
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>Compliance check against BAM brand guidelines.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingValidation && (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Analyzing content, please wait...</p>
                    </div>
                  )}
                  {!isLoadingValidation && !validationResult && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No Analysis Yet</p>
                      <p className="text-sm text-muted-foreground">Upload content and click "Analyze Content" to see results.</p>
                    </div>
                  )}
                  {validationResult && (
                    <ScrollArea className="h-[calc(100vh-350px)] pr-3"> {/* Adjust height as needed */}
                    <div className="space-y-6">
                      <Alert variant={validationResult.overallScore > 80 ? "default" : validationResult.overallScore > 60 ? "default" : "destructive"} className={validationResult.overallScore > 80 ? 'bg-green-50 border-green-300 text-green-700' : validationResult.overallScore > 60 ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-red-50 border-red-300 text-red-700'}>
                        {validationResult.overallScore > 80 ? <CheckCircle2 className="h-5 w-5" /> : validationResult.overallScore > 60 ? <AlertTriangle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        <AlertTitle className="font-bold">
                          Overall Brand Score: {validationResult.overallScore}/100 - 
                          {validationResult.overallScore > 80 ? ' Excellent Compliance!' : validationResult.overallScore > 60 ? ' Good, Some Areas for Improvement' : ' Needs Significant Improvement'}
                        </AlertTitle>
                      </Alert>

                      {/* Color Compliance */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center">
                            <PaletteIcon className="h-5 w-5 mr-2 text-primary" /> Color Compliance: {validationResult.colorCompliance.score}/30
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium">Detected Colors:</span>
                            {validationResult.colorCompliance.detectedColors.map((color, idx) => (
                              <TooltipProvider key={idx}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className={`w-6 h-6 rounded-full border-2 ${color.isBrandColor ? 'border-green-500' : 'border-red-500'}`} style={{ backgroundColor: color.hex }} />
                                  </TooltipTrigger>
                                  <TooltipContent>{color.hex} - {color.isBrandColor ? 'Brand Color' : 'Non-Brand Color'}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                          {validationResult.colorCompliance.issues.length > 0 && (
                            <Alert variant="destructive" className="text-xs">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Issues Found:</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc pl-4">
                                  {validationResult.colorCompliance.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                          <Alert variant="default" className="text-xs bg-blue-50 border-blue-200">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-700">Suggestions:</AlertTitle>
                            <AlertDescription className="text-blue-600">
                              <ul className="list-disc pl-4">
                                {validationResult.colorCompliance.suggestions.map((sugg, i) => <li key={i}>{sugg}</li>)}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>

                      {/* Typography Compliance */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center">
                            <Type className="h-5 w-5 mr-2 text-primary" /> Typography Compliance: {validationResult.typographyCompliance.score}/25
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm"><span className="font-medium">Detected Fonts:</span> {validationResult.typographyCompliance.detectedFonts.map(f => `${f.name} (${f.isBrandFont ? 'Brand' : 'Non-Brand'})`).join(', ')}</p>
                          {validationResult.typographyCompliance.issues.length > 0 && (
                            <Alert variant="destructive" className="text-xs">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Issues Found:</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc pl-4">
                                  {validationResult.typographyCompliance.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                           <Alert variant="default" className="text-xs bg-blue-50 border-blue-200">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-700">Suggestions:</AlertTitle>
                            <AlertDescription className="text-blue-600">
                              <ul className="list-disc pl-4">
                                {validationResult.typographyCompliance.suggestions.map((sugg, i) => <li key={i}>{sugg}</li>)}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                      
                      {/* Logo & Tone Compliance (Simplified) */}
                       <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center"><ImageIcon className="h-5 w-5 mr-2 text-primary" /> Logo Usage: {validationResult.logoCompliance.score}/25</CardTitle></CardHeader>
                            <CardContent className="text-xs space-y-2">
                                {validationResult.logoCompliance.issues.length > 0 ? validationResult.logoCompliance.issues.map((issue, i) => <p key={i} className="text-red-600">- {issue}</p>) : <p className="text-green-600">No major logo issues detected.</p>}
                                <p className="text-blue-600 pt-1">Suggestions: {validationResult.logoCompliance.suggestions.join(' ')}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center"><MessageSquare className="h-5 w-5 mr-2 text-primary" /> Voice & Tone: {validationResult.toneCompliance.score}/20</CardTitle></CardHeader>
                            <CardContent className="text-xs space-y-2">
                                {validationResult.toneCompliance.issues.length > 0 ? validationResult.toneCompliance.issues.map((issue, i) => <p key={i} className="text-red-600">- {issue}</p>) : <p className="text-green-600">Tone seems consistent with BAM guidelines.</p>}
                                <p className="text-blue-600 pt-1">Suggestions: {validationResult.toneCompliance.suggestions.join(' ')}</p>
                            </CardContent>
                        </Card>
                       </div>
                    </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Style Guide Tab */}
        <TabsContent value="styleguide" className="mt-6">
          <ScrollArea className="h-[calc(100vh-200px)] pr-3">
          <div className="space-y-8">
            {/* Colors Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Palette className="h-6 w-6 mr-2 text-primary" /> BAM Color Palette</CardTitle>
                <CardDescription>Official brand colors and their intended usage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(['primary', 'secondary', 'neutral'] as const).map(type => (
                  <div key={type}>
                    <h3 className="text-lg font-semibold mb-3 capitalize">{type} Colors</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {BAM_COLORS[type].map(color => (
                        <Card key={color.name} className="overflow-hidden">
                          <div style={{ backgroundColor: color.hex }} className="h-24 w-full" />
                          <CardHeader className="p-3">
                            <CardTitle className="text-base">{color.name}</CardTitle>
                            <CardDescription className="text-xs">{color.hex}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 text-xs">
                            <p className="text-muted-foreground">{color.usage}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Typography Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Type className="h-6 w-6 mr-2 text-primary" /> BAM Typography</CardTitle>
                <CardDescription>Approved fonts and their application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[BAM_TYPOGRAPHY.primaryFont, BAM_TYPOGRAPHY.secondaryFont].map(font => (
                  <div key={font.name}>
                    <h3 className="text-lg font-semibold mb-1">{font.name} <span className="text-sm text-muted-foreground">({font.family})</span></h3>
                    <p className="text-sm text-muted-foreground mb-3">Used for: {font.name === 'Inter' ? 'Headings & UI' : 'Body Text & Captions'}</p>
                    <div className="space-y-2">
                      {font.weights.map(fw => (
                        <div key={fw.weight} className="p-3 border rounded-md">
                          <p style={{ fontFamily: font.name, fontWeight: fw.weight.match(/\d+/)?.[0] || 'normal' }} className="text-xl">Aa Bb Cc - {fw.weight}</p>
                          <p className="text-xs text-muted-foreground mt-1">Usage: {fw.usage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Logo Usage Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><ImageIcon className="h-6 w-6 mr-2 text-primary" /> BAM Logo Usage</CardTitle>
                <CardDescription>Guidelines for correct logo application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BAM_LOGO_RULES.map(rule => (
                    <Card key={rule.rule} className={!rule.correct ? 'border-red-500' : ''}>
                      <CardHeader className="p-3">
                        <CardTitle className={`text-sm flex items-center ${rule.correct ? 'text-green-600' : 'text-red-600'}`}>
                          {rule.correct ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                          {rule.rule}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 text-xs space-y-2">
                        <img src={rule.exampleImg} alt={rule.rule} className="rounded border mb-2 object-contain h-20 w-full" />
                        <p className="text-muted-foreground">{rule.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Voice & Tone Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><MessageSquare className="h-6 w-6 mr-2 text-primary" /> BAM Voice & Tone</CardTitle>
                <CardDescription>Guiding principles for BAM's communication style.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {BAM_VOICE_TONE.map(vt => (
                    <li key={vt.point}>
                      <h4 className="font-semibold">{vt.point}</h4>
                      <p className="text-sm text-muted-foreground">{vt.description}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          </ScrollArea>
        </TabsContent>

        {/* Asset Library Tab */}
        <TabsContent value="assets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><DownloadCloud className="h-6 w-6 mr-2 text-primary" /> Brand Asset Library</CardTitle>
              <CardDescription>Download approved brand assets.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input 
                  placeholder="Search assets..." 
                  value={assetSearchTerm}
                  onChange={(e) => setAssetSearchTerm(e.target.value)}
                  className="flex-grow"
                />
                <Select value={assetCategoryFilter} onValueChange={setAssetCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Logos">Logos</SelectItem>
                    <SelectItem value="Templates">Templates</SelectItem>
                    <SelectItem value="Fonts">Fonts</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Icons">Icons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-[calc(100vh-350px)] pr-3">
              {filteredAssets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredAssets.map(asset => (
                    <Card key={asset.id} className="flex flex-col">
                      <CardHeader className="p-3">
                        <img src={asset.previewImg} alt={asset.name} className="rounded-md h-24 w-full object-cover border" />
                      </CardHeader>
                      <CardContent className="p-3 flex-grow">
                        <h4 className="text-sm font-semibold truncate">{asset.name}</h4>
                        <p className="text-xs text-muted-foreground">{asset.type} ({asset.format})</p>
                      </CardContent>
                      <CardFooter className="p-3">
                        <Button size="sm" className="w-full" onClick={() => downloadAsset(asset)}>
                          <DownloadCloud className="h-4 w-4 mr-2" /> Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground">No assets found matching your criteria.</p>
                </div>
              )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Edit3 className="h-5 w-5 mr-2 text-primary" /> Real-time Text Analyzer (Beta)</CardTitle>
                        <CardDescription>Quick check for tone and keywords.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Paste your text here for a quick analysis..."
                            value={realTimeText}
                            onChange={(e) => setRealTimeText(e.target.value)}
                            rows={6}
                        />
                        <Select value={realTimeTone} onValueChange={setRealTimeTone}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select intended tone/context" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="neutral">Neutral / General</SelectItem>
                                <SelectItem value="social">Social Media Post</SelectItem>
                                <SelectItem value="formal">Formal Document</SelectItem>
                                <SelectItem value="creative">Creative Copy</SelectItem>
                            </SelectContent>
                        </Select>
                        {realTimeAnalysis.length > 0 && (
                            <Alert variant="default" className="text-xs bg-blue-50 border-blue-200">
                                <Lightbulb className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-700">Quick Analysis:</AlertTitle>
                                <AlertDescription className="text-blue-600">
                                    <ul className="list-disc pl-4 space-y-1">
                                        {realTimeAnalysis.map((point, i) => <li key={i}>{point}</li>)}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={analyzeRealTimeText} disabled={!realTimeText.trim()}>
                            <RefreshCw className="h-4 w-4 mr-2" /> Re-analyze Text
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><FileText className="h-5 w-5 mr-2 text-primary" /> Brand Guideline Templates</CardTitle>
                        <CardDescription>Export BAM brand guidelines for your team or partners.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Provide your team with a comprehensive document outlining BAM's visual and verbal identity.
                            This helps ensure consistency across all communications and content.
                        </p>
                        <div className="flex items-center p-4 bg-gray-50 rounded-md border">
                            <Briefcase className="h-8 w-8 mr-4 text-primary"/>
                            <div>
                                <h4 className="font-medium">BAM Full Brand Guidelines</h4>
                                <p className="text-xs text-muted-foreground">Includes colors, typography, logo usage, voice & tone.</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={exportGuidelines} className="w-full">
                            <DownloadCloud className="h-4 w-4 mr-2" /> Export as PDF (Simulated)
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default BrandIdentity;
