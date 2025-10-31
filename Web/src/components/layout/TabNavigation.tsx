import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Home, FileText, MessageSquare, Settings, ClipboardList, UserCheck, Shield, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TabNavigation() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const studentTabs = [
    { path: '/student/dashboard', label: 'Dashboard', icon: Home },
    { path: '/student/resume', label: 'Resume Builder', icon: FileText },
    { path: '/student/job-applications', label: 'Job Applications', icon: Briefcase },
    { path: '/student/settings', label: 'Settings', icon: Settings },
  ];

  const issuerTabs = [
    { path: '/issuer/dashboard', label: 'Dashboard', icon: Home },
    { path: '/issuer/issue', label: 'Issue Credential', icon: ClipboardList },
  ];

  const recruiterTabs = [
    { path: '/recruiter/dashboard', label: 'Dashboard', icon: Home },
    { path: '/recruiter/verify', label: 'Verify Credentials', icon: UserCheck },
  ];

  const authorityTabs = [
    { path: '/authorization', label: 'Authorization Dashboard', icon: Shield },
  ];

  let tabs = studentTabs;
  if (user.role === 'issuer_staff' || user.role === 'issuer_admin') {
    tabs = issuerTabs;
  } else if (user.role === 'recruiter') {
    tabs = recruiterTabs;
  } else if (user.role === 'authority') {
    tabs = authorityTabs;
  }

  return (
    <nav className="border-b border-border/50 glass-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
