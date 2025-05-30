import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Sector
} from 'recharts';
import {
  Eye, TrendingUp, Users, DollarSign, ThumbsUp, Download, RefreshCw, Info, Activity, Brain, Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, subYears } from 'date-fns';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';

// TypeScript Interfaces
interface PerformanceMetric {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  description?: string;
}

interface TimeSeriesDataPoint {
  date: string;
  views?: number;
  engagement?: number;
  subscribers?: number;
  revenue?: number;
}

interface VideoPerformanceData {
  id: string;
  title: string;
  platform: 'TikTok' | 'YouTube' | 'Instagram';
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: number; // in minutes
  ctr?: number; // Click-through rate
  uploadDate: string;
  category: string;
  thumbnail: string;
}

interface AudienceDemographic {
  name: string;
  value: number;
}

interface TrendData {
  name: string; // Topic or Hashtag
  performance: number; // e.g., views, engagement score
  change?: number; // percentage change
}

interface OptimalTime {
  day: string;
  hour: number; // 0-23
  engagementScore: number;
}

// Mock Data Generation
const generateRandomTimeSeries = (numPoints: number, metric: 'views' | 'engagement' | 'subscribers' | 'revenue', startDate: Date): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  for (let i = 0; i < numPoints; i++) {
    const date = format(subDays(startDate, numPoints - 1 - i), 'MMM dd');
    let value;
    switch (metric) {
      case 'views': value = Math.floor(Math.random() * 50000) + 10000; break;
      case 'engagement': value = Math.random() * 5 + 2; break; // percentage
      case 'subscribers': value = Math.floor(Math.random() * 200) + 50; break;
      case 'revenue': value = Math.floor(Math.random() * 500) + 100; break;
      default: value = 0;
    }
    data.push({ date, [metric]: value });
  }
  return data;
};

const mockVideoPerformance: VideoPerformanceData[] = [
  { id: 'v1', title: 'BAM Exclusive: Politician Reacts to Memes', platform: 'YouTube', views: 1250300, likes: 85000, comments: 12000, shares: 25000, watchTime: 48000, ctr: 5.2, uploadDate: '2025-05-15', category: 'Satire', thumbnail: 'https://placehold.co/160x90/FF6347/FFFFFF?text=Satire+Vid' },
  { id: 'v2', title: 'Pop Culture Deep Dive: The TikTok Algorithm', platform: 'TikTok', views: 2500000, likes: 350000, comments: 8000, shares: 90000, watchTime: 15000, uploadDate: '2025-05-20', category: 'Pop Culture', thumbnail: 'https://placehold.co/160x90/4682B4/FFFFFF?text=TikTok+Deep+Dive' },
  { id: 'v3', title: 'Interview with a Viral Star: Behind the Scenes', platform: 'Instagram', views: 850000, likes: 120000, comments: 5500, shares: 15000, watchTime: 22000, uploadDate: '2025-05-10', category: 'Interviews', thumbnail: 'https://placehold.co/160x90/32CD32/FFFFFF?text=Interview' },
  { id: 'v4', title: 'The Future of BAM: Hugo & Brett Unfiltered', platform: 'YouTube', views: 750000, likes: 60000, comments: 9500, shares: 18000, watchTime: 35000, ctr: 4.1, uploadDate: '2025-04-28', category: 'Brand', thumbnail: 'https://placehold.co/160x90/FFD700/000000?text=BAM+Future' },
  { id: 'v5', title: 'Quick Laughs: Top 5 Satirical Shorts This Week', platform: 'TikTok', views: 1800000, likes: 280000, comments: 6500, shares: 75000, watchTime: 9000, uploadDate: '2025-05-25', category: 'Satire', thumbnail: 'https://placehold.co/160x90/BA55D3/FFFFFF?text=Quick+Laughs' },
];

const ageDemographics: AudienceDemographic[] = [
  { name: '13-17', value: 15 }, { name: '18-24', value: 35 }, { name: '25-34', value: 30 },
  { name: '35-44', value: 12 }, { name: '45+', value: 8 },
];
const genderDemographics: AudienceDemographic[] = [
  { name: 'Male', value: 48 }, { name: 'Female', value: 50 }, { name: 'Other/PNTS', value: 2 },
];
const locationDemographics: AudienceDemographic[] = [
  { name: 'USA', value: 60 }, { name: 'Canada', value: 15 }, { name: 'UK', value: 10 },
  { name: 'Australia', value: 8 }, { name: 'Other', value: 7 },
];
const deviceDemographics: AudienceDemographic[] = [
  { name: 'Mobile', value: 85 }, { name: 'Desktop', value: 12 }, { name: 'Tablet', value: 3 },
];

const mockOptimalTimes: OptimalTime[] = [
  { day: 'Mon', hour: 18, engagementScore: 75 }, { day: 'Tue', hour: 19, engagementScore: 80 },
  { day: 'Wed', hour: 17, engagementScore: 85 }, { day: 'Thu', hour: 20, engagementScore: 90 },
  { day: 'Fri', hour: 18, engagementScore: 95 }, { day: 'Sat', hour: 14, engagementScore: 88 },
  { day: 'Sun', hour: 16, engagementScore: 82 },
];

const dateRangeOptions = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'All Time', value: 'allTime' },
];

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF5733'];

// Active Shape for Pie Chart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontWeight="bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [activePieIndex, setActivePieIndex] = useState(0);

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [overallPerformanceData, setOverallPerformanceData] = useState<TimeSeriesDataPoint[]>([]);
  const [videoPerformanceData, setVideoPerformanceData] = useState<VideoPerformanceData[]>([]);
  const [topicPerformance, setTopicPerformance] = useState<TrendData[]>([]);
  const [hashtagPerformance, setHashtagPerformance] = useState<TrendData[]>([]);
  const [predictedEngagement, setPredictedEngagement] = useState<{min: number, max: number} | null>(null);
  const [predictionInput, setPredictionInput] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [liveViews, setLiveViews] = useState<{[videoId: string]: number}>({});

  const getDateRange = (rangeValue: string): { start: Date, end: Date } => {
    const end = new Date();
    switch (rangeValue) {
      case '7d': return { start: subDays(end, 7), end };
      case '30d': return { start: subDays(end, 30), end };
      case '90d': return { start: subDays(end, 90), end };
      case 'thisMonth': return { start: startOfMonth(end), end };
      case 'lastMonth': return { start: startOfMonth(subMonths(end,1)), end: endOfMonth(subMonths(end,1)) };
      case 'thisYear': return { start: startOfYear(end), end };
      case 'allTime': return { start: subYears(end, 5), end }; // Arbitrary 5 years for "all time"
      default: return { start: subDays(end, 30), end };
    }
  };

  const fetchData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const { start } = getDateRange(dateRange);
      const numPoints = dateRange === '7d' ? 7 : dateRange === 'allTime' ? 60 : 30; // 60 points for 5 years (monthly)

      setPerformanceMetrics([
        { label: 'Total Views', value: '15.2M', change: '+12.5%', changeType: 'positive', icon: Eye, description: 'Across all platforms' },
        { label: 'Engagement Rate', value: '6.8%', change: '-0.5%', changeType: 'negative', icon: ThumbsUp, description: 'Likes, comments, shares / views' },
        { label: 'Subscriber Growth', value: '+55.2K', change: '+8.2%', changeType: 'positive', icon: Users, description: 'Net new followers' },
        { label: 'Est. Revenue (Ads)', value: '$12,350', change: '+15.0%', changeType: 'positive', icon: DollarSign, description: 'From YouTube AdSense & TikTok Pulse' },
      ]);
      
      const viewsData = generateRandomTimeSeries(numPoints, 'views', start);
      const engagementData = generateRandomTimeSeries(numPoints, 'engagement', start);
      const combinedPerformance: TimeSeriesDataPoint[] = viewsData.map((v, i) => ({
        ...v,
        engagement: engagementData[i].engagement,
      }));
      setOverallPerformanceData(combinedPerformance);

      setVideoPerformanceData(mockVideoPerformance.filter(v => {
        if (platformFilter === 'all') return true;
        return v.platform.toLowerCase() === platformFilter.toLowerCase();
      }));

      setTopicPerformance([
        { name: 'Political Satire', performance: 7500000, change: 15 },
        { name: 'Pop Culture Analysis', performance: 5200000, change: 8 },
        { name: 'Tech Explainers', performance: 3100000, change: -5 },
        { name: 'Celebrity Interviews', performance: 2800000, change: 12 },
      ]);
      setHashtagPerformance([
        { name: '#BAMSatire', performance: 9800, change: 20 },
        { name: '#TikTokTrends', performance: 7500, change: 10 },
        { name: '#HugoAndBrett', performance: 6200, change: 5 },
        { name: '#ViralVideo', performance: 5100, change: -2 },
      ]);
      
      // Initialize live views for a few videos
      setLiveViews({
        'v1': Math.floor(Math.random() * 100) + 50,
        'v2': Math.floor(Math.random() * 200) + 100,
      });

      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, platformFilter]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViews(prev => {
        const updated = {...prev};
        Object.keys(updated).forEach(key => {
          updated[key] += Math.floor(Math.random() * 10) - 3; // Small random fluctuation
          if (updated[key] < 0) updated[key] = 0;
        });
        return updated;
      });
    }, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handlePredictEngagement = () => {
    if (!predictionInput.trim()) return;
    setIsPredicting(true);
    setTimeout(() => {
      const base = Math.random() * 10 + 5; // Base engagement %
      setPredictedEngagement({ min: parseFloat((base - 1.5).toFixed(1)), max: parseFloat((base + 1.5).toFixed(1)) });
      setIsPredicting(false);
    }, 1000);
  };

  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const TrendIndicator = ({ change, changeType }: { change: string, changeType: 'positive' | 'negative' | 'neutral' }) => {
    const isPositive = changeType === 'positive';
    const isNegative = changeType === 'negative';
    const color = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500';
    const icon = isPositive ? <TrendingUp className="h-4 w-4" /> : isNegative ? <TrendingUp className="h-4 w-4 transform rotate-180" /> : <Activity className="h-4 w-4"/>;

    return (
      <span className={`flex items-center text-sm font-medium ${color}`}>
        {icon}
        <span className="ml-1">{change}</span>
      </span>
    );
  };

  const engagementHotspotsData = useMemo(() => {
    return videoPerformanceData
      .map(video => ({
        ...video,
        totalEngagement: video.likes + video.comments,
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 5);
  }, [videoPerformanceData]);

  if (isLoading && performanceMetrics.length === 0) { // Initial full page load
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Analytics Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Analytics Dashboard</h1>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
           <Button variant="outline" onClick={() => alert("Report generation feature coming soon!")}>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videoPerformance">Video Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {performanceMetrics.map(metric => (
              <Card key={metric.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                  <metric.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{metric.description || ''}</p>
                    <TrendIndicator change={metric.change} changeType={metric.changeType} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Overall Performance Trend</CardTitle>
              <CardDescription>Views and Engagement Rate over the selected period.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overallPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" label={{ value: 'Views', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Engagement (%)', angle: -90, position: 'insideRight' }} />
                  <Tooltip formatter={(value, name) => [name === 'views' ? formatNumber(value as number) : (value as number).toFixed(1) + '%', name === 'views' ? 'Views' : 'Engagement Rate']} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="views" stroke="#8884d8" activeDot={{ r: 8 }} name="Views" />
                  <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#82ca9d" name="Engagement Rate (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Performance Tab */}
        <TabsContent value="videoPerformance" className="mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Videos</CardTitle>
                <CardDescription>Based on views in the selected period.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={videoPerformanceData.slice(0, 5).sort((a,b) => b.views - a.views)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatNumber} />
                    <YAxis dataKey="title" type="category" width={150} tick={{ fontSize: 10 }} interval={0} />
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" name="Views" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Engagement Hotspots</CardTitle>
                <CardDescription>Videos with the highest engagement (likes + comments).</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementHotspotsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatNumber}/>
                    <YAxis dataKey="title" type="category" width={150} tick={{ fontSize: 10 }} interval={0} />
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                    <Legend />
                    <Bar dataKey="totalEngagement" fill="#82ca9d" name="Total Engagement" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detailed Video Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Title</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Likes</TableHead>
                      <TableHead className="text-right">Comments</TableHead>
                      <TableHead className="text-right">Watch Time (min)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videoPerformanceData.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium flex items-center">
                          <img src={video.thumbnail} alt={video.title} className="w-10 h-6 mr-2 rounded-sm object-cover"/>
                          {video.title}
                        </TableCell>
                        <TableCell><Badge variant={video.platform === 'YouTube' ? 'destructive' : video.platform === 'TikTok' ? 'default' : 'secondary'}>{video.platform}</Badge></TableCell>
                        <TableCell className="text-right">{formatNumber(video.views)}</TableCell>
                        <TableCell className="text-right">{formatNumber(video.likes)}</TableCell>
                        <TableCell className="text-right">{formatNumber(video.comments)}</TableCell>
                        <TableCell className="text-right">{formatNumber(video.watchTime)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Insights Tab */}
        <TabsContent value="audience" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Age Demographics</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ageDemographics} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label activeIndex={activePieIndex} activeShape={renderActiveShape} onMouseEnter={onPieEnter}>
                      {ageDemographics.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Gender Demographics</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genderDemographics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" name="Percentage" fill="#82ca9d">
                      {genderDemographics.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Top Locations</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                    <Pie data={locationDemographics} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                       {locationDemographics.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Device Usage</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={deviceDemographics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" name="Percentage" fill="#ffc658">
                       {deviceDemographics.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trend Analysis Tab */}
        <TabsContent value="trends" className="mt-6">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Topic Performance</CardTitle></CardHeader>
              <CardContent>
                {topicPerformance.map(topic => (
                  <div key={topic.name} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="font-medium">{topic.name}</span>
                    <div className="flex items-center">
                      <span className="mr-2">{formatNumber(topic.performance)} views</span>
                      {topic.change && <TrendIndicator change={`${topic.change > 0 ? '+' : ''}${topic.change}%`} changeType={topic.change > 0 ? 'positive' : topic.change < 0 ? 'negative' : 'neutral'} />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Hashtag Effectiveness</CardTitle></CardHeader>
              <CardContent>
                {hashtagPerformance.map(tag => (
                   <div key={tag.name} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <Badge variant="secondary">{tag.name}</Badge>
                    <div className="flex items-center">
                      <span className="mr-2">{formatNumber(tag.performance)} uses/eng.</span>
                       {tag.change && <TrendIndicator change={`${tag.change > 0 ? '+' : ''}${tag.change}%`} changeType={tag.change > 0 ? 'positive' : tag.change < 0 ? 'negative' : 'neutral'} />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card className="mt-6">
            <CardHeader><CardTitle>Optimal Posting Times</CardTitle><CardDescription>Based on peak engagement hours (simulated data).</CardDescription></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockOptimalTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis label={{ value: 'Engagement Score', angle: -90, position: 'insideLeft' }}/>
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="engagementScore" name="Peak Engagement Score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader><CardTitle>Engagement Prediction (AI Beta)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Describe your planned video content (topic, style, length, keywords)..." 
                  value={predictionInput}
                  onChange={(e) => setPredictionInput(e.target.value)}
                  rows={3}
                />
                <Button onClick={handlePredictEngagement} disabled={isPredicting || !predictionInput.trim()}>
                  {isPredicting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                  Predict Engagement
                </Button>
                {predictedEngagement && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="font-medium text-green-700">Predicted Engagement Rate: {predictedEngagement.min}% - {predictedEngagement.max}%</p>
                    <p className="text-xs text-green-600 mt-1">Note: This is an experimental AI prediction with a simulated confidence interval.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Real-time Performance (Simulated)</CardTitle>
              <CardDescription>Live view counts for recently active videos.</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(liveViews).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(liveViews).map(([videoId, views]) => {
                    const videoDetails = mockVideoPerformance.find(v => v.id === videoId);
                    return (
                      <Card key={videoId} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{videoDetails?.title || `Video ID: ${videoId}`}</p>
                          <p className="text-xs text-muted-foreground">{videoDetails?.platform}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{formatNumber(views)}</p>
                          <p className="text-xs text-muted-foreground">Live Views</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No live data available currently.</p>
              )}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                  <Info className="inline h-3 w-3 mr-1" />
                  Live data is simulated and updates every few seconds for demonstration.
                </p>
              </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
