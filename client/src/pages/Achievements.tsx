import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowLeft, Trophy, Lock, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: Date;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export default function Achievements() {
  const { user } = useAuth();
  const { data: achievements, isLoading } = trpc.gamification.getAchievements.useQuery();

  if (!user) {
    return <div>Redirecting...</div>;
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  const unlockedAchievements = achievements?.filter((a: any) => a.isUnlocked) || [];
  const lockedAchievements = achievements?.filter((a: any) => !a.isUnlocked) || [];

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
          <h1 className="text-2xl font-bold">Achievements</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* Stats */}
        <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unlocked</p>
                <p className="text-3xl font-bold">{unlockedAchievements.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-accent" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Locked</p>
                <p className="text-3xl font-bold">{lockedAchievements.length}</p>
              </div>
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total XP</p>
                <p className="text-3xl font-bold">
                  {unlockedAchievements.reduce((sum: number, a: any) => sum + (a.xpReward || 0), 0)}
                </p>
              </div>
              <Zap className="w-8 h-8 text-xp-color" />
            </div>
          </Card>
        </motion.div>

        {/* Unlocked Achievements */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-2xl font-bold mb-6">Unlocked Achievements</h2>
              {unlockedAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unlockedAchievements.map((achievement: any, idx: number) => (
                    <motion.div
                      key={achievement.id}
                      variants={itemVariants}
                    >
                      <Card className="p-6 h-full bg-gradient-to-br from-primary/10 to-secondary/10 hover:shadow-lg transition-shadow border border-primary/30">
                        <div className="text-5xl mb-3 text-center">{achievement.icon}</div>
                        <h3 className="font-bold text-lg mb-2 text-center">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </span>
                          <span className="bg-xp-color/20 text-xp-color px-3 py-1 rounded-full text-sm font-semibold">
                            +{achievement.xpReward} XP
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No achievements unlocked yet. Start practicing!</p>
                </Card>
              )}
            </motion.div>

            {/* Locked Achievements */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-2xl font-bold mb-6">Locked Achievements</h2>
              {lockedAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lockedAchievements.map((achievement: any) => (
                    <motion.div
                      key={achievement.id}
                      variants={itemVariants}
                    >
                      <Card className="p-6 h-full opacity-60 hover:opacity-80 transition-opacity">
                        <div className="text-5xl mb-3 text-center opacity-40">❓</div>
                        <h3 className="font-bold text-lg mb-2 text-center text-muted-foreground">
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                          {achievement.description}
                        </p>
                        {achievement.progress !== undefined && (
                          <div className="mb-4">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    (achievement.progress / achievement.maxProgress) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {achievement.progress} / {achievement.maxProgress}
                            </p>
                          </div>
                        )}
                        <div className="text-center">
                          <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-semibold">
                            +{achievement.xpReward} XP
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">You've unlocked all achievements! 🎉</p>
                </Card>
              )}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
