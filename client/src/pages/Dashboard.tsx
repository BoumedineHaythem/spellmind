import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { 
  Flame, Zap, TrendingUp, Award, BarChart3, User, Settings, LogOut, Menu, X,
  Home, BookOpen, Trophy, Calendar, ChevronRight, Plus, Award as AwardIcon
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, navigate] = useLocation();

  const { data: dashboardData, isLoading } = trpc.dashboard.getStats.useQuery();

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse text-sm">Redirecting...</p>
      </div>
    );
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.05,
      }
    }
  };

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Practice", href: "/practice" },
    { icon: BarChart3, label: "Statistics", href: "/statistics" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
    { icon: AwardIcon, label: "Achievements", href: "/achievements" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-muted/50 transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-md shadow-primary/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              SpellMind
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-muted/80 text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Quick Overview */}
        <div className="p-6 border-b border-muted/40 bg-muted/10">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate leading-tight">{user.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-card border border-muted/60 p-2.5 rounded-lg">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider leading-none mb-1">Level</p>
              <p className="font-extrabold text-foreground text-base">{dashboardData?.level || 1}</p>
            </div>
            <div className="bg-card border border-muted/60 p-2.5 rounded-lg">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider leading-none mb-1">XP Points</p>
              <p className="font-extrabold text-foreground text-base">{dashboardData?.xp || 0}</p>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar Area */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary pl-3.5 font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className={`w-4.5 h-4.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-muted/40">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Navigation Bar */}
        <header className="bg-card border-b border-muted/40 px-6 py-4 flex items-center justify-between shadow-sm z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/80 text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="text-xs sm:text-sm font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-muted/60">
            Welcome back, <span className="font-semibold text-foreground">{user.name?.split(" ")[0] || "Learner"}</span>!
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-background to-muted/20">
          <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="max-w-5xl mx-auto space-y-6"
          >
            {/* Stats Metric Panel Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </>
              ) : (
                <>
                  {/* Metric: Daily Streak */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-5 hover:shadow-md hover:border-orange-500/30 transition-all duration-300 relative overflow-hidden group border-t-2 border-t-orange-500">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-orange-500/10 transition-colors" />
                      <div className="flex items-center justify-between mb-3.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Streak</h3>
                        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                          <Flame className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold tracking-tight">{dashboardData?.currentStreak || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1.5">consecutive active days</p>
                    </Card>
                  </motion.div>

                  {/* Metric: Current Level Progression */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-5 hover:shadow-md hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden group border-t-2 border-t-violet-500">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-violet-500/10 transition-colors" />
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience</h3>
                        <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
                          <Zap className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-3xl font-extrabold tracking-tight">{dashboardData?.xp || 0}</span>
                          <span className="text-xs font-semibold text-muted-foreground">/ {(dashboardData?.level || 1) * 1000} XP</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(((dashboardData?.xp || 0) / ((dashboardData?.level || 1) * 1000)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">remaining until level-up</p>
                    </Card>
                  </motion.div>

                  {/* Metric: Mastery Level */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-5 hover:shadow-md hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden group border-t-2 border-t-blue-500">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-blue-500/10 transition-colors" />
                      <div className="flex items-center justify-between mb-3.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level</h3>
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                          <Award className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold tracking-tight">{dashboardData?.level || 1}</div>
                      <p className="text-xs text-muted-foreground mt-1.5">current rank level</p>
                    </Card>
                  </motion.div>

                  {/* Metric: Historical Accuracy */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-5 hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group border-t-2 border-t-emerald-500">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/10 transition-colors" />
                      <div className="flex items-center justify-between mb-3.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Accuracy</h3>
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                          <TrendingUp className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold tracking-tight">
                        {parseFloat(dashboardData?.stats?.overallAccuracy as any)?.toFixed(1) || "0.0"}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">lifetime spelling accuracy</p>
                    </Card>
                  </motion.div>
                </>
              )}
            </div>

            {/* Banner Area: Action Quick Start */}
            <motion.div variants={fadeInUp}>
              <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-r from-primary/10 via-indigo-500/5 to-transparent p-6 sm:p-8 rounded-2xl shadow-sm">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2 max-w-lg">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                      Ready to build vocabulary?
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Practice makes perfect. Jump directly back into standard or adaptive spelling exercises built to improve phonetic recognition.
                    </p>
                  </div>
                  <Link href="/practice">
                    <Button size="lg" className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-semibold gap-2 w-full sm:w-auto h-12 px-6">
                      Start Session
                      <ChevronRight className="w-4.5 h-4.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* List Block: Recent Sessions */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 rounded-2xl border border-muted/50">
                <h2 className="text-lg font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
                  Recent Performance Sessions
                </h2>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-xl" />
                    ))}
                  </div>
                ) : dashboardData?.recentSessions && dashboardData.recentSessions.length > 0 ? (
                  <div className="divide-y divide-muted/50">
                    {dashboardData.recentSessions.map((session: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-muted/60 border border-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm leading-snug">Practice Session Completed</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              <span className="font-medium text-foreground">{session.accuracy?.toFixed(1)}% accuracy</span>
                              <span className="mx-1.5 text-muted-foreground/50">•</span>
                              <span>{session.totalAttempts} unique spelling attempts</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 font-bold text-sm text-violet-500 bg-violet-500/10 px-2.5 py-0.5 rounded-full">
                            +{session.xpEarned} XP
                          </span>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-1">
                            {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-muted rounded-xl bg-muted/10">
                    <p className="text-sm text-muted-foreground mb-4">No completed sessions found in this block</p>
                    <Link href="/practice">
                      <Button variant="outline" size="sm" className="font-semibold">
                        <Plus className="w-4 h-4 mr-1.5" />
                        First Practice Run
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm md:hidden z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}