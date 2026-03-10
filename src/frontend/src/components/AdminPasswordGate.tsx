import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Lock, LogIn, Shield } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useInitializeAdmin, usePromoteToAdmin } from "../hooks/useQueries";

interface AdminPasswordGateProps {
  onAuthenticated: () => void;
}

const ADMIN_PASSWORD = "admin123";
const SESSION_KEY = "admin_authenticated";

export default function AdminPasswordGate({
  onAuthenticated,
}: AdminPasswordGateProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStatus, setSetupStatus] = useState("");
  const hasInitialized = useRef(false);

  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const initializeAdmin = useInitializeAdmin();
  const promoteToAdmin = usePromoteToAdmin();

  const isLoggingIn = loginStatus === "logging-in";
  const isAuthenticated = !!identity;

  const onAuthenticatedRef = useRef(onAuthenticated);
  useEffect(() => {
    onAuthenticatedRef.current = onAuthenticated;
  });

  const stableOnAuthenticated = useCallback(() => {
    onAuthenticatedRef.current();
  }, []);

  // Check session storage for password verification
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === "true") {
      setPasswordVerified(true);
    }
  }, []);

  const initializeMutateRef = useRef(initializeAdmin.mutate);
  const promoteMutateRef = useRef(promoteToAdmin.mutate);
  useEffect(() => {
    initializeMutateRef.current = initializeAdmin.mutate;
  });
  useEffect(() => {
    promoteMutateRef.current = promoteToAdmin.mutate;
  });

  // Once both password verified AND identity present, initialize admin
  useEffect(() => {
    if (!passwordVerified || !isAuthenticated || hasInitialized.current) return;
    hasInitialized.current = true;
    setIsSettingUp(true);
    setSetupStatus("एडमिन एक्सेस सेट हो रहा है...");

    initializeMutateRef.current(ADMIN_PASSWORD, {
      onSettled: () => {
        setSetupStatus("एडमिन अधिकार जांच रहे हैं...");
        promoteMutateRef.current(ADMIN_PASSWORD, {
          onSettled: () => {
            setSetupStatus("तैयार हो रहा है...");
            setTimeout(() => {
              setIsSettingUp(false);
              stableOnAuthenticated();
            }, 1000);
          },
        });
      },
    });
  }, [passwordVerified, isAuthenticated, stableOnAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setPasswordVerified(true);
      setError("");
    } else {
      setError(
        "गलत पासवर्ड। कृपया पुनः प्रयास करें। / Wrong password. Please try again.",
      );
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message === "User is already authenticated") {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleBackToPassword = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setPasswordVerified(false);
    hasInitialized.current = false;
  };

  // Global initializing spinner
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

  // Setting up admin access after II login
  if (isSettingUp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-foreground font-medium text-sm">
            Setting up admin access...
          </p>
          <p className="text-muted-foreground text-xs">{setupStatus}</p>
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
              <h1 className="text-2xl font-bold text-foreground text-center">
                Admin Access
              </h1>
              <p className="text-muted-foreground text-sm text-center mt-1">
                एडमिन पैनल में प्रवेश करें / Enter Admin Panel
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  पासवर्ड / Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    data-ocid="admin.input"
                    type={showPassword ? "text" : "password"}
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
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
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
                data-ocid="admin.submit_button"
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
              <h1 className="text-2xl font-bold text-foreground text-center">
                Identity Verification
              </h1>
              <p className="text-muted-foreground text-sm text-center mt-2">
                बुकिंग देखने के लिए Internet Identity से लॉगिन करें।
              </p>
              <p className="text-muted-foreground text-xs text-center mt-1">
                Login with Internet Identity to access bookings and admin
                features.
              </p>
              <p className="mt-3 px-3 py-2 bg-primary/10 text-primary text-xs text-center rounded-lg font-medium">
                पहली बार लॉगिन पर आप स्वतः एडमिन बन जाएंगे।
                <br />
                On first login, you will automatically become admin.
              </p>
            </div>

            <button
              type="button"
              data-ocid="admin.login_button"
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
              type="button"
              onClick={handleBackToPassword}
              className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back / वापस जाएं
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Both verified and initialized — render nothing (parent will show dashboard)
  return null;
}
