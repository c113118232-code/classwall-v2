"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const MAX = 500;
const CHIPS = ["匿名", "全班可見", "即時同步"];

export function QuestionForm() {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState(0); // 送出成功 flash ring

  const length = content.length;
  const ratio = Math.min(length / MAX, 1);
  const nearLimit = ratio >= 0.85;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("questions")
      .insert({ content: trimmed });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setContent("");
    setFlashKey((k) => k + 1);
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative rounded-3xl border border-border/70 bg-card/70 backdrop-blur-md",
        "p-5 sm:p-7",
        "shadow-[0_1px_0_oklch(0.92_0.02_70_/_0.5),0_24px_48px_-20px_oklch(0.5_0.05_45_/_0.18)]"
      )}
    >
      {/* 三個提示 chips */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {CHIPS.map((c, i) => (
          <motion.span
            key={c}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className={cn(
              "inline-flex items-center rounded-full border border-border/60",
              "bg-muted/40 px-2.5 py-1 text-[11px] tracking-wider text-muted-foreground"
            )}
          >
            {c}
          </motion.span>
        ))}
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="想問什麼？匿名發問，全班都看得到..."
        maxLength={MAX}
        rows={3}
        disabled={submitting}
        className={cn(
          "resize-none border-transparent bg-transparent text-[15px] leading-relaxed",
          "px-0 focus-visible:ring-0 focus-visible:border-transparent",
          "placeholder:text-muted-foreground/60"
        )}
      />

      {/* 字數進度條 */}
      <div className="mt-3 flex items-center gap-3">
        <div
          className="h-[3px] flex-1 overflow-hidden rounded-full bg-muted"
          aria-hidden
        >
          <motion.div
            initial={false}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className={cn(
              "h-full rounded-full",
              nearLimit
                ? "bg-linear-to-r from-rose-400 to-orange-500"
                : "bg-linear-to-r from-amber-300 via-orange-400 to-rose-400"
            )}
          />
        </div>
        <span
          className={cn(
            "shrink-0 text-[11px] tabular-nums tracking-wider",
            nearLimit ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {length} / {MAX}
        </span>
      </div>

      <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative">
          <AnimatePresence>
            {flashKey > 0 ? (
              <motion.span
                key={flashKey}
                aria-hidden
                className="flash-ring rounded-full"
              />
            ) : null}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={submitting || content.trim().length === 0}
            whileTap={{ scale: 0.96 }}
            whileHover={
              submitting || content.trim().length === 0 ? undefined : { y: -1 }
            }
            className={cn(
              "group inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full",
              "bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground",
              "shadow-[0_8px_24px_-8px_oklch(0.62_0.18_38_/_0.5)]",
              "transition-[transform,box-shadow,opacity] duration-200",
              "hover:shadow-[0_12px_32px_-8px_oklch(0.62_0.18_38_/_0.7)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
              "sm:w-auto"
            )}
          >
            {submitting ? (
              <>
                <motion.span
                  aria-hidden
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                />
                <span>送出中</span>
              </>
            ) : (
              <>
                <span>送出問題</span>
                <motion.span
                  aria-hidden
                  className="inline-block"
                  initial={false}
                  animate={{ x: 0 }}
                  whileHover={{ x: 2 }}
                >
                  ↗
                </motion.span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-destructive"
        >
          送出失敗：{error}
        </motion.p>
      ) : null}
    </motion.form>
  );
}
