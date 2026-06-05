"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getRepurposingJob,
  scheduleRepurposingAssets,
  type RepurposedAsset,
  type RepurposingJobDetail,
} from "@/lib/api";
import { ToastStack, type ToastItem } from "@/app/components/Toast";

// ── Display helpers ────────────────────────────────────────────────────────

const ASSET_TYPE_LABELS: Record<RepurposedAsset["asset_type"], string> = {
  linkedin_article: "LinkedIn Article",
  twitter_thread: "Twitter Thread",
  quote_card: "Quote Card",
  reel_clip: "Reel / Short",
  audiogram: "Audiogram",
};

const ASSET_TYPE_COLORS: Record<RepurposedAsset["asset_type"], string> = {
  linkedin_article: "bg-[#0077b5]/15 text-[#0077b5]",
  twitter_thread: "bg-white/10 text-white",
  quote_card: "bg-purple-500/15 text-purple-400",
  reel_clip: "bg-orange-500/15 text-orange-400",
  audiogram: "bg-pink-500/15 text-pink-400",
};

const ASSET_ORDER: RepurposedAsset["asset_type"][] = [
  "linkedin_article",
  "twitter_thread",
  "quote_card",
  "reel_clip",
  "audiogram",
];

const STATUS_STYLES: Record<RepurposingJobDetail["status"], string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  processing: "bg-blue-500/10 text-blue-400",
  completed: "bg-[#45b26b]/15 text-[#45b26b]",
  failed: "bg-red-500/10 text-red-400",
};

function ClipMetadata({ meta }: { meta: Record<string, unknown> | undefined }) {
  if (!meta || (!meta.start_sec && meta.start_sec !== 0)) return null;
  const fmt = (s: unknown) => {
    const sec = Number(s);
    const m = Math.floor(sec / 60);
    const r = Math.floor(sec % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
      <span className="flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {fmt(meta.start_sec)} – {fmt(meta.end_sec)}
      </span>
      {meta.title && <span className="text-gray-600 truncate">{String(meta.title)}</span>}
    </div>
  );
}

// ── Schedule popover ───────────────────────────────────────────────────────

function SchedulePopover({
  assetId,
  jobId,
  onScheduled,
  onClose,
}: {
  assetId: number;
  jobId: number;
  onScheduled: (assetId: number) => void;
  onClose: () => void;
}) {
  const [dt, setDt] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(12, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [onClose]);

  async function handleSchedule() {
    if (!dt) { setError("Pick a date and time."); return; }
    setSaving(true);
    setError("");
    try {
      await scheduleRepurposingAssets(jobId, {
        asset_ids: [assetId],
        scheduled_times: [new Date(dt).toISOString()],
      });
      onScheduled(assetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      ref={ref}
      className="absolute z-20 right-0 top-full mt-2 w-72 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl p-4"
    >
      <p className="text-xs font-medium text-gray-300 mb-3">Schedule this asset</p>
      <input
        type="datetime-local"
        value={dt}
        onChange={(e) => setDt(e.target.value)}
        className="w-full bg-[#111111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#45b26b]/50 mb-3"
      />
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-3 py-2 text-xs text-gray-400 bg-[#252525] hover:bg-[#2f2f2f] rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSchedule}
          disabled={saving}
          className="flex-1 px-3 py-2 text-xs text-white bg-[#45b26b] hover:bg-[#3da05f] disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          {saving && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? "Scheduling…" : "Schedule"}
        </button>
      </div>
    </div>
  );
}

// ── Asset card ─────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  jobId,
  onScheduled,
  addToast,
}: {
  asset: RepurposedAsset;
  jobId: number;
  onScheduled: (assetId: number) => void;
  addToast: (msg: string, type: ToastItem["type"]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isMediaMarker = asset.asset_type === "reel_clip" || asset.asset_type === "audiogram";
  const isScheduled = asset.status !== "draft";

  useEffect(() => {
    const el = contentRef.current;
    if (el) setIsClamped(el.scrollHeight > el.clientHeight);
  }, [asset.content]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(asset.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      addToast("Failed to copy.", "error");
    }
  }

  return (
    <div className={`bg-[#1a1a1a] border rounded-xl p-4 transition-colors ${
      isScheduled ? "border-[#45b26b]/30" : "border-[#2a2a2a]"
    }`}>
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${ASSET_TYPE_COLORS[asset.asset_type]}`}>
            {ASSET_TYPE_LABELS[asset.asset_type]}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#252525] border border-[#333] text-gray-400 capitalize flex-shrink-0">
            {asset.platform}
          </span>
          {isScheduled && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#45b26b]/10 text-[#45b26b] flex-shrink-0 capitalize">
              {asset.status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 relative">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors"
            title="Copy content"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-[#45b26b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
          </button>
          {!isScheduled && !isMediaMarker && (
            <button
              onClick={() => setShowScheduler((v) => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-white bg-[#252525] hover:bg-[#2f2f2f] border border-[#333] rounded-lg transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Schedule
            </button>
          )}
          {isMediaMarker && (
            <span className="text-[11px] text-gray-600 px-2">Clip marker</span>
          )}
          {showScheduler && (
            <SchedulePopover
              assetId={asset.id}
              jobId={jobId}
              onScheduled={(id) => { onScheduled(id); setShowScheduler(false); }}
              onClose={() => setShowScheduler(false)}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className={`text-sm text-gray-300 leading-relaxed whitespace-pre-wrap cursor-pointer ${
          !expanded ? "line-clamp-4" : ""
        }`}
        onClick={() => isClamped || expanded ? setExpanded((v) => !v) : undefined}
      >
        {asset.content}
      </div>

      {/* Clip/audiogram metadata */}
      {isMediaMarker && <ClipMetadata meta={asset.metadata} />}

      {/* Thread tweet list */}
      {asset.asset_type === "twitter_thread" && expanded && Array.isArray(asset.metadata?.tweets) && (
        <div className="mt-3 space-y-2 pt-3 border-t border-[#252525]">
          {(asset.metadata.tweets as string[]).map((tweet, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[10px] text-gray-600 pt-0.5 flex-shrink-0">{i + 1}/</span>
              <p className="text-xs text-gray-400 leading-relaxed">{tweet}</p>
            </div>
          ))}
        </div>
      )}

      {/* Expand/collapse toggle */}
      {(isClamped || expanded) && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function RepurposeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);

  const [job, setJob] = useState<RepurposingJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [scheduledAssetIds, setScheduledAssetIds] = useState<Set<number>>(new Set());

  const addToast = useCallback((message: string, type: ToastItem["type"]) => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadJob = useCallback(async () => {
    try {
      const data = await getRepurposingJob(jobId);
      setJob(data);
      // Mark already-scheduled assets
      const ids = new Set(data.assets.filter((a) => a.status !== "draft").map((a) => a.id));
      setScheduledAssetIds(ids);
    } catch {
      addToast("Failed to load job.", "error");
    } finally {
      setLoading(false);
    }
  }, [jobId, addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJob();
  }, [loadJob]);

  // Poll while processing
  useEffect(() => {
    if (!job) return;
    if (job.status !== "pending" && job.status !== "processing") return;
    const timer = setTimeout(() => loadJob(), 4000);
    return () => clearTimeout(timer);
  }, [job, loadJob]);

  function handleAssetScheduled(assetId: number) {
    setScheduledAssetIds((prev) => new Set([...prev, assetId]));
    addToast("Asset scheduled!", "success");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-[#45b26b]/30 border-t-[#45b26b] rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-8 text-center">
        <p className="text-gray-400">Job not found.</p>
        <Link href="/dashboard/repurpose" className="text-sm text-[#45b26b] hover:underline mt-2 inline-block">
          Back to Repurpose
        </Link>
      </div>
    );
  }

  const sortedAssets = [...job.assets].sort(
    (a, b) => ASSET_ORDER.indexOf(a.asset_type) - ASSET_ORDER.indexOf(b.asset_type)
  );

  const isProcessing = job.status === "pending" || job.status === "processing";
  const scheduledCount = scheduledAssetIds.size;

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <ToastStack toasts={toasts} onClose={removeToast} />

      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/dashboard/repurpose")}
          className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-[#252525] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-white truncate">
              {job.title ?? "Repurposing Job"}
            </h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${STATUS_STYLES[job.status]}`}>
              {isProcessing ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                  {job.status}
                </span>
              ) : job.status}
            </span>
          </div>
          {job.source_url && (
            <p className="text-xs text-gray-600 mt-0.5 truncate">{job.source_url}</p>
          )}
        </div>
        {job.status === "completed" && scheduledCount > 0 && (
          <div className="text-xs text-[#45b26b] flex-shrink-0">
            {scheduledCount}/{sortedAssets.length} scheduled
          </div>
        )}
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 flex flex-col items-center gap-4 mb-6">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-white">Generating assets…</p>
            <p className="text-xs text-gray-500 mt-1">
              Transcribing, analysing, and writing your content. This takes about a minute.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {job.status === "failed" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-red-400 mb-1">Processing failed</p>
          <p className="text-xs text-red-300/70">{job.error_message ?? "Unknown error"}</p>
        </div>
      )}

      {/* Assets */}
      {job.status === "completed" && sortedAssets.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              {sortedAssets.length} assets generated
            </p>
          </div>

          <div className="space-y-3">
            {sortedAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={scheduledAssetIds.has(asset.id) ? { ...asset, status: "scheduled" } : asset}
                jobId={jobId}
                onScheduled={handleAssetScheduled}
                addToast={addToast}
              />
            ))}
          </div>
        </>
      )}

      {/* Completed but no assets edge case */}
      {job.status === "completed" && sortedAssets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-gray-400">No assets were generated.</p>
          <p className="text-xs text-gray-600 mt-1">The source content may have been too short or unreachable.</p>
        </div>
      )}
    </div>
  );
}
