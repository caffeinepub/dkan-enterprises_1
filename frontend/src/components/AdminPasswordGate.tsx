import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Shield, LogIn, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface AdminPasswordGateProps {
  onAuthenticated: () => void;
}

const ADMIN_PASSWORD = 'admin123';
const SESSION_KEY = 'admin_authenticated';

export default function AdminPasswordGate({ onAuthenticated }: AdminPasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);

  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isLoggingIn = loginStatus === 'logging-in';
  const isAuthenticated = !!identity;

  // Check session storage for password verification
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === 'true') {
      setPasswordVerified(true);
    }
  }, []);

  // Once both password verified AND identity present, call onAuthenticated
  useEffect(() => {
    if (passwordVerified && isAuthenticated) {
      onAuthenticated();
    }
  }, [passwordVerified, isAuthenticated, onAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setPasswordVerified(true);
      setError('');
    } else {
      setError('गलत पासवर्ड। कृपया पुनः प्रयास करें। / Wrong password. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      if (err?.message === 'User is already authenticated') {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    sessionStorage.removeItem(SESSION_KEY);
    setPasswordVerified(false);
    setPassword('');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Step 1: Password verification
  if (!passwordVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-navy-lg p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground text-center">Admin Access</h1>
              <p className="text-muted-foreground text-sm text-center mt-1">
                एडमिन पैनल में प्रवेश करें / Enter Admin Panel
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  पासवर्ड / Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 pr-12 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                जारी रखें / Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Internet Identity login (required for backend admin calls)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-navy-lg p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground text-center">Identity Verification</h1>
              <p className="text-muted-foreground text-sm text-center mt-2">
                बुकिंग देखने के लिए Internet Identity से लॉगिन करें।
              </p>
              <p className="text-muted-foreground text-xs text-center mt-1">
                Login with Internet Identity to access bookings and admin features.
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login with Internet Identity
                </>
              )}
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem(SESSION_KEY);
                setPasswordVerified(false);
              }}
              className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back / वापस जाएं
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Both verified — render nothing (parent will show dashboard)
  return null;
}
