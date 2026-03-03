const BASE_URL = "http://localhost:8000"; // your FastAPI backend URL

export async function fetchClips() {
  const res = await fetch(`${BASE_URL}/clips`);
  if (!res.ok) throw new Error("Failed to fetch clips");
  return res.json();
}

export async function fetchClipManifest(clipId: string) {
  const res = await fetch(`${BASE_URL}/clips/${clipId}`);
  if (!res.ok) throw new Error("Clip not found");
  return res.json();
}

export function getKeyframeUrl(clipId: string, frameName: string) {
  return `${BASE_URL}/clips/${clipId}/keyframes/${frameName}`;
}