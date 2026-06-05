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

// ── Agent Schedules ──────────────────────────────────────────────────────

export type AgentSchedule = {
  id: number;
  user_id: number;
  name: string;
  description: string;
  template: string | null;
  platforms: string[];
  cron_expression: string;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getAgentSchedules(): Promise<AgentSchedule[]> {
  return apiFetch<AgentSchedule[]>("/agent-schedules/");
}

export async function createAgentSchedule(data: {
  name: string;
  description: string;
  template?: string | null;
  platforms: string[];
  cron_expression: string;
}): Promise<AgentSchedule> {
  return apiFetch<AgentSchedule>("/agent-schedules/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateAgentSchedule(
  id: number,
  data: Partial<{ name: string; description: string; template: string | null; platforms: string[]; cron_expression: string; is_active: boolean }>
): Promise<AgentSchedule> {
  return apiFetch<AgentSchedule>(`/agent-schedules/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteAgentSchedule(id: number): Promise<void> {
  await apiFetch<void>(`/agent-schedules/${id}`, { method: "DELETE" });
}

export async function triggerAgentSchedule(id: number): Promise<{ task_id: string; status: string }> {
  return apiFetch<{ task_id: string; status: string }>(`/agent-schedules/${id}/trigger`, { method: "POST" });
}

// ── Content Repurposing ──────────────────────────────────────────────────

export type RepurposingJob = {
  id: number;
  user_id: number;
  source_type: "video_url" | "video_file" | "article_url" | "raw_text";
  source_url: string | null;
  title: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  asset_count: number;
  created_at: string;
  updated_at: string;
};

export type RepurposedAsset = {
  id: number;
  job_id: number;
  asset_type: "linkedin_article" | "twitter_thread" | "quote_card" | "reel_clip" | "audiogram";
  platform: string;
  content: string;
  metadata: Record<string, unknown>;
  status: "draft" | "scheduled" | "published";
  post_id: number | null;
  created_at: string;
};

export type RepurposingJobDetail = RepurposingJob & {
  transcript: string | null;
  assets: RepurposedAsset[];
};

export async function uploadVideoFileJob(file: File, title?: string): Promise<RepurposingJob> {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  const res = await fetch(`${API_URL}/repurposing/jobs/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    const detail = (err as { detail?: unknown }).detail;
    const message = Array.isArray(detail)
      ? (detail as { msg: string }[]).map((e) => e.msg).join("; ")
      : (detail as string | undefined) ?? "Upload failed";
    throw new Error(message);
  }
  return res.json() as Promise<RepurposingJob>;
}

export async function createRepurposingJob(data: {
  source_type: "video_url" | "article_url";
  source_url: string;
  title?: string;
}): Promise<RepurposingJob> {
  return apiFetch<RepurposingJob>("/repurposing/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function createRawTextJob(data: {
  content: string;
  title?: string;
}): Promise<RepurposingJob> {
  return apiFetch<RepurposingJob>("/repurposing/jobs/raw-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getRepurposingJobs(): Promise<RepurposingJob[]> {
  return apiFetch<RepurposingJob[]>("/repurposing/jobs");
}

export async function getRepurposingJob(id: number): Promise<RepurposingJobDetail> {
  return apiFetch<RepurposingJobDetail>(`/repurposing/jobs/${id}`);
}

export async function scheduleRepurposingAssets(
  jobId: number,
  data: { asset_ids: number[]; scheduled_times: string[] }
): Promise<{ scheduled: number }> {
  return apiFetch<{ scheduled: number }>(`/repurposing/jobs/${jobId}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteRepurposingJob(id: number): Promise<void> {
  await apiFetch<void>(`/repurposing/jobs/${id}`, { method: "DELETE" });
}

