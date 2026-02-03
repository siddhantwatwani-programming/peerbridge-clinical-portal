import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import peerbridgeLogo from '@/assets/peerbridge-logo.jpg';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if already authenticated on initial page load
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/select-site', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: error,
        });
        setIsLoading(false);
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully authenticated.",
        });
        // Navigate to site selection page
        setIsLoading(false);
        navigate('/select-site', { replace: true });
      }
    } catch (err) {
      console.error('Sign in error:', err);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "An unexpected error occurred",
      });
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error,
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Account created!",
        description: "You can now sign in with your credentials.",
      });
      setActiveTab('signin');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated ECG background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Left ECG line */}
        <svg 
          className="absolute top-1/2 -translate-y-1/2 left-0 w-1/3 h-40 opacity-[0.15]"
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 L80,50 L100,50 L120,20 L140,80 L160,30 L180,70 L200,50 L280,50 L300,50 L320,15 L340,85 L360,40 L380,60 L400,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent animate-pulse"
          />
        </svg>
        
        {/* Right ECG line */}
        <svg 
          className="absolute top-1/2 -translate-y-1/2 right-0 w-1/3 h-40 opacity-[0.15]"
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 L80,50 L100,50 L120,25 L140,75 L160,35 L180,65 L200,50 L280,50 L300,50 L320,20 L340,80 L360,45 L380,55 L400,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </svg>

        {/* Subtle gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Header with logo */}
          <div className="pt-10 pb-6 px-8 text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={peerbridgeLogo} 
                alt="Peerbridge Health" 
                className="h-16 object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
            
            {/* Orange accent line with gradient */}
            <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')} className="px-8 pb-8">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-5">
                {/* Email field */}
                <div className="space-y-2">
                  <label htmlFor="signin-email" className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'email' ? 'text-accent' : 'text-muted-foreground'}`} />
                    <input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="demo@peerbridge.health"
                      className="w-full h-12 pl-12 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground 
                        focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                        transition-all duration-200 hover:border-muted-foreground/50"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label htmlFor="signin-password" className="text-sm font-medium text-muted-foreground">
                    Password
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'password' ? 'text-accent' : 'text-muted-foreground'}`} />
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter password"
                      className="w-full h-12 pl-12 pr-12 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground 
                        focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                        transition-all duration-200 hover:border-muted-foreground/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors duration-200 p-1 rounded-full hover:bg-muted"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 relative group"
                  >
                    Forgot Password
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                  </button>
                </div>

                {/* Login button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg shadow-lg shadow-accent/25 
                    transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-5">
                {/* Full Name field */}
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'name' ? 'transform scale-[1.02]' : ''}`}>
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'name' ? 'text-accent' : 'text-muted-foreground'}`} />
                    <input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Dr. John Smith"
                      className="w-full h-12 pl-12 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground 
                        focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                        transition-all duration-200 hover:border-muted-foreground/50"
                      required
                    />
                  </div>
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'signup-email' ? 'transform scale-[1.02]' : ''}`}>
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'signup-email' ? 'text-accent' : 'text-muted-foreground'}`} />
                    <input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('signup-email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="demo@peerbridge.health"
                      className="w-full h-12 pl-12 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground 
                        focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                        transition-all duration-200 hover:border-muted-foreground/50"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium text-muted-foreground">
                    Password
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'signup-password' ? 'transform scale-[1.02]' : ''}`}>
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'signup-password' ? 'text-accent' : 'text-muted-foreground'}`} />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('signup-password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Min 6 characters"
                      className="w-full h-12 pl-12 pr-12 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground 
                        focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                        transition-all duration-200 hover:border-muted-foreground/50"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors duration-200 p-1 rounded-full hover:bg-muted"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Sign Up button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg shadow-lg shadow-accent/25 
                    transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* HIPAA Badge */}
          <div className="px-8 pb-8">
            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 text-sm font-medium transition-all duration-200 hover:bg-emerald-50 hover:border-emerald-300">
              <Shield className="h-4 w-4" />
              <span>HIPAA Compliant Session</span>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Protected by enterprise-grade security. All sessions are encrypted.
        </p>
      </div>

    </div>
  );
};

export default Login;
