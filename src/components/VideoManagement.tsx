import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Tag, 
  Plus, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Edit,
  Trash,
  Image,
  Download
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { invoke } from '@tauri-apps/api/tauri';

// Types
interface Video {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  thumbnail: string;
  videoUrl: string;
  status: 'uploading' | 'processing' | 'ready' | 'published' | 'failed';
  uploadProgress?: number;
  brandElements: {
    logo: boolean;
    outro: boolean;
    watermark: boolean;
  };
  createdAt: string;
}

interface Tag {
  id: string;
  text: string;
}

// Mock Data
const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Top 10 Political Moments of 2025',
    description: 'A satirical look at the most absurd political moments of the year so far.',
    tags: ['politics', 'satire', 'trending'],
    category: 'satire',
    thumbnail: 'https://placehold.co/300x200/2563eb/ffffff?text=Political+Satire',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    status: 'ready',
    brandElements: {
      logo: true,
      outro: true,
      watermark: true
    },
    createdAt: '2025-05-20T14:48:00.000Z'
  },
  {
    id: '2',
    title: 'Celebrity Interview: Tech Billionaire',
    description: 'Exclusive interview with the controversial tech CEO about AI regulations.',
    tags: ['interview', 'tech', 'celebrity'],
    category: 'interviews',
    thumbnail: 'https://placehold.co/300x200/10b981/ffffff?text=Tech+Interview',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    status: 'published',
    brandElements: {
      logo: true,
      outro: true,
      watermark: true
    },
    createdAt: '2025-05-15T10:30:00.000Z'
  },
  {
    id: '3',
    title: 'Movie Trailer Breakdown',
    description: 'Analyzing the hidden details in the latest blockbuster trailer.',
    tags: ['movies', 'pop culture', 'analysis'],
    category: 'pop culture',
    thumbnail: 'https://placehold.co/300x200/f59e0b/ffffff?text=Movie+Analysis',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    status: 'processing',
    uploadProgress: 100,
    brandElements: {
      logo: true,
      outro: false,
      watermark: true
    },
    createdAt: '2025-05-28T08:15:00.000Z'
  },
  {
    id: '4',
    title: 'Social Media Drama Explained',
    description: 'Breaking down this week\'s viral social media controversy.',
    tags: ['social media', 'drama', 'viral'],
    category: 'pop culture',
    thumbnail: 'https://placehold.co/300x200/ec4899/ffffff?text=Social+Media',
    videoUrl: '',
    status: 'uploading',
    uploadProgress: 45,
    brandElements: {
      logo: true,
      outro: true,
      watermark: true
    },
    createdAt: '2025-05-29T16:20:00.000Z'
  }
];

const categoryOptions = [
  { value: 'satire', label: 'Satire' },
  { value: 'pop culture', label: 'Pop Culture' },
  { value: 'interviews', label: 'Interviews' },
  { value: 'news', label: 'News Analysis' },
  { value: 'explainer', label: 'Explainer' },
  { value: 'reaction', label: 'Reaction' }
];

const suggestedTags = [
  'politics', 'celebrity', 'viral', 'trending', 'tech', 'movies', 'tv shows', 
  'music', 'social media', 'controversy', 'analysis', 'reaction', 'interview',
  'satire', 'comedy', 'drama', 'news', 'explainer', 'breakdown', 'review'
];

// Main Component
const VideoManagement = () => {
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{title: string, description: string} | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with first video if available
  useEffect(() => {
    if (videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
      
      // Initialize tags from selected video
      if (videos[0].tags) {
        setTags(videos[0].tags.map((tag, index) => ({
          id: index.toString(),
          text: tag
        })));
      }
    }
  }, [videos]);
  
  // Update video player when selected video changes
  useEffect(() => {
    if (selectedVideo && videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Initialize tags from selected video
      if (selectedVideo.tags) {
        setTags(selectedVideo.tags.map((tag, index) => ({
          id: index.toString(),
          text: tag
        })));
      }
    }
  }, [selectedVideo]);
  
  // Handle video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };
  
  // Handle video play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
    setIsMuted(newVolume === 0);
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume / 100;
      } else {
        videoRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };
  
  // Handle timeline scrubbing
  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = (seekTime / 100) * duration;
      setCurrentTime((seekTime / 100) * duration);
    }
  };
  
  // Format time for display (mm:ss)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle tag input
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTag(e.target.value);
  };
  
  // Add a new tag
  const addTag = (text: string) => {
    if (text.trim() !== '' && !tags.find(tag => tag.text.toLowerCase() === text.toLowerCase())) {
      const newTag = {
        id: Date.now().toString(),
        text: text.trim()
      };
      setTags([...tags, newTag]);
      setInputTag('');
      
      // Update selected video tags
      if (selectedVideo) {
        const updatedVideo = {
          ...selectedVideo,
          tags: [...tags.map(tag => tag.text), text.trim()]
        };
        setSelectedVideo(updatedVideo);
        
        // Update in videos array
        setVideos(videos.map(video => 
          video.id === selectedVideo.id ? updatedVideo : video
        ));
      }
    }
  };
  
  // Remove a tag
  const removeTag = (id: string) => {
    const filteredTags = tags.filter(tag => tag.id !== id);
    setTags(filteredTags);
    
    // Update selected video tags
    if (selectedVideo) {
      const updatedVideo = {
        ...selectedVideo,
        tags: filteredTags.map(tag => tag.text)
      };
      setSelectedVideo(updatedVideo);
      
      // Update in videos array
      setVideos(videos.map(video => 
        video.id === selectedVideo.id ? updatedVideo : video
      ));
    }
  };
  
  // Handle key press in tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputTag);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file upload
  const handleUpload = (file: File) => {
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create a new video object
    const newVideo: Video = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      description: '',
      tags: [],
      category: '',
      thumbnail: `https://placehold.co/300x200/6d28d9/ffffff?text=${encodeURIComponent(file.name)}`,
      videoUrl: URL.createObjectURL(file),
      status: 'uploading',
      uploadProgress: 0,
      brandElements: {
        logo: true,
        outro: true,
        watermark: true
      },
      createdAt: new Date().toISOString()
    };
    
    // Add to videos array
    setVideos([newVideo, ...videos]);
    setSelectedVideo(newVideo);
    setTags([]);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        
        // Update video upload progress
        setVideos(prevVideos => 
          prevVideos.map(video => 
            video.id === newVideo.id 
              ? { ...video, uploadProgress: newProgress } 
              : video
          )
        );
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Set status to processing after upload completes
          setTimeout(() => {
            setVideos(prevVideos => 
              prevVideos.map(video => 
                video.id === newVideo.id 
                  ? { ...video, status: 'processing', uploadProgress: 100 } 
                  : video
              )
            );
            
            // Set status to ready after processing
            setTimeout(() => {
              setVideos(prevVideos => 
                prevVideos.map(video => 
                  video.id === newVideo.id 
                    ? { ...video, status: 'ready' } 
                    : video
                )
              );
              setIsUploading(false);
            }, 3000);
          }, 1000);
          
          return 100;
        }
        
        return newProgress;
      });
    }, 300);
  };
  
  // Handle metadata changes
  const handleMetadataChange = (field: string, value: string | boolean) => {
    if (!selectedVideo) return;
    
    const updatedVideo = { ...selectedVideo, [field]: value };
    setSelectedVideo(updatedVideo);
    
    // Update in videos array
    setVideos(videos.map(video => 
      video.id === selectedVideo.id ? updatedVideo : video
    ));
  };
  
  // Handle brand element toggle
  const handleBrandElementToggle = (element: 'logo' | 'outro' | 'watermark') => {
    if (!selectedVideo) return;
    
    const updatedBrandElements = {
      ...selectedVideo.brandElements,
      [element]: !selectedVideo.brandElements[element]
    };
    
    const updatedVideo = {
      ...selectedVideo,
      brandElements: updatedBrandElements
    };
    
    setSelectedVideo(updatedVideo);
    
    // Update in videos array
    setVideos(videos.map(video => 
      video.id === selectedVideo.id ? updatedVideo : video
    ));
  };
  
  // Generate AI suggestions
  const generateAISuggestions = async () => {
    if (!selectedVideo) return;
    
    setIsGeneratingAI(true);
    
    try {
      // In a real app, this would call the Tauri backend
      // const response = await invoke('generate_ai_suggestions', { 
      //   videoId: selectedVideo.id,
      //   currentTitle: selectedVideo.title,
      //   currentDescription: selectedVideo.description,
      //   tags: selectedVideo.tags
      // });
      
      // For demo, simulate API call with timeout
      setTimeout(() => {
        const suggestions = {
          title: `BAM: ${selectedVideo.category === 'satire' 
            ? 'Hilarious Take on ' 
            : selectedVideo.category === 'interviews' 
              ? 'Exclusive Interview: ' 
              : 'Breaking Down '}${selectedVideo.title}`,
          description: `${selectedVideo.description}\n\nThis ${selectedVideo.category} video explores the trending topics of today with BAM's signature style. Don't forget to like and subscribe for more content!`
        };
        
        setAiSuggestions(suggestions);
        setIsGeneratingAI(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      setIsGeneratingAI(false);
    }
  };
  
  // Apply AI suggestion
  const applyAISuggestion = (field: 'title' | 'description') => {
    if (!selectedVideo || !aiSuggestions) return;
    
    const updatedVideo = {
      ...selectedVideo,
      [field]: aiSuggestions[field]
    };
    
    setSelectedVideo(updatedVideo);
    
    // Update in videos array
    setVideos(videos.map(video => 
      video.id === selectedVideo.id ? updatedVideo : video
    ));
  };
  
  // Get status badge
  const getStatusBadge = (status: Video['status']) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Uploading</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'ready':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Ready</Badge>;
      case 'published':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Published</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return null;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: Video['status']) => {
    switch (status) {
      case 'uploading':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'published':
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Video Management</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Video List */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl flex items-center justify-between">
                <span className="flex items-center">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary flex-shrink-0" />
                  <span className="truncate">Video Library</span>
                </span>
                <Button 
                  onClick={handleUpload} 
                  size="sm" 
                  className="ml-2 flex-shrink-0 px-2 sm:px-3"
                  disabled={isUploading}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
              />
              
              {/* Drag & Drop Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Drag and drop video files here, or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports MP4, MOV, AVI, WebM (max 500MB)
                </p>
                <div className="mt-3 p-2 bg-gray-50 rounded-md border">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant={selectedAspectRatio === '9:16' ? 'default' : 'outline'} className="text-sm" style={{ backgroundColor: selectedAspectRatio === '16:9' ? '#1F31C7' : undefined, color: selectedAspectRatio === '16:9' ? '#FFFFFF' : undefined }}>
                      {selectedAspectRatio} {selectedAspectRatio === '9:16' ? '(Vertical)' : '(Horizontal)'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Optimized for {selectedAspectRatio === '9:16' ? 'TikTok, Reels' : 'YouTube, Facebook'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Video List */}
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div 
                      key={video.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedVideo?.id === video.id 
                          ? 'bg-primary/10' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="relative h-20 w-32 flex-shrink-0 rounded-md overflow-hidden">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="h-full w-full object-cover"
                        />
                        {(video.status === 'uploading' || video.status === 'processing') && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Progress 
                              value={video.uploadProgress} 
                              className="w-4/5 h-2"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm truncate pr-2">{video.title}</h4>
                          <div className="flex-shrink-0">
                            {getStatusIcon(video.status)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2">
                          {getStatusBadge(video.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Video Editor */}
        <div className="xl:col-span-2">
          {selectedVideo ? (
            <Tabs defaultValue="preview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
              </TabsList>
              
              {/* Preview Tab */}
              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Preview</CardTitle>
                    <CardDescription>
                      Preview how your video will appear to viewers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedVideo.status === 'uploading' ? (
                      <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">Uploading Video...</h3>
                        <Progress value={selectedVideo.uploadProgress} className="mb-4" />
                        <p className="text-sm text-gray-500">
                          {selectedVideo.uploadProgress?.toFixed(0)}% complete
                        </p>
                      </div>
                    ) : selectedVideo.status === 'processing' ? (
                      <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-500 animate-pulse" />
                        <h3 className="text-lg font-medium mb-2">Processing Video...</h3>
                        <p className="text-sm text-gray-500">
                          This may take a few minutes
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                          <video
                            ref={videoRef}
                            className="w-full h-full"
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onLoadedMetadata={handleTimeUpdate}
                          >
                            <source src={selectedVideo.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          
                          {/* Video Controls */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <div className="flex items-center justify-between text-white">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20"
                                onClick={togglePlay}
                              >
                                {isPlaying ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </Button>
                              
                              <div className="flex-1 mx-4">
                                <Slider
                                  value={[currentTime ? (currentTime / duration) * 100 : 0]}
                                  max={100}
                                  step={0.1}
                                  onValueChange={handleSeek}
                                  className="cursor-pointer"
                                />
                                <div className="flex justify-between text-xs mt-1">
                                  <span>{formatTime(currentTime)}</span>
                                  <span>{formatTime(duration)}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-white hover:bg-white/20"
                                  onClick={toggleMute}
                                >
                                  {isMuted ? (
                                    <VolumeX className="h-5 w-5" />
                                  ) : (
                                    <Volume2 className="h-5 w-5" />
                                  )}
                                </Button>
                                
                                <div className="w-20">
                                  <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={100}
                                    step={1}
                                    onValueChange={handleVolumeChange}
                                    className="cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">{selectedVideo.title}</h3>
                          <p className="text-sm text-gray-600">{selectedVideo.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            {selectedVideo.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Metadata Tab */}
              <TabsContent value="metadata">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Video Metadata</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={generateAISuggestions}
                        disabled={isGeneratingAI || selectedVideo.status === 'uploading' || selectedVideo.status === 'processing'}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGeneratingAI ? 'Generating...' : 'AI Suggestions'}
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Edit title, description, tags, and category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={selectedVideo.title}
                          onChange={(e) => handleMetadataChange('title', e.target.value)}
                          placeholder="Enter video title"
                          disabled={selectedVideo.status === 'uploading'}
                        />
                        {aiSuggestions?.title && (
                          <div className="flex items-center mt-2 p-2 bg-primary/5 rounded-md">
                            <p className="text-sm flex-1">
                              <span className="font-medium">AI Suggestion:</span> {aiSuggestions.title}
                            </p>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => applyAISuggestion('title')}
                            >
                              Apply
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={selectedVideo.description}
                          onChange={(e) => handleMetadataChange('description', e.target.value)}
                          placeholder="Enter video description"
                          rows={4}
                          disabled={selectedVideo.status === 'uploading'}
                        />
                        {aiSuggestions?.description && (
                          <div className="flex items-start mt-2 p-2 bg-primary/5 rounded-md">
                            <p className="text-sm flex-1">
                              <span className="font-medium">AI Suggestion:</span> {aiSuggestions.description}
                            </p>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => applyAISuggestion('description')}
                              className="mt-1"
                            >
                              Apply
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Category */}
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={selectedVideo.category}
                          onValueChange={(value) => handleMetadataChange('category', value)}
                          disabled={selectedVideo.status === 'uploading'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Video Aspect Ratio */}
                      <div className="space-y-2">
                        <Label htmlFor="aspect-ratio">Video Format</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Card 
                            className={`cursor-pointer hover:shadow-md transition-shadow border-2 ${
                              selectedAspectRatio === '9:16' ? 'border-primary bg-primary/5' : 'border-muted'
                            }`}
                            onClick={() => setSelectedAspectRatio('9:16')}
                          >
                            <CardContent className="p-3 sm:p-4 text-center">
                              <div className="w-8 h-14 sm:w-12 sm:h-20 bg-primary/20 border-2 border-primary rounded mx-auto mb-2 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">9:16</span>
                              </div>
                              <h4 className="font-semibold text-xs sm:text-sm">TikTok / Reels</h4>
                              <p className="text-xs text-muted-foreground">1080x1920px</p>
                              <Badge variant="default" className="mt-1 text-xs">Vertical</Badge>
                            </CardContent>
                          </Card>
                          
                          <Card 
                            className={`cursor-pointer hover:shadow-md transition-shadow border-2 ${
                              selectedAspectRatio === '16:9' ? 'border-blue-600 bg-blue-50' : 'border-muted'
                            }`}
                            onClick={() => setSelectedAspectRatio('16:9')}
                          >
                            <CardContent className="p-3 sm:p-4 text-center">
                              <div className="w-14 h-8 sm:w-20 sm:h-12 bg-blue-500/20 border-2 border-blue-500 rounded mx-auto mb-2 flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">16:9</span>
                              </div>
                              <h4 className="font-semibold text-xs sm:text-sm">YouTube / FB</h4>
                              <p className="text-xs text-muted-foreground">1920x1080px</p>
                              <Badge variant="secondary" className="mt-1 text-xs">Horizontal</Badge>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Selected Format:</span>
                            <Badge variant={selectedAspectRatio === '9:16' ? 'default' : 'outline'} className="text-sm" style={{ backgroundColor: selectedAspectRatio === '16:9' ? '#1F31C7' : undefined, color: selectedAspectRatio === '16:9' ? '#FFFFFF' : undefined }}>
                              {selectedAspectRatio} {selectedAspectRatio === '9:16' ? '(Vertical)' : '(Horizontal)'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedAspectRatio === '9:16' 
                              ? 'Perfect for TikTok, Instagram Reels, and YouTube Shorts' 
                              : 'Ideal for YouTube videos, Facebook posts, and presentations'
                            }
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Platform Guidelines:</Label>
                          <div className="text-xs space-y-1 text-muted-foreground">
                            <div className="flex justify-between">
                              <span>• TikTok:</span>
                              <span>9:16 (1080x1920) - Max 60s</span>
                            </div>
                            <div className="flex justify-between">
                              <span>• Instagram Reels:</span>
                              <span>9:16 (1080x1920) - Max 90s</span>
                            </div>
                            <div className="flex justify-between">
                              <span>• YouTube Shorts:</span>
                              <span>9:16 (1080x1920) - Max 60s</span>
                            </div>
                            <div className="flex justify-between">
                              <span>• YouTube:</span>
                              <span>16:9 (1920x1080) - Any length</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                              #{tag.text}
                              <button
                                type="button"
                                onClick={() => removeTag(tag.id)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="tags"
                            value={inputTag}
                            onChange={handleTagInputChange}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Add a tag and press Enter"
                            disabled={selectedVideo.status === 'uploading'}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => addTag(inputTag)}
                            disabled={!inputTag.trim() || selectedVideo.status === 'uploading'}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Suggested Tags */}
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">Suggested tags:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestedTags
                              .filter(tag => !tags.some(t => t.text.toLowerCase() === tag.toLowerCase()))
                              .slice(0, 10)
                              .map((tag) => (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-primary/10"
                                  onClick={() => addTag(tag)}
                                >
                                  #{tag}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => alert(`Exporting ${selectedAspectRatio} template for video editing tools`)}
                      disabled={selectedVideo.status === 'uploading' || selectedVideo.status === 'processing'}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export {selectedAspectRatio} Template
                    </Button>
                    <Button
                      disabled={selectedVideo.status === 'uploading' || selectedVideo.status === 'processing'}
                    >
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Branding Tab */}
              <TabsContent value="branding">
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Elements</CardTitle>
                    <CardDescription>
                      Apply brand elements to your video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Logo */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="logo">BAM Logo</Label>
                          <p className="text-sm text-gray-500">
                            Add the BAM logo to your video
                          </p>
                        </div>
                        <Switch
                          id="logo"
                          checked={selectedVideo.brandElements.logo}
                          onCheckedChange={() => handleBrandElementToggle('logo')}
                          disabled={selectedVideo.status === 'uploading' || selectedVideo.status === 'processing'}
                        />
                      </div>
                      <Separator />
                      
                      {/* Outro */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="outro">Outro Animation</Label>
                          <p className="text-sm text-gray-500">
                            Add the standard outro animation
                          </p>
                        </div>
                        <Switch
                          id="outro"
                          checked={selectedVideo.brandElements.outro}
                          onCheckedChange={() => handleBrandElementToggle('outro')}
                          disabled={selectedVideo.status === 'uploading' || selectedVideo.status === 'processing'}
                        />
                      </div>
                      <Separator />
                      
                      {/* Watermark */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="watermark">Watermark</Label>
                          <p className="text-sm text-gray-500">
                            Add a subtle BAM watermark
                          </p>
                        </div>
                        <Switch
                          id="watermark"
                          checked={selectedVideo.brandElements.watermark}
                          onCheckedChange={() => handleBrandElementToggle('watermark')}
                          disabled={selectedVideo.status === 'uploading' || selectedVideo.status === 'processing'}
                        />
                      </div>
                      
                      {/* Brand Preview */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium mb-3">Brand Elements Preview</h3>
                        <div className="relative bg-gray-200 rounded-md aspect-video overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Image className="h-10 w-10 text-gray-400" />
                          </div>
                          
                          {/* Logo Preview */}
                          {selectedVideo.brandElements.logo && (
                            <div className="absolute top-4 right-4 bg-white/80 p-1 rounded">
                              <div className="text-xs font-bold">BAM LOGO</div>
                            </div>
                          )}
                          
                          {/* Watermark Preview */}
                          {selectedVideo.brandElements.watermark && (
                            <div className="absolute bottom-16 right-8 opacity-30">
                              <div className="text-sm font-bold text-gray-700">BAM</div>
                            </div>
                          )}
                          
                          {/* Outro Preview */}
                          {selectedVideo.brandElements.outro && (
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent flex items-center justify-center">
                              <div className="text-white text-xs">Outro Animation (5s)</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      disabled={selectedVideo.status === 'uploading' || selectedVideo.status === 'processing'}
                    >
                      Reset to Defaults
                    </Button>
                    <Button
                      disabled={selectedVideo.status === 'uploading' || selectedVideo.status === 'processing'}
                    >
                      Apply Branding
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium mb-2">No Video Selected</h3>
                <p className="text-gray-500 mb-4">
                  Upload a new video or select one from the list
                </p>
                <Button onClick={handleUploadClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoManagement;
