import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSite } from '@/contexts/SiteContext';
import peerbridgeLogo from '@/assets/peerbridge-logo.jpg';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
  const { enableDemoMode } = useSite();

  const handleDemoMode = () => {
    enableDemoMode?.();
    toast({
      title: "Demo Mode Activated",
      description: "Exploring with sample clinical sites.",
    });
    navigate('/select-site', { replace: true });
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/select-site', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Hardcoded credential check
    if (email === 'admin@pbh.com' && password === 'admin@1234') {
      toast({
        title: "Welcome back!",
        description: "Successfully authenticated.",
      });
      navigate('/select-site', { replace: true });
      setIsLoading(false);
      return;
    }

    // If credentials don't match, show error
    toast({
      variant: "destructive",
      title: "Authentication Failed",
      description: "Invalid email or password.",
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        {/* Grid dots */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden">
          {/* Header */}
          <div className="pt-10 pb-6 px-8 text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={peerbridgeLogo} 
                alt="Peerbridge Health" 
                className="h-14 object-contain"
              />
            </div>
            <div className="h-0.5 w-16 mx-auto bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="signin-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'transform scale-[1.01]' : ''}`}>
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${focusedField === 'email' ? 'text-accent' : 'text-muted-foreground'}`} />
                  <input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="demo@peerbridge.health"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/60 
                      focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
                      transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signin-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'transform scale-[1.01]' : ''}`}>
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${focusedField === 'password' ? 'text-accent' : 'text-muted-foreground'}`} />
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter password"
                    className="w-full h-12 pl-12 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/60 
                      focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
                      transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors duration-200 p-1 rounded-lg hover:bg-muted"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-accent transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl shadow-lg shadow-accent/20 
                  transition-all duration-300 hover:shadow-xl hover:shadow-accent/25 hover:-translate-y-0.5 active:translate-y-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>

          <div className="px-8 pb-6">
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-success/5 border border-success/10 text-success text-xs font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span>HIPAA Compliant Session</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
          Protected by enterprise-grade encryption. All sessions secured.
        </p>
      </div>
    </div>
  );
};

export default Login;
