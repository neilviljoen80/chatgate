"use client";

import { useState } from "react";
import { createFlow, addFlowStep, toggleFlow, deleteFlow, deleteFlowStep } from "@/app/actions/flows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Power,
  PowerOff,
  MessageSquare,
  Zap,
  ChevronDown,
  ChevronRight,
  Loader2,
  Sparkles,
  ArrowRight,
  Search,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowStep {
  id: string;
  flow_id: string;
  step_order: number;
  step_type: string;
  config: Record<string, unknown>;
}

interface Flow {
  id: string;
  page_id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_value: string | null;
  is_active: boolean;
  flow_steps: FlowStep[];
  page: { page_name: string };
}

interface Page {
  id: string;
  page_name: string;
}

interface FlowsClientProps {
  flows: Flow[];
  pages: Page[];
}

const triggerTypes = [
  { value: "keyword", label: "Keyword", icon: "🔑", description: "Trigger when message contains a keyword" },
  { value: "get_started", label: "Get Started", icon: "👋", description: "Trigger on Get Started button" },
  { value: "default_reply", label: "Default Reply", icon: "💬", description: "Fallback when no match" },
];

const templates = [
  {
    name: "Welcome Flow",
    description: "Greet new users and introduce your business",
    trigger: "get_started",
    icon: "👋",
    color: "bg-blue-50 border-blue-200",
    steps: [{ text: "Welcome! 🎉 Thanks for reaching out. How can I help you today?" }],
  },
  {
    name: "Lead Qualifier",
    description: "Ask questions to qualify potential customers",
    trigger: "keyword",
    keyword: "pricing",
    icon: "🎯",
    color: "bg-violet-50 border-violet-200",
    steps: [
      { text: "Thanks for your interest! 🙌 Let me help you find the right plan." },
      { text: "What's the size of your business?\n\n1️⃣ Just me\n2️⃣ 2-10 people\n3️⃣ 10+ people" },
    ],
  },
  {
    name: "Business Hours",
    description: "Let customers know your availability",
    trigger: "keyword",
    keyword: "hours",
    icon: "🕐",
    color: "bg-emerald-50 border-emerald-200",
    steps: [{ text: "Our business hours are:\n\n📅 Monday - Friday: 9AM - 6PM\n📅 Saturday: 10AM - 2PM\n📅 Sunday: Closed\n\nFeel free to leave a message and we'll get back to you!" }],
  },
  {
    name: "FAQ Auto-Reply",
    description: "Answer frequently asked questions automatically",
    trigger: "keyword",
    keyword: "help",
    icon: "❓",
    color: "bg-orange-50 border-orange-200",
    steps: [{ text: "Here are some common topics I can help with:\n\n📦 Shipping - type 'shipping'\n💰 Returns - type 'returns'\n📞 Contact - type 'contact'\n\nOr just type your question!" }],
  },
];

export function FlowsClient({ flows: initialFlows, pages }: FlowsClientProps) {
  const [flows, setFlows] = useState(initialFlows);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [newFlowName, setNewFlowName] = useState("");
  const [newFlowPage, setNewFlowPage] = useState(pages[0]?.id || "");
  const [newFlowTrigger, setNewFlowTrigger] = useState("keyword");
  const [newFlowTriggerValue, setNewFlowTriggerValue] = useState("");
  const [newFlowDescription, setNewFlowDescription] = useState("");
  const [newStepText, setNewStepText] = useState("");
  const [addingStepTo, setAddingStepTo] = useState<string | null>(null);

  const filteredFlows = flows.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleCreateFlow(e: React.FormEvent) {
    e.preventDefault();
    if (!newFlowName.trim() || !newFlowPage) return;
    setLoading(true);
    const result = await createFlow(
      newFlowPage, newFlowName.trim(), newFlowTrigger,
      newFlowTrigger === "keyword" ? newFlowTriggerValue.toLowerCase().trim() : null,
      newFlowDescription.trim() || null
    );
    if (result.error) { alert(result.error); }
    else {
      setShowCreate(false);
      setNewFlowName(""); setNewFlowTriggerValue(""); setNewFlowDescription("");
      if (result.flow) {
        const page = pages.find((p) => p.id === newFlowPage);
        setFlows((prev) => [{ ...result.flow, flow_steps: [], page: { page_name: page?.page_name || "" } } as Flow, ...prev]);
      }
    }
    setLoading(false);
  }

  async function handleUseTemplate(template: typeof templates[0]) {
    if (!pages[0]) { alert("Connect a Facebook Page first"); return; }
    setLoading(true);
    const result = await createFlow(
      pages[0].id, template.name, template.trigger,
      template.trigger === "keyword" ? (template.keyword || null) : null,
      template.description
    );
    if (result.flow) {
      for (let i = 0; i < template.steps.length; i++) {
        await addFlowStep(result.flow.id, "send_message", { text: template.steps[i].text }, i);
      }
      // Refresh
      const page = pages.find((p) => p.id === pages[0].id);
      const stepsData = template.steps.map((s, i) => ({
        id: crypto.randomUUID(), flow_id: result.flow.id, step_order: i,
        step_type: "send_message", config: { text: s.text },
      }));
      setFlows((prev) => [{ ...result.flow, flow_steps: stepsData, page: { page_name: page?.page_name || "" } } as Flow, ...prev]);
    }
    setLoading(false);
  }

  async function handleAddStep(flowId: string) {
    if (!newStepText.trim()) return;
    setLoading(true);
    const flow = flows.find((f) => f.id === flowId);
    const stepOrder = flow ? flow.flow_steps.length : 0;
    const result = await addFlowStep(flowId, "send_message", { text: newStepText.trim() }, stepOrder);
    if (!result.error && result.step) {
      setNewStepText(""); setAddingStepTo(null);
      setFlows((prev) => prev.map((f) =>
        f.id === flowId ? { ...f, flow_steps: [...f.flow_steps, result.step as FlowStep] } : f
      ));
    }
    setLoading(false);
  }

  async function handleToggle(flowId: string, currentActive: boolean) {
    const result = await toggleFlow(flowId, !currentActive);
    if (!result.error) {
      setFlows((prev) => prev.map((f) => (f.id === flowId ? { ...f, is_active: !currentActive } : f)));
    }
  }

  async function handleDeleteFlow(flowId: string) {
    if (!confirm("Delete this flow?")) return;
    const result = await deleteFlow(flowId);
    if (!result.error) setFlows((prev) => prev.filter((f) => f.id !== flowId));
  }

  async function handleDeleteStep(flowId: string, stepId: string) {
    const result = await deleteFlowStep(stepId);
    if (!result.error) {
      setFlows((prev) => prev.map((f) =>
        f.id === flowId ? { ...f, flow_steps: f.flow_steps.filter((s) => s.id !== stepId) } : f
      ));
    }
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 mb-4">
          <Zap className="h-8 w-8" />
        </div>
        <h3 className="font-semibold text-lg">No channel connected</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
          Connect a Facebook Page first to create automation flows.
        </p>
        <Button asChild className="mt-4 gradient-primary border-0 text-white">
          <a href="/dashboard/connect">Connect Page</a>
        </Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="automations" className="space-y-6">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="automations" className="gap-2">
          <Zap className="h-3.5 w-3.5" />
          My Automations
        </TabsTrigger>
        <TabsTrigger value="templates" className="gap-2">
          <LayoutTemplate className="h-3.5 w-3.5" />
          Templates
        </TabsTrigger>
      </TabsList>

      {/* Templates Tab */}
      <TabsContent value="templates" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Start Templates
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a template to create a flow instantly.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.name} className={`card-hover border shadow-sm cursor-pointer ${t.color}`} onClick={() => handleUseTemplate(t)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <CardDescription className="text-xs">{t.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t.steps.length} step(s) · {t.trigger}
                  </span>
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    Use template <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Automations Tab */}
      <TabsContent value="automations" className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search automations..."
              className="pl-9 bg-muted/50 border-0"
            />
          </div>
          <Button onClick={() => setShowCreate(!showCreate)} className="gradient-primary border-0 text-white shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            New Automation
          </Button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <Card className="border-0 shadow-md animate-scale-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                New Automation
              </CardTitle>
              <CardDescription>Set up a trigger and automated response.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateFlow} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</Label>
                    <Input value={newFlowName} onChange={(e) => setNewFlowName(e.target.value)} placeholder="e.g., Welcome Flow" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Page</Label>
                    <select value={newFlowPage} onChange={(e) => setNewFlowPage(e.target.value)} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm" required>
                      {pages.map((p) => (<option key={p.id} value={p.id}>{p.page_name}</option>))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trigger</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {triggerTypes.map((t) => (
                      <button key={t.value} type="button" onClick={() => setNewFlowTrigger(t.value)}
                        className={cn("rounded-xl border-2 p-4 text-left transition-all", newFlowTrigger === t.value ? "border-primary bg-primary/5 shadow-sm" : "border-transparent bg-muted/50 hover:bg-muted")}>
                        <span className="text-xl mb-1 block">{t.icon}</span>
                        <p className="text-sm font-semibold">{t.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {newFlowTrigger === "keyword" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keyword</Label>
                    <Input value={newFlowTriggerValue} onChange={(e) => setNewFlowTriggerValue(e.target.value)} placeholder="e.g., pricing, help" required />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description (optional)</Label>
                  <Input value={newFlowDescription} onChange={(e) => setNewFlowDescription(e.target.value)} placeholder="Brief description" />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="gradient-primary border-0 text-white">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Create
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Flows List */}
        {filteredFlows.length === 0 && !showCreate ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 mb-4">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="font-semibold">No automations yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Create one or use a template to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFlows.map((flow) => {
              const isExpanded = expandedFlow === flow.id;
              return (
                <Card key={flow.id} className="border-0 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedFlow(isExpanded ? null : flow.id)}>
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-sm", flow.is_active ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground")}>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{flow.name}</h3>
                          <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold", flow.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                            {flow.is_active ? "ACTIVE" : "STOPPED"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {flow.trigger_type === "keyword" && `Keyword: "${flow.trigger_value}"`}
                          {flow.trigger_type === "get_started" && "Get Started button"}
                          {flow.trigger_type === "default_reply" && "Default reply"}
                          {" · "}{flow.page.page_name}{" · "}{flow.flow_steps.length} step(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(flow.id, flow.is_active)} title={flow.is_active ? "Stop" : "Activate"}>
                        {flow.is_active ? <Power className="h-4 w-4 text-emerald-600" /> : <PowerOff className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/60 hover:text-destructive" onClick={() => handleDeleteFlow(flow.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      <Separator />
                      <div className="p-5 space-y-3 bg-muted/20">
                        {flow.description && <p className="text-sm text-muted-foreground italic">{flow.description}</p>}

                        {/* Visual flow steps */}
                        <div className="space-y-2">
                          {flow.flow_steps.sort((a, b) => a.step_order - b.step_order).map((step, idx) => (
                            <div key={step.id} className="flex items-start gap-3">
                              {/* Connector line */}
                              <div className="flex flex-col items-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white text-xs font-bold shrink-0">{idx + 1}</div>
                                {idx < flow.flow_steps.length - 1 && <div className="w-0.5 h-4 bg-primary/20 mt-1" />}
                              </div>
                              <div className="flex-1 rounded-xl border bg-background p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {step.step_type.replace("_", " ")}
                                  </span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteStep(flow.id, step.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{(step.config.text as string) || JSON.stringify(step.config)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Step */}
                        {addingStepTo === flow.id ? (
                          <div className="rounded-xl border bg-background p-4 space-y-3 ml-11">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</Label>
                            <Textarea value={newStepText} onChange={(e) => setNewStepText(e.target.value)} placeholder="Type what the bot should say..." rows={3} />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAddStep(flow.id)} disabled={loading || !newStepText.trim()} className="gradient-primary border-0 text-white">Add Step</Button>
                              <Button size="sm" variant="ghost" onClick={() => { setAddingStepTo(null); setNewStepText(""); }}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="ml-11 border-dashed" onClick={() => setAddingStepTo(flow.id)}>
                            <Plus className="mr-1 h-3 w-3" /> Add Step
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
