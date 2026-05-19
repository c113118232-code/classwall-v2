"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { useAnswers } from "@/lib/use-answers";
import { cn } from "@/lib/utils";

type Props = {
  questionId: string;
};

const MAX = 500;

// 展開後的回答區塊：上面是回答列表、下面是輸入框
export function AnswerSection({ questionId }: Props) {
  const { answers, loading, error, addAnswer } = useAnswers(questionId);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    const result = await addAnswer(trimmed);
    setSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    setContent("");
  }

  return (
    <div className="mt-4 border-t border-border/60 pt-4">
      {/* 回答列表 */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <p className="text-xs text-muted-foreground">載入回答中…</p>
        ) : error ? (
          <p className="text-xs text-destructive">讀取失敗：{error}</p>
        ) : answers.length === 0 ? (
          <p className="text-xs italic text-muted-foreground/80">
            還沒有人回答，你來當第一個 ✨
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {answers.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5",
                  "text-[13px] leading-relaxed"
                )}
              >
                <p className="whitespace-pre-wrap">{a.content}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  {new Date(a.created_at).toLocaleString("zh-TW", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* 回答輸入框 */}
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="寫下你的回答…"
          maxLength={MAX}
          rows={2}
          disabled={submitting}
          className={cn(
            "w-full rounded-xl border border-border/70 bg-card/60 px-3 py-2",
            "text-[13px] leading-relaxed placeholder:text-muted-foreground/60",
            "resize-none focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/30",
            "transition-colors duration-200",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] tabular-nums text-muted-foreground/70">
            {content.length} / {MAX}
          </span>
          <motion.button
            type="submit"
            disabled={submitting || content.trim().length === 0}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 py-1.5",
              "text-xs font-medium transition-colors duration-200",
              "border border-primary/60 bg-primary/10 text-primary",
              "hover:bg-primary hover:text-primary-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {submitting ? "送出中…" : "送出回答"}
          </motion.button>
        </div>
        {submitError ? (
          <p className="text-xs text-destructive">送出失敗：{submitError}</p>
        ) : null}
      </form>
    </div>
  );
}
