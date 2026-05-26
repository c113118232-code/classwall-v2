"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import type { Question } from "@/types/database";

const DEFAULT_PAGE_SIZE = 10;

// 依排序方式排列 questions
function sortQuestions(
  list: Question[],
  sortBy: "likes" | "recent"
): Question[] {
  return [...list].sort((a, b) => {
    if (sortBy === "likes") {
      // 先按讚數降冪，同讚數時新的在前
      if (b.likes !== a.likes) return b.likes - a.likes;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      // sortBy === "recent"：直接按時間，新的在前
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });
}

/**
 * 分頁載入 questions + Realtime 訂閱
 *
 * 策略：
 * - DB 端按 likes DESC, created_at DESC 分頁（高讚的永遠在前面）
 * - 不再 client 端二次排序，由 DB 與 hook 統一維持順序
 * - INSERT / UPDATE 後都重新排序，確保位置正確
 * - 用 idSet 去重避免分頁與 realtime 同時拿到同一筆
 *
 * 已知代價：高讚題目按讚變動時可能在分頁邊界漂移，
 * 教學情境量級不大、可接受。
 */
export function useQuestions(pageSize = DEFAULT_PAGE_SIZE) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"likes" | "recent">("likes");

  const offsetRef = useRef(0);
  const idSetRef = useRef<Set<string>>(new Set());
  const inFlightRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const isFirst = offsetRef.current === 0;
    if (isFirst) setLoading(true);
    else setLoadingMore(true);

    const from = offsetRef.current;
    const to = from + pageSize - 1;

    const { data, error: fetchError } = await supabase
      .from("questions")
      .select("*")
      .order("likes", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    inFlightRef.current = false;

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const batch = (data ?? []).filter((q) => {
      if (idSetRef.current.has(q.id)) return false;
      idSetRef.current.add(q.id);
      return true;
    });

    setQuestions((prev) => sortQuestions([...prev, ...batch], sortBy));
    offsetRef.current = from + (data?.length ?? 0);
    setHasMore((data?.length ?? 0) === pageSize);
    setLoading(false);
    setLoadingMore(false);
  }, [pageSize, sortBy]);

  useEffect(() => {
    loadMore();

    const channel = supabase
      .channel("questions-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "questions" },
        (payload) => {
          const next = payload.new as Question;
          if (idSetRef.current.has(next.id)) return;
          idSetRef.current.add(next.id);
          // 新題依排序方式插入正確位置
          setQuestions((prev) => sortQuestions([next, ...prev], sortBy));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "questions" },
        (payload) => {
          const next = payload.new as Question;
          // 按讚或不喜歡變動後重新排序，讓位置即時跟著動
          setQuestions((prev) =>
            sortQuestions(
              prev.map((q) => (q.id === next.id ? next : q)),
              sortBy
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "questions" },
        (payload) => {
          const old = payload.old as Pick<Question, "id">;
          idSetRef.current.delete(old.id);
          setQuestions((prev) => prev.filter((q) => q.id !== old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // 只在 mount 時跑一次；loadMore 因為 useCallback 穩定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    questions,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    sortBy,
    setSortBy,
  };
}
