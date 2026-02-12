-- ChatGate Database Schema
-- Run this in the Supabase SQL Editor after creating your project.
-- The auth.users table is managed automatically by Supabase Auth.

-- ============================================================
-- Pages table: stores connected Facebook Pages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,           -- Facebook Page ID
  page_name TEXT NOT NULL,         -- Display name of the Page
  access_token TEXT NOT NULL,      -- Page Access Token from Facebook
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_user_id ON public.pages(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_user_page ON public.pages(user_id, page_id);

-- ============================================================
-- Settings table: user preferences and configuration
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone TEXT DEFAULT 'UTC',
  notify_email BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);

-- ============================================================
-- Subscribers: people who message connected Facebook Pages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  psid TEXT NOT NULL,                    -- Page-Scoped User ID from Facebook
  first_name TEXT,
  last_name TEXT,
  profile_pic TEXT,
  locale TEXT,
  gender TEXT,
  is_subscribed BOOLEAN DEFAULT true,
  last_interaction TIMESTAMPTZ DEFAULT now(),
  custom_fields JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_page_psid ON public.subscribers(page_id, psid);
CREATE INDEX IF NOT EXISTS idx_subscribers_page_id ON public.subscribers(page_id);

-- ============================================================
-- Conversations: message threads between page and subscriber
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  last_message_preview TEXT,
  unread_count INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_page_subscriber ON public.conversations(page_id, subscriber_id);
CREATE INDEX IF NOT EXISTS idx_conversations_page_id ON public.conversations(page_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);

-- ============================================================
-- Messages: individual messages in conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'template', 'quick_reply', 'postback')),
  content TEXT,
  payload JSONB,
  fb_message_id TEXT,
  sent_by TEXT DEFAULT 'bot' CHECK (sent_by IN ('bot', 'human', 'subscriber')),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_page_id ON public.messages(page_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- ============================================================
-- Flows: automation flows
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'get_started', 'default_reply', 'manual', 'referral')),
  trigger_value TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flows_page_id ON public.flows(page_id);
CREATE INDEX IF NOT EXISTS idx_flows_trigger ON public.flows(page_id, trigger_type, is_active);

-- ============================================================
-- Flow Steps: individual steps in an automation flow
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flow_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 0,
  step_type TEXT NOT NULL CHECK (step_type IN ('send_message', 'ask_question', 'condition', 'delay', 'action', 'go_to_flow')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  next_step_id UUID REFERENCES public.flow_steps(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flow_steps_flow_id ON public.flow_steps(flow_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_steps ENABLE ROW LEVEL SECURITY;

-- Pages
CREATE POLICY "Users can view their own pages" ON public.pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pages" ON public.pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pages" ON public.pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pages" ON public.pages FOR DELETE USING (auth.uid() = user_id);

-- Settings
CREATE POLICY "Users can view their own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.settings FOR DELETE USING (auth.uid() = user_id);

-- Subscribers (accessible through page ownership)
CREATE POLICY "Users can view subscribers of their pages" ON public.subscribers FOR SELECT USING (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert subscribers of their pages" ON public.subscribers FOR INSERT WITH CHECK (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));
CREATE POLICY "Users can update subscribers of their pages" ON public.subscribers FOR UPDATE USING (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete subscribers of their pages" ON public.subscribers FOR DELETE USING (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));

-- Conversations
CREATE POLICY "Users can view conversations of their pages" ON public.conversations FOR SELECT USING (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert conversations of their pages" ON public.conversations FOR INSERT WITH CHECK (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));
CREATE POLICY "Users can update conversations of their pages" ON public.conversations FOR UPDATE USING (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete conversations of their pages" ON public.conversations FOR DELETE USING (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));

-- Messages
CREATE POLICY "Users can view messages of their pages" ON public.messages FOR SELECT USING (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert messages of their pages" ON public.messages FOR INSERT WITH CHECK (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));
CREATE POLICY "Users can update messages of their pages" ON public.messages FOR UPDATE USING (page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid()));

-- Flows
CREATE POLICY "Users can view their own flows" ON public.flows FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own flows" ON public.flows FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own flows" ON public.flows FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own flows" ON public.flows FOR DELETE USING (user_id = auth.uid());

-- Flow Steps (accessible through flow ownership)
CREATE POLICY "Users can view steps of their flows" ON public.flow_steps FOR SELECT USING (flow_id IN (SELECT id FROM public.flows WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert steps to their flows" ON public.flow_steps FOR INSERT WITH CHECK (flow_id IN (SELECT id FROM public.flows WHERE user_id = auth.uid()));
CREATE POLICY "Users can update steps of their flows" ON public.flow_steps FOR UPDATE USING (flow_id IN (SELECT id FROM public.flows WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete steps of their flows" ON public.flow_steps FOR DELETE USING (flow_id IN (SELECT id FROM public.flows WHERE user_id = auth.uid()));

-- Service role bypass (for webhook processing)
CREATE POLICY "Service role full access to subscribers" ON public.subscribers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to conversations" ON public.conversations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to messages" ON public.messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to flows" ON public.flows FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to flow_steps" ON public.flow_steps FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- Helper: auto-update updated_at on changes
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE TRIGGER pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER subscribers_updated_at BEFORE UPDATE ON public.subscribers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER flows_updated_at BEFORE UPDATE ON public.flows FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER flow_steps_updated_at BEFORE UPDATE ON public.flow_steps FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
