import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowLeft, Trophy, Medal, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

type LeaderboardPeriod = "all_time" | "monthly" | "weekly";

export default function Leaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>("all_time");
  
  const { data: leaderboardData, isLoading } = trpc.gamification.getLeaderboard.useQuery({ period, limit: 100 });
  const { data: userRank } = trpc.gamification.getUserRank.useQuery({ period });

  if (!user) {
    return <div>Redirecting...</div>;
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  const getMedalIcon = (rank: number | undefined) => {
    if (!rank) return null;
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <div className="bg-card border-b border-muted sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Global Leaderboard</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Period Selector */}
        <div className="flex gap-3">
          {(["all_time", "monthly", "weekly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg border transition-all font-medium ${
                period === p
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              {p === "all_time" ? "All Time" : p === "monthly" ? "This Month" : "This Week"}
            </button>
          ))}
        </div>

        {/* Your Rank */}
        {userRank && (
          <motion.div {...fadeInUp}>
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Rank</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-primary">#{userRank.rank || "—"}</span>
                    <div>
                      <p className="font-semibold">{user.name || "You"}</p>
                      <p className="text-sm text-muted-foreground">{userRank.xp} XP</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-2">Level</p>
                  <p className="text-4xl font-bold text-secondary">{userRank.level}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : leaderboardData && leaderboardData.length > 0 ? (
              <div className="divide-y divide-border">
                {leaderboardData.map((entry: any, idx: number) => {
                  const isCurrentUser = entry.user.id === user.id;
                  return (
                    <motion.div
                      key={entry.user.id}
                      {...fadeInUp}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 flex items-center justify-between hover:bg-background/50 transition-colors ${
                        isCurrentUser ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Rank */}
                        <div className="w-12 text-center">
                          {getMedalIcon(entry.rank) || (
                            <span className="text-lg font-bold text-muted-foreground">
                              #{entry.rank}
                            </span>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                            {entry.user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {entry.user.name || "Anonymous"}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                          </div>
                        </div>
                      </div>

                      {/* XP */}
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Zap className="w-4 h-4 text-xp-color" />
                          <span className="font-bold text-lg">{entry.xp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No leaderboard data available yet.
              </div>
            )}
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <Card className="p-6 bg-accent/5 border-accent/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Tips to Climb the Leaderboard
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Practice consistently to build your streak</li>
              <li>• Aim for high accuracy to earn more XP</li>
              <li>• Complete daily missions for bonus points</li>
              <li>• Master difficult words for extra rewards</li>
            </ul>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
