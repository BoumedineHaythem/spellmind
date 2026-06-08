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
  const [, navigate] = useLocation();

  const { data: dashboardData, isLoading } = trpc.dashboard.getStats.useQuery();

  if (!user) {
    return <div>Redirecting...</div>;
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-muted transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-muted flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">SpellMind</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-muted">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-background p-2 rounded">
                <p className="text-muted-foreground text-xs">Level</p>
                <p className="font-bold text-lg">{dashboardData?.level || 1}</p>
              </div>
              <div className="bg-background p-2 rounded">
                <p className="text-muted-foreground text-xs">XP</p>
                <p className="font-bold text-lg">{dashboardData?.xp || 0}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-muted">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-muted px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground">
            Welcome back, {user.name?.split(' ')[0] || 'Learner'}!
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </>
              ) : (
                <>
                  {/* Streak */}
                  <motion.div {...fadeInUp}>
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
                        <Flame className="w-5 h-5 text-streak-color" />
                      </div>
                      <div className="text-3xl font-bold">{dashboardData?.currentStreak || 0}</div>
                      <p className="text-xs text-muted-foreground mt-2">days in a row</p>
                    </Card>
                  </motion.div>

                  {/* XP Progress */}
                  <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">XP Progress</h3>
                        <Zap className="w-5 h-5 text-xp-color" />
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold">{dashboardData?.xp || 0}</span>
                          <span className="text-xs text-muted-foreground">/ {(dashboardData?.level || 1) * 1000}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-xp-color to-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(((dashboardData?.xp || 0) / ((dashboardData?.level || 1) * 1000)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">to next level</p>
                    </Card>
                  </motion.div>

                  {/* Level */}
                  <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Level</h3>
                        <Award className="w-5 h-5 text-level-color" />
                      </div>
                      <div className="text-3xl font-bold">{dashboardData?.level || 1}</div>
                      <p className="text-xs text-muted-foreground mt-2">keep practicing!</p>
                    </Card>
                  </motion.div>

                  {/* Accuracy */}
                  <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Accuracy</h3>
                        <TrendingUp className="w-5 h-5 text-success" />
                      </div>
                      <div className="text-3xl font-bold">{parseFloat(dashboardData?.stats?.overallAccuracy as any)?.toFixed(1) || 0}%</div>
                      <p className="text-xs text-muted-foreground mt-2">overall accuracy</p>
                    </Card>
                  </motion.div>
                </>
              )}
            </div>

            {/* Quick Start Section */}
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Ready to Practice?</h2>
                  <Link href="/practice">
                    <Button className="btn-primary">
                      Start Practice
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                <p className="text-muted-foreground">
                  Continue your learning journey with personalized exercises tailored to your level.
                </p>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : dashboardData?.recentSessions && dashboardData.recentSessions.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentSessions.map((session: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Practice Session</p>
                            <p className="text-sm text-muted-foreground">
                              {session.accuracy?.toFixed(1)}% accuracy • {session.totalAttempts} attempts
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-xp-color">+{session.xpEarned} XP</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No practice sessions yet</p>
                    <Link href="/practice">
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Start Your First Session
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
