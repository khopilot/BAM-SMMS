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
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';
import VideoManagement from './components/VideoManagement';
import ContentAssistant from './components/ContentAssistant';
import Analytics from './components/Analytics';
import BrandIdentity from './components/BrandIdentity';
import FreelancerWorkflow from './components/FreelancerWorkflow';
import AssetLibrary from './components/AssetLibrary';

// Dashboard Component - Fully Responsive
const Dashboard = () => (
  <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
    {/* Header - Responsive */}
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
      <img 
        src="/bam-logo.svg" 
        alt="BAM Logo" 
        className="h-12 sm:h-14 md:h-16 w-auto" 
      />
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Welcome to BAM APP</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Your comprehensive Social Media Management Tool</p>
      </div>
    </div>
    
    {/* Cards Grid - Responsive */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-primary">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center">
          <Video className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary flex-shrink-0" />
          <span className="truncate">Video Management</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">Create content optimized for TikTok (9:16) and YouTube (16:9)</p>
      </div>
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-secondary">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-secondary flex-shrink-0" />
          <span className="truncate">Analytics Dashboard</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">Track performance across all your social media platforms</p>
      </div>
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-accent sm:col-span-2 xl:col-span-1">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center">
          <Palette className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-accent flex-shrink-0" />
          <span className="truncate">Brand Identity</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">Maintain consistent branding with BAM's color palette</p>
      </div>
    </div>
  </div>
);

// Navigation Items
const navItems = [
  { path: "/", label: "Dashboard", icon: <Home className="h-4 w-4 sm:h-5 sm:w-5" /> },
  { path: "/videos", label: "Video Management", icon: <Video className="h-4 w-4 sm:h-5 sm:w-5" /> },
  { path: "/content-assistant", label: "Content Assistant", icon: <Brain className="h-4 w-4 sm:h-5 sm:w-5" /> },
  { path: "/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" /> },
  { path: "/brand", label: "Brand Identity", icon: <Palette className="h-4 w-4 sm:h-5 sm:w-5" /> },
  { path: "/freelancers", label: "Freelancer Workflow", icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" /> },
  { path: "/assets", label: "Asset Library", icon: <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5" /> },
];

// Sidebar Content Component
const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="flex items-center justify-center h-14 sm:h-16 border-b border-sidebar-border px-4">
      <div className="flex items-center space-x-2">
        <img src="/bam-icon.svg" alt="BAM Logo" className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-foreground truncate">BAM APP</h1>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto py-2 sm:py-4">
      <ul className="space-y-1 px-2 sm:px-3">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className="flex items-center px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-md hover:bg-secondary transition-colors"
              onClick={onNavigate}
            >
              <span className="mr-2 sm:mr-3 flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>

    {/* User profile */}
    <div className="p-3 sm:p-4 border-t border-sidebar-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full flex items-center justify-start px-3 sm:px-4 py-2 text-sm text-primary-foreground hover:bg-secondary transition-colors">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mr-2 flex-shrink-0">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs sm:text-sm">BA</AvatarFallback>
            </Avatar>
            <span className="truncate">BAM Admin</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 sm:w-56">
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
);

// Main Layout Component - 100% Responsive
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-primary text-primary-foreground">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-3 left-3 z-50 bg-background shadow-md"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-primary text-primary-foreground">
          <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 xl:ml-72">
        <main className="h-full overflow-y-auto">
          <div className="pt-12 lg:pt-0">
            {children}
          </div>
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