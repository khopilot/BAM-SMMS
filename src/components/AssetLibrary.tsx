import { useState, useMemo, useRef, useCallback } from 'react';
import {
  LayoutGrid, List, Search as SearchIcon, UploadCloud, Trash2, Download, Share2, Eye, Sparkles, FolderKanban, Tags, CheckCircle2, XCircle, Maximize2, FileText, ImageIcon, Music2, Palette, Briefcase, Bot, RotateCcw, ZoomIn, ExternalLink, Loader2, FolderPlus, FolderSymlink, PackageSearch, Layers3, ChevronsUpDown, Check, DatabaseZap, Type as TypeIcon, Clock, TrendingUp, ShieldCheck, ChevronLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Badge } from './ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'; // Unused
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetClose, SheetFooter } from './ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from './ui/command';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
// import { invoke } from '@tauri-apps/api/tauri'; // For simulated backend calls - unused

// TypeScript Interfaces
type AssetType = 'Image' | 'Video' | 'Audio' | 'Document' | 'Font' | 'Template' | 'Logo' | 'Icon Set' | 'Presentation';
type AssetStatus = 'Draft' | 'In Review' | 'Approved' | 'Archived';
type FileFormat = 'JPG' | 'PNG' | 'SVG' | 'MP4' | 'MOV' | 'MP3' | 'WAV' | 'PDF' | 'DOCX' | 'PPTX' | 'TTF' | 'OTF' | 'FIG' | 'PSD' | 'ICO' | 'UNK';

interface AssetVersion {
  versionNumber: number;
  date: string;
  editor: string; // User ID or name
  notes: string;
  fileUrl?: string; // URL to this specific version's file
  previewUrl?: string;
}

interface AssetComment {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  comment: string;
  timestamp: string;
  replies?: AssetComment[];
}

interface AssetUsage {
  moduleId: 'VideoManagement' | 'ContentAssistant' | 'FreelancerWorkflow' | 'BrandIdentity';
  itemId: string; // ID of the video, project, task, etc.
  itemName: string;
  dateUsed: string;
  link?: string; // Direct link to where it's used
}

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  format: FileFormat;
  size: number; // in KB
  previewUrl: string; // URL for thumbnail/preview
  fileUrl: string; // URL for actual file download
  tags: string[];
  description?: string;
  uploadedBy: string; // User ID or name
  uploadDate: string;
  lastModified: string;
  status: AssetStatus;
  dimensions?: { width: number; height: number }; // For images/videos
  duration?: number; // For audio/video in seconds
  isBrandCompliant?: boolean; // From BrandIdentity module
  versions: AssetVersion[];
  comments: AssetComment[];
  usage: AssetUsage[];
  popularityScore: number; // 0-100
  aiGeneratedData?: {
    autoTags?: string[];
    summary?: string;
    altText?: string;
  };
  folderId?: string; // For organization
  collections?: string[]; // IDs of smart collections it belongs to
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  assetCount?: number; // Calculated
}

interface SmartCollection {
  id: string;
  name: string;
  description: string;
  criteria: string; // e.g., \"type:Image AND tag:Q3Campaign\"
  icon: React.ElementType;
  assetCount?: number; // Calculated
}

interface AIGenerationTask {
  id: string;
  type: 'Thumbnail' | 'LogoVariation' | 'SocialMediaPost' | 'PresentationSlide';
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  prompt: string;
  sourceAssetId?: string;
  resultAssetId?: string;
  createdAt: string;
}

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4500'];

// Mock Data (Extensive)
const mockFolders: Folder[] = [
  { id: 'folder_logos', name: 'Brand Logos', createdAt: subDays(new Date(), 30).toISOString(), assetCount: 3 },
  { id: 'folder_marketing', name: 'Marketing Campaigns', createdAt: subDays(new Date(), 60).toISOString() },
  { id: 'folder_q3_tiktok', name: 'Q3 TikTok Campaign', parentId: 'folder_marketing', createdAt: subDays(new Date(), 10).toISOString(), assetCount: 4 },
  { id: 'folder_ui_elements', name: 'UI Elements & Icons', createdAt: subDays(new Date(), 90).toISOString(), assetCount: 2 },
  { id: 'folder_stock_media', name: 'Stock Media', createdAt: subDays(new Date(), 5).toISOString() },
  { id: 'folder_stock_video', name: 'Stock Video Clips', parentId: 'folder_stock_media', createdAt: subDays(new Date(), 4).toISOString(), assetCount: 2 },
  { id: 'folder_stock_audio', name: 'Stock Audio Tracks', parentId: 'folder_stock_media', createdAt: subDays(new Date(), 3).toISOString(), assetCount: 2 },
];

const mockAssets: Asset[] = [
  // Logos
  { id: 'asset001', name: 'BAM Primary Logo (Color)', type: 'Logo', format: 'SVG', size: 15, previewUrl: 'https://placehold.co/300x200/0A1A2F/FFFFFF?text=BAM+Logo', fileUrl: '#', tags: ['brand', 'primary', 'official'], uploadedBy: 'Hugo', uploadDate: subDays(new Date(), 45).toISOString(), lastModified: subDays(new Date(), 10).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 45).toISOString(), editor: 'Hugo', notes: 'Initial upload' }], comments: [], usage: [{ moduleId: 'VideoManagement', itemId: 'v1', itemName: 'BAM Exclusive: Politician Reacts to Memes', dateUsed: subDays(new Date(), 5).toISOString() }], popularityScore: 95, folderId: 'folder_logos' },
  { id: 'asset002', name: 'BAM Logo (White Knockout)', type: 'Logo', format: 'PNG', size: 12, previewUrl: 'https://placehold.co/300x200/2563EB/FFFFFF?text=BAM+Logo+White', fileUrl: '#', tags: ['brand', 'monochrome', 'dark background'], uploadedBy: 'Brett', uploadDate: subDays(new Date(), 40).toISOString(), lastModified: subDays(new Date(), 15).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 40).toISOString(), editor: 'Brett', notes: 'Initial upload' }], comments: [], usage: [], popularityScore: 88, folderId: 'folder_logos' },
  { id: 'asset025', name: 'BAM Favicon', type: 'Logo', format: 'ICO', size: 5, previewUrl: 'https://placehold.co/64x64/FF6B35/FFFFFF?text=B', fileUrl: '#', tags: ['brand', 'favicon', 'web'], uploadedBy: 'Hugo', uploadDate: subDays(new Date(), 38).toISOString(), lastModified: subDays(new Date(), 38).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 38).toISOString(), editor: 'Hugo', notes: 'Initial upload' }], comments: [], usage: [], popularityScore: 70, folderId: 'folder_logos' },
  // Images
  { id: 'asset003', name: 'Marketing Hero Image Q3', type: 'Image', format: 'JPG', size: 1200, previewUrl: 'https://placehold.co/600x400/FF6B35/FFFFFF?text=Hero+Image+Q3', fileUrl: '#', tags: ['marketing', 'q3', 'campaign', 'website'], uploadedBy: 'Carol (Freelancer)', uploadDate: subDays(new Date(), 20).toISOString(), lastModified: subDays(new Date(), 5).toISOString(), status: 'Approved', dimensions: { width: 1920, height: 1080 }, isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 20).toISOString(), editor: 'Carol', notes: 'First draft' }, { versionNumber: 2, date: subDays(new Date(), 5).toISOString(), editor: 'Hugo', notes: 'Color correction and BAM logo overlay' }], comments: [{ id: 'c1', userId: 'Hugo', userName: 'Hugo', comment: 'Looks great, Carol! Approved.', timestamp: subDays(new Date(), 5).toISOString() }], usage: [{ moduleId: 'FreelancerWorkflow', itemId: 'p1', itemName: 'BAM TikTok Campaign - Q3', dateUsed: subDays(new Date(), 4).toISOString() }], popularityScore: 92, folderId: 'folder_q3_tiktok' },
  { id: 'asset004', name: 'TikTok Ad Creative - Satire', type: 'Image', format: 'PNG', size: 850, previewUrl: 'https://placehold.co/400x700/10B981/FFFFFF?text=TikTok+Satire+Ad', fileUrl: '#', tags: ['tiktok', 'ad', 'satire', 'q3'], uploadedBy: 'Alice (Freelancer)', uploadDate: subDays(new Date(), 8).toISOString(), lastModified: subDays(new Date(), 2).toISOString(), status: 'In Review', dimensions: { width: 1080, height: 1920 }, isBrandCompliant: false, versions: [{ versionNumber: 1, date: subDays(new Date(), 8).toISOString(), editor: 'Alice', notes: 'Initial design' }], comments: [], usage: [], popularityScore: 75, folderId: 'folder_q3_tiktok' },
  // Videos
  { id: 'asset005', name: 'BAM Brand Intro Animation', type: 'Video', format: 'MP4', size: 5500, previewUrl: 'https://placehold.co/300x200/8B5CF6/FFFFFF?text=BAM+Intro', fileUrl: '#', tags: ['brand', 'intro', 'animation', 'video opener'], uploadedBy: 'Brett', uploadDate: subDays(new Date(), 60).toISOString(), lastModified: subDays(new Date(), 30).toISOString(), status: 'Approved', duration: 5, isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 60).toISOString(), editor: 'Brett', notes: 'Final version' }], comments: [], usage: [{ moduleId: 'VideoManagement', itemId: 'v1', itemName: 'BAM Exclusive: Politician Reacts to Memes', dateUsed: subDays(new Date(), 5).toISOString() }, { moduleId: 'VideoManagement', itemId: 'v4', itemName: 'The Future of BAM: Hugo & Brett Unfiltered', dateUsed: subDays(new Date(), 25).toISOString() }], popularityScore: 98, folderId: 'folder_stock_video' },
  { id: 'asset006', name: 'Tech B-Roll Footage Pack 1', type: 'Video', format: 'MOV', size: 250000, previewUrl: 'https://placehold.co/300x200/6B7280/FFFFFF?text=Tech+B-Roll', fileUrl: '#', tags: ['b-roll', 'tech', 'stock', '4k'], uploadedBy: 'Content Team', uploadDate: subDays(new Date(), 15).toISOString(), lastModified: subDays(new Date(), 15).toISOString(), status: 'Approved', duration: 120, isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 15).toISOString(), editor: 'Content Team', notes: 'Curated pack' }], comments: [], usage: [], popularityScore: 80, folderId: 'folder_stock_video' },
  // Audio
  { id: 'asset007', name: 'Upbeat Corporate Background Music', type: 'Audio', format: 'MP3', size: 3200, previewUrl: 'https://placehold.co/300x200/F3F4F6/0A1A2F?text=Audio+Track+1', fileUrl: '#', tags: ['music', 'background', 'corporate', 'upbeat'], uploadedBy: 'Content Team', uploadDate: subDays(new Date(), 25).toISOString(), lastModified: subDays(new Date(), 25).toISOString(), status: 'Approved', duration: 180, isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 25).toISOString(), editor: 'Content Team', notes: 'Licensed track' }], comments: [], usage: [], popularityScore: 85, folderId: 'folder_stock_audio' },
  { id: 'asset008', name: 'Whoosh Sound Effect Pack', type: 'Audio', format: 'WAV', size: 800, previewUrl: 'https://placehold.co/300x200/1F2937/FFFFFF?text=SFX+Pack', fileUrl: '#', tags: ['sfx', 'sound effects', 'transitions'], uploadedBy: 'Content Team', uploadDate: subDays(new Date(), 18).toISOString(), lastModified: subDays(new Date(), 18).toISOString(), status: 'Approved', duration: 60, isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 18).toISOString(), editor: 'Content Team', notes: 'Collection of 20 whooshes' }], comments: [], usage: [], popularityScore: 78, folderId: 'folder_stock_audio' },
  // Documents
  { id: 'asset009', name: 'Standard Video Script Template', type: 'Document', format: 'DOCX', size: 45, previewUrl: 'https://placehold.co/300x200/2563EB/FFFFFF?text=Script+Template', fileUrl: '#', tags: ['template', 'script', 'video production'], uploadedBy: 'Brett', uploadDate: subDays(new Date(), 50).toISOString(), lastModified: subDays(new Date(), 20).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 50).toISOString(), editor: 'Brett', notes: 'Initial version' }, { versionNumber: 2, date: subDays(new Date(), 20).toISOString(), editor: 'Hugo', notes: 'Added BAM branding section' }], comments: [], usage: [{ moduleId: 'ContentAssistant', itemId: 'script_gen_default', itemName: 'Default Script Generation', dateUsed: subDays(new Date(), 1).toISOString() }], popularityScore: 90 },
  { id: 'asset010', name: 'Freelancer Onboarding Guide', type: 'Document', format: 'PDF', size: 1500, previewUrl: 'https://placehold.co/300x200/FF6B35/FFFFFF?text=Onboarding+PDF', fileUrl: '#', tags: ['freelancer', 'onboarding', 'guide', 'hr'], uploadedBy: 'Hugo', uploadDate: subDays(new Date(), 70).toISOString(), lastModified: subDays(new Date(), 5).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 70).toISOString(), editor: 'Hugo', notes: 'V1.0' }], comments: [], usage: [{ moduleId: 'FreelancerWorkflow', itemId: 'onboarding_process', itemName: 'New Freelancer Onboarding', dateUsed: subDays(new Date(), 3).toISOString() }], popularityScore: 82 },
  // Fonts (as assets, though typically handled by system/CSS)
  { id: 'asset011', name: 'Inter Font Family (TTF)', type: 'Font', format: 'TTF', size: 2300, previewUrl: 'https://placehold.co/300x200/10B981/FFFFFF?text=Inter+Font', fileUrl: '#', tags: ['font', 'inter', 'sans-serif', 'ui'], uploadedBy: 'Design Team', uploadDate: subDays(new Date(), 100).toISOString(), lastModified: subDays(new Date(), 100).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 100).toISOString(), editor: 'Design Team', notes: 'Latest version' }], comments: [], usage: [], popularityScore: 96 },
  // Templates
  { id: 'asset012', name: 'TikTok Video Template - News Update', type: 'Template', format: 'FIG', size: 4500, previewUrl: 'https://placehold.co/300x200/8B5CF6/FFFFFF?text=TikTok+News+Template', fileUrl: '#', tags: ['template', 'tiktok', 'news', 'figma'], uploadedBy: 'Carol (Freelancer)', uploadDate: subDays(new Date(), 7).toISOString(), lastModified: subDays(new Date(), 1).toISOString(), status: 'In Review', isBrandCompliant: false, versions: [{ versionNumber: 1, date: subDays(new Date(), 7).toISOString(), editor: 'Carol', notes: 'Initial submission' }], comments: [], usage: [], popularityScore: 70, folderId: 'folder_q3_tiktok' },
  { id: 'asset013', name: 'YouTube Thumbnail Template - Gaming', type: 'Template', format: 'PSD', size: 12000, previewUrl: 'https://placehold.co/300x200/F3F4F6/0A1A2F?text=YT+Gaming+Thumb', fileUrl: '#', tags: ['template', 'youtube', 'thumbnail', 'gaming'], uploadedBy: 'Design Team', uploadDate: subDays(new Date(), 35).toISOString(), lastModified: subDays(new Date(), 10).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 35).toISOString(), editor: 'Design Team', notes: 'V1 with multiple layers' }], comments: [], usage: [], popularityScore: 85 },
  // More assets
  { id: 'asset014', name: 'BAM Brand Guidelines Presentation', type: 'Presentation', format: 'PPTX', size: 8500, previewUrl: 'https://placehold.co/300x200/1F2937/FFFFFF?text=Brand+PPT', fileUrl: '#', tags: ['brand', 'guidelines', 'presentation', 'internal'], uploadedBy: 'Hugo', uploadDate: subDays(new Date(), 55).toISOString(), lastModified: subDays(new Date(), 5).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 55).toISOString(), editor: 'Hugo', notes: 'Q2 Update' }], comments: [], usage: [], popularityScore: 89 },
  { id: 'asset015', name: 'Social Media Icon Pack (BAM Style)', type: 'Icon Set', format: 'SVG', size: 350, previewUrl: 'https://placehold.co/300x200/6B7280/FFFFFF?text=Social+Icons', fileUrl: '#', tags: ['icons', 'social media', 'brand style'], uploadedBy: 'Design Team', uploadDate: subDays(new Date(), 22).toISOString(), lastModified: subDays(new Date(), 22).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 22).toISOString(), editor: 'Design Team', notes: 'Set of 12 icons' }], comments: [], usage: [], popularityScore: 80, folderId: 'folder_ui_elements' },
  { id: 'asset016', name: 'AI Generated Abstract Background 1', type: 'Image', format: 'JPG', size: 2100, previewUrl: 'https://placehold.co/600x400/2563EB/FFFFFF?text=AI+Abstract+1', fileUrl: '#', tags: ['ai generated', 'background', 'abstract', 'blue'], uploadedBy: 'ContentAssistantBot', uploadDate: subDays(new Date(), 3).toISOString(), lastModified: subDays(new Date(), 3).toISOString(), status: 'Approved', dimensions: { width: 3840, height: 2160 }, isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 3).toISOString(), editor: 'AI Bot', notes: 'Generated from prompt "futuristic blue waves"' }], comments: [], usage: [], popularityScore: 77 },
  { id: 'asset017', name: 'Podcast Intro Music - Chill Hop', type: 'Audio', format: 'MP3', size: 4800, previewUrl: 'https://placehold.co/300x200/FF6B35/FFFFFF?text=Chill+Hop+Intro', fileUrl: '#', tags: ['music', 'podcast', 'intro', 'chill hop', 'royalty-free'], uploadedBy: 'Content Team', uploadDate: subDays(new Date(), 12).toISOString(), lastModified: subDays(new Date(), 12).toISOString(), status: 'Approved', duration: 30, isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 12).toISOString(), editor: 'Content Team', notes: 'Licensed track' }], comments: [], usage: [], popularityScore: 83 },
  { id: 'asset018', name: 'BAM Website UI Kit', type: 'Template', format: 'FIG', size: 15000, previewUrl: 'https://placehold.co/300x200/10B981/FFFFFF?text=BAM+UI+Kit', fileUrl: '#', tags: ['ui kit', 'website', 'figma', 'design system'], uploadedBy: 'Design Team', uploadDate: subDays(new Date(), 80).toISOString(), lastModified: subDays(new Date(), 10).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 80).toISOString(), editor: 'Design Team', notes: 'Initial UI Kit' }, { versionNumber: 2, date: subDays(new Date(), 10).toISOString(), editor: 'Design Team', notes: 'Added dark mode components' }], comments: [], usage: [], popularityScore: 94, folderId: 'folder_ui_elements' },
  { id: 'asset019', name: 'Explainer Video Character Set', type: 'Image', format: 'SVG', size: 950, previewUrl: 'https://placehold.co/300x200/8B5CF6/FFFFFF?text=Characters', fileUrl: '#', tags: ['characters', 'explainer', 'vector', 'illustration'], uploadedBy: 'Carol (Freelancer)', uploadDate: subDays(new Date(), 28).toISOString(), lastModified: subDays(new Date(), 28).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 28).toISOString(), editor: 'Carol', notes: 'Set of 5 characters' }], comments: [], usage: [], popularityScore: 86 },
  { id: 'asset020', name: 'BAM Brand Voice Guide (Short)', type: 'Document', format: 'PDF', size: 300, previewUrl: 'https://placehold.co/300x200/F3F4F6/0A1A2F?text=Voice+Guide', fileUrl: '#', tags: ['brand', 'voice', 'tone', 'guide'], uploadedBy: 'Brett', uploadDate: subDays(new Date(), 65).toISOString(), lastModified: subDays(new Date(), 65).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 65).toISOString(), editor: 'Brett', notes: 'Quick reference guide' }], comments: [], usage: [], popularityScore: 81 },
  { id: 'asset021', name: 'Q3 TikTok Ad - Variant B', type: 'Video', format: 'MP4', size: 4800, previewUrl: 'https://placehold.co/300x200/1F2937/FFFFFF?text=TikTok+Ad+B', fileUrl: '#', tags: ['tiktok', 'ad', 'q3', 'variant'], uploadedBy: 'Alice (Freelancer)', uploadDate: subDays(new Date(), 5).toISOString(), lastModified: subDays(new Date(), 1).toISOString(), status: 'Approved', duration: 15, isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 5).toISOString(), editor: 'Alice', notes: 'Alternative version' }], comments: [], usage: [], popularityScore: 79, folderId: 'folder_q3_tiktok' },
  { id: 'asset022', name: 'BAM Animated Logo Sting', type: 'Video', format: 'MOV', size: 2200, previewUrl: 'https://placehold.co/300x200/6B7280/FFFFFF?text=Logo+Sting', fileUrl: '#', tags: ['brand', 'logo', 'animation', 'sting'], uploadedBy: 'Design Team', uploadDate: subDays(new Date(), 90).toISOString(), lastModified: subDays(new Date(), 90).toISOString(), status: 'Approved', duration: 3, isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 90).toISOString(), editor: 'Design Team', notes: 'Final version' }], comments: [], usage: [], popularityScore: 91 },
  { id: 'asset023', name: 'Internal Memo Template', type: 'Document', format: 'DOCX', size: 30, previewUrl: 'https://placehold.co/300x200/2563EB/FFFFFF?text=Memo+Template', fileUrl: '#', tags: ['template', 'document', 'internal', 'memo'], uploadedBy: 'Hugo', uploadDate: subDays(new Date(), 120).toISOString(), lastModified: subDays(new Date(), 30).toISOString(), status: 'Approved', isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 120).toISOString(), editor: 'Hugo', notes: 'Basic template' }], comments: [], usage: [], popularityScore: 76 },
  { id: 'asset024', name: 'Product Hunt Launch Graphics', type: 'Image', format: 'PNG', size: 3200, previewUrl: 'https://placehold.co/600x400/FF6B35/FFFFFF?text=PH+Launch', fileUrl: '#', tags: ['product hunt', 'launch', 'marketing', 'graphics'], uploadedBy: 'Marketing Team', uploadDate: subDays(new Date(), 2).toISOString(), lastModified: subDays(new Date(), 1).toISOString(), status: 'Draft', dimensions: { width: 1200, height: 630 }, isBrandCompliant: true, versions: [{ versionNumber: 1, date: subDays(new Date(), 2).toISOString(), editor: 'Marketing Team', notes: 'Draft for review' }], comments: [], usage: [], popularityScore: 0, folderId: 'folder_marketing' },
];

const mockSmartCollections: SmartCollection[] = [
  { id: 'sc1', name: 'Recently Added', description: 'Assets uploaded in the last 7 days.', criteria: 'uploadDate > NOW()-7d', icon: Clock, assetCount: mockAssets.filter(a => differenceInDays(new Date(), parseISO(a.uploadDate)) <= 7).length },
  { id: 'sc2', name: 'Most Popular', description: 'Top downloaded or used assets.', criteria: 'popularityScore > 90', icon: TrendingUp, assetCount: mockAssets.filter(a => a.popularityScore > 90).length },
  { id: 'sc3', name: 'Brand Approved Logos', description: 'Official logos ready for use.', criteria: 'type:Logo AND status:Approved', icon: ShieldCheck, assetCount: mockAssets.filter(a => a.type === 'Logo' && a.status === 'Approved').length },
  { id: 'sc4', name: 'Q3 Campaign Assets', description: 'All assets tagged for the Q3 campaign.', criteria: 'tag:q3', icon: Briefcase, assetCount: mockAssets.filter(a => a.tags.includes('q3')).length },
  { id: 'sc5', name: 'Needs Review', description: 'Assets currently in review status.', criteria: 'status:In Review', icon: Eye, assetCount: mockAssets.filter(a => a.status === 'In Review').length },
  { id: 'sc6', name: 'AI Generated Content', description: 'Assets created using AI tools.', criteria: 'tag:ai generated OR uploadedBy:ContentAssistantBot', icon: Bot, assetCount: mockAssets.filter(a => a.tags.includes('ai generated') || a.uploadedBy === 'ContentAssistantBot').length },
];

const AssetLibrary = () => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [folders, setFolders] = useState<Folder[]>(mockFolders);
  const [smartCollections, setSmartCollections] = useState<SmartCollection[]>(mockSmartCollections);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'All',
    dateRange: 'allTime', // 'today', 'last7days', 'last30days', 'custom'
    tags: [] as string[],
    status: 'All',
    compliance: 'All', // 'Compliant', 'Non-Compliant'
    folder: 'All',
  });
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]); // IDs of selected assets
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null); // For navigating folders

  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<Asset | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [aiGenerationTasks, setAiGenerationTasks] = useState<AIGenerationTask[]>([]);
  const [currentAIGenType, setCurrentAIGenType] = useState<'Thumbnail' | 'LogoVariation' | 'SocialMediaPost' | 'PresentationSlide' | null>(null);
  const [aiGenPrompt, setAiGenPrompt] = useState('');
  const [aiSourceAssetId, setAiSourceAssetId] = useState<string | undefined>(undefined); // Changed to undefined
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[fileName: string]: number}>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAndSortedAssets = useMemo(() => {
    let result = assets;
    
    // Folder filtering
    if (currentFolder) {
      result = result.filter(asset => asset.folderId === currentFolder.id);
    } else if (filters.folder !== 'All') {
       result = result.filter(asset => asset.folderId === filters.folder);
    }

    // Text search (name, tags, description, AI data)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(asset =>
        asset.name.toLowerCase().includes(lowerSearchTerm) ||
        asset.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
        asset.description?.toLowerCase().includes(lowerSearchTerm) ||
        asset.aiGeneratedData?.summary?.toLowerCase().includes(lowerSearchTerm) ||
        asset.aiGeneratedData?.altText?.toLowerCase().includes(lowerSearchTerm) ||
        asset.aiGeneratedData?.autoTags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Type filter
    if (filters.type !== 'All') {
      result = result.filter(asset => asset.type === filters.type);
    }
    // Status filter
    if (filters.status !== 'All') {
      result = result.filter(asset => asset.status === filters.status);
    }
    // Compliance filter
    if (filters.compliance !== 'All') {
      result = result.filter(asset => filters.compliance === 'Compliant' ? asset.isBrandCompliant : !asset.isBrandCompliant);
    }
    // Date range filter (simplified for example)
    if (filters.dateRange !== 'allTime') {
      const days = parseInt(filters.dateRange.replace('last','').replace('days',''));
      if (!isNaN(days)) {
        result = result.filter(asset => differenceInDays(new Date(), parseISO(asset.uploadDate)) <= days);
      }
    }
    // Tag filter (if any tags are selected)
    if (filters.tags.length > 0) {
        result = result.filter(asset => filters.tags.every(filterTag => asset.tags.includes(filterTag)));
    }

    return result.sort((a, b) => parseISO(b.lastModified).getTime() - parseISO(a.lastModified).getTime());
  }, [assets, searchTerm, filters, currentFolder]);
  
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    assets.forEach(asset => asset.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [assets]);

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setUploadFiles(Array.from(event.dataTransfer.files));
      setIsUploadModalOpen(true);
      // Reset progress for new files
      const initialProgress: {[fileName: string]: number} = {};
      Array.from(event.dataTransfer.files).forEach(file => initialProgress[file.name] = 0);
      setUploadProgress(initialProgress);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploadFiles(Array.from(event.target.files));
      setIsUploadModalOpen(true);
      const initialProgress: {[fileName: string]: number} = {};
      Array.from(event.target.files).forEach(file => initialProgress[file.name] = 0);
      setUploadProgress(initialProgress);
    }
  };

  const simulateUpload = () => {
    uploadFiles.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          // Add to assets (mock)
          const newAsset: Asset = {
            id: `asset${assets.length + 1 + Math.random()}`.replace('.',''),
            name: file.name,
            type: file.type.startsWith('image/') ? 'Image' : file.type.startsWith('video/') ? 'Video' : 'Document',
            format: file.name.split('.').pop()?.toUpperCase() as FileFormat || 'UNK',
            size: Math.round(file.size / 1024),
            previewUrl: URL.createObjectURL(file), // Temporary preview
            fileUrl: '#', // Placeholder
            tags: ['newly uploaded', file.type.split('/')[0]],
            uploadedBy: 'Current User',
            uploadDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            status: 'Draft',
            versions: [{versionNumber: 1, date: new Date().toISOString(), editor: 'Current User', notes: 'Initial Upload'}],
            comments: [],
            usage: [],
            popularityScore: 0,
            folderId: currentFolder?.id,
          };
          setAssets(prev => [newAsset, ...prev]);
        }
        setUploadProgress(prev => ({...prev, [file.name]: progress}));
      }, 200);
    });
    // setTimeout(() => setIsUploadModalOpen(false), uploadFiles.length * 2500); // Close after all uploads might finish
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: `folder_${Date.now()}`.replace('.',''),
      name: newFolderName,
      parentId: currentFolder?.id,
      createdAt: new Date().toISOString(),
      assetCount: 0,
    };
    setFolders(prev => [...prev, newFolder]);
    setIsCreateFolderModalOpen(false);
    setNewFolderName('');
  };
  
  const handleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  // const handleSelectAll = () => { // Unused function
  //   if (selectedAssets.length === filteredAndSortedAssets.length) {
  //     setSelectedAssets([]);
  //   } else {
  //     setSelectedAssets(filteredAndSortedAssets.map(a => a.id));
  //   }
  // };
  
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedAssets.length} assets? This action cannot be undone.`)) {
      setAssets(prev => prev.filter(a => !selectedAssets.includes(a.id)));
      setSelectedAssets([]);
      alert(`${selectedAssets.length} assets deleted (simulated).`);
    }
  };

  const handleBulkDownload = () => {
    alert(`Simulating download of ${selectedAssets.length} assets.`);
    // In a real app, this would zip and download selected assets
  };

  const handleGenerateAIAsset = () => {
    if (!currentAIGenType || !aiGenPrompt) return;
    setIsGeneratingAsset(true);
    const newGenTask: AIGenerationTask = {
      id: `gen_${Date.now()}`.replace('.',''),
      type: currentAIGenType,
      status: 'Processing',
      prompt: aiGenPrompt,
      sourceAssetId: aiSourceAssetId,
      createdAt: new Date().toISOString(),
    };
    setAiGenerationTasks(prev => [newGenTask, ...prev]);

    setTimeout(() => {
      setAiGenerationTasks(prev => prev.map(task => task.id === newGenTask.id ? {...task, status: 'Completed', resultAssetId: `ai_asset_${Date.now()}`.replace('.','')} : task));
      // Mock adding a new asset
      const resultAsset: Asset = {
        id: `ai_asset_${Date.now()}`.replace('.',''),
        name: `${currentAIGenType} from \"${aiGenPrompt.substring(0,20)}...\"`,
        type: currentAIGenType === 'Thumbnail' || currentAIGenType === 'SocialMediaPost' ? 'Image' : currentAIGenType === 'LogoVariation' ? 'Logo' : 'Template',
        format: 'PNG',
        size: Math.floor(Math.random() * 500) + 100,
        previewUrl: `https://placehold.co/300x200/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=AI+${currentAIGenType.replace(' ','+')}`,
        fileUrl: '#',
        tags: ['ai generated', currentAIGenType.toLowerCase().replace(' ','-')],
        uploadedBy: 'ContentAssistantBot',
        uploadDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: 'Draft',
        versions: [{versionNumber: 1, date: new Date().toISOString(), editor: 'AI Bot', notes: `Generated via prompt: ${aiGenPrompt}`}],
        comments: [],
        usage: [],
        popularityScore: 0,
        aiGeneratedData: { summary: `AI Generated ${currentAIGenType}`},
        folderId: currentFolder?.id,
      };
      setAssets(prev => [resultAsset, ...prev]);
      setIsGeneratingAsset(false);
      setCurrentAIGenType(null);
      setAiGenPrompt('');
      setAiSourceAssetId(undefined);
      alert(`AI ${currentAIGenType} generation complete!`);
    }, 3000);
  };
  
  const openAssetDetail = (asset: Asset) => {
    setSelectedAssetDetail(asset);
    setIsDetailSheetOpen(true);
  };

  const getFolderBreadcrumbs = useCallback(() => {
    const crumbs: Folder[] = [];
    let folder = currentFolder;
    while(folder) {
      crumbs.unshift(folder);
      folder = folders.find(f => f.id === folder?.parentId);
    }
    return crumbs;
  }, [currentFolder, folders]);

  const renderAssetPreview = (asset: Asset) => {
    switch(asset.type) {
      case 'Image':
      case 'Logo':
      case 'Icon Set':
        return <img src={asset.previewUrl} alt={asset.name} className="max-h-[400px] w-auto object-contain rounded-md border" />;
      case 'Video':
        return <video src={asset.fileUrl} controls className="max-h-[400px] w-full rounded-md border bg-black"><track kind="captions" /></video>;
      case 'Audio':
        return <audio src={asset.fileUrl} controls className="w-full" />;
      case 'Document':
      case 'Presentation':
        return <div className="h-[300px] bg-gray-100 rounded-md flex flex-col items-center justify-center border">
          <FileText className="h-16 w-16 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">{asset.name}</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => window.open(asset.fileUrl, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" /> Open Document
          </Button>
        </div>;
      case 'Font':
         return <div className="h-[300px] bg-gray-100 rounded-md flex flex-col items-center justify-center border p-4">
          <TypeIcon className="h-16 w-16 text-gray-400 mb-2" />
          <p className="text-2xl font-bold" style={{fontFamily: asset.name.split(' ')[0]}}>{asset.name}</p> {/* Basic font preview */}
          <p className="text-sm text-gray-600 mt-2">Format: {asset.format}</p>
        </div>;
      case 'Template':
         return <div className="h-[300px] bg-gray-100 rounded-md flex flex-col items-center justify-center border p-4">
          <Layers3 className="h-16 w-16 text-gray-400 mb-2" />
          <p className="text-lg font-semibold">{asset.name}</p>
          <p className="text-sm text-gray-600 mt-1">Type: {asset.type} ({asset.format})</p>
        </div>;
      default:
        return <div className="h-[300px] bg-gray-200 rounded-md flex items-center justify-center"><PackageSearch className="h-12 w-12 text-gray-400"/></div>;
    }
  };

  const currentPathDisplay = useMemo(() => {
    const breadcrumbs = getFolderBreadcrumbs();
    if (breadcrumbs.length === 0) return "All Assets";
    return breadcrumbs.map(f => f.name).join(' / ');
  }, [getFolderBreadcrumbs]);

  const subFoldersInCurrentView = useMemo(() => {
    return folders.filter(f => f.parentId === currentFolder?.id);
  }, [folders, currentFolder]);

  const handleTagFilterChange = (tag: string) => {
    setFilters(prev => ({
        ...prev,
        tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center">
          <DatabaseZap className="h-8 w-8 mr-3 text-primary" />
          Asset Library
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload Assets
          </Button>
          <Button variant="outline" onClick={() => setIsCreateFolderModalOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" /> New Folder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="browse" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <TabsTrigger value="browse">Browse Assets</TabsTrigger>
          <TabsTrigger value="collections">Smart Collections</TabsTrigger>
          <TabsTrigger value="generate">AI Generate</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Browse Assets Tab */}
        <TabsContent value="browse" className="mt-6 flex-grow flex flex-col overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Filters Sidebar */}
            <Card className="w-full md:w-72 flex-shrink-0">
              <CardHeader><CardTitle className="text-lg">Filters & Folders</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-320px)] pr-3"> {/* Adjust height */}
                  <div className="space-y-6">
                    <div>
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">Folders</Label>
                      <div className="mt-2 space-y-1">
                        <Button variant="ghost" size="sm" className={`w-full justify-start ${!currentFolder ? 'bg-accent' : ''}`} onClick={() => setCurrentFolder(null)}>All Assets</Button>
                        {getFolderBreadcrumbs().length > 0 && (
                           <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground" onClick={() => setCurrentFolder(folders.find(f => f.id === currentFolder?.parentId) || null)}>
                             <ChevronLeft className="h-3 w-3 mr-1" /> Back to {folders.find(f => f.id === currentFolder?.parentId)?.name || 'Root'}
                           </Button>
                        )}
                        {subFoldersInCurrentView.map(folder => (
                          <Button key={folder.id} variant="ghost" size="sm" className="w-full justify-start" onClick={() => setCurrentFolder(folder)}>
                            <FolderSymlink className="h-4 w-4 mr-2" /> {folder.name} ({folder.assetCount || assets.filter(a => a.folderId === folder.id).length})
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Label htmlFor="filter-type" className="text-xs font-semibold uppercase text-muted-foreground">Asset Type</Label>
                      <Select value={filters.type} onValueChange={(value) => setFilters(f => ({...f, type: value}))}>
                        <SelectTrigger id="filter-type" className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['All', 'Image', 'Video', 'Audio', 'Document', 'Font', 'Template', 'Logo', 'Icon Set', 'Presentation'].map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="filter-status" className="text-xs font-semibold uppercase text-muted-foreground">Status</Label>
                      <Select value={filters.status} onValueChange={(value) => setFilters(f => ({...f, status: value}))}>
                        <SelectTrigger id="filter-status" className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['All', 'Draft', 'In Review', 'Approved', 'Archived'].map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                     <div>
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">Tags</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between mt-1">
                                {filters.tags.length > 0 ? `${filters.tags.length} selected` : "Select tags..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Search tags..." />
                                <CommandList>
                                <CommandEmpty>No tags found.</CommandEmpty>
                                <CommandGroup>
                                    {allTags.map(tag => (
                                        <CommandItem key={tag} value={tag} onSelect={() => handleTagFilterChange(tag)}>
                                            <Check className={`mr-2 h-4 w-4 ${filters.tags.includes(tag) ? "opacity-100" : "opacity-0"}`} />
                                            {tag}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                {filters.tags.length > 0 && (
                                    <>
                                        <CommandSeparator />
                                        <CommandGroup>
                                            <CommandItem onSelect={() => setFilters(f => ({...f, tags: []}))} className="justify-center text-center">
                                                Clear filters
                                            </CommandItem>
                                        </CommandGroup>
                                    </>
                                )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="filter-compliance" className="text-xs font-semibold uppercase text-muted-foreground">Brand Compliance</Label>
                      <Select value={filters.compliance} onValueChange={(value) => setFilters(f => ({...f, compliance: value}))}>
                        <SelectTrigger id="filter-compliance" className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['All', 'Compliant', 'Non-Compliant'].map(val => (
                            <SelectItem key={val} value={val}>{val}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Main Asset Area */}
            <div className="flex-grow flex flex-col overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <div className="relative w-full sm:max-w-xs">
                  <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search assets (name, tags, AI semantic...)" className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{filteredAndSortedAssets.length} assets</span>
                  <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid"><LayoutGrid className="h-4 w-4 inline mr-1" /> Grid</SelectItem>
                      <SelectItem value="list"><List className="h-4 w-4 inline mr-1" /> List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Path Display */}
              <div className="mb-2 text-sm text-muted-foreground">
                Path: {currentPathDisplay}
              </div>

              {/* Bulk Actions Bar */}
              {selectedAssets.length > 0 && (
                <Card className="mb-4 p-3 bg-secondary/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{selectedAssets.length} assets selected</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => alert('Tagging selected assets (simulated)')}><Tags className="h-4 w-4 mr-1.5"/> Tag</Button>
                      <Button size="sm" variant="outline" onClick={() => alert('Moving selected assets (simulated)')}><FolderSymlink className="h-4 w-4 mr-1.5"/> Move</Button>
                      <Button size="sm" variant="outline" onClick={handleBulkDownload}><Download className="h-4 w-4 mr-1.5"/> Download</Button>
                      <Button size="sm" variant="destructive" onClick={handleBulkDelete}><Trash2 className="h-4 w-4 mr-1.5"/> Delete</Button>
                    </div>
                  </div>
                </Card>
              )}

              <ScrollArea className="flex-grow" onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()}>
                {filteredAndSortedAssets.length === 0 && !currentFolder && subFoldersInCurrentView.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <PackageSearch className="h-24 w-24 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold">No Assets Found</h3>
                        <p className="text-muted-foreground mb-4">Try adjusting your filters or upload new assets.</p>
                        <Button onClick={() => setIsUploadModalOpen(true)}><UploadCloud className="mr-2 h-4 w-4" /> Upload Assets</Button>
                    </div>
                ) : (
                    <>
                    {/* Display Subfolders if any */}
                    {subFoldersInCurrentView.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-md font-semibold mb-2 text-muted-foreground">Folders in "{currentFolder?.name || 'Root'}"</h3>
                            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
                                {subFoldersInCurrentView.map(folder => (
                                    <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentFolder(folder)}>
                                        <CardContent className="p-4 flex flex-col items-center text-center">
                                            <FolderKanban className="h-12 w-12 text-primary mb-2" />
                                            <p className="text-sm font-medium truncate w-full">{folder.name}</p>
                                            <p className="text-xs text-muted-foreground">{folder.assetCount || assets.filter(a => a.folderId === folder.id).length} items</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <Separator className="my-6"/>
                        </div>
                    )}

                    {/* Display Assets */}
                    {filteredAndSortedAssets.length > 0 && <h3 className="text-md font-semibold mb-2 text-muted-foreground">Assets in "{currentPathDisplay}"</h3>}
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
                    {filteredAndSortedAssets.map(asset => (
                        <Card key={asset.id} className={`flex flex-col overflow-hidden transition-all hover:shadow-lg ${selectedAssets.includes(asset.id) ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                        <CardHeader className="p-0 relative aspect-video">
                            <Checkbox
                                checked={selectedAssets.includes(asset.id)}
                                onCheckedChange={() => handleAssetSelection(asset.id)}
                                className="absolute top-2 left-2 z-10 bg-background/80"
                            />
                            <img src={asset.previewUrl} alt={asset.name} className="w-full h-full object-cover cursor-pointer" onClick={() => openAssetDetail(asset)} />
                            <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">{asset.format}</Badge>
                        </CardHeader>
                        <CardContent className="p-3 flex-grow">
                            <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <h4 className="text-sm font-semibold truncate cursor-default" onClick={() => openAssetDetail(asset)}>{asset.name}</h4>
                            </TooltipTrigger><TooltipContent>{asset.name}</TooltipContent></Tooltip></TooltipProvider>
                            <p className="text-xs text-muted-foreground">{asset.type} - {asset.size}KB</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                            {asset.tags.slice(0,2).map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                            {asset.tags.length > 2 && <Badge variant="outline" className="text-xs">+{asset.tags.length - 2}</Badge>}
                            </div>
                        </CardContent>
                        <CardFooter className="p-2 border-t flex justify-end gap-1">
                            <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => openAssetDetail(asset)}><Eye className="h-3.5 w-3.5"/></Button>
                            </TooltipTrigger><TooltipContent>View Details</TooltipContent></Tooltip></TooltipProvider>
                            <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => alert(`Downloading ${asset.name}`)}><Download className="h-3.5 w-3.5"/></Button>
                            </TooltipTrigger><TooltipContent>Download</TooltipContent></Tooltip></TooltipProvider>
                            <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => alert(`Sharing ${asset.name}`)}><Share2 className="h-3.5 w-3.5"/></Button>
                            </TooltipTrigger><TooltipContent>Share</TooltipContent></Tooltip></TooltipProvider>
                        </CardFooter>
                        </Card>
                    ))}
                    </div>
                    </>
                )}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        {/* Other Tabs (Placeholders for now or simplified) */}
        <TabsContent value="collections" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Smart Collections</CardTitle><CardDescription>Automatically grouped assets based on criteria.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {smartCollections.map(sc => (
                <Card key={sc.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => alert(`Filtering by collection: ${sc.name}`)}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium">{sc.name}</CardTitle>
                    <sc.icon className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{sc.description}</p>
                    <p className="text-2xl font-bold mt-1">{sc.assetCount}</p>
                    <p className="text-xs text-muted-foreground">assets</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader><CardTitle>AI Asset Generation</CardTitle><CardDescription>Create new assets using AI.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={(value: AIGenerationTask['type']) => setCurrentAIGenType(value)}>
                  <SelectTrigger><SelectValue placeholder="Select asset type to generate..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thumbnail"><ImageIcon className="h-4 w-4 mr-2 inline-block"/>AI Thumbnail</SelectItem>
                    <SelectItem value="LogoVariation"><Palette className="h-4 w-4 mr-2 inline-block"/>Logo Variation</SelectItem>
                    <SelectItem value="SocialMediaPost"><LayoutGrid className="h-4 w-4 mr-2 inline-block"/>Social Media Graphic</SelectItem>
                    <SelectItem value="PresentationSlide"><Layers3 className="h-4 w-4 mr-2 inline-block"/>Presentation Slide</SelectItem>
                  </SelectContent>
                </Select>
                {currentAIGenType === 'LogoVariation' && (
                    <Select value={aiSourceAssetId} onValueChange={setAiSourceAssetId}>
                        <SelectTrigger><SelectValue placeholder="Select source logo..." /></SelectTrigger>
                        <SelectContent>
                            {assets.filter(a => a.type === 'Logo').map(logo => <SelectItem key={logo.id} value={logo.id}>{logo.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
                <Textarea placeholder="Describe the asset you want to generate (e.g., 'Thumbnail for a video about AI ethics, dark blue theme')..." value={aiGenPrompt} onChange={e => setAiGenPrompt(e.target.value)} rows={4}/>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleGenerateAIAsset} disabled={isGeneratingAsset || !currentAIGenType || !aiGenPrompt}>
                  {isGeneratingAsset ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Sparkles className="h-4 w-4 mr-2"/>}
                  Generate Asset
                </Button>
              </CardFooter>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle>Generation Queue & History</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {aiGenerationTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No generation tasks yet.</p>}
                  <div className="space-y-3">
                  {aiGenerationTasks.map(task => (
                    <Card key={task.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{task.type} - <span className="text-xs text-muted-foreground">"{task.prompt.substring(0,30)}..."</span></p>
                          <p className="text-xs text-muted-foreground">Requested: {format(parseISO(task.createdAt), 'PPp')}</p>
                        </div>
                        <Badge variant={task.status === 'Completed' ? 'default' : task.status === 'Processing' ? 'secondary' : 'destructive'} className={task.status === 'Completed' ? 'bg-green-500' : ''}>{task.status}</Badge>
                      </div>
                      {task.status === 'Processing' && <Progress value={Math.random()*80+10} className="h-1.5 mt-2"/>}
                      {task.status === 'Completed' && task.resultAssetId && (
                        <Button size="sm" variant="link" className="p-0 h-auto mt-1" onClick={() => openAssetDetail(assets.find(a=>a.id===task.resultAssetId)!)}>View Result</Button>
                      )}
                    </Card>
                  ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
            <Card>
                <CardHeader><CardTitle>Asset Usage Analytics</CardTitle><CardDescription>Insights into how assets are being utilized.</CardDescription></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Top Used Assets</CardTitle></CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={assets.sort((a,b) => b.usage.length - a.usage.length).slice(0,5)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10}} interval={0}/>
                                    <RechartsTooltip />
                                    <Bar dataKey="usage.length" name="Times Used" fill="#8884d8" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Asset Types Distribution</CardTitle></CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={Object.entries(assets.reduce((acc, asset) => { acc[asset.type] = (acc[asset.type] || 0) + 1; return acc; }, {} as Record<AssetType, number>)).map(([name, value]) => ({name, value}))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                      {Object.entries(assets.reduce((acc, asset) => { acc[asset.type] = (acc[asset.type] || 0) + 1; return acc; }, {} as Record<AssetType, number>)).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
            <Card>
                <CardHeader><CardTitle>Asset Library Settings</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Default Asset Status on Upload</Label>
                        <Select defaultValue="Draft">
                            <SelectTrigger className="w-[200px]"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="In Review">In Review</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="ai-tagging" defaultChecked/>
                        <Label htmlFor="ai-tagging">Enable AI Auto-Tagging</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="version-history"/>
                        <Label htmlFor="version-history">Enable Detailed Version History (more storage)</Label>
                    </div>
                     <div>
                        <Label>Storage Usage (Simulated)</Label>
                        <Progress value={65} className="mt-1"/>
                        <p className="text-xs text-muted-foreground mt-1">6.5GB / 10GB Used</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>

      {/* Modals & Sheets */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Upload Assets</DialogTitle><DialogDescription>Select files to upload to the Asset Library.</DialogDescription></DialogHeader>
          <div className="py-4 space-y-4">
            {uploadFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors" onClick={() => fileInputRef.current?.click()} onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()}>
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Drag & drop files or click to browse</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-3">
                <div className="space-y-3">
                {uploadFiles.map(file => (
                  <div key={file.name} className="border p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium truncate max-w-[70%]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)}KB</p>
                    </div>
                    <Progress value={uploadProgress[file.name] || 0} className="h-1.5 mt-1.5" />
                    {uploadProgress[file.name] === 100 && <p className="text-xs text-green-600 mt-0.5">Upload complete!</p>}
                  </div>
                ))}
                </div>
              </ScrollArea>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileInputChange} multiple className="hidden" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsUploadModalOpen(false); setUploadFiles([]); setUploadProgress({}); }}>Cancel</Button>
            <Button onClick={simulateUpload} disabled={uploadFiles.length === 0 || Object.values(uploadProgress).some(p => p > 0 && p < 100)}>
              {Object.values(uploadProgress).some(p => p > 0 && p < 100) ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <UploadCloud className="h-4 w-4 mr-2"/>}
              {Object.values(uploadProgress).some(p => p > 0 && p < 100) ? 'Uploading...' : `Upload ${uploadFiles.length} File(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create New Folder</DialogTitle><DialogDescription>Organize your assets by creating a new folder{currentFolder ? ` inside \"${currentFolder.name}\"` : ''}.</DialogDescription></DialogHeader>
          <div className="py-4">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input id="folder-name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="mt-1" placeholder="e.g., Social Media Graphics"/>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {setIsCreateFolderModalOpen(false); setNewFolderName('');}}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0">
          {selectedAssetDetail && (
            <ScrollArea className="h-screen">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="text-2xl">{selectedAssetDetail.name}</SheetTitle>
              <SheetDescription>
                {selectedAssetDetail.type} - {selectedAssetDetail.format} - {selectedAssetDetail.size}KB
                <span className="mx-2">|</span>
                Uploaded by {selectedAssetDetail.uploadedBy} on {format(parseISO(selectedAssetDetail.uploadDate), 'PP')}
              </SheetDescription>
            </SheetHeader>
            <div className="p-6 space-y-6">
              <Tabs defaultValue="preview">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  <TabsTrigger value="versions">Versions ({selectedAssetDetail.versions.length})</TabsTrigger>
                  <TabsTrigger value="usage">Usage ({selectedAssetDetail.usage.length})</TabsTrigger>
                  <TabsTrigger value="comments">Comments ({selectedAssetDetail.comments.length})</TabsTrigger>
                  <TabsTrigger value="ai">AI Insights</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <Card>
                    <CardContent className="p-4 flex justify-center items-center min-h-[300px] bg-muted/30 rounded-md">
                      {renderAssetPreview(selectedAssetDetail)}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm"><ZoomIn className="h-4 w-4 mr-1"/> Zoom</Button>
                      <Button variant="outline" size="sm"><Maximize2 className="h-4 w-4 mr-1"/> Fullscreen</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="metadata" className="mt-4">
                  <Card><CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div><strong className="text-muted-foreground">File Name:</strong> {selectedAssetDetail.name}</div>
                      <div><strong className="text-muted-foreground">Asset ID:</strong> {selectedAssetDetail.id}</div>
                      <div><strong className="text-muted-foreground">Type:</strong> {selectedAssetDetail.type}</div>
                      <div><strong className="text-muted-foreground">Format:</strong> {selectedAssetDetail.format}</div>
                      <div><strong className="text-muted-foreground">Size:</strong> {selectedAssetDetail.size} KB</div>
                      <div><strong className="text-muted-foreground">Status:</strong> <Badge variant={selectedAssetDetail.status === 'Approved' ? 'default' : 'secondary'} className={selectedAssetDetail.status === 'Approved' ? 'bg-green-500' : ''}>{selectedAssetDetail.status}</Badge></div>
                      {selectedAssetDetail.dimensions && <div><strong className="text-muted-foreground">Dimensions:</strong> {selectedAssetDetail.dimensions.width}x{selectedAssetDetail.dimensions.height}px</div>}
                      {selectedAssetDetail.duration && <div><strong className="text-muted-foreground">Duration:</strong> {selectedAssetDetail.duration}s</div>}
                      <div><strong className="text-muted-foreground">Uploaded:</strong> {format(parseISO(selectedAssetDetail.uploadDate), 'PPp')} by {selectedAssetDetail.uploadedBy}</div>
                      <div><strong className="text-muted-foreground">Last Modified:</strong> {format(parseISO(selectedAssetDetail.lastModified), 'PPp')}</div>
                      <div><strong className="text-muted-foreground">Brand Compliant:</strong> {selectedAssetDetail.isBrandCompliant ? <CheckCircle2 className="h-4 w-4 inline text-green-600"/> : <XCircle className="h-4 w-4 inline text-red-600"/>}</div>
                      <div><strong className="text-muted-foreground">Folder:</strong> {selectedAssetDetail.folderId ? folders.find(f=>f.id===selectedAssetDetail.folderId)?.name : 'Root'}</div>
                    </div>
                    <Separator/>
                    <div>
                      <Label htmlFor="asset-desc" className="font-semibold">Description</Label>
                      <Textarea id="asset-desc" defaultValue={selectedAssetDetail.description} rows={3} className="mt-1 text-sm" placeholder="Add a description..."/>
                    </div>
                    <div>
                      <Label className="font-semibold">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                          {selectedAssetDetail.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                          {/* Add tag input here */}
                      </div>
                    </div>
                  </CardContent></Card>
                </TabsContent>
                <TabsContent value="versions" className="mt-4">
                   <Card><CardContent className="p-4 space-y-3 text-sm">
                    {selectedAssetDetail.versions.sort((a,b) => b.versionNumber - a.versionNumber).map(v => (
                      <div key={v.versionNumber} className="p-3 border rounded-md">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">Version {v.versionNumber} <span className="text-xs text-muted-foreground">({format(parseISO(v.date), 'PP')})</span></p>
                          {v.versionNumber === selectedAssetDetail.versions.length && <Badge>Current</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">By: {v.editor}</p>
                        <p className="mt-1 text-xs">{v.notes}</p>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline"><Eye className="h-3 w-3 mr-1"/> Preview</Button>
                          {v.versionNumber !== selectedAssetDetail.versions.length && <Button size="sm" variant="outline"><RotateCcw className="h-3 w-3 mr-1"/> Revert to this</Button>}
                        </div>
                      </div>
                    ))}
                  </CardContent></Card>
                </TabsContent>
                <TabsContent value="usage" className="mt-4">
                  <Card><CardContent className="p-4 space-y-3 text-sm">
                    {selectedAssetDetail.usage.length === 0 && <p className="text-muted-foreground">This asset hasn't been used in any projects or content yet.</p>}
                    {selectedAssetDetail.usage.map((use, i) => (
                      <div key={i} className="p-3 border rounded-md">
                        <p className="font-medium">{use.itemName}</p>
                        <p className="text-xs text-muted-foreground">Module: {use.moduleId} | Used on: {format(parseISO(use.dateUsed), 'PP')}</p>
                        {use.link && <Button size="sm" variant="link" className="p-0 h-auto" onClick={() => alert(`Navigate to ${use.link}`)}>View Context</Button>}
                      </div>
                    ))}
                  </CardContent></Card>
                </TabsContent>
                <TabsContent value="comments" className="mt-4">
                  <Card><CardContent className="p-4 space-y-4 text-sm">
                    {/* Commenting system UI would go here */}
                    <Textarea placeholder="Add a comment..." rows={3}/>
                    <Button size="sm">Post Comment</Button>
                    <p className="text-muted-foreground text-center">Commenting feature coming soon.</p>
                  </CardContent></Card>
                </TabsContent>
                <TabsContent value="ai" className="mt-4">
                  <Card><CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold">AI Generated Insights</h4>
                    <p className="text-sm"><strong className="text-muted-foreground">Auto Tags:</strong> {selectedAssetDetail.aiGeneratedData?.autoTags?.join(', ') || 'N/A'}</p>
                    <p className="text-sm"><strong className="text-muted-foreground">Summary:</strong> {selectedAssetDetail.aiGeneratedData?.summary || 'N/A'}</p>
                    <p className="text-sm"><strong className="text-muted-foreground">Alt Text Suggestion:</strong> {selectedAssetDetail.aiGeneratedData?.altText || 'N/A'}</p>
                    <Separator className="my-3"/>
                    <h4 className="font-semibold">AI Recommendations</h4>
                    <p className="text-sm text-muted-foreground">Assets often used with this one:</p>
                    {/* Mock recommendations */}
                    <div className="flex gap-2 overflow-x-auto py-2">
                      {assets.slice(0,3).map(rec => <Card key={rec.id} className="w-28 flex-shrink-0"><CardContent className="p-1"><img src={rec.previewUrl} alt={rec.name} className="h-16 w-full object-cover rounded-sm"/><p className="text-xs truncate mt-1">{rec.name}</p></CardContent></Card>)}
                    </div>
                  </CardContent></Card>
                </TabsContent>
              </Tabs>
            </div>
            <SheetFooter className="p-6 border-t">
              <SheetClose asChild><Button variant="outline">Close</Button></SheetClose>
              <Button><Download className="h-4 w-4 mr-2"/> Download Asset</Button>
            </SheetFooter>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default AssetLibrary;
