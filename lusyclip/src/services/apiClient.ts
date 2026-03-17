export const BASE_URL = "http://localhost:8000";
//export const BASE_URL = "http://100.112.104.21:8000";

// --- Types ---

export interface HumanReview {
  decision: string;
  reviewer: string;
  reviewed_at: string;
}

export interface ClipEntry {
  clip_id: string;
  human_review?: HumanReview;
}

export interface ClipsResponse {
  clips: ClipEntry[];
  total: number;
  count: number;
  page: number;
  page_size: number;
}

// --- API Functions ---

export async function getClips(
  category: string = "all",
  page: number = 1,
  pageSize: number = 50
): Promise<ClipsResponse> {
  const response = await fetch(
    `${BASE_URL}/clips?category=${category}&page=${page}&page_size=${pageSize}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch clips");
  }
  const data = await response.json();
  return {
    clips: data.clips,
    total: data.count,
    count: data.count,
    page: data.page,
    page_size: data.page_size,
  };
}

export async function getClipCounts(): Promise<Record<string, number>> {
  const categories = ["accepted", "review", "rejected"];
  const counts: Record<string, number> = {};
  for (const cat of categories) {
    const response = await fetch(`${BASE_URL}/clips?category=${cat}&page=1&page_size=1`);
    if (response.ok) {
      const data = await response.json();
      counts[cat] = data.count;
    }
  }
  return counts;
}

export async function getClipManifest(clipId: string) {
  const response = await fetch(`${BASE_URL}/clips/${clipId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch manifest");
  }
  return response.json();
}

export async function submitReview(
  clipId: string,
  decision: "accepted" | "rejected",
  reviewer: string
) {
  const response = await fetch(`${BASE_URL}/clips/${clipId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, reviewer }),
  });
  if (!response.ok) {
    throw new Error("Failed to submit review");
  }
  return response.json();
}

export async function getReviewHistory(page: number = 1, pageSize: number = 52) {
  const response = await fetch(
    `${BASE_URL}/review-history?page=${page}&page_size=${pageSize}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch review history");
  }
  return response.json();
}