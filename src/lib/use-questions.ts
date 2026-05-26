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
  const sortByRef = useRef<"likes" | "recent">("likes");

  const loadMore = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const isFirst = offsetRef.current === 0;
    if (isFirst) setLoading(true);
    else setLoadingMore(true);

    const from = offsetRef.current;
    const to = from + pageSize - 1;

    // 根據 sortBy 決定 DB 查詢的排序
    let query = supabase.from("questions").select("*");

    if (sortBy === "likes") {
      query = query
        .order("likes", { ascending: false })
        .order("created_at", { ascending: false });
    } else {
      // sortBy === "recent"
      query = query.order("created_at", { ascending: false });
    }

    const { data, error: fetchError } = await query.range(from, to);

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

    // 第一頁時 replace，後續頁面時 append
    if (from === 0) {
      setQuestions(sortQuestions(batch, sortBy));
    } else {
      setQuestions((prev) => sortQuestions([...prev, ...batch], sortBy));
    }
    offsetRef.current = from + (data?.length ?? 0);
    setHasMore((data?.length ?? 0) === pageSize);
    setLoading(false);
    setLoadingMore(false);
  }, [pageSize, sortBy]);

  // 當 sortBy 改變時，重置分頁狀態，不直接改 questions state
  // 而是讓 loadMore 重新查詢並重新渲染
  useEffect(() => {
    offsetRef.current = 0;
    idSetRef.current.clear();
    sortByRef.current = sortBy;
  }, [sortBy]);

  // Mount 或 sortBy 改變時載入第一頁
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  useEffect(() => {
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
          setQuestions((prev) =>
            sortQuestions([next, ...prev], sortByRef.current)
          );
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
              sortByRef.current
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
  }, [loadMore]);

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
