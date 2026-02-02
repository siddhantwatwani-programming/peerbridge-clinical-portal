import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
        description: "Successfully authenticated. Redirecting to dashboard...",
      });
      setTimeout(() => navigate('/dashboard'), 500);
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'email' ? 'text-accent' : 'text-slate-400'}`} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter email address"
                  className="w-full h-12 pl-12 pr-4 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                    transition-all duration-200 hover:border-slate-300"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'password' ? 'text-accent' : 'text-slate-400'}`} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter password"
                  className="w-full h-12 pl-12 pr-12 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                    transition-all duration-200 hover:border-slate-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent transition-colors duration-200 p-1 rounded-full hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-accent transition-colors duration-200 relative group"
              >
                Forgot Password
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
              </button>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg shadow-lg shadow-accent/25 
                transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Login'
              )}
            </Button>

            {/* Request access */}
            <div className="text-center pt-2">
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-primary transition-colors duration-200 relative group"
              >
                Request Access
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            </div>
          </form>

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
