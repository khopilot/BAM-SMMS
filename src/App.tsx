import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import {
  Video,
  Brain,
  BarChart3,
  Palette,
  Users,
  FolderOpen,
  Home,
  Menu,
  X,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import VideoManagement from './components/VideoManagement';
import ContentAssistant from './components/ContentAssistant';
import Analytics from './components/Analytics';
import BrandIdentity from './components/BrandIdentity';
import FreelancerWorkflow from './components/FreelancerWorkflow';
import AssetLibrary from './components/AssetLibrary';

// Placeholder components for each route
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Videos</h2>
        <p className="text-muted-foreground">No videos uploaded yet</p>
      </div>
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Performance</h2>
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        <p className="text-muted-foreground">No pending tasks</p>
      </div>
    </div>
  </div>
);

// Main layout component with sidebar
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { path: "/videos", label: "Video Management", icon: <Video className="h-5 w-5" /> },
    { path: "/content-assistant", label: "Content Assistant", icon: <Brain className="h-5 w-5" /> },
    { path: "/analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { path: "/brand", label: "Brand Identity", icon: <Palette className="h-5 w-5" /> },
    { path: "/freelancers", label: "Freelancer Workflow", icon: <Users className="h-5 w-5" /> },
    { path: "/assets", label: "Asset Library", icon: <FolderOpen className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-background"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-primary-foreground transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <div className="bg-accent text-accent-foreground w-8 h-8 rounded-md flex items-center justify-center font-bold">B</div>
              <h1 className="text-2xl font-bold text-primary-foreground">BAM</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center px-4 py-3 text-sm rounded-md hover:bg-secondary transition-colors"
                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-start px-4 py-2 text-sm text-primary-foreground hover:bg-secondary transition-colors">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">BA</AvatarFallback>
                  </Avatar>
                  <span>BAM Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <main className="h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/videos" element={<VideoManagement />} />
          <Route path="/content-assistant" element={<ContentAssistant />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/brand" element={<BrandIdentity />} />
          <Route path="/freelancers" element={<FreelancerWorkflow />} />
          <Route path="/assets" element={<AssetLibrary />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;