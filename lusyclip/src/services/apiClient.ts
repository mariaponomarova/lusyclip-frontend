const BASE_URL = "http://localhost:8000";

export async function getClips(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/clips`);
  if (!response.ok) {
    throw new Error("Failed to fetch clips");
  }
  const data = await response.json();
  return data.clips;
}

export async function getClipManifest(clipId: string) {
  const response = await fetch(`${BASE_URL}/clips/${clipId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch manifest");
  }
  return response.json();
}