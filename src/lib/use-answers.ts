"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import type { Answer } from "@/types/database";

/**
 * 載入單一 question 的回答 + Realtime 訂閱
 *
 * 用法：在 QuestionCard 展開時 mount 這個 hook，
 * 收起時 unmount 即自動取消訂閱（節省連線數）。
 *
 * 載入順序：時間升冪（舊 → 新，像聊天訊息）
 */
export function useAnswers(questionId: string) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error: fetchError } = await supabase
        .from("answers")
        .select("*")
        .eq("question_id", questionId)
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setAnswers(data ?? []);
      }
      setLoading(false);
    }

    load();

    // Realtime：只訂閱該題的 INSERT
    const channel = supabase
      .channel(`answers-${questionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "answers",
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          const next = payload.new as Answer;
          setAnswers((prev) =>
            prev.some((a) => a.id === next.id) ? prev : [...prev, next]
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [questionId]);

  const addAnswer = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return { error: "回答不能為空" };

      const { error: insertError } = await supabase
        .from("answers")
        .insert({ question_id: questionId, content: trimmed });

      if (insertError) return { error: insertError.message };
      return { error: null };
    },
    [questionId]
  );

  return { answers, loading, error, addAnswer };
}
