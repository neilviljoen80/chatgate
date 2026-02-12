"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Search,
  X,
  Facebook,
  Clock,
  Globe,
  Tag,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string;
  psid: string;
  first_name: string | null;
  last_name: string | null;
  profile_pic: string | null;
  locale: string | null;
  is_subscribed: boolean;
  last_interaction: string;
  tags: string[];
  page: { page_name: string };
}

interface SubscribersClientProps {
  subscribers: Subscriber[];
}

export function SubscribersClient({ subscribers }: SubscribersClientProps) {
  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<Subscriber | null>(null);

  const filtered = subscribers.filter((sub) => {
    const name = `${sub.first_name || ""} ${sub.last_name || ""}`.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || sub.psid.includes(q) || sub.tags.some((t) => t.toLowerCase().includes(q));
  });

  function getName(sub: Subscriber) {
    if (sub.first_name || sub.last_name) return `${sub.first_name || ""} ${sub.last_name || ""}`.trim();
    return `User ${sub.psid.slice(-4)}`;
  }

  function getInitials(sub: Subscriber) {
    if (sub.first_name && sub.last_name) return `${sub.first_name[0]}${sub.last_name[0]}`.toUpperCase();
    if (sub.first_name) return sub.first_name[0].toUpperCase();
    return "U";
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  }

  function formatRelative(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(diff / 86400000);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
  }

  const subscribedCount = subscribers.filter((s) => s.is_subscribed).length;

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className={cn("flex-1 space-y-4 transition-all", selectedSub && "lg:mr-0")}>
        {/* Stats bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{subscribers.length} total</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">{subscribedCount} subscribed</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9 bg-muted/50 border-0"
          />
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-3">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">
              {subscribers.length === 0 ? "No contacts yet" : "No results"}
            </h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              {subscribers.length === 0
                ? "Contacts will appear here when people message your Pages."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left font-semibold text-xs uppercase tracking-wider p-3 text-muted-foreground">Contact</th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider p-3 text-muted-foreground hidden sm:table-cell">Channel</th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider p-3 text-muted-foreground hidden md:table-cell">Tags</th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider p-3 text-muted-foreground hidden lg:table-cell">Last Active</th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider p-3 text-muted-foreground">Status</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((sub) => (
                      <tr
                        key={sub.id}
                        onClick={() => setSelectedSub(sub)}
                        className={cn(
                          "border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/30",
                          selectedSub?.id === sub.id && "bg-primary/5"
                        )}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-9 w-9 border shadow-sm">
                                {sub.profile_pic && <AvatarImage src={sub.profile_pic} />}
                                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                  {getInitials(sub)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-blue-600 flex items-center justify-center border-2 border-background">
                                <Facebook className="h-1.5 w-1.5 text-white" />
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{getName(sub)}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {sub.locale || "Unknown locale"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs hidden sm:table-cell">{sub.page.page_name}</td>
                        <td className="p-3 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {sub.tags.length > 0 ? (
                              sub.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] bg-muted font-normal">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                            {sub.tags.length > 2 && (
                              <Badge variant="secondary" className="text-[10px] bg-muted font-normal">
                                +{sub.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">
                          {formatRelative(sub.last_interaction)}
                        </td>
                        <td className="p-3">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            sub.is_subscribed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-muted text-muted-foreground"
                          )}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", sub.is_subscribed ? "bg-emerald-500" : "bg-muted-foreground")} />
                            {sub.is_subscribed ? "Subscribed" : "Unsubscribed"}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Panel */}
      {selectedSub && (
        <div className="hidden lg:block w-[340px] shrink-0 animate-slide-in-right">
          <Card className="border-0 shadow-sm sticky top-24 overflow-hidden">
            {/* Header */}
            <div className="gradient-primary p-6 text-white relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setSelectedSub(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 border-4 border-white/20 shadow-lg">
                  {selectedSub.profile_pic && <AvatarImage src={selectedSub.profile_pic} />}
                  <AvatarFallback className="text-lg font-bold bg-white/20 text-white">
                    {getInitials(selectedSub)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 font-bold text-lg">{getName(selectedSub)}</h3>
                <p className="text-white/70 text-sm">{selectedSub.page.page_name}</p>
              </div>
            </div>

            <CardContent className="p-5 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  selectedSub.is_subscribed ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", selectedSub.is_subscribed ? "bg-emerald-500" : "bg-muted-foreground")} />
                  {selectedSub.is_subscribed ? "Subscribed" : "Unsubscribed"}
                </span>
              </div>

              <Separator />

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Facebook className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Platform</p>
                    <p className="font-medium text-xs">Facebook Messenger</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Locale</p>
                    <p className="font-medium text-xs">{selectedSub.locale || "Unknown"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Last Active</p>
                    <p className="font-medium text-xs">{formatRelative(selectedSub.last_interaction)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSub.tags.length > 0 ? (
                    selectedSub.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* System info */}
              <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">PSID</span>
                  <span className="font-mono text-[11px]">{selectedSub.psid}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">First Seen</span>
                  <span>{formatDate(selectedSub.last_interaction)}</span>
                </div>
              </div>

              {/* Action */}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`/dashboard/inbox`}>
                  <MessageSquare className="mr-2 h-3.5 w-3.5" />
                  Open Conversation
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
