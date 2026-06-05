"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPost, uploadMedia, getSocialAccounts, type SocialAccount } from "@/lib/api";
import { ToastStack, type ToastItem } from "@/app/components/Toast";

type Mode = "now" | "schedule";

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem["type"]) => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    getSocialAccounts().then((data) => {
      setAccounts(data);
      setSelectedPlatforms(data.map((a) => a.platform));
    }).catch(() => {});
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  }

  function removeMedia() {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      addToast("Post content is required.", "error");
      return;
    }
    if (selectedPlatforms.length === 0) {
      addToast("Select at least one platform.", "error");
      return;
    }
    if (mode === "schedule" && !scheduledAt) {
      addToast("Please pick a date/time to schedule.", "error");
      return;
    }

    setSubmitting(true);

    try {
      let mediaUrls: string[] = [];

      if (mediaFile) {
        setUploadingMedia(true);
        try {
          const { key } = await uploadMedia(mediaFile);
          mediaUrls = [key];
        } finally {
          setUploadingMedia(false);
        }
      }

      const scheduled = mode === "schedule" ? new Date(scheduledAt).toISOString() : null;

      const post = await createPost({
        content: content.trim(),
        media_urls: mediaUrls,
        platforms: selectedPlatforms,
        scheduled_at: scheduled,
      });

      if (mode === "now" && post.status === "draft") {
        const { publishPost } = await import("@/lib/api");
        await publishPost(post.id);
        const names = selectedPlatforms.map((p) => p === "twitter" ? "X / Twitter" : "LinkedIn").join(" & ");
        addToast(`Post published to ${names}!`, "success");
      } else {
        addToast(
          mode === "schedule"
            ? `Post scheduled for ${new Date(scheduledAt).toLocaleString()}.`
            : "Post saved as draft.",
          "success"
        );
      }

      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const charCount = content.length;
  const hasTwitter = selectedPlatforms.includes("twitter");
  const CHAR_LIMIT = hasTwitter ? 280 : 3000;
  const charWarning = charCount > CHAR_LIMIT * 0.9;
  const charOver = charCount > CHAR_LIMIT;

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <ToastStack toasts={toasts} onClose={removeToast} />
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">Create Post</h1>
        <p className="text-sm text-gray-500 mt-0.5">Compose and schedule or publish to your connected channels</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Platform selector */}
        {accounts.length === 0 ? (
          <p className="text-xs text-gray-500">No channels connected. <a href="/dashboard" className="text-[#45b26b] hover:underline">Connect one</a> first.</p>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {accounts.map((account) => {
              const selected = selectedPlatforms.includes(account.platform);
              const isLinkedIn = account.platform === "linkedin";
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setSelectedPlatforms((prev) =>
                    prev.includes(account.platform)
                      ? prev.filter((p) => p !== account.platform)
                      : [...prev, account.platform]
                  )}
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
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isLinkedIn ? "bg-[#0077b5]" : "bg-black"}`}>
                    {isLinkedIn ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    )}
                  </div>
                  {isLinkedIn ? "LinkedIn" : "X / Twitter"}
                  <span className="text-[10px] text-gray-600 font-normal truncate max-w-[80px]">{account.screen_name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content editor */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to share?"
            rows={6}
            maxLength={CHAR_LIMIT}
            className="w-full bg-transparent px-4 pt-4 pb-2 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none"
          />

          {/* Media preview */}
          {mediaPreview && (
            <div className="px-4 pb-3">
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#333] text-gray-300 hover:text-white flex items-center justify-center"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#252525] transition-colors"
                title="Add image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
            </div>
            <span className={`text-xs ${charOver ? "text-red-400" : charWarning ? "text-yellow-500" : "text-gray-600"}`}>
              {charCount}/{CHAR_LIMIT}
            </span>
          </div>
        </div>

        {/* Publish mode toggle */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setMode("now")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === "now"
                  ? "bg-[#252525] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Publish now
            </button>
            <button
              type="button"
              onClick={() => setMode("schedule")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === "schedule"
                  ? "bg-[#252525] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Schedule
            </button>
          </div>

          {mode === "schedule" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Date & time (your local time)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                // eslint-disable-next-line react-hooks/purity
                min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                className="bg-[#252525] border border-[#383838] text-sm text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#45b26b] transition-colors [color-scheme:dark]"
              />
              <p className="text-[11px] text-gray-600 mt-1">Stored and sent in UTC.</p>
            </div>
          )}
        </div>


        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !content.trim() || charOver || selectedPlatforms.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#45b26b] hover:bg-[#3da05f] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {uploadingMedia ? "Uploading…" : mode === "now" ? "Publishing…" : "Scheduling…"}
              </>
            ) : (
              <>
                {mode === "now" ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                  </svg>
                )}
                {mode === "now" ? "Publish now" : "Schedule post"}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
