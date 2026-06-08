import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { toast } from "sonner";
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Flame, 
  Trophy, 
  TrendingUp 
} from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect to the home page instead of the dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  // tRPC Login Mutation - updated to reference trpc.auth and redirect to home (/)
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Successfully logged in!");
      // Hard refresh to load active session state on the home page
      window.location.href = "/";
    },
    onError: (err) => {
      toast.error(err.message || "Failed to log in. Please check your credentials.");
    },
  });

  // tRPC Register Mutation - updated to reference trpc.auth and redirect to home (/)
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Account created successfully!");
      // Hard refresh to load active session state on the home page
      window.location.href = "/";
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create account. Username or email may be taken.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegistering) {
      if (!username || !email || !password) {
        toast.error("Please fill out all fields.");
        return;
      }
      // Map the local "username" state to the "name" field expected by the server
      registerMutation.mutate({ name: username, email, password });
    } else {
      if (!email || !password) {
        toast.error("Please fill out all fields.");
        return;
      }
      loginMutation.mutate({ email, password });
    }
  };

  const isLoading = loginMutation.isLoading || registerMutation.isLoading;

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen bg-background">
      {/* Left side: Gamification Pitch (hidden on mobile) */}
      <div className="desktop-only w-1/2 flex-col justify-between bg-card p-12 border-r">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Sparkles className="h-6 w-6 animate-pulse-glow" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-gradient">
            SpellMind
          </span>
        </div>

        <div className="max-w-md my-auto space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">
            Level up your mind, one challenge at a time.
          </h1>
          <p className="text-muted-foreground">
            Embark on a personalized learning quest. Build habits, challenge your memory, and unlock achievements.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <span className="badge-streak">
                <Flame className="h-4 w-4" /> Streak
              </span>
              <p className="text-sm text-muted-foreground">Daily lessons to maintain your streak.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="badge-xp">
                <TrendingUp className="h-4 w-4" /> XP Gain
              </span>
              <p className="text-sm text-muted-foreground">Earn points on successful practices.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="badge-level">
                <Trophy className="h-4 w-4" /> Rank up
              </span>
              <p className="text-sm text-muted-foreground">Climb the leaderboard among your peers.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} SpellMind. All rights reserved.
        </p>
      </div>

      {/* Right side: Interactive Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-slideUp">
          <div className="text-center lg:text-left mb-8">
            <div className="mobile-only flex justify-center items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-semibold text-xl tracking-tight text-gradient">
                SpellMind
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              {isRegistering ? "Get Started" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isRegistering
                ? "Create an account to begin your learning journey"
                : "Sign in to resume your learning streak"}
            </p>
          </div>

          <div className="card-elevated p-6 space-y-6">
            {/* Tab Toggles */}
            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-md">
              <button
                type="button"
                className={`py-1.5 text-sm font-semibold rounded-sm transition-all ${
                  !isRegistering
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  setIsRegistering(false);
                  setEmail("");
                  setPassword("");
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`py-1.5 text-sm font-semibold rounded-sm transition-all ${
                  isRegistering
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  setIsRegistering(true);
                  setEmail("");
                  setUsername("");
                  setPassword("");
                }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field (Registration Only) */}
              {isRegistering && (
                <div className="space-y-1">
                  <label htmlFor="username" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      id="username"
                      type="text"
                      required
                      placeholder="spellcrafter"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-md border bg-input py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-md border bg-input py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-md border bg-input py-2 pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-2.5 px-4 rounded-md text-sm font-semibold flex items-center justify-center gap-2 hover-lift cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    {isRegistering ? "Create Account" : "Sign In"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}