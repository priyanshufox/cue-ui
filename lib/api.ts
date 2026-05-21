import { API_URL, getToken } from "./auth";

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    const detail = (err as { detail?: unknown }).detail;
    const message = Array.isArray(detail)
      ? (detail as { msg: string }[]).map((e) => e.msg).join("; ")
      : (detail as string | undefined) ?? "Request failed";
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Social Accounts ──────────────────────────────────────────────────────

export type SocialAccount = {
  id: number;
  platform: string;
  screen_name: string;
  expires_at: string | null;
  connected_at: string;
};

export async function getLinkedInAuthUrl(): Promise<string> {
  const data = await apiFetch<{ url: string }>("/social/linkedin/auth-url");
  return data.url;
}

export async function getTwitterAuthUrl(): Promise<string> {
  const data = await apiFetch<{ url: string }>("/social/twitter/auth-url");
  return data.url;
}

export async function getSocialAccounts(): Promise<SocialAccount[]> {
  return apiFetch<SocialAccount[]>("/social/accounts");
}

export async function disconnectAccount(id: number): Promise<void> {
  await apiFetch<void>(`/social/accounts/${id}`, { method: "DELETE" });
}

// ── Posts ────────────────────────────────────────────────────────────────

export type Post = {
  id: number;
  content: string;
  media_urls: string[];
  platforms: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduled_at: string | null;
  published_at: string | null;
  error_message: string | null;
  created_at: string;
};

export async function getPosts(): Promise<Post[]> {
  return apiFetch<Post[]>("/posts");
}

export async function uploadMedia(file: File): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/posts/media`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error((err as { detail?: string }).detail ?? "Upload failed");
  }
  return res.json() as Promise<{ url: string; key: string }>;
}

export async function createPost(data: {
  content: string;
  media_urls: string[];
  platforms: string[];
  scheduled_at?: string | null;
}): Promise<Post> {
  return apiFetch<Post>("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function publishPost(postId: number): Promise<Post> {
  return apiFetch<Post>(`/posts/${postId}/publish`, { method: "POST" });
}

