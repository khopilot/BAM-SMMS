import { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Star,
  Trash,
  UserPlus,
  Filter,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

// Types
interface Freelancer {
  id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  avatar: string;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  hourlyRate: number;
  completedProjects: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  deadline: string;
  budget: number;
  assignedTo: string[];
  progress: number;
  priority: 'low' | 'medium' | 'high';
}

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string;
  status: 'to-do' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

// Mock Data
const mockFreelancers: Freelancer[] = [
  {
    id: 'f1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'Video Editor',
    skills: ['Premiere Pro', 'After Effects', 'Color Grading'],
    avatar: 'https://placehold.co/100/4763FF/FFFFFF?text=AJ',
    rating: 4.8,
    status: 'active',
    hourlyRate: 45,
    completedProjects: 23
  },
  {
    id: 'f2',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'Graphic Designer',
    skills: ['Photoshop', 'Illustrator', 'Branding'],
    avatar: 'https://placehold.co/100/FF4757/FFFFFF?text=SW',
    rating: 4.9,
    status: 'active',
    hourlyRate: 50,
    completedProjects: 31
  },
  {
    id: 'f3',
    name: 'Miguel Rodriguez',
    email: 'miguel@example.com',
    role: 'Content Writer',
    skills: ['Copywriting', 'SEO', 'Research'],
    avatar: 'https://placehold.co/100/FFD700/000000?text=MR',
    rating: 4.6,
    status: 'active',
    hourlyRate: 35,
    completedProjects: 18
  },
  {
    id: 'f4',
    name: 'Emily Chen',
    email: 'emily@example.com',
    role: 'Motion Designer',
    skills: ['After Effects', '3D Animation', 'Character Design'],
    avatar: 'https://placehold.co/100/4763FF/FFFFFF?text=EC',
    rating: 4.7,
    status: 'inactive',
    hourlyRate: 55,
    completedProjects: 27
  },
  {
    id: 'f5',
    name: 'David Kim',
    email: 'david@example.com',
    role: 'Video Editor',
    skills: ['Final Cut Pro', 'DaVinci Resolve', 'Sound Design'],
    avatar: 'https://placehold.co/100/FF4757/FFFFFF?text=DK',
    rating: 4.5,
    status: 'pending',
    hourlyRate: 40,
    completedProjects: 12
  }
];

const mockProjects: Project[] = [
  {
    id: 'p1',
    title: 'Q2 Marketing Campaign Videos',
    description: 'Create 5 promotional videos for our Q2 marketing campaign focusing on new product features.',
    status: 'in-progress',
    deadline: '2025-06-15',
    budget: 3500,
    assignedTo: ['f1', 'f4'],
    progress: 65,
    priority: 'high'
  },
  {
    id: 'p2',
    title: 'Website Redesign Assets',
    description: 'Design new graphics, icons, and visual elements for the upcoming website redesign.',
    status: 'review',
    deadline: '2025-06-10',
    budget: 2800,
    assignedTo: ['f2'],
    progress: 90,
    priority: 'medium'
  },
  {
    id: 'p3',
    title: 'Product Documentation Update',
    description: 'Revise and update all product documentation to reflect the latest features and improvements.',
    status: 'pending',
    deadline: '2025-06-30',
    budget: 1500,
    assignedTo: ['f3'],
    progress: 0,
    priority: 'low'
  },
  {
    id: 'p4',
    title: 'Social Media Content Calendar',
    description: 'Develop a content calendar and create assets for next month\'s social media campaigns.',
    status: 'completed',
    deadline: '2025-05-25',
    budget: 2000,
    assignedTo: ['f2', 'f3'],
    progress: 100,
    priority: 'medium'
  }
];

const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Edit product demo video',
    description: 'Edit the raw footage of the product demo into a 2-minute promotional video.',
    projectId: 'p1',
    assignedTo: 'f1',
    status: 'in-progress',
    dueDate: '2025-06-05',
    priority: 'high'
  },
  {
    id: 't2',
    title: 'Create motion graphics intro',
    description: 'Design and animate a 10-second intro for the campaign videos.',
    projectId: 'p1',
    assignedTo: 'f4',
    status: 'to-do',
    dueDate: '2025-06-08',
    priority: 'medium'
  },
  {
    id: 't3',
    title: 'Design new hero section',
    description: 'Create visuals for the website homepage hero section.',
    projectId: 'p2',
    assignedTo: 'f2',
    status: 'review',
    dueDate: '2025-06-03',
    priority: 'high'
  },
  {
    id: 't4',
    title: 'Write product feature descriptions',
    description: 'Write clear, concise descriptions for 5 new product features.',
    projectId: 'p3',
    assignedTo: 'f3',
    status: 'to-do',
    dueDate: '2025-06-20',
    priority: 'medium'
  }
];

// Main Component
const FreelancerWorkflow = () => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>(mockFreelancers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Filter freelancers based on search term and status filter
  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          freelancer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || freelancer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Filter projects based on search term and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Get tasks for a specific project
  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };
  
  // Get freelancer by ID
  const getFreelancerById = (id: string) => {
    return freelancers.find(freelancer => freelancer.id === id);
  };
  
  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    overdue: projects.filter(p => new Date(p.deadline) < new Date() && p.status !== 'completed').length
  };
  
  // Calculate freelancer statistics
  const freelancerStats = {
    total: freelancers.length,
    active: freelancers.filter(f => f.status === 'active').length,
    pending: freelancers.filter(f => f.status === 'pending').length
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Freelancer Workflow</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {projectStats.inProgress} in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Freelancers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{freelancerStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {freelancerStats.pending} pending approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{projectStats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Needs immediate attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(project => (
              <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProject(project)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge
                      variant={
                        project.status === 'completed' ? 'default' :
                        project.status === 'in-progress' ? 'secondary' :
                        project.status === 'review' ? 'outline' : 'destructive'
                      }
                    >
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {project.assignedTo.map(freelancerId => {
                          const freelancer = getFreelancerById(freelancerId);
                          return freelancer ? (
                            <Avatar key={freelancer.id} className="border-2 border-background h-8 w-8">
                              <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                              <AvatarFallback>{freelancer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                          ) : null;
                        })}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Freelancers Tab */}
        <TabsContent value="freelancers" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search freelancers..."
                className="w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Freelancer
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFreelancers.map(freelancer => (
                    <TableRow key={freelancer.id} className="cursor-pointer" onClick={() => setSelectedFreelancer(freelancer)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                            <AvatarFallback>{freelancer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{freelancer.name}</div>
                            <div className="text-xs text-muted-foreground">{freelancer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{freelancer.role}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {freelancer.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            freelancer.status === 'active' ? 'default' :
                            freelancer.status === 'inactive' ? 'secondary' : 'outline'
                          }
                        >
                          {freelancer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${freelancer.hourlyRate}/hr</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
                          <span>{freelancer.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Assign to Project</DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="to-do">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    const freelancer = getFreelancerById(task.assignedTo);
                    
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{task.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{project?.title || 'Unknown Project'}</TableCell>
                        <TableCell>
                          {freelancer && (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                                <AvatarFallback>{freelancer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span>{freelancer.name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.status === 'completed' ? 'default' :
                              task.status === 'in-progress' ? 'secondary' :
                              task.status === 'review' ? 'outline' : 'destructive'
                            }
                          >
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.priority === 'high' ? 'destructive' :
                              task.priority === 'medium' ? 'secondary' : 'outline'
                            }
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Task</DropdownMenuItem>
                              <DropdownMenuItem>Change Status</DropdownMenuItem>
                              <DropdownMenuItem>Reassign</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FreelancerWorkflow;
