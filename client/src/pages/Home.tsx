import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Zap, Brain, TrendingUp, Award, Users, Sparkles, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    viewport: { once: true },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-muted">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">SpellMind AI</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="default">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="outline">Sign In</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button className="btn-primary">Get Started</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="space-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none" />
        <div className="container relative">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">AI-Powered Learning</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">
              Master Spelling with AI
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              SpellMind AI combines adaptive learning, gamification, and artificial intelligence to help you master spelling in any language. Practice smarter, improve faster, stay motivated.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href={getLoginUrl()}>
                <Button size="lg" className="btn-primary w-full sm:w-auto">
                  Start Free Trial
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>50K+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span>2.5x Faster Learning</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-section">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to become a spelling master
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered Hints",
                description: "Get intelligent hints and explanations powered by advanced AI",
              },
              {
                icon: Zap,
                title: "Adaptive Learning",
                description: "Personalized exercises that adjust to your skill level",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description: "Detailed analytics showing your improvement over time",
              },
              {
                icon: Award,
                title: "Gamification",
                description: "Earn XP, unlock badges, and climb the leaderboard",
              },
              {
                icon: Users,
                title: "Global Community",
                description: "Compete with learners worldwide and stay motivated",
              },
              {
                icon: Sparkles,
                title: "Multiple Exercise Types",
                description: "Type, fill-in-the-blank, audio, and multiple choice",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg hover:border-primary/50 transition-all hover-lift">
                  <feature.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-section bg-card/50">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to spelling mastery
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Practice",
                description: "Start with adaptive exercises tailored to your level",
              },
              {
                step: "2",
                title: "Learn",
                description: "Get AI-powered hints and detailed explanations",
              },
              {
                step: "3",
                title: "Master",
                description: "Track progress and celebrate achievements with rewards",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-primary/30">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="space-section">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your learning goals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for getting started",
                features: [
                  "50 words per month",
                  "Basic exercises",
                  "Progress tracking",
                  "Community access",
                ],
                cta: "Get Started",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$9.99",
                period: "/month",
                description: "For serious learners",
                features: [
                  "Unlimited words",
                  "All exercise types",
                  "AI hints & explanations",
                  "Advanced analytics",
                  "Custom word lists",
                  "Priority support",
                ],
                cta: "Start Free Trial",
                highlighted: true,
              },
              {
                name: "Team",
                price: "$49.99",
                period: "/month",
                description: "For educators & teams",
                features: [
                  "Everything in Pro",
                  "Up to 50 users",
                  "Class management",
                  "Performance reports",
                  "Custom curriculum",
                  "Dedicated support",
                ],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className={`p-8 h-full flex flex-col transition-all ${
                    plan.highlighted
                      ? "border-primary/50 shadow-lg scale-105"
                      : "hover:shadow-md"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold w-fit">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-success" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={getLoginUrl()}>
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </a>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="space-section bg-card/50">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Learners</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our community has to say
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Chen",
                role: "Student",
                content: "SpellMind AI helped me improve my spelling from 65% to 95% in just 3 months. The AI hints are incredibly helpful!",
                avatar: "SC",
              },
              {
                name: "Marcus Johnson",
                role: "English Teacher",
                content: "I use SpellMind with my students and the results are amazing. They're actually excited about practicing spelling now.",
                avatar: "MJ",
              },
              {
                name: "Elena Rodriguez",
                role: "Language Learner",
                content: "As a non-native speaker, this app has been a game-changer. The gamification keeps me motivated every single day.",
                avatar: "ER",
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-accent text-accent"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-section">
        <div className="container max-w-3xl">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "Is SpellMind AI free?",
                a: "Yes! We offer a free plan with 50 words per month. Upgrade to Pro for unlimited access and advanced features.",
              },
              {
                q: "What languages are supported?",
                a: "We currently support English, Spanish, French, German, and more. New languages are added regularly.",
              },
              {
                q: "How does the AI work?",
                a: "Our AI analyzes your mistakes, learning patterns, and progress to provide personalized hints and explanations.",
              },
              {
                q: "Can I use this for teaching?",
                a: "Absolutely! Our Team plan is designed for educators with class management, performance reports, and more.",
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-6">
                  <h4 className="font-semibold mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground">{faq.a}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="space-section bg-gradient-to-r from-primary/10 to-secondary/10 border-t border-b border-muted">
        <div className="container">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Master Spelling?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of learners improving their spelling skills every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={getLoginUrl()}>
                <Button size="lg" className="btn-primary w-full sm:w-auto">
                  Start Free Trial
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-muted py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">SpellMind AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Master spelling with AI-powered adaptive learning
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-muted pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SpellMind AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
