import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowLeft, User, Bell, Palette, Lock, Award, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function Profile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "achievements">("profile");
  const [name, setName] = useState(user?.name || "");
  const [difficultyLevel, setDifficultyLevel] = useState<"beginner" | "intermediate" | "advanced">(
    (user?.difficultyLevel as any) || "beginner"
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled !== false);

  const updateProfileMutation = trpc.user.updateProfile.useMutation();
  const { data: achievements } = trpc.gamification.getAchievements.useQuery();

  const handleUpdateProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name,
        difficultyLevel,
        notificationsEnabled,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!user) {
    return <div>Redirecting...</div>;
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: SettingsIcon },
    { id: "achievements", label: "Achievements", icon: Award },
  ];

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
          <h1 className="text-2xl font-bold">Profile & Settings</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-muted">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div {...fadeInUp} className="space-y-6">
            <Card className="p-8">
              <h2 className="text-xl font-bold mb-6">Your Profile</h2>
              
              {/* Avatar */}
              <div className="mb-8">
                <p className="text-sm font-medium mb-4">Avatar</p>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Display Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="text-lg p-3"
                />
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  value={user.email || ""}
                  disabled
                  className="text-lg p-3 bg-muted"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-background rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Level</p>
                  <p className="text-2xl font-bold">{user.level}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">XP</p>
                  <p className="text-2xl font-bold">{user.xp}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Streak</p>
                  <p className="text-2xl font-bold">{user.currentStreak}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Best Streak</p>
                  <p className="text-2xl font-bold">{user.longestStreak}</p>
                </div>
              </div>

              <Button className="btn-primary" onClick={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
                Save Changes
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div {...fadeInUp} className="space-y-6">
            {/* Difficulty Level */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Learning Difficulty</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose your preferred difficulty level for exercises
              </p>
              <div className="space-y-3">
                {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                  <label key={level} className="flex items-center gap-3 p-3 border border-muted rounded-lg cursor-pointer hover:bg-background/50 transition-colors">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficultyLevel === level}
                      onChange={(e) => setDifficultyLevel(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium capitalize">{level}</p>
                      <p className="text-xs text-muted-foreground">
                        {level === "beginner" && "Perfect for getting started"}
                        {level === "intermediate" && "For intermediate learners"}
                        {level === "advanced" && "Challenge yourself with advanced words"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {/* Theme */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Theme</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                >
                  Current: {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark mode for comfortable learning
              </p>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Get reminders to practice</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    notificationsEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </Card>

            {/* Security */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Security</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your account is secured with OAuth authentication
              </p>
              <Button variant="outline">Change Password</Button>
            </Card>

            <Button className="btn-primary w-full" onClick={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
              Save Settings
            </Button>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <motion.div {...fadeInUp} className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Your Achievements</h2>
              {achievements && achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement: any, idx: number) => (
                    <motion.div
                      key={achievement.achievement.id}
                      {...fadeInUp}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 border border-muted rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="text-4xl mb-3">{achievement.achievement.icon}</div>
                      <h4 className="font-semibold mb-1">{achievement.achievement.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.achievement.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </span>
                        <span className="bg-xp-color/20 text-xp-color px-2 py-1 rounded">
                          +{achievement.achievement.xpReward} XP
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements unlocked yet. Start practicing to earn badges!</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
