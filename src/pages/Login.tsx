import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PeerbridgeLogo } from '@/components/PeerbridgeLogo';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock authentication
    if (email === 'admin' && password === 'admin') {
      toast({
        title: "Welcome back, Dr. Admin",
        description: "Successfully authenticated. Redirecting to dashboard...",
      });
      setTimeout(() => navigate('/dashboard'), 500);
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid clinical credentials. Please verify your email and password.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* ECG line decoration */}
        <svg 
          className="absolute top-1/4 left-0 w-full h-32 opacity-5"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 L200,50 L220,50 L240,20 L260,80 L280,30 L300,70 L320,50 L400,50 L420,50 L440,10 L460,90 L480,40 L500,60 L520,50 L700,50 L720,50 L740,25 L760,75 L780,35 L800,65 L820,50 L1000,50 L1020,50 L1040,15 L1060,85 L1080,45 L1100,55 L1120,50 L1200,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary ecg-line"
          />
        </svg>
        
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative">
        <div className="bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
          {/* Header with logo */}
          <div className="p-8 pb-6 text-center">
            <div className="flex justify-center mb-6">
              <PeerbridgeLogo size="lg" />
            </div>
            
            {/* Orange accent line */}
            <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="input-medical w-full pl-12"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-medical w-full pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Forgot Password
              </button>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              Login
            </Button>

            {/* Request access */}
            <div className="text-center pt-2">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Request Access
              </button>
            </div>
          </form>

          {/* HIPAA Badge */}
          <div className="px-8 pb-6">
            <div className="trust-badge justify-center w-full">
              <Shield className="h-4 w-4" />
              <span>HIPAA Compliant Session</span>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by enterprise-grade security. All sessions are encrypted.
        </p>
      </div>
    </div>
  );
};

export default Login;
