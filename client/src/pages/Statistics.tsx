import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Target, Zap, Calendar } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from "recharts";
import { motion } from "framer-motion";

export default function Statistics() {
  const { user } = useAuth();
  const { data: accuracyTrend, isLoading: loadingTrend } = trpc.statistics.getAccuracyTrend.useQuery({ days: 30 });
  const { data: weakAreas, isLoading: loadingWeak } = trpc.statistics.getWeakAreas.useQuery();
  const { data: dashboardData } = trpc.dashboard.getStats.useQuery();
  const { data: heatmapData } = trpc.dashboard.getActivityHeatmap.useQuery({ days: 365 });

  if (!user) {
    return <div>Redirecting...</div>;
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  // Process heatmap data for calendar view
  const heatmapByMonth = heatmapData?.reduce((acc: any, item: any) => {
    const date = new Date(item.date);
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <div className="bg-card border-b border-muted sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Your Statistics</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Attempts",
              value: dashboardData?.stats?.totalAttempts || 0,
              icon: Target,
              color: "primary",
            },
            {
              label: "Overall Accuracy",
              value: `${parseFloat(dashboardData?.stats?.overallAccuracy as any)?.toFixed(1) || 0}%`,
              icon: TrendingUp,
              color: "success",
            },
            {
              label: "Words Mastered",
              value: dashboardData?.stats?.wordsMastered || 0,
              icon: Zap,
              color: "xp-color",
            },
            {
              label: "Sessions",
              value: dashboardData?.stats?.totalSessions || 0,
              icon: Calendar,
              color: "secondary",
            },
          ].map((stat, idx) => (
            <motion.div key={idx} {...fadeInUp} transition={{ delay: idx * 0.1 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Accuracy Trend Chart */}
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Accuracy Trend (30 Days)</h2>
            {loadingTrend ? (
              <Skeleton className="h-80" />
            ) : accuracyTrend && accuracyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={accuracyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", r: 4 }}
                    name="Accuracy %"
                  />
                  <Bar dataKey="attempts" fill="var(--secondary)" opacity={0.3} name="Attempts" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No data available yet. Start practicing to see your trends!
              </div>
            )}
          </Card>
        </motion.div>

        {/* Weak Areas */}
        <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Words to Focus On</h2>
            {loadingWeak ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : weakAreas && weakAreas.length > 0 ? (
              <div className="space-y-3">
                {weakAreas.map((word: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-background/80 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium mb-1">Word #{idx + 1}</p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                          style={{ width: `${word.accuracy}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-semibold">{word.accuracy.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">{word.attempts} attempts</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No weak areas identified yet. Keep practicing!
              </div>
            )}
          </Card>
        </motion.div>

        {/* Activity Heatmap */}
        <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Activity Heatmap (Last Year)</h2>
            {heatmapData && heatmapData.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(heatmapByMonth).map(([month, days]: any, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">{month}</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {days.map((day: any, dayIdx: number) => {
                        const intensity = Math.min(day.attempts / 10, 1);
                        return (
                          <div
                            key={dayIdx}
                            className="w-8 h-8 rounded border border-muted hover:border-primary transition-colors cursor-pointer"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8})`,
                            }}
                            title={`${day.date}: ${day.attempts} attempts`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No activity data available yet.
              </div>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
