"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendReply } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Send,
  MessageSquare,
  Loader2,
  Search,
  Inbox,
  ArrowLeft,
  Facebook,
  Smile,
} from "lucide-react";

interface Subscriber {
  id: string;
  psid: string;
  first_name: string | null;
  last_name: string | null;
  profile_pic: string | null;
}

interface Page {
  id: string;
  page_id?: string;
  page_name: string;
}

interface Conversation {
  id: string;
  page_id: string;
  subscriber_id: string;
  status: string;
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;
  subscriber: Subscriber;
  page: Page;
}

interface Message {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  content: string | null;
  sent_by: string;
  created_at: string;
}

interface InboxClientProps {
  conversations: Conversation[];
  pages: Page[];
}

export function InboxClient({ conversations: initialConversations }: InboxClientProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedConvo) return;
    async function loadMessages() {
      setLoadingMessages(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConvo!.id)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages(data || []);
      setLoadingMessages(false);
      await supabase.from("conversations").update({ unread_count: 0 }).eq("id", selectedConvo!.id);
      setConversations((prev) => prev.map((c) => c.id === selectedConvo!.id ? { ...c, unread_count: 0 } : c));
    }
    loadMessages();
  }, [selectedConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedConvo) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${selectedConvo.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedConvo.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConvo]);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConvo || !replyText.trim()) return;
    setSending(true);
    const result = await sendReply(selectedConvo.id, selectedConvo.page_id, selectedConvo.subscriber_id, replyText.trim());
    if (result.error) {
      alert(`Failed to send: ${result.error}`);
    } else {
      const newMsg: Message = { id: crypto.randomUUID(), conversation_id: selectedConvo.id, direction: "outbound", message_type: "text", content: replyText.trim(), sent_by: "human", created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, newMsg]);
      setReplyText("");
      setConversations((prev) => prev.map((c) => c.id === selectedConvo.id ? { ...c, last_message_preview: replyText.trim().substring(0, 100), last_message_at: new Date().toISOString() } : c));
    }
    setSending(false);
  }

  function getName(sub: Subscriber) {
    if (sub.first_name || sub.last_name) return `${sub.first_name || ""} ${sub.last_name || ""}`.trim();
    return `User ${sub.psid.slice(-4)}`;
  }

  function getInitials(sub: Subscriber) {
    if (sub.first_name && sub.last_name) return `${sub.first_name[0]}${sub.last_name[0]}`.toUpperCase();
    if (sub.first_name) return sub.first_name[0].toUpperCase();
    return "U";
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString();
  }

  const filtered = conversations.filter((c) => {
    const name = getName(c.subscriber).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className="flex h-[calc(100vh-10rem)] rounded-xl border shadow-sm overflow-hidden bg-background">
      {/* Sidebar - Conversations */}
      <div className={cn("w-full md:w-[340px] border-r flex flex-col bg-background", selectedConvo && "hidden md:flex")}>
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Inbox</h3>
              {totalUnread > 0 && (
                <Badge variant="default" className="gradient-primary border-0 text-white text-[10px] px-2 py-0">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] font-normal">
                {filtered.length} chats
              </Badge>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 h-9 bg-muted/50 border-0 text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-3">
                <Inbox className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">Messages will appear here</p>
            </div>
          ) : (
            filtered.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo)}
                className={cn(
                  "w-full text-left px-4 py-3.5 transition-all hover:bg-muted/50 border-b border-border/50",
                  selectedConvo?.id === convo.id && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                <div className="flex gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      {convo.subscriber.profile_pic && <AvatarImage src={convo.subscriber.profile_pic} />}
                      <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
                        {getInitials(convo.subscriber)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center border-2 border-background">
                      <Facebook className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm truncate", convo.unread_count > 0 ? "font-bold" : "font-medium")}>
                        {getName(convo.subscriber)}
                      </span>
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                        {formatTime(convo.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={cn("text-xs truncate pr-2", convo.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
                        {convo.last_message_preview || "No messages"}
                      </p>
                      {convo.unread_count > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full gradient-primary text-[10px] text-white font-bold px-1.5 shrink-0">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn("flex-1 flex flex-col", !selectedConvo && "hidden md:flex")}>
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b px-4 py-3 bg-background/80 backdrop-blur-sm">
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSelectedConvo(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-9 w-9 border shadow-sm">
                {selectedConvo.subscriber.profile_pic && <AvatarImage src={selectedConvo.subscriber.profile_pic} />}
                <AvatarFallback className="text-xs font-semibold bg-primary/10">
                  {getInitials(selectedConvo.subscriber)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold">{getName(selectedConvo.subscriber)}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Facebook className="h-2.5 w-2.5 text-blue-600" />
                  via {selectedConvo.page.page_name}
                </p>
              </div>
              <Badge variant={selectedConvo.status === "open" ? "default" : "secondary"} className={cn("text-[10px]", selectedConvo.status === "open" && "bg-emerald-100 text-emerald-700 border-emerald-200")}>
                {selectedConvo.status}
              </Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar bg-muted/20">
              {loadingMessages ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.direction === "outbound" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm", msg.direction === "outbound" ? "gradient-primary text-white rounded-br-md" : "bg-background border rounded-bl-md")}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <div className={cn("flex items-center gap-1.5 mt-1", msg.direction === "outbound" ? "text-white/60" : "text-muted-foreground")}>
                        <span className="text-[10px]">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {msg.direction === "outbound" && <span className="text-[10px] font-medium">{msg.sent_by === "bot" ? "· Bot" : "· You"}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply */}
            <form onSubmit={handleSendReply} className="border-t p-3 bg-background">
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground shrink-0">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 bg-muted/50 border-0 rounded-full h-10"
                />
                <Button type="submit" size="icon" disabled={sending || !replyText.trim()} className="h-9 w-9 rounded-full gradient-primary border-0 text-white shadow-md shrink-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="relative mb-6">
              <div className="h-24 w-24 rounded-3xl gradient-primary opacity-10 absolute -inset-2 blur-xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <h3 className="font-semibold text-lg">Select a conversation</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
              Choose a conversation from the sidebar to start chatting with your customers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
