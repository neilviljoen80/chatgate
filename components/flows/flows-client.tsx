"use client";

import { useState } from "react";
import { createFlow, addFlowStep, toggleFlow, deleteFlow, deleteFlowStep } from "@/app/actions/flows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  { value: "keyword", label: "Keyword Match", description: "Trigger when message contains a specific word" },
  { value: "get_started", label: "Get Started", description: "Trigger when user taps Get Started button" },
  { value: "default_reply", label: "Default Reply", description: "Fallback reply when no other flow matches" },
];

export function FlowsClient({ flows: initialFlows, pages }: FlowsClientProps) {
  const [flows, setFlows] = useState(initialFlows);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Create flow form state
  const [newFlowName, setNewFlowName] = useState("");
  const [newFlowPage, setNewFlowPage] = useState(pages[0]?.id || "");
  const [newFlowTrigger, setNewFlowTrigger] = useState("keyword");
  const [newFlowTriggerValue, setNewFlowTriggerValue] = useState("");
  const [newFlowDescription, setNewFlowDescription] = useState("");

  // Add step form state
  const [newStepText, setNewStepText] = useState("");
  const [addingStepTo, setAddingStepTo] = useState<string | null>(null);

  async function handleCreateFlow(e: React.FormEvent) {
    e.preventDefault();
    if (!newFlowName.trim() || !newFlowPage) return;

    setLoading(true);
    const result = await createFlow(
      newFlowPage,
      newFlowName.trim(),
      newFlowTrigger,
      newFlowTrigger === "keyword" ? newFlowTriggerValue.toLowerCase().trim() : null,
      newFlowDescription.trim() || null
    );

    if (result.error) {
      alert(result.error);
    } else {
      setShowCreate(false);
      setNewFlowName("");
      setNewFlowTriggerValue("");
      setNewFlowDescription("");
      // Add to local state
      if (result.flow) {
        const page = pages.find((p) => p.id === newFlowPage);
        setFlows((prev) => [
          { ...result.flow, flow_steps: [], page: { page_name: page?.page_name || "" } } as Flow,
          ...prev,
        ]);
      }
    }
    setLoading(false);
  }

  async function handleAddStep(flowId: string) {
    if (!newStepText.trim()) return;

    setLoading(true);
    const flow = flows.find((f) => f.id === flowId);
    const stepOrder = flow ? flow.flow_steps.length : 0;

    const result = await addFlowStep(flowId, "send_message", { text: newStepText.trim() }, stepOrder);

    if (result.error) {
      alert(result.error);
    } else {
      setNewStepText("");
      setAddingStepTo(null);
      // Update local state
      if (result.step) {
        setFlows((prev) =>
          prev.map((f) =>
            f.id === flowId
              ? { ...f, flow_steps: [...f.flow_steps, result.step as FlowStep] }
              : f
          )
        );
      }
    }
    setLoading(false);
  }

  async function handleToggle(flowId: string, currentActive: boolean) {
    const result = await toggleFlow(flowId, !currentActive);
    if (!result.error) {
      setFlows((prev) =>
        prev.map((f) => (f.id === flowId ? { ...f, is_active: !currentActive } : f))
      );
    }
  }

  async function handleDeleteFlow(flowId: string) {
    if (!confirm("Delete this flow and all its steps?")) return;
    const result = await deleteFlow(flowId);
    if (!result.error) {
      setFlows((prev) => prev.filter((f) => f.id !== flowId));
    }
  }

  async function handleDeleteStep(flowId: string, stepId: string) {
    const result = await deleteFlowStep(stepId);
    if (!result.error) {
      setFlows((prev) =>
        prev.map((f) =>
          f.id === flowId
            ? { ...f, flow_steps: f.flow_steps.filter((s) => s.id !== stepId) }
            : f
        )
      );
    }
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Zap className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Connect a Facebook Page first to create automation flows.</p>
        <a href="/dashboard/connect" className="mt-4 text-primary hover:underline text-sm font-medium">
          Connect a Page
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Flow Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{flows.length} flow(s)</p>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Flow
        </Button>
      </div>

      {/* Create Flow Form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Automation Flow</CardTitle>
            <CardDescription>Set up a trigger and automated reply sequence.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFlow} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Flow Name</Label>
                  <Input
                    value={newFlowName}
                    onChange={(e) => setNewFlowName(e.target.value)}
                    placeholder="e.g., Welcome Flow"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facebook Page</Label>
                  <select
                    value={newFlowPage}
                    onChange={(e) => setNewFlowPage(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    required
                  >
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.page_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {triggerTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setNewFlowTrigger(t.value)}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-colors",
                        newFlowTrigger === t.value
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {newFlowTrigger === "keyword" && (
                <div className="space-y-2">
                  <Label>Keyword</Label>
                  <Input
                    value={newFlowTriggerValue}
                    onChange={(e) => setNewFlowTriggerValue(e.target.value)}
                    placeholder="e.g., pricing, hello, help"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The flow triggers when the incoming message contains this word.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  value={newFlowDescription}
                  onChange={(e) => setNewFlowDescription(e.target.value)}
                  placeholder="Brief description of this flow"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Flow
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Flows List */}
      {flows.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Zap className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No automation flows yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flows.map((flow) => {
            const isExpanded = expandedFlow === flow.id;
            return (
              <Card key={flow.id}>
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandedFlow(isExpanded ? null : flow.id)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{flow.name}</h3>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            flow.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {flow.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {flow.trigger_type === "keyword" && `Keyword: "${flow.trigger_value}"`}
                        {flow.trigger_type === "get_started" && "Get Started button"}
                        {flow.trigger_type === "default_reply" && "Default reply (fallback)"}
                        {" · "}
                        {flow.page.page_name}
                        {" · "}
                        {flow.flow_steps.length} step(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(flow.id, flow.is_active)}
                      title={flow.is_active ? "Deactivate" : "Activate"}
                    >
                      {flow.is_active ? (
                        <Power className="h-4 w-4 text-green-600" />
                      ) : (
                        <PowerOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFlow(flow.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <>
                    <Separator />
                    <div className="p-4 space-y-3">
                      {flow.description && (
                        <p className="text-sm text-muted-foreground">{flow.description}</p>
                      )}

                      {/* Steps */}
                      {flow.flow_steps
                        .sort((a, b) => a.step_order - b.step_order)
                        .map((step, idx) => (
                          <div
                            key={step.id}
                            className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-medium capitalize">
                                  {step.step_type.replace("_", " ")}
                                </span>
                              </div>
                              <p className="text-sm mt-1 whitespace-pre-wrap">
                                {(step.config.text as string) || JSON.stringify(step.config)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 h-7 w-7"
                              onClick={() => handleDeleteStep(flow.id, step.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                      {/* Add Step */}
                      {addingStepTo === flow.id ? (
                        <div className="space-y-2 rounded-lg border p-3">
                          <Label className="text-xs">Message text</Label>
                          <Input
                            value={newStepText}
                            onChange={(e) => setNewStepText(e.target.value)}
                            placeholder="Type the message the bot should send..."
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddStep(flow.id)}
                              disabled={loading || !newStepText.trim()}
                            >
                              Add Step
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAddingStepTo(null);
                                setNewStepText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddingStepTo(flow.id)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Step
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
    </div>
  );
}
