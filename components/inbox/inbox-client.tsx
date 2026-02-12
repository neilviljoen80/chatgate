"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendReply } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Send, MessageSquare, Loader2 } from "lucide-react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when a conversation is selected
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

      // Mark as read
      await supabase
        .from("conversations")
        .update({ unread_count: 0 })
        .eq("id", selectedConvo!.id);

      // Update local state
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvo!.id ? { ...c, unread_count: 0 } : c
        )
      );
    }

    loadMessages();
  }, [selectedConvo]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedConvo) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${selectedConvo.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConvo.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvo]);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConvo || !replyText.trim()) return;

    setSending(true);
    const result = await sendReply(
      selectedConvo.id,
      selectedConvo.page_id,
      selectedConvo.subscriber_id,
      replyText.trim()
    );

    if (result.error) {
      alert(`Failed to send: ${result.error}`);
    } else {
      // Optimistically add the message
      const newMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: selectedConvo.id,
        direction: "outbound",
        message_type: "text",
        content: replyText.trim(),
        sent_by: "human",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setReplyText("");

      // Update conversation preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvo.id
            ? {
                ...c,
                last_message_preview: replyText.trim().substring(0, 100),
                last_message_at: new Date().toISOString(),
              }
            : c
        )
      );
    }
    setSending(false);
  }

  function getSubscriberName(sub: Subscriber) {
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

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] rounded-lg border overflow-hidden">
      {/* Conversation List */}
      <div className="w-80 border-r flex flex-col bg-muted/30">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">Conversations</h3>
          <p className="text-xs text-muted-foreground">{conversations.length} total</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No conversations yet. Messages will appear here when people message your Page.
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo)}
                className={cn(
                  "w-full text-left p-3 border-b transition-colors hover:bg-muted/50",
                  selectedConvo?.id === convo.id && "bg-muted"
                )}
              >
                <div className="flex gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    {convo.subscriber.profile_pic && (
                      <AvatarImage src={convo.subscriber.profile_pic} />
                    )}
                    <AvatarFallback className="text-xs">
                      {getInitials(convo.subscriber)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {getSubscriberName(convo.subscriber)}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTime(convo.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">
                        {convo.last_message_preview || "No messages yet"}
                      </p>
                      {convo.unread_count > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shrink-0">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      via {convo.page.page_name}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b p-3">
              <Avatar className="h-8 w-8">
                {selectedConvo.subscriber.profile_pic && (
                  <AvatarImage src={selectedConvo.subscriber.profile_pic} />
                )}
                <AvatarFallback className="text-xs">
                  {getInitials(selectedConvo.subscriber)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {getSubscriberName(selectedConvo.subscriber)}
                </p>
                <p className="text-xs text-muted-foreground">
                  via {selectedConvo.page.page_name}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No messages in this conversation yet.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.direction === "outbound" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg px-3 py-2",
                        msg.direction === "outbound"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1",
                          msg.direction === "outbound"
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground"
                        )}
                      >
                        <span className="text-[10px]">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.direction === "outbound" && (
                          <span className="text-[10px]">
                            {msg.sent_by === "bot" ? "Bot" : "You"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendReply} className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending || !replyText.trim()}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
