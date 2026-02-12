"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Send,
  Plus,
  Clock,
  Users,
  MessageSquare,
  Sparkles,
  X,
  ArrowRight,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Broadcast {
  id: string;
  name: string;
  message: string;
  status: "draft" | "scheduled" | "sent";
  createdAt: string;
  sentTo?: number;
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const newBroadcast: Broadcast = {
      id: crypto.randomUUID(),
      name: name.trim(),
      message: message.trim(),
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    setBroadcasts((prev) => [newBroadcast, ...prev]);
    setName("");
    setMessage("");
    setShowCreate(false);
  }

  function handleDelete(id: string) {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  }

  const statusStyles = {
    draft: "bg-amber-100 text-amber-700",
    scheduled: "bg-blue-100 text-blue-700",
    sent: "bg-emerald-100 text-emerald-700",
  };

  return (
    <DashboardShell
      title="Broadcasts"
      description="Send targeted messages to your subscribers."
      action={
        <Button onClick={() => setShowCreate(!showCreate)} className="gradient-primary border-0 text-white shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          New Broadcast
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Create form */}
        {showCreate && (
          <Card className="border-0 shadow-md animate-scale-in overflow-hidden">
            <div className="gradient-primary p-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Radio className="h-4 w-4" />
                New Broadcast
              </h3>
              <p className="text-white/70 text-sm mt-0.5">Compose a message to send to your subscribers</p>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Broadcast Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Weekly Update"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Message Content
                  </Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your broadcast message here..."
                    rows={4}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Tip: Keep messages concise and include a clear call-to-action.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="gradient-primary border-0 text-white">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {broadcasts.length === 0 && !showCreate ? (
          <div className="space-y-8">
            {/* Hero empty state */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center">
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-3xl gradient-primary opacity-10 absolute -inset-2 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                  <Send className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-semibold text-xl">No broadcasts yet</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-md">
                Broadcasts let you send messages to all your subscribers at once. 
                Great for announcements, promotions, and updates.
              </p>
              <Button onClick={() => setShowCreate(true)} className="mt-6 gradient-primary border-0 text-white shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Broadcast
              </Button>
            </div>

            {/* Inspiration cards */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Broadcast Ideas
              </h3>
              <div className="grid gap-4 md:grid-cols-3 stagger-children">
                {[
                  {
                    icon: "📢",
                    title: "Promotional Offer",
                    desc: "Share exclusive deals with your audience",
                    color: "bg-orange-50 border-orange-200",
                  },
                  {
                    icon: "📰",
                    title: "Weekly Newsletter",
                    desc: "Keep subscribers updated on what's new",
                    color: "bg-blue-50 border-blue-200",
                  },
                  {
                    icon: "🎉",
                    title: "Product Launch",
                    desc: "Announce new products or features",
                    color: "bg-violet-50 border-violet-200",
                  },
                ].map((idea) => (
                  <Card key={idea.title} className={`card-hover border shadow-sm cursor-pointer ${idea.color}`} onClick={() => { setShowCreate(true); setName(idea.title); }}>
                    <CardHeader className="pb-2">
                      <span className="text-2xl mb-1">{idea.icon}</span>
                      <CardTitle className="text-base">{idea.title}</CardTitle>
                      <CardDescription className="text-xs">{idea.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        Use this template <ArrowRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Broadcasts list */
          broadcasts.length > 0 && (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <Card key={b.id} className="border-0 shadow-sm card-hover">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{b.name}</h3>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", statusStyles[b.status])}>
                            {b.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-sm">
                          {b.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                        {b.sentTo && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Users className="h-3 w-3" />
                            {b.sentTo} recipients
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {b.status === "draft" && (
                          <Button size="sm" variant="outline" className="text-xs">
                            <Send className="mr-1 h-3 w-3" />
                            Send
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(b.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </DashboardShell>
  );
}
