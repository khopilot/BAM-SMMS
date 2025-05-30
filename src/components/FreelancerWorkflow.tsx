import { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, Briefcase, Users2, DollarSign, MessageCircle, BarChartHorizontalBig, FileText, Settings, PlusCircle, Filter, Search, Edit, Trash2, ChevronDown, ChevronUp, Clock, CalendarDays, CheckCircle2, XCircle, Paperclip, Send, Star, TrendingUp, Eye, UserPlus, Mail, Phone, MoreHorizontal, ExternalLink, ChevronLeft, ChevronRight, GripVertical, Copy, Download, AlertTriangle, Info, ListChecks, Palette, Brain, Video as VideoIcon, Maximize2, Minimize2, Loader2
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from './ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Label } from './ui/label';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, addDays, subDays, differenceInDays, parseISO } from 'date-fns';

// TypeScript Interfaces
type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';
type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
type FreelancerSpecialty = 'Video Editor' | 'Scriptwriter' | 'Graphic Designer' | 'Voice Actor' | 'Social Media Manager';
type PaymentStatus = 'Pending' | 'Processing' | 'Paid' | 'Overdue' | 'Disputed';

interface Freelancer {
  id: string;
  name: string;
  avatarUrl: string;
  specialty: FreelancerSpecialty;
  skills: string[];
  rating: number; // 1-5
  hourlyRate: number;
  availability: 'Available' | 'Partially Available' | 'Unavailable';
  email: string;
  phone?: string;
  portfolioLink?: string;
  joinedDate: string;
  completedProjects: number;
  onTimeDeliveryRate: number; // percentage
}

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  assignedTo?: string; // Freelancer ID
  status: TaskStatus;
  dueDate: string;
  priority: ProjectPriority;
  estimatedHours: number;
  loggedHours?: number;
  attachments?: { name: string; url: string }[];
  feedback?: { author: string; comment: string; date: string }[];
  submissionUrl?: string;
}

interface Project {
  id: string;
  title: string;
  client?: string; // Could be BAM internal department or external
  description: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: ProjectPriority;
  budget: number;
  spentBudget?: number;
  startDate: string;
  deadline: string;
  tasks: ProjectTask[];
  team: string[]; // Freelancer IDs
  projectManager: string; // BAM team member
  templateUsed?: string; // ID of ProjectTemplate
  // Integration points
  relatedVideoId?: string; // from VideoManagement
  relatedScriptId?: string; // from ContentAssistant
}

interface Payment {
  id: string;
  projectId: string;
  freelancerId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  hoursBilled?: number;
  invoiceNumber?: string;
}

interface Message {
  id: string;
  senderId: string; // Can be freelancer or BAM team member
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Notification {
  id: string;
  userId: string; // Freelancer or BAM team member
  message: string;
  type: 'Task Update' | 'New Message' | 'Payment' | 'Deadline Reminder';
  timestamp: string;
  read: boolean;
  link?: string; // Link to relevant project/task
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  defaultTasks: Partial<ProjectTask>[];
  estimatedBudgetRange: [number, number];
  estimatedDurationDays: number;
  specialtiesNeeded: FreelancerSpecialty[];
}

// Mock Data
const mockFreelancers: Freelancer[] = [
  { id: 'f1', name: 'Alice Wonderland', avatarUrl: 'https://i.pravatar.cc/150?u=alice', specialty: 'Video Editor', skills: ['Adobe Premiere Pro', 'After Effects', 'Color Grading', 'Storytelling'], rating: 4.8, hourlyRate: 75, availability: 'Available', email: 'alice@example.com', portfolioLink: '#', joinedDate: '2023-01-15', completedProjects: 25, onTimeDeliveryRate: 95 },
  { id: 'f2', name: 'Bob The Builder', avatarUrl: 'https://i.pravatar.cc/150?u=bob', specialty: 'Scriptwriter', skills: ['Creative Writing', 'Copywriting', 'Storyboarding', 'SEO'], rating: 4.5, hourlyRate: 60, availability: 'Partially Available', email: 'bob@example.com', joinedDate: '2023-03-01', completedProjects: 18, onTimeDeliveryRate: 92 },
  { id: 'f3', name: 'Carol Danvers', avatarUrl: 'https://i.pravatar.cc/150?u=carol', specialty: 'Graphic Designer', skills: ['Photoshop', 'Illustrator', 'Branding', 'UI/UX'], rating: 4.9, hourlyRate: 80, availability: 'Available', email: 'carol@example.com', portfolioLink: '#', joinedDate: '2022-11-10', completedProjects: 32, onTimeDeliveryRate: 98 },
  { id: 'f4', name: 'David Copperfield', avatarUrl: 'https://i.pravatar.cc/150?u=david', specialty: 'Voice Actor', skills: ['Voice Over', 'Character Voices', 'Audio Editing', 'Narration'], rating: 4.7, hourlyRate: 90, availability: 'Unavailable', email: 'david@example.com', joinedDate: '2023-05-20', completedProjects: 15, onTimeDeliveryRate: 100 },
  { id: 'f5', name: 'Eve Harrington', avatarUrl: 'https://i.pravatar.cc/150?u=eve', specialty: 'Social Media Manager', skills: ['Content Strategy', 'Community Management', 'Analytics', 'Campaigns'], rating: 4.6, hourlyRate: 65, availability: 'Available', email: 'eve@example.com', portfolioLink: '#', joinedDate: '2023-02-01', completedProjects: 22, onTimeDeliveryRate: 90 },
];

const mockProjectTemplates: ProjectTemplate[] = [
    { id: 'pt1', name: 'Short-form Video Package', description: 'Editing and graphics for a 60-second TikTok/Reels video.', defaultTasks: [{ title: 'Video Editing (Raw Cut)', estimatedHours: 4 }, { title: 'Motion Graphics & Text Overlays', estimatedHours: 3 }, { title: 'Sound Design & Music', estimatedHours: 2 }], estimatedBudgetRange: [300, 700], estimatedDurationDays: 3, specialtiesNeeded: ['Video Editor', 'Graphic Designer'] },
    { id: 'pt2', name: 'Script Writing (5 min video)', description: 'Full script development for a 5-minute YouTube explainer.', defaultTasks: [{ title: 'Topic Research & Outline', estimatedHours: 3 }, { title: 'Draft 1 Scripting', estimatedHours: 6 }, { title: 'Revisions (2 rounds)', estimatedHours: 4 }], estimatedBudgetRange: [400, 800], estimatedDurationDays: 5, specialtiesNeeded: ['Scriptwriter'] },
    { id: 'pt3', name: 'Thumbnail Design Set', description: 'Set of 3 unique thumbnails for a video series.', defaultTasks: [{ title: 'Concept Ideation (3 options)', estimatedHours: 2 }, { title: 'Design & Iteration', estimatedHours: 5 }], estimatedBudgetRange: [150, 400], estimatedDurationDays: 2, specialtiesNeeded: ['Graphic Designer'] },
];


const initialProjects: Project[] = [
  { 
    id: 'p1', title: 'BAM TikTok Campaign - Q3', client: 'Marketing Dept.', description: 'Create 10 short-form videos for TikTok promoting BAM\'s new features.', status: 'Active', priority: 'High', budget: 5000, spentBudget: 1200, startDate: '2025-06-01', deadline: '2025-07-15', 
    tasks: [
      { id: 't1p1', title: 'Video 1: Editing', assignedTo: 'f1', status: 'In Progress', dueDate: '2025-06-10', priority: 'High', estimatedHours: 8, loggedHours: 3 },
      { id: 't2p1', title: 'Video 1: Script', assignedTo: 'f2', status: 'Completed', dueDate: '2025-06-05', priority: 'High', estimatedHours: 4, loggedHours: 4, submissionUrl: '#' },
      { id: 't3p1', title: 'Campaign Graphics', assignedTo: 'f3', status: 'To Do', dueDate: '2025-06-15', priority: 'Medium', estimatedHours: 12 },
    ], 
    team: ['f1', 'f2', 'f3'], projectManager: 'Hugo' 
  },
  { 
    id: 'p2', title: 'Explainer Video: AI in BAM', client: 'Product Team', description: 'Develop a 5-minute explainer video on how AI is used in the BAM platform.', status: 'Planning', priority: 'Medium', budget: 3500, startDate: '2025-06-15', deadline: '2025-07-30', 
    tasks: [
      { id: 't1p2', title: 'Script Writing', status: 'To Do', dueDate: '2025-06-25', priority: 'High', estimatedHours: 10 },
      { id: 't2p2', title: 'Voice Over Recording', status: 'To Do', dueDate: '2025-07-05', priority: 'Medium', estimatedHours: 4 },
    ], 
    team: [], projectManager: 'Brett', templateUsed: 'pt2'
  },
  { 
    id: 'p3', title: 'Freelancer Portal UI Design', client: 'Engineering', description: 'Design UI/UX for the new freelancer portal within BAM app.', status: 'Active', priority: 'Urgent', budget: 8000, spentBudget: 3200, startDate: '2025-05-15', deadline: '2025-06-30', 
    tasks: [
      { id: 't1p3', title: 'User Research & Personas', assignedTo: 'f3', status: 'Completed', dueDate: '2025-05-30', priority: 'High', estimatedHours: 16, loggedHours: 16, submissionUrl: '#' },
      { id: 't2p3', title: 'Wireframes & Low-fi Prototypes', assignedTo: 'f3', status: 'In Review', dueDate: '2025-06-10', priority: 'High', estimatedHours: 24, loggedHours: 20, submissionUrl: '#' },
      { id: 't3p3', title: 'Hi-fi Mockups & Design System', status: 'To Do', dueDate: '2025-06-25', priority: 'High', estimatedHours: 40 },
    ], 
    team: ['f3'], projectManager: 'Hugo' 
  },
];

const mockPayments: Payment[] = [
    { id: 'pay1', projectId: 'p1', freelancerId: 'f2', amount: 240, issueDate: '2025-06-06', dueDate: '2025-06-20', status: 'Paid', paidDate: '2025-06-10', hoursBilled: 4, invoiceNumber: 'INV-2025-001' },
    { id: 'pay2', projectId: 'p3', freelancerId: 'f3', amount: 1280, issueDate: '2025-06-01', dueDate: '2025-06-15', status: 'Pending', hoursBilled: 16, invoiceNumber: 'INV-2025-002' },
    { id: 'pay3', projectId: 'p1', freelancerId: 'f1', amount: 600, issueDate: '2025-06-15', dueDate: '2025-06-30', status: 'Pending', hoursBilled: 8, invoiceNumber: 'INV-2025-003' },
];

const mockMessages: Message[] = [
    { id: 'm1', senderId: 'Hugo', receiverId: 'f1', content: 'Hey Alice, how is Video 1 editing coming along? Need any help?', timestamp: subDays(new Date(), 1).toISOString(), read: false },
    { id: 'm2', senderId: 'f1', receiverId: 'Hugo', content: 'Hi Hugo, making good progress! Should have a draft for review by EOD tomorrow.', timestamp: subDays(new Date(), 1).toISOString(), read: true },
    { id: 'm3', senderId: 'Brett', receiverId: 'f3', content: 'Carol, the wireframes look great. One small feedback point on the dashboard layout...', timestamp: new Date().toISOString(), read: false },
];

const mockNotifications: Notification[] = [
    { id: 'n1', userId: 'Hugo', message: 'Alice (Video 1: Editing) is approaching deadline.', type: 'Deadline Reminder', timestamp: new Date().toISOString(), read: false, link: '/projects/p1/t1p1' },
    { id: 'n2', userId: 'f3', message: 'New feedback on "Wireframes & Low-fi Prototypes" task.', type: 'Task Update', timestamp: subDays(new Date(),1).toISOString(), read: true, link: '/projects/p3/t2p3' },
    { id: 'n3', userId: 'f2', message: 'Payment for INV-2025-001 has been processed.', type: 'Payment', timestamp: subDays(new Date(),2).toISOString(), read: true },
];

const KANBAN_COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Completed', 'Blocked'];

// Main Component
const FreelancerWorkflow = () => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>(mockFreelancers);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isViewFreelancerSheetOpen, setIsViewFreelancerSheetOpen] = useState(false);
  const [isViewProjectSheetOpen, setIsViewProjectSheetOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isSubmitWorkModalOpen, setIsSubmitWorkModalOpen] = useState(false);
  const [isReviewWorkModalOpen, setIsReviewWorkModalOpen] = useState(false);

  // Form states for creation/editing
  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({});
  const [newTaskData, setNewTaskData] = useState<Partial<ProjectTask>>({});
  const [submissionData, setSubmissionData] = useState<{url: string, notes: string}>({url: '', notes: ''});
  const [reviewData, setReviewData] = useState<{feedback: string, status: 'Approved' | 'Rejected'}>({feedback: '', status: 'Approved'});
  
  const [searchTermFreelancers, setSearchTermFreelancers] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('All');
  const [searchTermProjects, setSearchTermProjects] = useState('');
  const [filterProjectStatus, setFilterProjectStatus] = useState('All');

  // Kanban state
  const tasksByStatus = useMemo(() => {
    const groupedTasks: Record<TaskStatus, ProjectTask[]> = {
      'To Do': [], 'In Progress': [], 'In Review': [], 'Completed': [], 'Blocked': []
    };
    projects.forEach(p => p.tasks.forEach(t => {
      if (selectedProject && p.id !== selectedProject.id) return; // Only show tasks for selected project or all if none selected
      if (!selectedProject && p.status !== 'Active') return; // Only show tasks for active projects on main board
      groupedTasks[t.status].push({...t, projectId: p.id}); // Add projectId for context
    }));
    return groupedTasks;
  }, [projects, selectedProject]);

  const handleCreateProject = () => {
    const newId = `p${projects.length + 1}`;
    const projectToAdd: Project = {
      id: newId,
      title: newProjectData.title || 'Untitled Project',
      description: newProjectData.description || '',
      status: 'Planning',
      priority: newProjectData.priority || 'Medium',
      budget: newProjectData.budget || 0,
      startDate: newProjectData.startDate || new Date().toISOString().split('T')[0],
      deadline: newProjectData.deadline || addDays(new Date(), 30).toISOString().split('T')[0],
      tasks: [],
      team: newProjectData.team || [],
      projectManager: 'Hugo', // Default, should be selectable
      ...newProjectData,
    };
    setProjects([...projects, projectToAdd]);
    setIsCreateProjectModalOpen(false);
    setNewProjectData({});
  };
  
  const handleTaskStatusChange = (taskId: string, projectId: string, newStatus: TaskStatus) => {
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        };
      }
      return p;
    }));
  };

  const openTaskDetail = (task: ProjectTask, projectId: string) => {
    setSelectedTask({...task, projectId}); // Store projectId with task for context
    setIsTaskDetailModalOpen(true);
  };
  
  const openSubmitWorkModal = (task: ProjectTask) => {
    setSelectedTask(task);
    setIsSubmitWorkModalOpen(true);
  };

  const handleSubmitWork = () => {
    if (!selectedTask || !selectedTask.projectId) return;
    // In real app, save submission URL and notes
    handleTaskStatusChange(selectedTask.id, selectedTask.projectId, 'In Review');
    setNotifications(prev => [{id: `n${prev.length+1}`, userId: 'Hugo', message: `Work submitted for task: ${selectedTask.title}`, type: 'Task Update', timestamp: new Date().toISOString(), read: false, link: `/projects/${selectedTask.projectId}/${selectedTask.id}`}, ...prev]);
    setIsSubmitWorkModalOpen(false);
    setSubmissionData({url: '', notes: ''});
  };
  
  const openReviewWorkModal = (task: ProjectTask) => {
    setSelectedTask(task);
    setIsReviewWorkModalOpen(true);
  };

  const handleReviewWork = () => {
    if (!selectedTask || !selectedTask.projectId) return;
    // In real app, save feedback and new status
    const newStatus = reviewData.status === 'Approved' ? 'Completed' : 'In Progress'; // Or 'Blocked' / 'To Do' if rejected with revisions
    handleTaskStatusChange(selectedTask.id, selectedTask.projectId, newStatus);
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === selectedTask.projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === selectedTask.id ? { ...t, feedback: [...(t.feedback || []), {author: 'Hugo', comment: reviewData.feedback, date: new Date().toISOString() }] } : t)
        };
      }
      return p;
    }));
    setNotifications(prev => [{id: `n${prev.length+1}`, userId: selectedTask.assignedTo || '', message: `Feedback received for task: ${selectedTask.title}`, type: 'Task Update', timestamp: new Date().toISOString(), read: false, link: `/projects/${selectedTask.projectId}/${selectedTask.id}`}, ...prev]);
    setIsReviewWorkModalOpen(false);
    setReviewData({feedback: '', status: 'Approved'});
  };

  const filteredFreelancers = useMemo(() => {
    return freelancers.filter(f => 
      (f.name.toLowerCase().includes(searchTermFreelancers.toLowerCase()) || f.skills.some(s => s.toLowerCase().includes(searchTermFreelancers.toLowerCase()))) &&
      (filterSpecialty === 'All' || f.specialty === filterSpecialty)
    );
  }, [freelancers, searchTermFreelancers, filterSpecialty]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p =>
        (p.title.toLowerCase().includes(searchTermProjects.toLowerCase()) || p.description.toLowerCase().includes(searchTermProjects.toLowerCase())) &&
        (filterProjectStatus === 'All' || p.status === filterProjectStatus)
    );
  }, [projects, searchTermProjects, filterProjectStatus]);

  const calculateProjectProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(t => t.status === 'Completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const getFreelancerById = (id: string) => freelancers.find(f => f.id === id);

  const freelancerPerformanceData = useMemo(() => {
    return freelancers.map(f => ({
      name: f.name,
      completed: f.completedProjects,
      onTimeRate: f.onTimeDeliveryRate,
      avgRating: f.rating,
    }));
  }, [freelancers]);
  
  const projectStatusData = useMemo(() => {
    const statuses = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<Project['status'], number>);
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Placeholder for selecting a freelancer for a task
  const [assignFreelancerOpen, setAssignFreelancerOpen] = useState(false);
  const [currentTaskForAssignment, setCurrentTaskForAssignment] = useState<ProjectTask | null>(null);

  const handleAssignFreelancerToTask = (freelancerId: string) => {
    if (!currentTaskForAssignment || !currentTaskForAssignment.projectId) return;
    const { projectId, id: taskId } = currentTaskForAssignment;
    setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === projectId) {
            return {
                ...p,
                tasks: p.tasks.map(t => t.id === taskId ? { ...t, assignedTo: freelancerId } : t)
            };
        }
        return p;
    }));
    setAssignFreelancerOpen(false);
    setCurrentTaskForAssignment(null);
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center">
          <Briefcase className="h-8 w-8 mr-3 text-primary" />
          Freelancer Workflow
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateProjectModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Project
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <MessageCircle className="mr-2 h-4 w-4" /> Messages
                {messages.filter(m => !m.read && m.receiverId === 'BAM_TEAM_ID_PLACEHOLDER').length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Recent Messages</SheetTitle>
                <SheetDescription>Conversations with freelancers.</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-150px)] mt-4 pr-3">
                <div className="space-y-4">
                  {messages.slice(0, 10).map(msg => (
                    <Card key={msg.id} className={`p-3 ${msg.senderId === 'BAM_TEAM_ID_PLACEHOLDER' ? 'ml-auto bg-primary/10' : 'mr-auto bg-secondary/10'} max-w-[80%]`}>
                      <p className="text-xs font-medium">{msg.senderId === 'BAM_TEAM_ID_PLACEHOLDER' ? 'You' : getFreelancerById(msg.senderId)?.name || msg.senderId}</p>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-muted-foreground text-right">{format(parseISO(msg.timestamp), 'PPp')}</p>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Task Board</TabsTrigger>
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.filter(p => p.status === 'Active').length}</div>
                <p className="text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks In Review</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'In Review').length, 0)}</div>
                <p className="text-xs text-muted-foreground">Awaiting BAM approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Deadlines (7 days)</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.reduce((sum, p) => sum + p.tasks.filter(t => differenceInDays(parseISO(t.dueDate), new Date()) <= 7 && differenceInDays(parseISO(t.dueDate), new Date()) >= 0 && t.status !== 'Completed').length, 0)}</div>
                <p className="text-xs text-muted-foreground">Tasks due soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Freelancers</CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{freelancers.length}</div>
                <p className="text-xs text-muted-foreground">Active in the network</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 mb-2 rounded-md border ${n.read ? 'opacity-70' : 'bg-primary/5'}`}>
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium">{n.type}</p>
                        <Badge variant={n.read ? "outline" : "default"} className="text-xs">{n.read ? 'Read' : 'New'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(parseISO(n.timestamp), 'PPp')}</p>
                      {n.link && <Button variant="link" size="sm" className="p-0 h-auto mt-1" onClick={() => alert(`Navigate to ${n.link}`)}>View Details</Button>}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Overdue Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {projects.flatMap(p => p.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').map(t => ({...t, projectName: p.title}))).length > 0 ? (
                    projects.flatMap(p => p.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').map(t => ({...t, projectName: p.title}))).map(task => (
                      <div key={task.id} className="p-3 mb-2 rounded-md border border-destructive/50 bg-destructive/5">
                        <p className="text-sm font-medium text-destructive">{task.title} <span className="text-xs text-destructive/80">({task.projectName})</span></p>
                        <p className="text-xs text-destructive/90">Due: {format(parseISO(task.dueDate), 'PP')} (Overdue by {differenceInDays(new Date(), parseISO(task.dueDate))} days)</p>
                        {task.assignedTo && <p className="text-xs text-destructive/90">Assigned to: {getFreelancerById(task.assignedTo)?.name}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No overdue tasks. Great job!</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <Input 
              placeholder="Search projects..." 
              value={searchTermProjects}
              onChange={(e) => setSearchTermProjects(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterProjectStatus} onValueChange={setFilterProjectStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(project => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge variant={project.priority === 'Urgent' || project.priority === 'High' ? 'destructive' : project.priority === 'Medium' ? 'secondary' : 'outline'}>
                      {project.priority}
                    </Badge>
                  </div>
                  <CardDescription>{project.client ? `Client: ${project.client}` : 'Internal Project'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                  <div className="text-xs">
                    <p><strong>Deadline:</strong> {format(parseISO(project.deadline), 'PP')}</p>
                    <p><strong>Budget:</strong> ${project.budget.toLocaleString()} {project.spentBudget ? `($${project.spentBudget.toLocaleString()} spent)` : ''}</p>
                    <p><strong>Status:</strong> <Badge variant="outline" className="capitalize">{project.status}</Badge></p>
                  </div>
                  <Progress value={calculateProjectProgress(project)} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground text-right">{calculateProjectProgress(project)}% complete</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" onClick={() => { setSelectedProject(project); setIsViewProjectSheetOpen(true); }}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Task Board (Kanban) Tab */}
        <TabsContent value="tasks" className="mt-6">
            <div className="mb-4">
                <Select onValueChange={(projectId) => setSelectedProject(projects.find(p => p.id === projectId) || null)}>
                    <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="View tasks for a specific project (default: Active Projects)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-active">All Active Projects</SelectItem>
                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                </Select>
                {selectedProject && <p className="text-sm text-muted-foreground mt-2">Showing tasks for: <strong>{selectedProject.title}</strong></p>}
            </div>
            <ScrollArea className="w-full pb-4">
                <div className="flex gap-4">
                {KANBAN_COLUMNS.map(status => (
                    <Card key={status} className="w-72 flex-shrink-0">
                    <CardHeader>
                        <CardTitle className="text-base">{status} ({tasksByStatus[status].length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 h-[calc(100vh-300px)] overflow-y-auto p-3">
                        {tasksByStatus[status].map(task => (
                        <Card key={task.id} className="p-3 shadow-sm cursor-grab" onClick={() => openTaskDetail(task, task.projectId || '')}>
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">Due: {format(parseISO(task.dueDate), 'PP')}</p>
                            {task.assignedTo && getFreelancerById(task.assignedTo) && (
                                <div className="flex items-center mt-2">
                                    <Avatar className="h-5 w-5 mr-1.5">
                                        <AvatarImage src={getFreelancerById(task.assignedTo)?.avatarUrl} />
                                        <AvatarFallback>{getFreelancerById(task.assignedTo)?.name.substring(0,1)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">{getFreelancerById(task.assignedTo)?.name}</span>
                                </div>
                            )}
                            <Badge variant={task.priority === 'Urgent' || task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'secondary' : 'outline'} className="mt-2 text-xs">{task.priority}</Badge>
                        </Card>
                        ))}
                        {tasksByStatus[status].length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No tasks in this stage.</p>}
                    </CardContent>
                    </Card>
                ))}
                </div>
            </ScrollArea>
        </TabsContent>

        {/* Freelancers Tab */}
        <TabsContent value="freelancers" className="mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <Input 
              placeholder="Search freelancers by name or skill..." 
              value={searchTermFreelancers}
              onChange={(e) => setSearchTermFreelancers(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Specialties</SelectItem>
                {(Object.keys(mockFreelancers.reduce((acc, f) => ({...acc, [f.specialty]: true}), {})) as FreelancerSpecialty[]).map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFreelancers.map(freelancer => (
              <Card key={freelancer.id}>
                <CardHeader className="items-center text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-2">
                    <AvatarImage src={freelancer.avatarUrl} alt={freelancer.name} />
                    <AvatarFallback>{freelancer.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <CardTitle>{freelancer.name}</CardTitle>
                  <CardDescription>{freelancer.specialty}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1 text-center">
                  <div className="flex justify-center items-center">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < freelancer.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                    <span className="ml-1 text-xs text-muted-foreground">({freelancer.rating.toFixed(1)})</span>
                  </div>
                  <p>Rate: ${freelancer.hourlyRate}/hr</p>
                  <Badge variant={freelancer.availability === 'Available' ? 'default' : freelancer.availability === 'Partially Available' ? 'secondary' : 'outline'} className={freelancer.availability === 'Available' ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {freelancer.availability}
                  </Badge>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" onClick={() => { setSelectedFreelancer(freelancer); setIsViewFreelancerSheetOpen(true); }}>
                    View Profile
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payment Tracking</CardTitle>
                    <CardDescription>Manage payments to freelancers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[calc(100vh-300px)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Freelancer</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map(payment => {
                                    const freelancer = getFreelancerById(payment.freelancerId);
                                    const project = projects.find(p => p.id === payment.projectId);
                                    return (
                                    <TableRow key={payment.id}>
                                        <TableCell>{payment.invoiceNumber || 'N/A'}</TableCell>
                                        <TableCell>{freelancer?.name || 'Unknown'}</TableCell>
                                        <TableCell>{project?.title || 'Unknown Project'}</TableCell>
                                        <TableCell className="text-right">${payment.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={payment.status === 'Paid' ? 'default' : payment.status === 'Pending' ? 'secondary' : payment.status === 'Overdue' ? 'destructive' : 'outline'}
                                                   className={payment.status === 'Paid' ? 'bg-green-500 hover:bg-green-600' : ''}
                                            >
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(parseISO(payment.dueDate), 'PP')}</TableCell>
                                        <TableCell>
                                            <Popover>
                                                <PopoverTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></PopoverTrigger>
                                                <PopoverContent className="w-40">
                                                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => alert(`View invoice ${payment.invoiceNumber}`)}>View Invoice</Button>
                                                    {payment.status === 'Pending' && <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => alert(`Mark ${payment.invoiceNumber} as paid`)}>Mark as Paid</Button>}
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Freelancer Performance</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={freelancerPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Projects/Rating', angle: -90, position: 'insideLeft' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'On-Time %', angle: -90, position: 'insideRight' }} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="completed" fill="#8884d8" name="Completed Projects" />
                                <Bar yAxisId="left" dataKey="avgRating" fill="#FFBB28" name="Avg Rating (1-5)" />
                                <Line yAxisId="right" type="monotone" dataKey="onTimeRate" stroke="#82ca9d" name="On-Time Delivery %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Project Status Distribution</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {projectStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>

      {/* Modals & Sheets */}
      <Dialog open={isCreateProjectModalOpen} onOpenChange={setIsCreateProjectModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Fill in the details for the new project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="p-title" className="text-right">Title</Label>
              <Input id="p-title" value={newProjectData.title || ''} onChange={e => setNewProjectData({...newProjectData, title: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="p-desc" className="text-right">Description</Label>
              <Textarea id="p-desc" value={newProjectData.description || ''} onChange={e => setNewProjectData({...newProjectData, description: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="p-template" className="text-right">Template (Optional)</Label>
                <Select onValueChange={templateId => {
                    const template = mockProjectTemplates.find(t => t.id === templateId);
                    if (template) {
                        setNewProjectData(prev => ({
                            ...prev,
                            description: template.description,
                            budget: (template.estimatedBudgetRange[0] + template.estimatedBudgetRange[1]) / 2,
                            tasks: template.defaultTasks.map((dt, i) => ({...dt, id: `task-${Date.now()}-${i}`, status: 'To Do', priority: 'Medium', dueDate: addDays(new Date(), 7 + i*2).toISOString().split('T')[0] }) as ProjectTask), // Added type assertion
                            templateUsed: template.id
                        }));
                    } else {
                         setNewProjectData(prev => ({...prev, templateUsed: undefined, tasks: []}));
                    }
                }}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a project template" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">No Template</SelectItem>
                        {mockProjectTemplates.map(pt => <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="p-budget" className="text-right">Budget ($)</Label>
              <Input id="p-budget" type="number" value={newProjectData.budget || ''} onChange={e => setNewProjectData({...newProjectData, budget: parseFloat(e.target.value)})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="p-deadline" className="text-right">Deadline</Label>
              <Input id="p-deadline" type="date" value={newProjectData.deadline || ''} onChange={e => setNewProjectData({...newProjectData, deadline: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="p-priority" className="text-right">Priority</Label>
                <Select value={newProjectData.priority} onValueChange={(val: ProjectPriority) => setNewProjectData({...newProjectData, priority: val})}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Set priority" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateProjectModalOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={isViewFreelancerSheetOpen} onOpenChange={setIsViewFreelancerSheetOpen}>
        <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedFreelancer?.name}</SheetTitle>
            <SheetDescription>{selectedFreelancer?.specialty}</SheetDescription>
          </SheetHeader>
          {selectedFreelancer && (
            <div className="py-4 space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedFreelancer.avatarUrl} />
                  <AvatarFallback>{selectedFreelancer.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < selectedFreelancer.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                    <span className="ml-2 text-sm text-muted-foreground">({selectedFreelancer.rating.toFixed(1)} average rating)</span>
                  </div>
                  <p className="text-lg font-semibold">${selectedFreelancer.hourlyRate}/hr</p>
                  <Badge variant={selectedFreelancer.availability === 'Available' ? 'default' : 'outline'} className={selectedFreelancer.availability === 'Available' ? 'bg-green-500 hover:bg-green-600' : ''}>{selectedFreelancer.availability}</Badge>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <p className="text-sm"><Mail className="inline h-4 w-4 mr-2 text-muted-foreground" />{selectedFreelancer.email}</p>
                {selectedFreelancer.phone && <p className="text-sm"><Phone className="inline h-4 w-4 mr-2 text-muted-foreground" />{selectedFreelancer.phone}</p>}
                {selectedFreelancer.portfolioLink && <p className="text-sm"><ExternalLink className="inline h-4 w-4 mr-2 text-muted-foreground" /><a href={selectedFreelancer.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Portfolio</a></p>}
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFreelancer.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Statistics</h4>
                <p className="text-sm">Joined: {format(parseISO(selectedFreelancer.joinedDate), 'PP')}</p>
                <p className="text-sm">Completed Projects: {selectedFreelancer.completedProjects}</p>
                <p className="text-sm">On-Time Delivery: {selectedFreelancer.onTimeDeliveryRate}%</p>
              </div>
              {/* Placeholder for recent projects by this freelancer */}
            </div>
          )}
           <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="outline">Close</Button>
                </SheetClose>
                <Button type="button" onClick={() => alert(`Contacting ${selectedFreelancer?.name}`)}>
                    <MessageCircle className="mr-2 h-4 w-4" /> Message Freelancer
                </Button>
            </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={isViewProjectSheetOpen} onOpenChange={setIsViewProjectSheetOpen}>
        <SheetContent className="w-[90vw] max-w-3xl overflow-y-auto">
            <SheetHeader>
                <SheetTitle>{selectedProject?.title}</SheetTitle>
                <SheetDescription>
                    {selectedProject?.description}
                    <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Status: {selectedProject?.status}</Badge>
                        <Badge variant="outline">Priority: {selectedProject?.priority}</Badge>
                        <Badge variant="outline">Deadline: {selectedProject?.deadline ? format(parseISO(selectedProject.deadline), 'PP') : 'N/A'}</Badge>
                    </div>
                </SheetDescription>
            </SheetHeader>
            {selectedProject && (
                <div className="py-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Client:</span> {selectedProject.client || 'Internal'}</div>
                        <div><span className="font-medium">Project Manager:</span> {selectedProject.projectManager}</div>
                        <div><span className="font-medium">Budget:</span> ${selectedProject.budget.toLocaleString()}</div>
                        <div><span className="font-medium">Spent:</span> ${selectedProject.spentBudget?.toLocaleString() || '0'}</div>
                        <div><span className="font-medium">Start Date:</span> {format(parseISO(selectedProject.startDate), 'PP')}</div>
                        <div><span className="font-medium">Progress:</span> {calculateProjectProgress(selectedProject)}%</div>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Team Members</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedProject.team.map(freelancerId => {
                                const freelancer = getFreelancerById(freelancerId);
                                return freelancer ? (
                                    <Badge key={freelancerId} variant="secondary" className="flex items-center gap-1.5 p-1 pr-2">
                                        <Avatar className="h-5 w-5"><AvatarImage src={freelancer.avatarUrl} /><AvatarFallback>{freelancer.name[0]}</AvatarFallback></Avatar>
                                        {freelancer.name}
                                    </Badge>
                                ) : null;
                            })}
                            {/* Add team member button */}
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Tasks ({selectedProject.tasks.length})</h4>
                        <ScrollArea className="h-[300px] pr-2">
                            <div className="space-y-3">
                            {selectedProject.tasks.map(task => (
                                <Card key={task.id} className="p-3 text-sm">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium">{task.title}</p>
                                        <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'} className={task.status === 'Completed' ? 'bg-green-500 hover:bg-green-600' : ''}>{task.status}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Due: {format(parseISO(task.dueDate), 'PP')} - Priority: {task.priority}</p>
                                    {task.assignedTo && <p className="text-xs text-muted-foreground">Assigned: {getFreelancerById(task.assignedTo)?.name}</p>}
                                    <div className="mt-2 flex gap-2">
                                        <Button size="xs" variant="outline" onClick={() => openTaskDetail(task, selectedProject.id)}>Details</Button>
                                        {task.status === 'In Progress' && <Button size="xs" variant="outline" onClick={() => openSubmitWorkModal({...task, projectId: selectedProject.id})}>Submit Work</Button>}
                                        {task.status === 'In Review' && <Button size="xs" variant="outline" onClick={() => openReviewWorkModal({...task, projectId: selectedProject.id})}>Review Work</Button>}
                                    </div>
                                </Card>
                            ))}
                            </div>
                        </ScrollArea>
                    </div>
                    {/* Add task button */}
                </div>
            )}
            <SheetFooter>
                <SheetClose asChild><Button variant="outline">Close</Button></SheetClose>
                <Button onClick={() => alert(`Editing project ${selectedProject?.title}`)}>Edit Project</Button>
            </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Task Detail Modal (Simplified) */}
      <Dialog open={isTaskDetailModalOpen} onOpenChange={setIsTaskDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>Due: {selectedTask?.dueDate ? format(parseISO(selectedTask.dueDate), 'PP') : 'N/A'} - Priority: {selectedTask?.priority}</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3 text-sm">
            <p><span className="font-medium">Description:</span> {selectedTask?.description}</p>
            <p><span className="font-medium">Status:</span> {selectedTask?.status}</p>
            <p><span className="font-medium">Assigned To:</span> {selectedTask?.assignedTo ? getFreelancerById(selectedTask.assignedTo)?.name : 'Unassigned'}</p>
            <p><span className="font-medium">Estimated Hours:</span> {selectedTask?.estimatedHours}</p>
            {selectedTask?.loggedHours && <p><span className="font-medium">Logged Hours:</span> {selectedTask.loggedHours}</p>}
            
            {/* Change Status Dropdown */}
            {selectedTask && selectedTask.projectId && (
                <div className="flex items-center gap-2 pt-2">
                    <Label htmlFor="task-status-change" className="whitespace-nowrap">Change Status:</Label>
                    <Select 
                        value={selectedTask.status} 
                        onValueChange={(newStatus: TaskStatus) => handleTaskStatusChange(selectedTask.id, selectedTask.projectId || '', newStatus)}
                    >
                        <SelectTrigger id="task-status-change" className="flex-grow">
                            <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                            {KANBAN_COLUMNS.map(colStatus => (
                                <SelectItem key={colStatus} value={colStatus}>{colStatus}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {/* Assign Freelancer */}
            {selectedTask && selectedTask.projectId && !selectedTask.assignedTo && (
                <Popover open={assignFreelancerOpen} onOpenChange={setAssignFreelancerOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => setCurrentTaskForAssignment(selectedTask)}>Assign Freelancer</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder="Search freelancer..." />
                            <CommandList>
                                <CommandEmpty>No freelancer found.</CommandEmpty>
                                <CommandGroup>
                                    {freelancers.filter(f => f.availability === 'Available' || f.availability === 'Partially Available').map(f => (
                                        <CommandItem key={f.id} value={f.name} onSelect={() => handleAssignFreelancerToTask(f.id)}>
                                            <CheckCircle2 className={`mr-2 h-4 w-4 ${selectedTask?.assignedTo === f.id ? "opacity-100" : "opacity-0"}`} />
                                            {f.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}

            {selectedTask?.feedback && selectedTask.feedback.length > 0 && (
                <div className="pt-2">
                    <h4 className="font-medium text-xs mb-1">Feedback:</h4>
                    <ScrollArea className="h-20 border rounded-md p-2">
                        {selectedTask.feedback.map((fb, i) => (
                            <div key={i} className="text-xs mb-1 pb-1 border-b last:border-b-0">
                                <p><strong>{fb.author}</strong> ({format(parseISO(fb.date), 'Pp')}): {fb.comment}</p>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDetailModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Work Modal */}
      <Dialog open={isSubmitWorkModalOpen} onOpenChange={setIsSubmitWorkModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Submit Work for: {selectedTask?.title}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
                <Input placeholder="Submission URL (e.g., Google Drive, Dropbox)" value={submissionData.url} onChange={e => setSubmissionData({...submissionData, url: e.target.value})} />
                <Textarea placeholder="Notes for reviewer (optional)" value={submissionData.notes} onChange={e => setSubmissionData({...submissionData, notes: e.target.value})} />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsSubmitWorkModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitWork}>Submit</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Work Modal */}
      <Dialog open={isReviewWorkModalOpen} onOpenChange={setIsReviewWorkModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Review Submission for: {selectedTask?.title}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
                {selectedTask?.submissionUrl && <p className="text-sm">Submission: <a href={selectedTask.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selectedTask.submissionUrl}</a></p>}
                <Textarea placeholder="Provide feedback..." value={reviewData.feedback} onChange={e => setReviewData({...reviewData, feedback: e.target.value})} />
                <Select value={reviewData.status} onValueChange={(val: 'Approved' | 'Rejected') => setReviewData({...reviewData, status: val})}>
                    <SelectTrigger><SelectValue placeholder="Set status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Approved">Approve</SelectItem>
                        <SelectItem value="Rejected">Request Revisions</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsReviewWorkModalOpen(false)}>Cancel</Button>
                <Button onClick={handleReviewWork}>Submit Review</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default FreelancerWorkflow;
