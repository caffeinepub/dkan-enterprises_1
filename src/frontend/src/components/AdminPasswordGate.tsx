import { Eye, EyeOff, Lock } from "lucide-react";
import type React from "react";
import { useState } from "react";

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

  // Check existing session
  const storedSession =
    typeof window !== "undefined" ? sessionStorage.getItem(SESSION_KEY) : null;
  if (storedSession === "true") {
    // Already authenticated in this session
    onAuthenticated();
    return null;
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setError("");
      onAuthenticated();
    } else {
      setError(
        "गलत पासवर्ड। कृपया पुनः प्रयास करें। / Wrong password. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
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
              Admin Panel खोलें / Open Admin Panel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
