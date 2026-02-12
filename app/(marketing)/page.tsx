import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Zap, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Auto-Reply to Messages",
    description:
      "Respond to Messenger inquiries instantly, even when you're away. Never miss a lead again.",
  },
  {
    icon: Zap,
    title: "Qualify Leads Automatically",
    description:
      "Ask the right questions to filter serious buyers from browsers — before you spend time on them.",
  },
  {
    icon: Shield,
    title: "Simple & Secure",
    description:
      "Connect your Facebook Page in one click. Your data stays safe with enterprise-grade security.",
  },
  {
    icon: BarChart3,
    title: "Track Conversations",
    description:
      "See who messaged, what they asked, and how your auto-replies performed — all in one dashboard.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Automate Your Messenger.
            <br />
            <span className="text-primary">Grow Your Business.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            ChatGate helps small businesses respond to Facebook Messenger
            messages automatically — qualify leads, answer common questions, and
            stay connected with customers 24/7.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Everything you need to manage Messenger
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            No coding required. Connect your Page, set up your flows, and let
            ChatGate handle the rest.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-background shadow-sm">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Create your free account in seconds. No credit card required.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
