"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAgentSchedule, getSocialAccounts, type SocialAccount } from "@/lib/api";
import { ToastStack, type ToastItem } from "@/app/components/Toast";

// ── Cron builder helpers ───────────────────────────────────────────────────

type Frequency = "daily" | "weekly" | "weekdays" | "custom";

const DAY_OPTIONS = [
  { label: "Mon", value: "1" },
  { label: "Tue", value: "2" },
  { label: "Wed", value: "3" },
  { label: "Thu", value: "4" },
  { label: "Fri", value: "5" },
  { label: "Sat", value: "6" },
  { label: "Sun", value: "0" },
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: `${i % 12 || 12}:00 ${i < 12 ? "AM" : "PM"}`,
}));

const MINUTE_OPTIONS = [
  { value: "0", label: ":00" },
  { value: "15", label: ":15" },
  { value: "30", label: ":30" },
  { value: "45", label: ":45" },
];

function buildCron(frequency: Frequency, day: string, hour: string, minute: string, custom: string): string {
  if (frequency === "custom") return custom.trim();
  const h = hour || "9";
  const m = minute || "0";
  if (frequency === "daily") return `${m} ${h} * * *`;
  if (frequency === "weekdays") return `${m} ${h} * * 1-5`;
  return `${m} ${h} * * ${day || "1"}`;
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  linkedin: { label: "LinkedIn", color: "bg-[#0077b5]" },
  twitter: { label: "X / Twitter", color: "bg-black" },
  facebook: { label: "Facebook", color: "bg-[#1877f2]" },
};

// ── Page ───────────────────────────────────────────────────────────────────

export default function NewAgentSchedulePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("");
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [day, setDay] = useState("1");
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("0");
  const [customCron, setCustomCron] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem["type"]) => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    getSocialAccounts()
      .then((data) => {
        setAccounts(data);
        setSelectedPlatforms(data.map((a) => a.platform));
      })
      .catch(() => {});
  }, []);

  function togglePlatform(platform: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  const cronExpression = buildCron(frequency, day, hour, minute, customCron);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { addToast("Name is required.", "error"); return; }
    if (!description.trim()) { addToast("Description is required.", "error"); return; }
    if (selectedPlatforms.length === 0) { addToast("Select at least one platform.", "error"); return; }
    if (frequency === "custom" && !customCron.trim()) { addToast("Enter a cron expression.", "error"); return; }

    setSubmitting(true);
    try {
      await createAgentSchedule({
        name: name.trim(),
        description: description.trim(),
        template: template.trim() || null,
        platforms: selectedPlatforms,
        cron_expression: cronExpression,
      });
      router.push("/dashboard/agent-schedules");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to create schedule.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <ToastStack toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/agent-schedules")}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-3"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          AI Scheduler
        </button>
        <h1 className="text-lg font-semibold text-white">New AI Schedule</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          The agent will research, write, and publish a post on your chosen schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-1">
          <label className="block text-xs text-gray-400 font-medium">Schedule name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Geopolitical Weekly, Monday Motivation"
            className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-1">
          <label className="block text-xs text-gray-400 font-medium">
            Topic &amp; instructions
            <span className="text-gray-600 font-normal ml-1">— tell the agent what to write about</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Weekly geopolitical news bulletin — cover major global developments, US-China relations, and EU policy. Tone: informative, neutral, professional."
            rows={3}
            className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none"
          />
        </div>

        {/* Template */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-1">
          <label className="block text-xs text-gray-400 font-medium">
            Style template
            <span className="text-gray-600 font-normal ml-1">— optional, paste a sample post to define the format</span>
          </label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder={"🌍 WORLD BULLETIN | Week of [DATE]\n\n📌 [HEADLINE]\n[Summary]\n\n#WorldNews #GeoPolitics"}
            rows={4}
            className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none font-mono"
          />
          <p className="text-[11px] text-gray-600 pt-1">
            The agent uses this as a style reference — not a literal template. Leave blank to let the agent choose its own format.
          </p>
        </div>

        {/* Platforms */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <label className="block text-xs text-gray-400 font-medium">Platforms</label>
          {accounts.length === 0 ? (
            <p className="text-xs text-gray-600">
              No channels connected.{" "}
              <a href="/dashboard" className="text-[#45b26b] hover:underline">Connect one</a> first.
            </p>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {accounts.map((account) => {
                const selected = selectedPlatforms.includes(account.platform);
                const meta = PLATFORM_LABELS[account.platform];
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => togglePlatform(account.platform)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      selected
                        ? "bg-[#1a1a1a] border-[#45b26b] text-white"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-500 hover:border-[#444]"
                    }`}
                  >
                    {selected && (
                      <svg className="w-3 h-3 text-[#45b26b] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${meta?.color ?? "bg-gray-700"}`}>
                      {account.platform === "linkedin" && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      )}
                      {account.platform === "twitter" && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      )}
                    </div>
                    {meta?.label ?? account.platform}
                    <span className="text-[10px] text-gray-600 font-normal truncate max-w-[80px]">{account.screen_name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Schedule builder */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-4">
          <label className="block text-xs text-gray-400 font-medium">Schedule <span className="text-gray-600 font-normal">(all times UTC)</span></label>

          {/* Frequency tabs */}
          <div className="flex items-center gap-1 bg-[#111] rounded-lg p-1">
            {(["daily", "weekly", "weekdays", "custom"] as Frequency[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                  frequency === f
                    ? "bg-[#252525] text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {frequency === "custom" ? (
            <div className="space-y-1">
              <input
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
                placeholder="0 12 * * 4"
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 font-mono focus:outline-none focus:border-[#45b26b] transition-colors"
              />
              <p className="text-[11px] text-gray-600">
                Standard 5-field cron: minute hour day month weekday. Example: <span className="text-gray-500 font-mono">0 12 * * 4</span> = every Thursday at noon.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Day picker (weekly only) */}
              {frequency === "weekly" && (
                <div className="flex items-center gap-1">
                  {DAY_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDay(d.value)}
                      className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                        day === d.value
                          ? "bg-[#45b26b] text-white"
                          : "bg-[#252525] text-gray-400 hover:text-white"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Time picker */}
              <div className="flex items-center gap-1.5">
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="bg-[#252525] border border-[#333] text-sm text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#45b26b] transition-colors [color-scheme:dark]"
                >
                  {HOUR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="bg-[#252525] border border-[#333] text-sm text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#45b26b] transition-colors [color-scheme:dark]"
                >
                  {MINUTE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Preview */}
          {cronExpression && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-[#111] rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5 text-[#45b26b] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-gray-600">{cronExpression}</span>
              <span className="text-gray-600">·</span>
              <span>
                {(() => {
                  const parts = cronExpression.trim().split(/\s+/);
                  if (parts.length !== 5) return cronExpression;
                  const [m, h, , , dow] = parts;
                  const hNum = parseInt(h), mNum = parseInt(m);
                  if (isNaN(hNum) || isNaN(mNum)) return cronExpression;
                  const t = `${hNum % 12 || 12}:${mNum.toString().padStart(2, "0")} ${hNum < 12 ? "AM" : "PM"} UTC`;
                  const days: Record<string, string> = { "0": "Sun", "1": "Mon", "2": "Tue", "3": "Wed", "4": "Thu", "5": "Fri", "6": "Sat" };
                  if (dow === "*") return `Every day at ${t}`;
                  if (dow === "1-5") return `Weekdays at ${t}`;
                  return `Every ${days[dow] ?? dow} at ${t}`;
                })()}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting || !name.trim() || !description.trim() || selectedPlatforms.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#45b26b] hover:bg-[#3da05f] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Create schedule
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/agent-schedules")}
            className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
