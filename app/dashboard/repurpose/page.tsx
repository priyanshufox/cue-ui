"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  createRepurposingJob,
  createRawTextJob,
  uploadVideoFileJob,
  getRepurposingJobs,
  deleteRepurposingJob,
  type RepurposingJob,
} from "@/lib/api";
import { ToastStack, type ToastItem } from "@/app/components/Toast";

type SourceTab = "video_file" | "article_url" | "raw_text";

const SOURCE_LABELS: Record<SourceTab, string> = {
  video_file: "Upload Video",
  article_url: "Article URL",
  raw_text: "Raw Text",
};

const STATUS_STYLES: Record<RepurposingJob["status"], string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  processing: "bg-blue-500/10 text-blue-400",
  completed: "bg-[#45b26b]/15 text-[#45b26b]",
  failed: "bg-red-500/10 text-red-400",
};

const SOURCE_TYPE_LABELS: Record<RepurposingJob["source_type"], string> = {
  video_url: "Video",
  video_file: "Video File",
  article_url: "Article",
  raw_text: "Raw Text",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RepurposePage() {
  const [jobs, setJobs] = useState<RepurposingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [showAllJobs, setShowAllJobs] = useState(false);

  // Form state
  const [activeTab, setActiveTab] = useState<SourceTab>("video_file");
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const addToast = useCallback((message: string, type: ToastItem["type"]) => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    getRepurposingJobs()
      .then(setJobs)
      .catch(() => addToast("Failed to load jobs.", "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeTab === "raw_text" && !rawText.trim()) {
      addToast("Please enter some text to repurpose.", "error");
      return;
    }
    if (activeTab === "video_file" && !videoFile) {
      addToast("Please select a video file.", "error");
      return;
    }
    if (activeTab === "article_url" && !url.trim()) {
      addToast("Please enter a URL.", "error");
      return;
    }

    setSubmitting(true);
    try {
      let job: RepurposingJob;
      if (activeTab === "raw_text") {
        job = await createRawTextJob({ content: rawText, title: title || undefined });
      } else if (activeTab === "video_file") {
        job = await uploadVideoFileJob(videoFile!, title || undefined);
      } else {
        job = await createRepurposingJob({
          source_type: "article_url",
          source_url: url,
          title: title || undefined,
        });
      }
      setJobs((prev) => [job, ...prev]);
      setUrl("");
      setRawText("");
      setTitle("");
      setVideoFile(null);
      addToast("Job queued — assets will be ready in a minute.", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to submit.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteRepurposingJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      addToast("Job deleted.", "success");
    } catch {
      addToast("Failed to delete job.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <ToastStack toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">Repurpose Content</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Turn one piece of content into LinkedIn articles, Twitter threads, quote cards, and more.
        </p>
      </div>

      {/* Submit form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 mb-8"
      >
        {/* Source type tabs */}
        <div className="flex gap-1 p-1 bg-[#111111] rounded-lg mb-5 w-fit">
          {(["video_file", "article_url", "raw_text"] as SourceTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-[#252525] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {SOURCE_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {activeTab === "video_file" ? (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Video File
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) setVideoFile(f);
                }}
                onClick={() => document.getElementById("video-file-input")?.click()}
                className={`w-full border-2 border-dashed rounded-lg px-4 py-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  dragOver
                    ? "border-[#45b26b]/60 bg-[#45b26b]/5"
                    : videoFile
                    ? "border-[#45b26b]/40 bg-[#45b26b]/5"
                    : "border-[#333] bg-[#111111] hover:border-[#444]"
                }`}
              >
                <input
                  id="video-file-input"
                  type="file"
                  accept="video/*,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setVideoFile(f);
                  }}
                />
                {videoFile ? (
                  <>
                    <svg className="w-6 h-6 text-[#45b26b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-white font-medium truncate max-w-xs">{videoFile.name}</p>
                    <p className="text-xs text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors mt-1"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm text-gray-400">Drop a video here or <span className="text-[#45b26b]">browse</span></p>
                    <p className="text-xs text-gray-600">MP4, MOV, WebM, MP3, and more</p>
                  </>
                )}
              </div>
            </div>
          ) : activeTab === "article_url" ? (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Article URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/blog/post"
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#45b26b]/50 transition-colors"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Content / Transcript
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your transcript, article text, or any long-form content here…"
                rows={6}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#45b26b]/50 transition-colors resize-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Title <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give it a name for easy reference"
              className="w-full bg-[#111111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#45b26b]/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#252525]">
          <p className="text-xs text-gray-600">
            Generates a LinkedIn article, Twitter thread, 3 quote cards, 5 clip markers, and an audiogram marker.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-[#45b26b] hover:bg-[#3da05f] disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
              </svg>
            )}
            {submitting ? "Processing…" : "Repurpose"}
          </button>
        </div>
      </form>

      {/* Jobs list */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3">Recent Jobs</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-[#45b26b]/30 border-t-[#45b26b] rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium">No jobs yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Submit a URL or text above to generate your first batch of assets.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {(showAllJobs ? jobs : jobs.slice(0, 2)).map((job) => (
              <div
                key={job.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white truncate">
                      {job.title ?? `${SOURCE_TYPE_LABELS[job.source_type]} — ${formatDate(job.created_at)}`}
                    </span>
                    <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[job.status]}`}>
                      {job.status === "processing" ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                          processing
                        </span>
                      ) : job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>{SOURCE_TYPE_LABELS[job.source_type]}</span>
                    {job.source_url && (
                      <span className="truncate max-w-[220px]">{job.source_url}</span>
                    )}
                    {job.status === "completed" && (
                      <span className="text-[#45b26b]">{job.asset_count} assets ready</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {job.status === "completed" && (
                    <Link
                      href={`/dashboard/repurpose/${job.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#252525] hover:bg-[#2f2f2f] border border-[#333] rounded-lg transition-colors"
                    >
                      View assets
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  )}
                  {(job.status === "pending" || job.status === "processing") && (
                    <Link
                      href={`/dashboard/repurpose/${job.id}`}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(job.id)}
                    disabled={deletingId === job.id}
                    className="p-1.5 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete job"
                  >
                    {deletingId === job.id ? (
                      <div className="w-3.5 h-3.5 border border-gray-600 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {jobs.length > 2 && (
              <button
                onClick={() => setShowAllJobs((prev) => !prev)}
                className="w-full mt-1 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showAllJobs ? "Show less" : `Show ${jobs.length - 2} more`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
