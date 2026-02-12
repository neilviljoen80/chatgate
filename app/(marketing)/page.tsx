import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Users,
  Send,
  Sparkles,
  Check,
  Star,
  Facebook,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Live Chat Inbox",
    description:
      "View and reply to all Messenger conversations in one beautiful dashboard.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description:
      "Set up keyword-triggered flows that respond to customers automatically, 24/7.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Users,
    title: "Contact Management",
    description:
      "Track every subscriber with detailed profiles, tags, and interaction history.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Send,
    title: "Broadcast Messages",
    description:
      "Send targeted broadcasts to all your subscribers with one click.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Enterprise-grade security with Facebook OAuth. Your data stays protected.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track conversations, subscribers, and automation performance in real-time.",
    color: "bg-cyan-50 text-cyan-600",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect Your Page",
    description: "Link your Facebook Page in one click with secure OAuth.",
    icon: Facebook,
  },
  {
    step: "02",
    title: "Set Up Automations",
    description: "Choose from templates or create custom keyword-triggered flows.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Engage & Grow",
    description: "Watch your subscriber list grow while ChatGate handles replies.",
    icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-violet-500/5 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-36">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm shadow-sm mb-8 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Messenger Automation Made Simple</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] animate-slide-up">
              Automate Your
              <br />
              <span className="gradient-text">Messenger Conversations</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
              ChatGate helps small businesses respond to Facebook Messenger
              messages automatically — qualify leads, answer questions, and grow
              your business 24/7.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" asChild className="gradient-primary border-0 text-white shadow-lg shadow-primary/25 h-12 px-8 text-base">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link href="/login">Log in</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
              No credit card required · Free forever for 1 connected page
            </p>
          </div>

          {/* Preview mockup */}
          <div className="mt-20 mx-auto max-w-5xl animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="rounded-2xl border bg-background shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-1 text-xs text-muted-foreground border">
                    <div className="h-3 w-3 rounded-full gradient-primary" />
                    app.chatgate.io/dashboard
                  </div>
                </div>
              </div>
              {/* Fake dashboard content */}
              <div className="flex">
                {/* Fake sidebar */}
                <div className="w-56 border-r bg-[hsl(224,71%,4%)] p-4 hidden md:block">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-sm">ChatGate</span>
                  </div>
                  {["Home", "Live Chat", "Contacts", "Automation", "Broadcasts"].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-1 text-sm ${i === 0 ? "bg-primary/80 text-white" : "text-white/50"}`}>
                      <div className="h-4 w-4 rounded bg-white/10" />
                      {item}
                    </div>
                  ))}
                </div>
                {/* Fake main content */}
                <div className="flex-1 p-6">
                  <div className="text-lg font-bold mb-1">Hello, Sarah! 👋</div>
                  <div className="text-sm text-muted-foreground mb-6">1 connected channel</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Subscribers", value: "1,247", color: "bg-blue-50" },
                      { label: "Open Chats", value: "23", color: "bg-emerald-50" },
                      { label: "Active Flows", value: "5", color: "bg-violet-50" },
                      { label: "Broadcasts", value: "12", color: "bg-orange-50" },
                    ].map((stat) => (
                      <div key={stat.label} className={`${stat.color} rounded-xl p-3`}>
                        <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                        <div className="text-xl font-bold mt-1">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
              <Star className="h-3 w-3" />
              FEATURES
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage Messenger
            </h2>
            <p className="mt-4 text-muted-foreground">
              No coding required. Connect your Page, set up your flows, and let ChatGate handle the rest.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto stagger-children">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-background shadow-sm card-hover">
                <CardHeader>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color} mb-3`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 mb-4">
              <Zap className="h-3 w-3" />
              HOW IT WORKS
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in 3 minutes
            </h2>
            <p className="mt-4 text-muted-foreground">
              Getting started with ChatGate is as easy as 1-2-3. No technical knowledge required.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto stagger-children">
            {steps.map((item, i) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary text-white shadow-lg shadow-primary/20">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary font-bold text-primary text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{item.description}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground/30 mx-auto mt-4 hidden md:block rotate-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing hint */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Free to start. Scale when you&apos;re ready.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Start with one connected Page for free. Upgrade when you need more power.
            </p>

            <Card className="mt-10 border-0 shadow-md max-w-sm mx-auto overflow-hidden">
              <div className="gradient-primary p-6 text-white text-center">
                <p className="text-sm font-medium text-white/80">Starter</p>
                <div className="flex items-baseline justify-center mt-2">
                  <span className="text-5xl font-extrabold">$0</span>
                  <span className="text-white/60 ml-1">/month</span>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  "1 Facebook Page",
                  "Unlimited messages",
                  "3 automation flows",
                  "Basic analytics",
                  "Live chat inbox",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
                <div className="pt-4">
                  <Button asChild className="w-full gradient-primary border-0 text-white shadow-lg shadow-primary/20">
                    <Link href="/signup">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl rounded-3xl gradient-primary p-12 md:p-16 text-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blob animate-float" />
            <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5 blob" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to automate your Messenger?
              </h2>
              <p className="mt-4 text-white/80 max-w-lg mx-auto">
                Join thousands of small businesses using ChatGate to save time and grow faster.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 h-12 px-8 shadow-lg">
                  <Link href="/signup">
                    Start for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
