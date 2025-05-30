import { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Mic, 
  MessageSquare, 
  RefreshCw, 
  Lightbulb, 
  Copy, 
  Download, 
  Settings, 
  Sparkles, 
  Zap, 
  ThumbsUp, 
  ThumbsDown, 
  Save, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Layers,
  Flame,
  TrendingUp,
  Clock,
  Shuffle,
  Maximize,
  Minimize,
  ArrowRight,
  ChevronsUpDown,
  Loader2,
  Check,
  Trash,
  Plus,
  Search,
  BookOpen
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Progress } from './ui/progress';
import { invoke } from '@tauri-apps/api/tauri';

// Types
interface ScriptTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
  category: string;
  tags: string[];
}

interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  preview: string;
  category: 'standard' | 'premium';
}

interface MemeTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  duration: string;
  complexity: 'simple' | 'medium' | 'complex';
  example: string;
  steps: string[];
}

interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  popularity: number; // 0-100
  relatedTopics: string[];
  summary?: string;
}

// Mock Data
const scriptTemplates: ScriptTemplate[] = [
  {
    id: '1',
    title: 'Political Satire',
    description: 'A satirical take on current political events',
    template: 'In a world where [POLITICAL_FIGURE] thinks [RIDICULOUS_CLAIM], we find ourselves asking: has politics always been this absurd? Let\'s break down this week\'s political circus, where [EVENT_1] somehow led to [UNEXPECTED_OUTCOME]...',
    category: 'satire',
    tags: ['politics', 'satire', 'comedy']
  },
  {
    id: '2',
    title: 'Tech Review',
    description: 'A balanced review of the latest tech products',
    template: 'Today we\'re looking at [PRODUCT_NAME], the latest release from [COMPANY]. With its [FEATURE_1] and [FEATURE_2], it promises to revolutionize how we [ACTIVITY]. But does it live up to the hype? Let\'s find out...',
    category: 'review',
    tags: ['tech', 'review', 'gadgets']
  },
  {
    id: '3',
    title: 'Pop Culture Breakdown',
    description: 'Analysis of trending entertainment topics',
    template: 'Unless you\'ve been living under a rock, you\'ve probably heard about [TRENDING_TOPIC]. From [CELEBRITY_1]\'s hot take to [CELEBRITY_2]\'s controversial response, this has been the talk of social media. Let\'s unpack what\'s really happening...',
    category: 'entertainment',
    tags: ['celebrity', 'trends', 'entertainment']
  },
  {
    id: '4',
    title: 'Conspiracy Theory Debunk',
    description: 'Humorous debunking of popular conspiracy theories',
    template: 'So apparently [CONSPIRACY_THEORY] is making the rounds again. According to believers, [RIDICULOUS_CLAIM] is actually true because [FAULTY_REASONING]. Let\'s break down why this makes absolutely no sense...',
    category: 'debunking',
    tags: ['conspiracy', 'debunk', 'facts']
  },
  {
    id: '5',
    title: 'Social Media Drama',
    description: 'Recap of viral social media controversies',
    template: 'The internet is on fire again, and this time it\'s about [CONTROVERSY]. It all started when [PERSON/BRAND] posted [CONTENT], which led to [REACTION]. Now everyone from [CELEBRITY] to [INFLUENCER] is weighing in...',
    category: 'social media',
    tags: ['drama', 'viral', 'social media']
  }
];

const voiceOptions: VoiceOption[] = [
  {
    id: 'v1',
    name: 'Alex',
    gender: 'male',
    accent: 'American',
    preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    category: 'standard'
  },
  {
    id: 'v2',
    name: 'Sophia',
    gender: 'female',
    accent: 'British',
    preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    category: 'standard'
  },
  {
    id: 'v3',
    name: 'Morgan',
    gender: 'neutral',
    accent: 'American',
    preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    category: 'standard'
  },
  {
    id: 'v4',
    name: 'James',
    gender: 'male',
    accent: 'Australian',
    preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    category: 'premium'
  },
  {
    id: 'v5',
    name: 'Emma',
    gender: 'female',
    accent: 'American',
    preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    category: 'premium'
  }
];

const memeTemplates: MemeTemplate[] = [
  {
    id: 'm1',
    name: 'Distracted Boyfriend',
    description: 'Guy looking at another girl while his girlfriend looks shocked',
    imageUrl: 'https://placehold.co/400x300/2563eb/ffffff?text=Distracted+Boyfriend',
    tags: ['relationships', 'choices', 'classic']
  },
  {
    id: 'm2',
    name: 'Change My Mind',
    description: 'Steven Crowder sitting at a table with a "change my mind" sign',
    imageUrl: 'https://placehold.co/400x300/10b981/ffffff?text=Change+My+Mind',
    tags: ['debate', 'opinion', 'challenge']
  },
  {
    id: 'm3',
    name: 'Drake Hotline Bling',
    description: 'Drake disapproving and approving in two panels',
    imageUrl: 'https://placehold.co/400x300/f59e0b/ffffff?text=Drake+Hotline+Bling',
    tags: ['preference', 'comparison', 'music']
  },
  {
    id: 'm4',
    name: 'Two Buttons',
    description: 'Person sweating while deciding between two buttons',
    imageUrl: 'https://placehold.co/400x300/ec4899/ffffff?text=Two+Buttons',
    tags: ['choice', 'dilemma', 'decision']
  },
  {
    id: 'm5',
    name: 'Woman Yelling at Cat',
    description: 'Woman yelling at confused cat at dinner table',
    imageUrl: 'https://placehold.co/400x300/8b5cf6/ffffff?text=Woman+Yelling+at+Cat',
    tags: ['argument', 'confusion', 'animals']
  }
];

const contentTemplates: ContentTemplate[] = [
  {
    id: 'ct1',
    title: 'Timeline Bio',
    description: 'Chronological evolution of a person, brand, or trend',
    duration: '1-3 minutes',
    complexity: 'medium',
    example: 'Elon Musk: From PayPal to Mars',
    steps: [
      'Start with early beginnings/origin',
      'Highlight 5-7 key milestones with dates',
      'Show visual progression (photos/videos)',
      'End with current status and future predictions'
    ]
  },
  {
    id: 'ct2',
    title: 'Face Evolution',
    description: 'Visual progression of a person\'s appearance over time',
    duration: '30-60 seconds',
    complexity: 'simple',
    example: 'Taylor Swift Through the Decades',
    steps: [
      'Collect chronological photos (10-20)',
      'Align faces consistently',
      'Add year captions',
      'Set to trending music',
      'Add commentary on major style changes'
    ]
  },
  {
    id: 'ct3',
    title: 'Reaction Video',
    description: 'Reacting to trending content with commentary',
    duration: '2-5 minutes',
    complexity: 'simple',
    example: 'Reacting to the Latest iPhone Announcement',
    steps: [
      'Introduce the original content',
      'Show genuine first reactions',
      'Pause for detailed commentary',
      'Highlight surprising/controversial moments',
      'Summarize final thoughts'
    ]
  },
  {
    id: 'ct4',
    title: 'Explainer Video',
    description: 'Break down complex topics into simple explanations',
    duration: '3-7 minutes',
    complexity: 'complex',
    example: 'Web3 Explained in 5 Minutes',
    steps: [
      'Hook with a relatable problem/question',
      'Provide historical context',
      'Break down key concepts with visuals',
      'Address common misconceptions',
      'Explain real-world applications',
      'Summarize with key takeaways'
    ]
  },
  {
    id: 'ct5',
    title: 'Controversy Breakdown',
    description: 'Neutral analysis of divisive topics with multiple perspectives',
    duration: '5-10 minutes',
    complexity: 'complex',
    example: 'The AI Ethics Debate: Both Sides Explained',
    steps: [
      'Introduce the controversy without bias',
      'Present perspective A with strongest arguments',
      'Present perspective B with strongest arguments',
      'Show nuanced middle ground positions',
      'Discuss implications and future outlook',
      'End with thought-provoking questions'
    ]
  }
];

const trendingTopics: TrendingTopic[] = [
  {
    id: 't1',
    topic: 'AI Regulation Debate',
    category: 'technology',
    popularity: 92,
    relatedTopics: ['OpenAI', 'EU AI Act', 'AI safety', 'AGI timeline'],
    summary: 'Ongoing discussions about how to govern artificial intelligence, balancing innovation with ethical considerations and potential risks.'
  },
  {
    id: 't2',
    topic: 'Climate Policy Controversy',
    category: 'politics',
    popularity: 87,
    relatedTopics: ['carbon tax', 'green energy', 'climate protests', 'oil companies'],
    summary: 'Debates surrounding government actions to address climate change, including economic impacts and effectiveness of proposed measures.'
  },
  {
    id: 't3',
    topic: 'Viral Dance Challenge',
    category: 'entertainment',
    popularity: 95,
    relatedTopics: ['TikTok', 'trending audio', 'celebrity participation', 'dance tutorials'],
    summary: 'The latest dance trend sweeping social media platforms, often involving specific songs and choreography, engaging millions of users.'
  },
  {
    id: 't4',
    topic: 'Cryptocurrency Market Crash',
    category: 'finance',
    popularity: 89,
    relatedTopics: ['Bitcoin', 'market volatility', 'regulation', 'investor panic'],
    summary: 'Significant downturns in the value of cryptocurrencies, sparking discussions about market stability, investor protection, and regulation.'
  },
  {
    id: 't5',
    topic: 'Celebrity Relationship Drama',
    category: 'entertainment',
    popularity: 91,
    relatedTopics: ['breakup rumors', 'public statements', 'social media reactions', 'paparazzi photos'],
    summary: 'High-profile romantic entanglements and breakups among celebrities, often playing out publicly and generating widespread media attention.'
  }
];

// Main Component
const ContentAssistant = () => {
  // Script Generator State
  const [scriptPrompt, setScriptPrompt] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none'); // Changed initial state
  const [scriptTone, setScriptTone] = useState<string>('satirical');
  const [scriptLength, setScriptLength] = useState<number>(300);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptCreativity, setScriptCreativity] = useState<number>(70);
  
  // Voice-over State
  const [voiceText, setVoiceText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>('v1');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(100);
  const [voicePitch, setVoicePitch] = useState<number>(50);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  
  // Meme Generator State
  const [memeText, setMemeText] = useState('');
  const [selectedMeme, setSelectedMeme] = useState<string>('m1');
  const [memeStyle, setMemeStyle] = useState<string>('viral');
  const [generatedMemeCaption, setGeneratedMemeCaption] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [isGeneratingMeme, setIsGeneratingMeme] = useState(false);
  
  // Narrative Spinner State
  const [narrativeTopic, setNarrativeTopic] = useState('');
  const [perspectives, setPerspectives] = useState<string[]>([]);
  const [isGeneratingPerspectives, setIsGeneratingPerspectives] = useState(false);
  const [narrativeFormat, setNarrativeFormat] = useState<string>('balanced');
  
  // Content Templates State
  const [selectedContentTemplate, setSelectedContentTemplate] = useState<string>('ct1');
  const [customizedTemplate, setCustomizedTemplate] = useState<ContentTemplate | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // Topic Research State
  const [researchQuery, setResearchQuery] = useState('');
  const [researchResults, setResearchResults] = useState<TrendingTopic[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [researchDepth, setResearchDepth] = useState<number>(50); // 0-100 for "depth"
  
  // Settings State
  const [openAIKey, setOpenAIKey] = useState('');
  const [showAPISettings, setShowAPISettings] = useState(false);
  const [defaultModel, setDefaultModel] = useState<string>('gpt-4');
  const [saveHistory, setSaveHistory] = useState(true);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const currentTemplate = contentTemplates.find(t => t.id === selectedContentTemplate);
    if (currentTemplate && !isCustomizing) {
        setCustomizedTemplate(null); // Reset customized if not in customizing mode
    }
  }, [selectedContentTemplate, isCustomizing]);
  
  // Handle Script Generation
  const generateScript = async () => {
    if (!scriptPrompt.trim()) return;
    
    setIsGeneratingScript(true);
    setGeneratedScript('');
    
    try {
      // In a real app, this would call the Tauri backend to interact with OpenAI
      // const response = await invoke('generate_script', { 
      //   prompt: scriptPrompt,
      //   template: selectedTemplate === 'none' ? '' : selectedTemplate, // Pass empty if "none"
      //   tone: scriptTone,
      //   length: scriptLength,
      //   creativity: scriptCreativity
      // });
      
      setTimeout(() => {
        const template = scriptTemplates.find(t => t.id === selectedTemplate);
        let baseTemplate = template ? template.template : '';
        
        if (!baseTemplate) { // This handles selectedTemplate === "none" or if template not found
          baseTemplate = "Let's talk about [TOPIC]. This is a fascinating subject that deserves our attention...";
        }
        
        let generatedContent = baseTemplate
          .replace(/\[POLITICAL_FIGURE\]/g, 'the President')
          .replace(/\[RIDICULOUS_CLAIM\]/g, 'social media is a reliable news source')
          .replace(/\[EVENT_1\]/g, 'a viral tweet')
          .replace(/\[UNEXPECTED_OUTCOME\]/g, 'a nationwide debate')
          .replace(/\[PRODUCT_NAME\]/g, 'the latest smartphone')
          .replace(/\[COMPANY\]/g, 'a major tech company')
          .replace(/\[FEATURE_1\]/g, 'advanced AI capabilities')
          .replace(/\[FEATURE_2\]/g, 'all-day battery life')
          .replace(/\[ACTIVITY\]/g, 'communicate')
          .replace(/\[TRENDING_TOPIC\]/g, scriptPrompt)
          .replace(/\[CELEBRITY_1\]/g, 'a famous actor')
          .replace(/\[CELEBRITY_2\]/g, 'a popular musician')
          .replace(/\[CONSPIRACY_THEORY\]/g, 'a wild internet theory')
          .replace(/\[FAULTY_REASONING\]/g, 'some questionable logic')
          .replace(/\[CONTROVERSY\]/g, scriptPrompt)
          .replace(/\[PERSON\/BRAND\]/g, 'a verified account')
          .replace(/\[CONTENT\]/g, 'something controversial')
          .replace(/\[REACTION\]/g, 'immediate backlash')
          .replace(/\[CELEBRITY\]/g, 'Hollywood stars')
          .replace(/\[INFLUENCER\]/g, 'social media personalities')
          .replace(/\[TOPIC\]/g, scriptPrompt);
        
        if (scriptLength > 300) {
          generatedContent += "\n\nBut there's more to this story. When we look deeper, we find that public opinion is divided. Some argue that this represents a fundamental shift in our culture, while others see it as just another fleeting moment in the never-ending news cycle.\n\nWhat makes this particularly interesting is how it reflects broader societal trends. The way we consume and react to information has changed dramatically in recent years, and this situation perfectly illustrates that transformation.";
        }
        
        if (scriptLength > 500) {
          generatedContent += "\n\nHistorically speaking, we've seen similar patterns emerge in the past. Remember when [SIMILAR_EVENT] happened back in 2020? The parallels are striking, though the context has evolved significantly since then.\n\nExperts in the field have weighed in with varying perspectives. Dr. Jane Smith from the Institute of Media Studies suggests that 'this represents a fundamental shift in how information spreads in the digital age,' while Professor Robert Johnson counters that 'we're seeing the same sociological patterns, just accelerated by technology.'\n\nUltimately, what we can learn from this situation is that the intersection of media, technology, and human behavior continues to create fascinating and unpredictable outcomes. As we move forward, it's worth considering how these dynamics will continue to shape our shared experiences and conversations.";
        }
        
        if (scriptTone === 'satirical') {
          generatedContent = "Oh boy, here we go again! " + generatedContent.replace('Let\'s talk about', 'Buckle up folks, because we need to talk about');
          generatedContent = generatedContent.replace('This is a fascinating subject', 'This absolutely ridiculous situation');
        } else if (scriptTone === 'professional') {
          generatedContent = "In this analysis, we examine " + generatedContent.replace('Let\'s talk about', 'We will explore the implications of');
          generatedContent = generatedContent.replace('This is a fascinating subject', 'This significant development');
        } else if (scriptTone === 'comedic') {
          generatedContent = "Well, well, well... what do we have here? " + generatedContent.replace('Let\'s talk about', 'Let me tell you about the absolute circus that is');
          generatedContent = generatedContent.replace('This is a fascinating subject', 'This complete dumpster fire of a situation');
        }
        
        setGeneratedScript(generatedContent);
        setIsGeneratingScript(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to generate script:', error);
      setGeneratedScript('Error generating script. Please try again.');
      setIsGeneratingScript(false);
    }
  };
  
  const generateVoice = async () => {
    if (!voiceText.trim()) return;
    
    setIsGeneratingVoice(true);
    setGeneratedAudioUrl(null);
    
    try {
      setTimeout(() => {
        const selectedVoicePreview = voiceOptions.find(v => v.id === selectedVoice)?.preview || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        setGeneratedAudioUrl(selectedVoicePreview);
        setIsGeneratingVoice(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to generate voice:', error);
      setIsGeneratingVoice(false);
    }
  };
  
  const togglePlayback = () => {
    if (!audioRef.current || !generatedAudioUrl) return;
    
    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioSeek = (value: number[]) => {
    if (audioRef.current && audioDuration > 0) {
      const seekTime = (value[0] / 100) * audioDuration;
      audioRef.current.currentTime = seekTime;
      setAudioCurrentTime(seekTime);
    }
  };

  const formatAudioTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const toggleAudioMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isAudioMuted;
    setIsAudioMuted(!isAudioMuted);
  };
  
  const generateMemeCaption = async () => {
    if (!memeText.trim()) return;
    
    setIsGeneratingMeme(true);
    setGeneratedMemeCaption('');
    setGeneratedHashtags([]);
    
    try {
      setTimeout(() => {
        const memeTemplate = memeTemplates.find(m => m.id === selectedMeme);
        let caption = '';
        
        if (memeStyle === 'viral') {
          caption = `When ${memeText.includes('when') ? memeText.substring(memeText.indexOf('when') + 5) : memeText}`;
        } else if (memeStyle === 'sarcastic') {
          caption = `Yeah, because ${memeText.includes('because') ? memeText.substring(memeText.indexOf('because') + 8) : memeText} is TOTALLY a great idea`;
        } else {
          caption = `Nobody:\nAbsolutely nobody:\nMe: ${memeText}`;
        }
        
        const hashtags = [
          '#viral',
          '#trending',
          '#memes',
          memeTemplate ? `#${memeTemplate.name.replace(/\s+/g, '')}` : '#meme',
          `#${memeText.split(' ').slice(0, 2).join('').replace(/[^\w\s]/gi, '')}`
        ];
        
        setGeneratedMemeCaption(caption);
        setGeneratedHashtags(hashtags);
        setIsGeneratingMeme(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to generate meme caption:', error);
      setIsGeneratingMeme(false);
    }
  };
  
  const generatePerspectives = async () => {
    if (!narrativeTopic.trim()) return;
    
    setIsGeneratingPerspectives(true);
    setPerspectives([]);
    
    try {
      setTimeout(() => {
        let generatedPerspectives: string[] = [];
        
        if (narrativeFormat === 'balanced') {
          generatedPerspectives = [
            `**Perspective 1:** ${narrativeTopic} represents a positive development because it could lead to innovation and progress in several key areas. Proponents argue that embracing this approach would benefit society by creating new opportunities and solving existing problems.`,
            
            `**Perspective 2:** Critics of ${narrativeTopic} raise valid concerns about potential negative consequences, including ethical dilemmas and unintended side effects. They advocate for a more cautious approach that considers long-term implications.`,
            
            `**Perspective 3:** A middle-ground view suggests that ${narrativeTopic} offers both benefits and risks that must be carefully weighed. This nuanced approach recognizes the complexity of the issue and calls for thoughtful regulation rather than all-or-nothing positions.`
          ];
        } else if (narrativeFormat === 'controversial') {
          generatedPerspectives = [
            `**The Enthusiast View:** ${narrativeTopic} is absolutely revolutionary and anyone who disagrees is simply afraid of change! The potential benefits are so enormous that any risks are worth taking. We must move forward aggressively or be left behind.`,
            
            `**The Alarmist View:** ${narrativeTopic} represents an existential threat that could lead to disaster if not stopped immediately. The risks are being deliberately downplayed by those with financial interests, and society is sleepwalking into a crisis.`,
            
            `**The Conspiracy Angle:** What the mainstream media isn't telling you about ${narrativeTopic} is that it's actually a cover for a larger agenda. Connect the dots and you'll see that powerful interests are using this issue to distract from what's really happening.`,
            
            `**The Academic Perspective:** The discourse surrounding ${narrativeTopic} has become overly simplified in public debate. Historical and sociological contexts reveal a more complex picture that defies the binary positions typically presented in media coverage.`
          ];
        } else { // multidimensional
          generatedPerspectives = [
            `**Political Perspective:** ${narrativeTopic} has become a partisan issue, with conservatives generally arguing that it threatens traditional values and economic stability, while progressives tend to view it as necessary for addressing systemic problems and creating a more equitable future.`,
            
            `**Economic Lens:** From a market perspective, ${narrativeTopic} presents both opportunities and challenges. Investors see potential for growth in related sectors, while economists debate whether it will create or destroy jobs in the long run.`,
            
            `**Social Impact:** Communities affected by ${narrativeTopic} have reported mixed experiences. Some demographic groups have benefited significantly, while others feel increasingly marginalized or left behind by these developments.`,
            
            `**Global Context:** Internationally, approaches to ${narrativeTopic} vary widely. Countries like Sweden have embraced it with positive outcomes, while experiences in Brazil show potential pitfalls. These international case studies provide valuable insights for policy development.`
          ];
        }
        
        setPerspectives(generatedPerspectives);
        setIsGeneratingPerspectives(false);
      }, 2500);
    } catch (error) {
      console.error('Failed to generate perspectives:', error);
      setIsGeneratingPerspectives(false);
    }
  };
  
  const startCustomizing = () => {
    const template = contentTemplates.find(t => t.id === selectedContentTemplate);
    if (template) {
      setCustomizedTemplate({ ...template });
      setIsCustomizing(true);
    }
  };

  const saveCustomizedTemplate = () => {
    if (customizedTemplate) {
      // In a real app, save this to backend or local storage
      console.log("Saving customized template:", customizedTemplate);
      alert("Template saved (simulated)!");
      setIsCustomizing(false);
      // Optionally, update the main contentTemplates list or add to a user's custom list
    }
  };
  
  const researchTopics = async () => {
    if (!researchQuery.trim()) return;
    
    setIsResearching(true);
    setResearchResults([]);
    
    try {
      setTimeout(() => {
        const results = trendingTopics.filter(topic => 
          topic.topic.toLowerCase().includes(researchQuery.toLowerCase()) ||
          topic.category.toLowerCase().includes(researchQuery.toLowerCase()) ||
          topic.relatedTopics.some(rt => rt.toLowerCase().includes(researchQuery.toLowerCase()))
        ).map(topic => ({
          ...topic,
          popularity: Math.max(10, Math.min(100, topic.popularity + (Math.random() * researchDepth / 5) - (researchDepth / 10))) // Adjust popularity based on depth
        }));
        
        const finalResults = results.length > 0 ? results : [
          {
            ...trendingTopics[0],
            topic: `${trendingTopics[0].topic} (Related to "${researchQuery}")`,
            popularity: Math.max(10, Math.min(100, trendingTopics[0].popularity + (Math.random() * researchDepth / 5) - (researchDepth / 10)))
          },
          {
            ...trendingTopics[2],
            topic: `${trendingTopics[2].topic} (Connected to "${researchQuery}")`,
            popularity: Math.max(10, Math.min(100, trendingTopics[2].popularity + (Math.random() * researchDepth / 5) - (researchDepth / 10)))
          }
        ].slice(0, Math.max(1, Math.floor(researchDepth / 20))); // Limit results based on depth
        
        setResearchResults(finalResults.sort((a,b) => b.popularity - a.popularity));
        setIsResearching(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to research topics:', error);
      setIsResearching(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optionally show a success message
      console.log("Copied to clipboard:", text);
    }).catch(err => {
      console.error("Failed to copy to clipboard:", err);
    });
  };
  
  const exportScript = (text: string, format: 'txt' | 'docx' = 'txt') => {
    console.log(`Exporting script as ${format}:`, text);
    alert(`Script would be exported as ${format} file in a real app.`);
  };
  
  const getSelectedTemplate = () => scriptTemplates.find(t => t.id === selectedTemplate);
  const getSelectedVoice = () => voiceOptions.find(v => v.id === selectedVoice);
  const getSelectedMeme = () => memeTemplates.find(m => m.id === selectedMeme);
  const getCurrentContentTemplate = () => contentTemplates.find(t => t.id === selectedContentTemplate);
  
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Content Assistant</h1>
      
      <Tabs defaultValue="titles" className="space-y-4 sm:space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2 h-auto">
          <TabsTrigger value="titles" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            <span className="hidden sm:inline">Title</span>
            <span className="sm:hidden">Titles</span>
          </TabsTrigger>
          <TabsTrigger value="descriptions" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            <span className="hidden sm:inline">Description</span>
            <span className="sm:hidden">Desc</span>
          </TabsTrigger>
          <TabsTrigger value="hashtags" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            <span className="hidden sm:inline">Hashtags</span>
            <span className="sm:hidden">Tags</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Voice</TabsTrigger>
          <TabsTrigger value="variations" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            <span className="hidden sm:inline">Variations</span>
            <span className="sm:hidden">Vars</span>
          </TabsTrigger>
          <TabsTrigger value="research" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            <span className="hidden sm:inline">Research</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Script Generator Tab */}
        <TabsContent value="script">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Input */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Script Generator</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setShowAPISettings(!showAPISettings)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>AI Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                  <CardDescription>
                    Generate professional scripts for your videos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="scriptPrompt">What's your video about?</Label>
                      <Textarea
                        id="scriptPrompt"
                        placeholder="Enter a topic or prompt for your script..."
                        value={scriptPrompt}
                        onChange={(e) => setScriptPrompt(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="scriptTemplate">Script Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger id="scriptTemplate">
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Template</SelectItem>
                          {scriptTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {getSelectedTemplate() && (
                        <p className="text-sm text-gray-500 mt-1">
                          {getSelectedTemplate()?.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="scriptTone">Tone</Label>
                      <Select value={scriptTone} onValueChange={setScriptTone}>
                        <SelectTrigger id="scriptTone">
                          <SelectValue placeholder="Select a tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="satirical">Satirical</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="comedic">Comedic</SelectItem>
                          <SelectItem value="dramatic">Dramatic</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="scriptLength">Length (words)</Label>
                        <span className="text-sm text-gray-500">
                          {scriptLength < 300 ? 'Short' : scriptLength < 500 ? 'Medium' : 'Long'}
                        </span>
                      </div>
                      <Slider
                        id="scriptLength"
                        min={100}
                        max={800}
                        step={50}
                        value={[scriptLength]}
                        onValueChange={(value) => setScriptLength(value[0])}
                      />
                    </div>
                    
                    {showAPISettings && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-sm">Advanced Settings</h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="creativity">Creativity</Label>
                            <span className="text-sm text-gray-500">
                              {scriptCreativity < 30 ? 'Conservative' : scriptCreativity < 70 ? 'Balanced' : 'Creative'}
                            </span>
                          </div>
                          <Slider
                            id="creativity"
                            min={0}
                            max={100}
                            step={5}
                            value={[scriptCreativity]}
                            onValueChange={(value) => setScriptCreativity(value[0])}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="apiKey">OpenAI API Key</Label>
                          <Input
                            id="apiKey"
                            type="password"
                            placeholder="sk-..."
                            value={openAIKey}
                            onChange={(e) => setOpenAIKey(e.target.value)}
                          />
                          <p className="text-xs text-gray-500">
                            Your API key is stored locally and never sent to our servers
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="model">AI Model</Label>
                          <Select value={defaultModel} onValueChange={setDefaultModel}>
                            <SelectTrigger id="model">
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="saveHistory"
                            checked={saveHistory}
                            onCheckedChange={setSaveHistory}
                          />
                          <Label htmlFor="saveHistory">Save generation history</Label>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={generateScript} 
                    disabled={isGeneratingScript || !scriptPrompt.trim()}
                  >
                    {isGeneratingScript ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Script
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Right Column - Output */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Generated Script</CardTitle>
                  <CardDescription>
                    Your AI-generated script will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isGeneratingScript ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-gray-500">Crafting your script with AI magic...</p>
                      <Progress value={Math.random() * 100} className="w-64" />
                    </div>
                  ) : generatedScript ? (
                    <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                      <div className="whitespace-pre-line text-sm">
                        {generatedScript}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                      <FileText className="h-16 w-16 text-gray-200" />
                      <div>
                        <p className="text-lg font-medium">No Script Generated Yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Fill in the details and click "Generate Script" to create content
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                {generatedScript && (
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => copyToClipboard(generatedScript)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" onClick={() => exportScript(generatedScript, 'txt')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setGeneratedScript('')}>
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={generateScript}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Voice-over Tab */}
        <TabsContent value="voice">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Input */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Voice-over Synthesis</CardTitle>
                  <CardDescription>
                    Convert text to natural-sounding speech
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="voiceText">Text to Convert</Label>
                      <Textarea
                        id="voiceText"
                        placeholder="Enter the text you want to convert to speech..."
                        value={voiceText}
                        onChange={(e) => setVoiceText(e.target.value)}
                        className="min-h-[150px]"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{voiceText.length} characters</span>
                        <span>Max 1000 characters</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="voiceSelect">Voice</Label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger id="voiceSelect">
                          <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {voiceOptions.map(voice => (
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name} ({voice.gender}, {voice.accent}) {voice.category === 'premium' && '(Premium)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="voiceSpeed">Speed</Label>
                          <span className="text-sm text-gray-500">{voiceSpeed}%</span>
                        </div>
                        <Slider
                          id="voiceSpeed"
                          min={50}
                          max={200}
                          step={5}
                          value={[voiceSpeed]}
                          onValueChange={(value) => setVoiceSpeed(value[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="voicePitch">Pitch</Label>
                          <span className="text-sm text-gray-500">
                            {voicePitch < 40 ? 'Lower' : voicePitch > 60 ? 'Higher' : 'Natural'}
                          </span>
                        </div>
                        <Slider
                          id="voicePitch"
                          min={0}
                          max={100}
                          step={5}
                          value={[voicePitch]}
                          onValueChange={(value) => setVoicePitch(value[0])}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={generateVoice} 
                    disabled={isGeneratingVoice || !voiceText.trim() || voiceText.length > 1000}
                  >
                    {isGeneratingVoice ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Generate Voice
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Right Column - Output */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Audio Preview</CardTitle>
                  <CardDescription>
                    Listen to your generated voice-over
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isGeneratingVoice ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-gray-500">Synthesizing voice...</p>
                      <Progress value={Math.random() * 100} className="w-64" />
                    </div>
                  ) : generatedAudioUrl ? (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-lg border">
                        <div className="flex items-center justify-between text-black">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={togglePlayback}
                          >
                            {isPlayingAudio ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5" />
                            )}
                          </Button>
                          
                          <div className="flex-1 mx-4">
                            <Slider
                              value={[audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0]}
                              max={100}
                              step={0.1}
                              onValueChange={handleAudioSeek}
                              className="cursor-pointer"
                            />
                            <div className="flex justify-between text-xs mt-1 text-gray-500">
                              <span>{formatAudioTime(audioCurrentTime)}</span>
                              <span>{formatAudioTime(audioDuration)}</span>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleAudioMute}
                          >
                            {isAudioMuted ? (
                              <VolumeX className="h-5 w-5" />
                            ) : (
                              <Volume2 className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                        
                        <audio
                          ref={audioRef}
                          src={generatedAudioUrl}
                          className="hidden"
                          onTimeUpdate={handleAudioTimeUpdate}
                          onLoadedMetadata={handleAudioTimeUpdate}
                          onEnded={() => setIsPlayingAudio(false)}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Voice Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="font-medium">Voice</p>
                            <p className="text-gray-600">
                              {getSelectedVoice()?.name} ({getSelectedVoice()?.gender}, {getSelectedVoice()?.accent})
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Duration</p>
                            <p className="text-gray-600">
                              {audioDuration > 0 ? formatAudioTime(audioDuration) : 'N/A'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Speed</p>
                            <p className="text-gray-600">{voiceSpeed}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Pitch</p>
                            <p className="text-gray-600">
                              {voicePitch < 40 ? 'Lower' : voicePitch > 60 ? 'Higher' : 'Natural'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                      <Mic className="h-16 w-16 text-gray-200" />
                      <div>
                        <p className="text-lg font-medium">No Audio Generated Yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Enter text and click "Generate Voice" to create audio
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                {generatedAudioUrl && (
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => window.open(generatedAudioUrl, '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download MP3
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setGeneratedAudioUrl(null);
                      setIsPlayingAudio(false);
                      setAudioCurrentTime(0);
                      setAudioDuration(0);
                    }}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Meme Caption Generator Tab */}
        <TabsContent value="meme">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Input */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Meme Caption Generator</CardTitle>
                  <CardDescription>
                    Create viral-worthy captions for your memes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="memeText">What's your meme about?</Label>
                      <Textarea
                        id="memeText"
                        placeholder="Describe what you want your meme to be about..."
                        value={memeText}
                        onChange={(e) => setMemeText(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="memeTemplate">Meme Template</Label>
                      <Select value={selectedMeme} onValueChange={setSelectedMeme}>
                        <SelectTrigger id="memeTemplate">
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {memeTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="memeStyle">Caption Style</Label>
                      <RadioGroup id="memeStyle" value={memeStyle} onValueChange={setMemeStyle} className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="viral" id="viral" />
                          <Label htmlFor="viral">Viral Format</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sarcastic" id="sarcastic" />
                          <Label htmlFor="sarcastic">Sarcastic</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nobody" id="nobody" />
                          <Label htmlFor="nobody">"Nobody:" Format</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {getSelectedMeme() && (
                      <div className="space-y-2">
                        <Label>Selected Template Preview</Label>
                        <div className="rounded-lg overflow-hidden border">
                          <img
                            src={getSelectedMeme()?.imageUrl}
                            alt={getSelectedMeme()?.name}
                            className="w-full h-auto"
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          {getSelectedMeme()?.description}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={generateMemeCaption} 
                    disabled={isGeneratingMeme || !memeText.trim()}
                  >
                    {isGeneratingMeme ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate Caption
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Right Column - Output */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Generated Caption & Preview</CardTitle>
                  <CardDescription>
                    Your viral-worthy caption will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isGeneratingMeme ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-gray-500">Crafting viral caption...</p>
                    </div>
                  ) : generatedMemeCaption ? (
                    <ScrollArea className="h-[500px] pr-3">
                    <div className="space-y-8">
                      <div className="bg-gray-50 p-6 rounded-lg border">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Generated Caption</h3>
                          <div className="bg-white p-4 rounded border whitespace-pre-line text-sm">
                            {generatedMemeCaption}
                          </div>
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedMemeCaption)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Caption
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Suggested Hashtags</h3>
                        <div className="flex flex-wrap gap-2">
                          {generatedHashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(generatedHashtags.join(' '))}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Hashtags
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Meme Preview</h3>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="relative max-w-md mx-auto">
                            <img
                              src={getSelectedMeme()?.imageUrl}
                              alt={getSelectedMeme()?.name}
                              className="w-full h-auto rounded"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 text-center font-bold text-lg">
                              {generatedMemeCaption.split('\n')[0]}
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-gray-500">
                            <p className="font-medium">Full Caption + Hashtags:</p>
                            <p className="mt-1">{generatedMemeCaption}</p>
                            <p className="mt-2">{generatedHashtags.join(' ')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                      <MessageSquare className="h-16 w-16 text-gray-200" />
                      <div>
                        <p className="text-lg font-medium">No Caption Generated Yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Fill in the details and click "Generate Caption" to create content
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                {generatedMemeCaption && (
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => alert("Image export simulation!")}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as Image
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setGeneratedMemeCaption('');
                        setGeneratedHashtags([]);
                      }}>
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={generateMemeCaption}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Narrative Spinner Tab */}
        <TabsContent value="narrative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Input */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Narrative Spinner</CardTitle>
                  <CardDescription>
                    Generate different perspectives on controversial topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="narrativeTopic">Topic</Label>
                      <Textarea
                        id="narrativeTopic"
                        placeholder="Enter a controversial or complex topic..."
                        value={narrativeTopic}
                        onChange={(e) => setNarrativeTopic(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-gray-500">
                        Example: "Social media regulation", "AI in education", "Remote work policies"
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="narrativeFormat">Perspective Format</Label>
                      <Select value={narrativeFormat} onValueChange={setNarrativeFormat}>
                        <SelectTrigger id="narrativeFormat">
                          <SelectValue placeholder="Select a format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balanced">Balanced Perspectives</SelectItem>
                          <SelectItem value="controversial">Controversial Takes</SelectItem>
                          <SelectItem value="multidimensional">Multidimensional Analysis</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {narrativeFormat === 'balanced' 
                          ? 'Generates fair, reasonable perspectives from different viewpoints' 
                          : narrativeFormat === 'controversial' 
                            ? 'Generates more polarized, attention-grabbing perspectives' 
                            : 'Analyzes the topic through multiple lenses (political, economic, social, etc.)'}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={generatePerspectives} 
                    disabled={isGeneratingPerspectives || !narrativeTopic.trim()}
                  >
                    {isGeneratingPerspectives ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Shuffle className="mr-2 h-4 w-4" />
                        Generate Perspectives
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Right Column - Output */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Different Perspectives</CardTitle>
                  <CardDescription>
                    Multiple viewpoints on your topic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isGeneratingPerspectives ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-gray-500">Analyzing different viewpoints...</p>
                      <Progress value={Math.random() * 100} className="w-64" />
                    </div>
                  ) : perspectives.length > 0 ? (
                    <ScrollArea className="h-[500px] pr-3">
                      <Accordion type="single" collapsible className="w-full">
                        {perspectives.map((perspective, index) => (
                          <AccordionItem key={index} value={`perspective-${index}`}>
                            <AccordionTrigger className="text-left hover:no-underline">
                              {perspective.split('\n')[0].replace(/\*\*/g, '')}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="prose prose-sm max-w-none text-gray-700">
                                <div className="whitespace-pre-line">
                                  {perspective.split('\n').slice(1).join('\n')}
                                </div>
                                <div className="flex justify-end mt-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => copyToClipboard(perspective)}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Perspective
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                        <h3 className="text-sm font-medium mb-2">Usage Tips</h3>
                        <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
                          <li>Use these perspectives to create balanced content</li>
                          <li>Incorporate multiple viewpoints for credibility</li>
                          <li>Consider using the "controversial" format for engagement</li>
                          <li>Combine with the Script Generator for complete videos</li>
                        </ul>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                      <Shuffle className="h-16 w-16 text-gray-200" />
                      <div>
                        <p className="text-lg font-medium">No Perspectives Generated Yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Enter a topic and click "Generate Perspectives" to see different viewpoints
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                {perspectives.length > 0 && (
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => copyToClipboard(perspectives.join('\n\n'))}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setPerspectives([])}>
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={generatePerspectives}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Content Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Template List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Content Templates</CardTitle>
                  <CardDescription>
                    Pre-built templates for popular video formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[550px] pr-3">
                  <div className="space-y-4">
                    <Label>Select a Template</Label>
                    <RadioGroup value={selectedContentTemplate} onValueChange={(value) => {
                        setSelectedContentTemplate(value);
                        setIsCustomizing(false); // Exit customizing mode when selecting a new template
                        setCustomizedTemplate(null);
                    }}>
                      {contentTemplates.map((template) => (
                        <div 
                          key={template.id} 
                          className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                            selectedContentTemplate === template.id 
                              ? 'bg-primary/10 border-primary' 
                              : 'hover:bg-gray-100 border-transparent'
                          }`}
                          onClick={() => {
                            setSelectedContentTemplate(template.id);
                            setIsCustomizing(false);
                            setCustomizedTemplate(null);
                          }}
                        >
                          <RadioGroupItem value={template.id} id={template.id} className="mt-1 flex-shrink-0" />
                          <div className="flex-grow">
                            <Label htmlFor={template.id} className="text-base font-medium cursor-pointer">
                              {template.title}
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              {template.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {template.duration}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {template.complexity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={startCustomizing}
                    disabled={!selectedContentTemplate || isCustomizing}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    {isCustomizing ? "Already Customizing" : "Use & Customize Template"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Right Column - Template Details / Customization */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    {isCustomizing && customizedTemplate 
                      ? `Customizing: ${customizedTemplate.title}` 
                      : getCurrentContentTemplate()?.title || 'Template Details'}
                  </CardTitle>
                  <CardDescription>
                    {isCustomizing && customizedTemplate 
                      ? 'Modify this template to fit your needs' 
                      : getCurrentContentTemplate()?.description || 'View the selected template details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-3">
                  {isCustomizing && customizedTemplate ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="templateTitle">Title</Label>
                          <Input
                            id="templateTitle"
                            value={customizedTemplate.title}
                            onChange={(e) => setCustomizedTemplate({
                              ...customizedTemplate,
                              title: e.target.value
                            })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="templateDescription">Description</Label>
                          <Textarea
                            id="templateDescription"
                            value={customizedTemplate.description}
                            onChange={(e) => setCustomizedTemplate({
                              ...customizedTemplate,
                              description: e.target.value
                            })}
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="templateExample">Example</Label>
                          <Input
                            id="templateExample"
                            value={customizedTemplate.example}
                            onChange={(e) => setCustomizedTemplate({
                              ...customizedTemplate,
                              example: e.target.value
                            })}
                            placeholder="Example title for this template"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Steps</Label>
                          <div className="space-y-2">
                            {customizedTemplate.steps.map((step, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  value={step}
                                  onChange={(e) => {
                                    const newSteps = [...customizedTemplate.steps];
                                    newSteps[index] = e.target.value;
                                    setCustomizedTemplate({
                                      ...customizedTemplate,
                                      steps: newSteps
                                    });
                                  }}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    const newSteps = customizedTemplate.steps.filter((_, i) => i !== index);
                                    setCustomizedTemplate({
                                      ...customizedTemplate,
                                      steps: newSteps
                                    });
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setCustomizedTemplate({
                                  ...customizedTemplate,
                                  steps: [...customizedTemplate.steps, 'New step']
                                });
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Step
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Label htmlFor="templateComplexity">Complexity</Label>
                            <Select 
                                value={customizedTemplate.complexity}
                                onValueChange={(value: 'simple' | 'medium' | 'complex') => 
                                setCustomizedTemplate({
                                    ...customizedTemplate,
                                    complexity: value
                                })
                                }
                            >
                                <SelectTrigger id="templateComplexity">
                                <SelectValue placeholder="Select complexity" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="simple">Simple (Beginner)</SelectItem>
                                <SelectItem value="medium">Medium (Intermediate)</SelectItem>
                                <SelectItem value="complex">Complex (Advanced)</SelectItem>
                                </SelectContent>
                            </Select>
                            </div>
                            
                            <div className="space-y-2">
                            <Label htmlFor="templateDuration">Duration</Label>
                            <Input
                                id="templateDuration"
                                value={customizedTemplate.duration}
                                onChange={(e) => setCustomizedTemplate({
                                ...customizedTemplate,
                                duration: e.target.value
                                })}
                                placeholder="e.g. 2-5 minutes"
                            />
                            </div>
                        </div>
                      </div>
                    ) : getCurrentContentTemplate() ? (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">{getCurrentContentTemplate()?.title}</h3>
                          <p className="text-sm text-gray-600">{getCurrentContentTemplate()?.description}</p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <h4 className="font-medium">Example</h4>
                          <p className="text-sm text-gray-600 italic">"{getCurrentContentTemplate()?.example}"</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Steps</h4>
                          <ul className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                            {getCurrentContentTemplate()?.steps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-sm">Duration</h4>
                                <p className="text-sm text-gray-600">{getCurrentContentTemplate()?.duration}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">Complexity</h4>
                                <p className="text-sm text-gray-600 capitalize">{getCurrentContentTemplate()?.complexity}</p>
                            </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                        <Layers className="h-16 w-16 text-gray-200" />
                        <div>
                          <p className="text-lg font-medium">No Template Selected</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Select a template from the list to view its details or customize it
                          </p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
                {isCustomizing && customizedTemplate && (
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => {
                        setIsCustomizing(false);
                        setCustomizedTemplate(null);
                    }}>
                        Cancel
                    </Button>
                    <Button onClick={saveCustomizedTemplate}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Customized Template
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Topic Research Tab */}
        <TabsContent value="research">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Input */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Topic Research & Idea Generation</CardTitle>
                  <CardDescription>
                    Discover trending topics and get content ideas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="researchQuery">Research Query</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="researchQuery"
                          placeholder="Enter keywords, e.g., 'AI ethics', 'TikTok trends'"
                          value={researchQuery}
                          onChange={(e) => setResearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && researchTopics()}
                        />
                        <Button onClick={researchTopics} disabled={isResearching || !researchQuery.trim()} size="icon">
                          {isResearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="researchDepth">Research Depth</Label>
                        <span className="text-sm text-gray-500">
                          {researchDepth < 30 ? 'Quick Overview' : researchDepth < 70 ? 'Detailed' : 'Comprehensive'}
                        </span>
                      </div>
                      <Slider
                        id="researchDepth"
                        min={10} // Min depth
                        max={100} // Max depth
                        step={10}
                        value={[researchDepth]}
                        onValueChange={(value) => setResearchDepth(value[0])}
                      />
                       <p className="text-xs text-gray-500">
                        Adjusts the scope and detail of the research. Higher depth may take longer.
                      </p>
                    </div>

                    <Separator />
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Quick Search Popular Topics</h4>
                        <div className="flex flex-wrap gap-2">
                            {trendingTopics.slice(0,3).map(topic => (
                                <Button key={topic.id} variant="outline" size="sm" onClick={() => {
                                    setResearchQuery(topic.topic);
                                    researchTopics();
                                }}>
                                    {topic.topic}
                                </Button>
                            ))}
                        </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={researchTopics} 
                    disabled={isResearching || !researchQuery.trim()}
                  >
                    {isResearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Find Trending Topics
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Right Column - Output */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Research Results</CardTitle>
                  <CardDescription>
                    Trending topics and content ideas based on your query
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isResearching ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-gray-500">Searching for trending topics...</p>
                      <Progress value={Math.random() * 100} className="w-64" />
                    </div>
                  ) : researchResults.length > 0 ? (
                    <ScrollArea className="h-[500px] pr-3">
                      <div className="space-y-4">
                        {researchResults.map((result) => (
                          <Card key={result.id} className="shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-lg flex justify-between items-center">
                                <span>{result.topic}</span>
                                <Badge variant={result.popularity > 90 ? "default" : result.popularity > 75 ? "secondary" : "outline"}>
                                  {result.popularity > 90 ? <Flame className="h-3 w-3 mr-1.5" /> : <TrendingUp className="h-3 w-3 mr-1.5" />}
                                  Popularity: {result.popularity}%
                                </Badge>
                              </CardTitle>
                              <CardDescription>Category: <span className="capitalize">{result.category}</span></CardDescription>
                            </CardHeader>
                            <CardContent>
                              {result.summary && <p className="text-sm text-gray-600 mb-3">{result.summary}</p>}
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Related Topics:</h4>
                              <div className="flex flex-wrap gap-2">
                                {result.relatedTopics.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button size="sm" variant="ghost" onClick={() => {
                                    setScriptPrompt(`Create a video about: ${result.topic}, focusing on ${result.relatedTopics[0] || ''}`);
                                    // Optionally switch to script tab: document.querySelector('[data-state="inactive"][value="script"]')?.click();
                                }}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Use for Script
                                </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                      <Search className="h-16 w-16 text-gray-200" />
                      <div>
                        <p className="text-lg font-medium">No Topics Found Yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Enter a query and click "Find Trending Topics" to start your research
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                 {researchResults.length > 0 && (
                  <CardFooter className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => setResearchResults([])}>
                        <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default ContentAssistant;
