import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getClipManifest } from "../services/apiClient";
import KeyframeViewer from "../components/KeyframeViewer";

interface ClipManifest {
  clip_id: string;
  video_norm: {
    num_keyframes: number;
  };
  provenance: {
    clip_id: string;
  };
}

export default function ClipDetailPage() {
  const { clipId } = useParams<{ clipId: string }>();

  const [manifest, setManifest] = useState<ClipManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clipId) {
      setError("Missing clip ID");
      setLoading(false);
      return;
    }

    getClipManifest(clipId)
      .then((data: ClipManifest) => {
        setManifest(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clipId]);

  if (loading) return <p>Loading clip...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!manifest) return <p>No clip found</p>;

  if (!manifest.video_norm || manifest.video_norm.num_keyframes === 0) {
    return <p>No keyframes available</p>;
  }

  return (
    <div>
      <h1>Clip: {manifest.provenance.clip_id}</h1>
      <KeyframeViewer
        clipId={manifest.provenance.clip_id}
        numFrames={manifest.video_norm.num_keyframes}
      />
    </div>
  );
}