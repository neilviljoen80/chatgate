"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createFlow(
  pageId: string,
  name: string,
  triggerType: string,
  triggerValue: string | null,
  description: string | null
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify page ownership
  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .single();

  if (!page) return { error: "Page not found" };

  const { data: flow, error } = await supabase
    .from("flows")
    .insert({
      page_id: pageId,
      user_id: user.id,
      name,
      trigger_type: triggerType,
      trigger_value: triggerValue,
      description,
      is_active: false,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/flows");
  return { success: true, flow };
}

export async function addFlowStep(
  flowId: string,
  stepType: string,
  config: Record<string, unknown>,
  stepOrder: number
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify flow ownership
  const { data: flow } = await supabase
    .from("flows")
    .select("id")
    .eq("id", flowId)
    .eq("user_id", user.id)
    .single();

  if (!flow) return { error: "Flow not found" };

  const { data: step, error } = await supabase
    .from("flow_steps")
    .insert({
      flow_id: flowId,
      step_type: stepType,
      config,
      step_order: stepOrder,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/flows");
  return { success: true, step };
}

export async function toggleFlow(flowId: string, isActive: boolean) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("flows")
    .update({ is_active: isActive })
    .eq("id", flowId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/flows");
  return { success: true };
}

export async function deleteFlow(flowId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("flows")
    .delete()
    .eq("id", flowId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/flows");
  return { success: true };
}

export async function deleteFlowStep(stepId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify ownership through flow
  const { data: step } = await supabase
    .from("flow_steps")
    .select("flow_id")
    .eq("id", stepId)
    .single();

  if (!step) return { error: "Step not found" };

  const { data: flow } = await supabase
    .from("flows")
    .select("id")
    .eq("id", step.flow_id)
    .eq("user_id", user.id)
    .single();

  if (!flow) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("flow_steps")
    .delete()
    .eq("id", stepId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/flows");
  return { success: true };
}
