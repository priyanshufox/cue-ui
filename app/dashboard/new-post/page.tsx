"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPost, publishPost, uploadMedia } from "@/lib/api";

const channels = [
  { id: "twitter", name: "@yourbrand", platform: "Twitter/X", color: "bg-black", initial: "𝕏", limit: 280 },
  { id: "linkedin", name: "Your Brand", platform: "LinkedIn", color: "bg-blue-700", initial: "in", limit: 3000 },
  { id: "facebook", name: "Your Brand", platform: "Facebook", color: "bg-blue-600", initial: "f", limit: 63206 },
];

export default function NewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["twitter"]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [mediaKeys, setMediaKeys] = useState<string[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeChannel = channels.find((c) => selectedChannels[0] === c.id) ?? channels[0];
  const charLimit = activeChannel.limit;
  const charCount = content.length;
  const isOverLimit = charCount > charLimit;
  const canSubmit = content.trim().length > 0 && selectedChannels.length > 0 && !isOverLimit && !isSubmitting;

  function toggleChannel(id: string) {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const { url, key } = await uploadMedia(file);
      setMediaKeys((prev) => [...prev, key]);
      setMediaPreviews((prev) => [...prev, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeMedia(index: number) {
    setMediaKeys((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSchedule() {
    if (!canSubmit || !scheduleDate || !scheduleTime) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createPost({
        content,
        media_urls: mediaKeys,
        platforms: selectedChannels,
        scheduled_at: `${scheduleDate}T${scheduleTime}:00Z`,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule post");
      setIsSubmitting(false);
    }
  }

  async function handlePublishNow() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const post = await createPost({
        content,
        media_urls: mediaKeys,
        platforms: selectedChannels,
      });
      await publishPost(post.id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish post");
      setIsSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createPost({
        content,
        media_urls: mediaKeys,
        platforms: selectedChannels,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">New Post</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto grid lg:grid-cols-5 gap-6">
          {/* Composer */}
          <div className="lg:col-span-3 space-y-4">
            {/* Channel selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Post to
              </p>
              <div className="flex flex-wrap gap-2">
                {channels.map((ch) => {
                  const active = selectedChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        active
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${ch.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {ch.initial}
                      </span>
                      {ch.name}
                      {active && (
                        <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text editor */}
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Write / Preview tabs */}
              <div className="flex border-b border-gray-100 px-4 pt-3">
                {(["write", "preview"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 pb-2.5 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
                      tab === t
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === "write" ? (
                <div className="p-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What do you want to share?"
                    rows={6}
                    className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
                  />
                </div>
              ) : (
                <div className="p-4 min-h-40">
                  {content ? (
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{content}</div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Nothing to preview yet.</p>
                  )}
                </div>
              )}

              {/* Media previews */}
              {mediaPreviews.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {mediaPreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/80 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    title="Add image"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className={`text-xs font-medium ${isOverLimit ? "text-red-500" : charCount > charLimit * 0.8 ? "text-amber-500" : "text-gray-400"}`}>
                  {charCount}/{charLimit}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}
          </div>

          {/* Scheduling panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Schedule */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Schedule
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Time (UTC)</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Best times suggestion */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <div className="flex items-start gap-2 mb-3">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-semibold text-blue-700">Suggested posting times</p>
              </div>
              <div className="space-y-2">
                {[
                  { time: "9:00 AM", value: "09:00", label: "Peak engagement" },
                  { time: "12:30 PM", value: "12:30", label: "Lunch break audience" },
                  { time: "6:00 PM", value: "18:00", label: "Evening commuters" },
                ].map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setScheduleTime(slot.value)}
                    className="w-full flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-blue-100 hover:border-blue-300 transition-colors"
                  >
                    <span className="font-medium text-gray-700">{slot.time}</span>
                    <span className="text-gray-500">{slot.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={handleSchedule}
                disabled={!canSubmit || (!scheduleDate || !scheduleTime)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                {isSubmitting ? "Saving…" : scheduleDate && scheduleTime ? "Schedule post" : "Add to queue"}
              </button>
              <button
                onClick={handlePublishNow}
                disabled={!canSubmit}
                className="w-full bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium text-sm py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                {isSubmitting ? "Publishing…" : "Publish now"}
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={!canSubmit}
                className="w-full text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm py-2 rounded-xl transition-colors"
              >
                Save as draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
