// Update this page (the content is just a fallback if you fail to update the page)

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Kriti SmartHire</h1>
        <p className="text-xl text-muted-foreground">
          Please <Link to="/login" className="text-primary hover:underline">login</Link> or{' '}
          <Link to="/signup" className="text-primary hover:underline">sign up</Link> to continue.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Button variant="premium" size="lg" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
