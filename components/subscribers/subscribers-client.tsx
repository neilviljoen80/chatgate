"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search } from "lucide-react";

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

  const filtered = subscribers.filter((sub) => {
    const name = `${sub.first_name || ""} ${sub.last_name || ""}`.toLowerCase();
    const q = search.toLowerCase();
    return (
      name.includes(q) ||
      sub.psid.includes(q) ||
      sub.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  function getName(sub: Subscriber) {
    if (sub.first_name || sub.last_name) {
      return `${sub.first_name || ""} ${sub.last_name || ""}`.trim();
    }
    return `User ${sub.psid.slice(-4)}`;
  }

  function getInitials(sub: Subscriber) {
    if (sub.first_name && sub.last_name) {
      return `${sub.first_name[0]}${sub.last_name[0]}`.toUpperCase();
    }
    if (sub.first_name) return sub.first_name[0].toUpperCase();
    return "U";
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or tag..."
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {subscribers.length} subscriber(s)
        </p>
      </div>

      {/* Subscribers Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            {subscribers.length === 0
              ? "No subscribers yet. They'll appear here when people message your Pages."
              : "No subscribers match your search."}
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-3">Subscriber</th>
                    <th className="text-left font-medium p-3">Page</th>
                    <th className="text-left font-medium p-3">Tags</th>
                    <th className="text-left font-medium p-3">Last Interaction</th>
                    <th className="text-left font-medium p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => (
                    <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {sub.profile_pic && <AvatarImage src={sub.profile_pic} />}
                            <AvatarFallback className="text-xs">{getInitials(sub)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{getName(sub)}</p>
                            <p className="text-xs text-muted-foreground">
                              PSID: {sub.psid.slice(-8)}
                              {sub.locale && ` · ${sub.locale}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{sub.page.page_name}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {sub.tags.length > 0 ? (
                            sub.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {formatDate(sub.last_interaction)}
                      </td>
                      <td className="p-3">
                        <Badge variant={sub.is_subscribed ? "default" : "secondary"}>
                          {sub.is_subscribed ? "Subscribed" : "Unsubscribed"}
                        </Badge>
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
  );
}
