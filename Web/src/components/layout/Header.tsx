import { Link } from 'react-router-dom';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/kriti-logo.png';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={isLoggedIn ? "/" : "/home"} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img src={logoImage} alt="Kriti Career Passport" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <div className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                KRITI
              </div>
              <div className="text-xs text-muted-foreground -mt-1">HireForge</div>
            </div>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Navigation Links */}
            {!isLoggedIn && (
              <div className="hidden md:flex items-center space-x-4 mr-4">
                <Button variant="ghost" asChild>
                  <Link to="/pricing/student">Student Pricing</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/pricing/recruiter">Recruiter Pricing</Link>
                </Button>
              </div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu */}
            {isLoggedIn && user ? (
              <div className="flex items-center space-x-2 ml-2">
                <Button variant="ghost" asChild>
                  <Link to="/subscription">Billing</Link>
                </Button>
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 glass-card rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="premium" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
