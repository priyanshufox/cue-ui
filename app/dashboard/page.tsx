"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPosts, publishPost, type Post } from "@/lib/api";
import { Toast } from "@/app/components/Toast";

type Tab = "scheduled" | "drafts" | "sent" | "failed";

const TAB_STATUS: Record<Tab, string> = {
  scheduled: "scheduled",
  drafts: "draft",
  sent: "published",
  failed: "failed",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PostCard({ post, onPublish }: { post: Post; onPublish: (id: number) => void }) {
  const [publishing, setPublishing] = useState(false);

  async function handlePublish() {
    setPublishing(true);
    try {
      await onPublish(post.id);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex gap-4">
      {post.media_urls.length > 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.media_urls[0]}
          alt=""
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-[#252525]"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-relaxed line-clamp-2 mb-2">{post.content}</p>
        <div className="flex items-center gap-3 flex-wrap">
          {post.platforms.map((p) => (
            <span key={p} className="flex items-center gap-1 text-[11px] text-gray-500">
              {p === "linkedin" && (
                <>
                  <svg className="w-3 h-3 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </>
              )}
              {p === "twitter" && (
                <>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X / Twitter
                </>
              )}
            </span>
          ))}
          {post.scheduled_at && (
            <span className="text-[11px] text-gray-500">
              Scheduled: {formatDate(post.scheduled_at)}
            </span>
          )}
          {post.published_at && (
            <span className="text-[11px] text-gray-500">
              Published: {formatDate(post.published_at)}
            </span>
          )}
          {post.error_message && (
            <span className="text-[11px] text-red-400 truncate max-w-xs" title={post.error_message}>
              {post.error_message}
            </span>
          )}
        </div>
      </div>
      {(post.status === "draft" || post.status === "scheduled") && (
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex-shrink-0 self-start px-3 py-1.5 text-xs font-medium text-white bg-[#45b26b] hover:bg-[#3da05f] disabled:opacity-50 rounded-lg transition-colors"
        >
          {publishing ? "Publishing…" : "Publish now"}
        </button>
      )}
    </div>
  );
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  linkedin_denied: "LinkedIn connection was cancelled.",
  linkedin_token_exchange: "Failed to get LinkedIn access token.",
  linkedin_profile_fetch: "Failed to fetch LinkedIn profile.",
  twitter_denied: "X / Twitter connection was cancelled.",
  twitter_token_exchange: "Failed to get X / Twitter access token.",
  twitter_profile_fetch: "Failed to fetch X / Twitter profile.",
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("scheduled");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive initial toast from URL params on first render, then clear URL
  const connected = searchParams.get("connected");
  const oauthError = searchParams.get("error");
  const upgraded = searchParams.get("upgraded");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(() => {
    if (connected === "linkedin") return { message: "LinkedIn connected successfully!", type: "success" };
    if (connected === "twitter") return { message: "X / Twitter connected successfully!", type: "success" };
    if (oauthError) return { message: OAUTH_ERROR_MESSAGES[oauthError] ?? "Connection failed.", type: "error" };
    if (upgraded === "1") return { message: "You're now on Pro — enjoy unlimited posts and channels!", type: "success" };
    return null;
  });

  useEffect(() => {
    if (connected || oauthError || upgraded) router.replace("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch {
        // not authed or network error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handlePublish(postId: number) {
    try {
      const updated = await publishPost(postId);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setToast({ message: "Post published!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Publish failed", type: "error" });
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "scheduled", label: "Scheduled" },
    { key: "drafts", label: "Drafts" },
    { key: "sent", label: "Sent" },
    { key: "failed", label: "Failed" },
  ];

  const filtered = posts.filter((p) => p.status === TAB_STATUS[activeTab]);

  return (
    <div className="h-full flex flex-col">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 pointer-events-none">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Top header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            <div className="rounded-sm bg-gray-500 w-1.5 h-1.5" />
            <div className="rounded-sm bg-gray-500 w-1.5 h-1.5" />
            <div className="rounded-sm bg-gray-500 w-1.5 h-1.5" />
            <div className="rounded-sm bg-gray-500 w-1.5 h-1.5" />
          </div>
          <h1 className="text-sm font-semibold text-white">All Channels</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* List / Calendar toggle */}
          <div className="flex items-center bg-[#222] border border-[#333] rounded-lg overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "list" ? "bg-[#2e2e2e] text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "calendar" ? "bg-[#2e2e2e] text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Calendar
            </button>
          </div>

          <Link
            href="/dashboard/create"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#45b26b] hover:bg-[#3da05f] text-white text-xs font-medium rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-5 border-b border-[#2a2a2a]">
        {tabs.map(({ key, label }) => {
          const count = posts.filter((p) => p.status === TAB_STATUS[key]).length;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-1.5 px-1 py-3 mr-5 text-sm font-medium transition-colors ${
                activeTab === key ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {activeTab === key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
              {label}
              <span className="text-xs text-gray-500 font-normal">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="space-y-3 max-w-2xl">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} onPublish={handlePublish} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { title: string; body: string }> = {
    scheduled: { title: "No scheduled posts", body: "Schedule a post and it will appear here." },
    drafts: { title: "No drafts", body: "Save a post as a draft and it will appear here." },
    sent: { title: "Nothing published yet", body: "Published posts will appear here." },
    failed: { title: "No failed posts", body: "Posts that fail to publish will appear here." },
  };
  const { title, body } = messages[tab];

  return (
    <div className="flex flex-col items-center text-center max-w-sm mx-auto pt-16">
      <div className="relative w-56 h-44 mb-6">
        <div className="absolute top-8 left-4 right-4 h-24 bg-[#2a2a2a] rounded-xl border border-[#333]" />
        <div className="absolute top-4 left-2 right-2 h-24 bg-[#252525] rounded-xl border border-[#333]" />
        <div className="absolute top-0 left-0 right-0 h-24 bg-[#222222] rounded-xl border border-[#383838] flex items-center justify-center">
          <div className="space-y-2 px-4 w-full">
            <div className="h-2 bg-[#2e2e2e] rounded-full w-3/4" />
            <div className="h-2 bg-[#2e2e2e] rounded-full w-1/2" />
          </div>
        </div>
      </div>
      <h2 className="text-base font-semibold text-white mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-6">{body}</p>
      <Link
        href="/dashboard/create"
        className="flex items-center gap-2 px-4 py-2 bg-[#45b26b] hover:bg-[#3da05f] text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create a Post
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
