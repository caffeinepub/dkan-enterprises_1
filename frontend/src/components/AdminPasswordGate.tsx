import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const ADMIN_PASSWORD = 'admin123';
const SESSION_KEY = 'dkan_admin_auth';

interface AdminPasswordGateProps {
  children: React.ReactNode;
}

export default function AdminPasswordGate({ children }: AdminPasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError('');

    setTimeout(() => {
      if (password.trim() === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setIsAuthenticated(true);
      } else {
        setError('गलत पासवर्ड। फिर कोशिश करें। / Incorrect password. Please try again.');
        setPassword('');
      }
      setIsChecking(false);
    }, 400);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setPassword('');
    setError('');
  };

  if (isAuthenticated) {
    return (
      <div>
        <div className="bg-navy text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-electric-green" />
            <span className="text-electric-green font-semibold">Admin Mode</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-300 hover:text-white hover:bg-navy-light text-xs"
          >
            लॉगआउट / Logout
          </Button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-navy-lg">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center shadow-navy-lg">
              <Lock className="w-8 h-8 text-electric-green" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-foreground mb-2">
              एडमिन डैशबोर्ड
            </h1>
            <p className="text-muted-foreground text-sm">
              Admin Dashboard — DKAN Enterprises
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="font-semibold text-foreground">
                व्यवस्थापक पासवर्ड / Admin Password
              </Label>
              <div className="relative">
                <Input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="पासवर्ड दर्ज करें / Enter password"
                  className={`pr-10 ${error ? 'border-destructive' : ''}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-destructive text-xs">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isChecking || !password.trim()}
              className="w-full bg-navy hover:bg-navy-mid text-white font-bold py-3 rounded-xl"
            >
              {isChecking ? 'जांच हो रही है...' : 'लॉगिन करें / Login'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            केवल अधिकृत व्यक्तियों के लिए / Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
