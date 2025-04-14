import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getThreadById = async (threadId: string) => {
  const { data: thread, error } = await supabase
    .from("threads")
    .select("*")
    .eq("id", threadId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return thread
}

export const getThreadByChatId = async (chatId: string) => {
  const { data: thread, error } = await supabase
    .from("threads")
    .select("*")
    .eq("chat_id", chatId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return thread
}

export const createThread = async (thread: TablesInsert<"threads">) => {
  const { data: createdThread, error } = await supabase
    .from("threads")
    .insert([thread])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdThread
}

export const updateThread = async (
  threadId: string,
  thread: TablesUpdate<"threads">
) => {
  const { data: updatedThread, error } = await supabase
    .from("threads")
    .update(thread)
    .eq("id", threadId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedThread
}

export const deleteThread = async (threadId: string) => {
  const { error } = await supabase.from("threads").delete().eq("id", threadId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
