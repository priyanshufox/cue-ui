"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { getUser, clearAuth, type AuthUser } from "@/lib/auth";
import {
  getSocialAccounts, getLinkedInAuthUrl, getTwitterAuthUrl, disconnectAccount, type SocialAccount,
} from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useState<AuthUser | null>(() => (typeof window !== "undefined" ? getUser() : null));
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [showChannelsBanner, setShowChannelsBanner] = useState(true);
  const [connectingLinkedIn, setConnectingLinkedIn] = useState(false);
  const [connectingTwitter, setConnectingTwitter] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await getSocialAccounts();
      setAccounts(data);
    } catch {
      // ignore – user may not be authed yet
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAccounts();
  }, [user, router, loadAccounts]);

  async function handleLinkedInConnect() {
    setConnectingLinkedIn(true);
    try {
      const url = await getLinkedInAuthUrl();
      window.location.href = url;
    } catch {
      setConnectingLinkedIn(false);
    }
  }

  async function handleTwitterConnect() {
    setConnectingTwitter(true);
    try {
      const url = await getTwitterAuthUrl();
      window.location.href = url;
    } catch {
      setConnectingTwitter(false);
    }
  }

  async function handleDisconnect(accountId: number) {
    try {
      await disconnectAccount(accountId);
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    } catch {
      // ignore
    }
  }

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  const initials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "M";

  const linkedInAccount = accounts.find((a) => a.platform === "linkedin");
  const twitterAccount = accounts.find((a) => a.platform === "twitter");
  const connectedCount = accounts.length;
  const MAX_CHANNELS = 3;

  return (
    <div className="flex h-screen bg-[#111111] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1a1a1a] flex flex-col flex-shrink-0 border-r border-[#2a2a2a]">
        {/* Logo */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="0" width="22" height="3" rx="1.5" fill="white"/>
              <rect y="7" width="22" height="3" rx="1.5" fill="white"/>
              <rect y="14" width="16" height="3" rx="1.5" fill="white"/>
            </svg>
            <span className="text-[15px] font-semibold text-white tracking-tight">Buffer</span>
          </Link>
          <button className="text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 5.4-6 7.8-6 12a6 6 0 0012 0c0-4.2-4.8-6.6-6-12z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M10 7h4" />
            </svg>
          </button>
        </div>

        {/* + New button */}
        <div className="px-3 pb-3">
          <Link
            href="/dashboard/create"
            className="w-full flex items-center justify-center gap-2 bg-[#45b26b] hover:bg-[#3da05f] text-white text-sm font-medium rounded-lg py-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New
          </Link>
        </div>

        {/* Main nav */}
        <nav className="px-2 space-y-0.5">
          <Link
            href="/dashboard/create"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === "/dashboard/create"
                ? "bg-[#252525] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#252525]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Create
          </Link>
          <Link
            href="/dashboard"
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === "/dashboard"
                ? "bg-[#252525] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#252525]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              Publish
            </div>
          </Link>
        </nav>

        {/* Channels section */}
        <div className="mt-4 px-2">
          <p className="text-[11px] text-gray-600 uppercase tracking-wider px-3 mb-2 font-medium">Channels</p>
          <div className="space-y-0.5">

            {/* LinkedIn */}
            {linkedInAccount ? (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg group">
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-[#0077b5] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#45b26b] border-2 border-[#1a1a1a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{linkedInAccount.screen_name}</div>
                  <div className="text-[10px] text-[#45b26b]">Connected</div>
                </div>
                <button
                  onClick={() => handleDisconnect(linkedInAccount.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                  title="Disconnect"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLinkedInConnect}
                disabled={connectingLinkedIn}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#252525] transition-colors text-left disabled:opacity-60"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-[#0077b5] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#1a1a1a] border border-[#1a1a1a] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                      <svg className="w-2 h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-400 hover:text-white">
                  {connectingLinkedIn ? "Connecting…" : "LinkedIn"}
                </span>
              </button>
            )}

            {/* Twitter/X */}
            {twitterAccount ? (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg group">
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#45b26b] border-2 border-[#1a1a1a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">@{twitterAccount.screen_name}</div>
                  <div className="text-[10px] text-[#45b26b]">Connected</div>
                </div>
                <button
                  onClick={() => handleDisconnect(twitterAccount.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                  title="Disconnect"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleTwitterConnect}
                disabled={connectingTwitter}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#252525] transition-colors text-left disabled:opacity-60"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#1a1a1a] border border-[#1a1a1a] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                      <svg className="w-2 h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-400 hover:text-white">
                  {connectingTwitter ? "Connecting…" : "X / Twitter"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Channels connected banner */}
        {showChannelsBanner && connectedCount < MAX_CHANNELS && (
          <div className="mx-3 mb-3 bg-[#222222] border border-[#333] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">{connectedCount}/{MAX_CHANNELS} channels connected</span>
              <button
                onClick={() => setShowChannelsBanner(false)}
                className="text-gray-600 hover:text-gray-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: MAX_CHANNELS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i < connectedCount ? "bg-[#45b26b]" : "bg-[#333]"}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* User */}
        <div className="px-2 pb-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[#252525] transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">My Organization</div>
              <div className="text-[11px] truncate flex items-center gap-1.5">
                <span className="text-gray-500">Free Plan</span>
              </div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#111111]">
        {children}
      </main>
    </div>
  );
}
