import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getClipManifest, getClips, submitReview } from "../services/apiClient";
import KeyframeViewer from "../components/KeyframeViewer";
import { theme } from "../theme";

interface ClipManifest {
  provenance: {
    clip_id: string;
    source_video_title: string;
  };
  video_norm: {
    num_keyframes: number;
  };
  segment: {
    start_ms: number;
    end_ms: number;
    duration_ms: number;
  };
  stage2_review?: {
    algorithm_decision?: {
      decision: string;
      reason: string | null;
      flags: string[];
    };
    lighting_analysis?: {
      lighting_quality: string;
      detection_mode: string;
      median_light_score: number;
    };
    lighting_classification?: {
      frame_metrics?: {
        beam_count: number;
        spot_count: number;
        wash_count: number;
      };
    };
    human_review: {
      decision: string;
      reviewer: string;
      reviewed_at: string;
    } | null;
  };
}

export default function ClipDetailPage() {
  const { clipId } = useParams<{ clipId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get("category") || "all";

  const [manifest, setManifest] = useState<ClipManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clipList, setClipList] = useState<string[]>([]);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

  useEffect(() => {
  getClips(category, 1, 10000)
    .then((data) => setClipList(data.clips.map((c: any) => c.clip_id)))
    .catch(console.error);
}, [category]);

  useEffect(() => {
    if (!clipId) {
      setError("Missing clip ID");
      setLoading(false);
      return;
    }
    setLoading(true);
    setReviewStatus(null);
    getClipManifest(clipId)
      .then((data: ClipManifest) => setManifest(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clipId]);

  const goToNextClip = useCallback(() => {
    const currentIndex = clipList.indexOf(clipId || "");
    if (currentIndex >= 0 && currentIndex < clipList.length - 1) {
      navigate(`/clips/${clipList[currentIndex + 1]}?category=${category}`);
    }
  }, [clipList, clipId, category, navigate]);

  const goToPrevClip = useCallback(() => {
    const currentIndex = clipList.indexOf(clipId || "");
    if (currentIndex > 0) {
      navigate(`/clips/${clipList[currentIndex - 1]}?category=${category}`);
    }
  }, [clipList, clipId, category, navigate]);

  const handleReview = useCallback(
    async (decision: "accepted" | "rejected") => {
      if (!clipId) return;
      try {
        await submitReview(clipId, decision, "mariia");
        setReviewStatus(decision);
        setTimeout(() => goToNextClip(), 500);
      } catch {
        setReviewStatus("error");
      }
    },
    [clipId, goToNextClip]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "a" || e.key === "A") handleReview("accepted");
      if (e.key === "r" || e.key === "R") handleReview("rejected");
      if (e.key === "ArrowRight") goToNextClip();
      if (e.key === "ArrowLeft") goToPrevClip();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleReview, goToNextClip, goToPrevClip]);

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: theme.colors.pinkDark }}>
        Loading... 💫
      </div>
    );
  if (error)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: theme.colors.red }}>
        Error: {error}
      </div>
    );
  if (!manifest) return <p>No clip found</p>;

  const currentIndex = clipList.indexOf(clipId || "");
  const algoDecision = manifest.stage2_review?.algorithm_decision;
  const humanReview = manifest.stage2_review?.human_review;
  const lightingAnalysis = manifest.stage2_review?.lighting_analysis;
  const frameMetrics = manifest.stage2_review?.lighting_classification?.frame_metrics;

  return (
    <div style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(`/?category=${category}`)}
        style={{
          padding: "8px 20px",
          backgroundColor: theme.colors.white,
          color: theme.colors.pinkDark,
          border: `2px solid ${theme.colors.pinkMedium}`,
          borderRadius: "20px",
          cursor: "pointer",
          fontWeight: 600,
          fontFamily: theme.fonts.main,
          marginBottom: "24px",
        }}
      >
        ← Back to list
      </button>

      {/* Title Card */}
      <div
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: "16px",
          border: `1px solid ${theme.colors.borderLight}`,
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "20px", color: theme.colors.pinkDark, marginBottom: "8px" }}>
          🎬 {manifest.provenance.clip_id}
        </h1>
        <p style={{ color: theme.colors.textLight, marginBottom: "8px" }}>
          {manifest.provenance.source_video_title}
        </p>
        <p style={{ color: theme.colors.textMuted, fontSize: "14px" }}>
          Duration: {(manifest.segment.duration_ms / 1000).toFixed(1)}s |
          Clip {currentIndex + 1} of {clipList.length}
        </p>
      </div>

      {/* Info Cards Row */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        {algoDecision && (
          <div
            style={{
              flex: 1,
              minWidth: "200px",
              backgroundColor: theme.colors.cardBg,
              borderRadius: "16px",
              border: `1px solid ${theme.colors.borderLight}`,
              padding: "16px",
            }}
          >
            <p style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "8px" }}>
              🤖 Algorithm Decision
            </p>
            <p
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color:
                  algoDecision.decision === "ACCEPT"
                    ? theme.colors.greenDark
                    : algoDecision.decision === "REJECT"
                    ? theme.colors.redDark
                    : "#ff8f00",
              }}
            >
              {algoDecision.decision}
            </p>
            {algoDecision.reason && (
              <p style={{ fontSize: "12px", color: theme.colors.textLight, marginTop: "4px" }}>
                {algoDecision.reason}
              </p>
            )}
          </div>
        )}

        {lightingAnalysis && (
          <div
            style={{
              flex: 1,
              minWidth: "200px",
              backgroundColor: theme.colors.cardBg,
              borderRadius: "16px",
              border: `1px solid ${theme.colors.borderLight}`,
              padding: "16px",
            }}
          >
            <p style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "8px" }}>
              💡 Lighting
            </p>
            <p style={{ fontWeight: 600, color: theme.colors.textDark }}>
              {lightingAnalysis.lighting_quality} ({lightingAnalysis.detection_mode})
            </p>
            <p style={{ fontSize: "14px", color: theme.colors.textLight }}>
              Score: {lightingAnalysis.median_light_score.toFixed(3)}
            </p>
          </div>
        )}

        {frameMetrics && (
          <div
            style={{
              flex: 1,
              minWidth: "200px",
              backgroundColor: theme.colors.cardBg,
              borderRadius: "16px",
              border: `1px solid ${theme.colors.borderLight}`,
              padding: "16px",
            }}
          >
            <p style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "8px" }}>
              ✨ Phenomena
            </p>
            <p style={{ fontWeight: 600, color: theme.colors.textDark }}>
              {frameMetrics.beam_count > 0 ? "🔦 Beam " : ""}
              {frameMetrics.spot_count > 0 ? "🔵 Spot " : ""}
              {frameMetrics.wash_count > 0 ? "🌈 Wash " : ""}
              {frameMetrics.beam_count === 0 &&
                frameMetrics.spot_count === 0 &&
                frameMetrics.wash_count === 0 &&
                "None detected"}
            </p>
          </div>
        )}
      </div>

      {/* Human Review Status */}
      {humanReview && (
        <div
          style={{
            padding: "12px 20px",
            marginBottom: "24px",
            backgroundColor:
              humanReview.decision === "accepted" ? "#e8f5e9" : "#ffebee",
            borderRadius: "12px",
            border: `1px solid ${
              humanReview.decision === "accepted" ? "#a5d6a7" : "#ef9a9a"
            }`,
          }}
        >
          Already reviewed: <strong>{humanReview.decision}</strong> by{" "}
          {humanReview.reviewer} on{" "}
          {new Date(humanReview.reviewed_at).toLocaleDateString()}
        </div>
      )}

      {/* Video Player */}
      <div
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: "16px",
          border: `1px solid ${theme.colors.borderLight}`,
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <p style={{ fontSize: "14px", color: theme.colors.textMuted, marginBottom: "12px" }}>
          🎥 Video Preview
        </p>
        <video
          key={clipId}
          controls
          autoPlay
          // loop
          style={{
            width: "100%",
            borderRadius: "12px",
            backgroundColor: "#000",
          }}
        >
          <source
            src={`http://localhost:8000/clips/${manifest.provenance.clip_id}/video`}
            type="video/mp4"
          />
        </video>
      </div>

      {/* Keyframes */}
      <div
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: "16px",
          border: `1px solid ${theme.colors.borderLight}`,
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <p style={{ fontSize: "14px", color: theme.colors.textMuted, marginBottom: "12px" }}>
          🖼️ Keyframes ({manifest.video_norm.num_keyframes} frames)
        </p>
        <KeyframeViewer
          clipId={manifest.provenance.clip_id}
          numFrames={manifest.video_norm.num_keyframes}
        />
      </div>

      {/* Review Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          marginBottom: "16px",
        }}
      >
        <button
          onClick={() => handleReview("accepted")}
          style={{
            padding: "16px 48px",
            backgroundColor: theme.colors.green,
            color: theme.colors.white,
            border: "none",
            borderRadius: "24px",
            fontSize: "18px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: theme.fonts.main,
            boxShadow: "0 4px 12px rgba(119, 221, 119, 0.4)",
          }}
        >
          ✅ Accept (A)
        </button>
        <button
          onClick={() => handleReview("rejected")}
          style={{
            padding: "16px 48px",
            backgroundColor: theme.colors.red,
            color: theme.colors.white,
            border: "none",
            borderRadius: "24px",
            fontSize: "18px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: theme.fonts.main,
            boxShadow: "0 4px 12px rgba(255, 107, 107, 0.4)",
          }}
        >
          ❌ Reject (R)
        </button>
      </div>

      {/* Review Status Toast */}
      {reviewStatus && (
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            borderRadius: "12px",
            fontWeight: 700,
            marginBottom: "16px",
            backgroundColor:
              reviewStatus === "accepted"
                ? "#e8f5e9"
                : reviewStatus === "rejected"
                ? "#ffebee"
                : "#fff3e0",
            color:
              reviewStatus === "accepted"
                ? theme.colors.greenDark
                : reviewStatus === "rejected"
                ? theme.colors.redDark
                : "#e65100",
          }}
        >
          {reviewStatus === "accepted"
            ? "✅ Accepted! Moving to next..."
            : reviewStatus === "rejected"
            ? "❌ Rejected! Moving to next..."
            : "⚠️ Failed to submit review"}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "16px" }}>
        <button
          onClick={goToPrevClip}
          disabled={currentIndex <= 0}
          style={{
            padding: "10px 24px",
            backgroundColor: currentIndex <= 0 ? "#f0f0f0" : theme.colors.white,
            color: currentIndex <= 0 ? "#ccc" : theme.colors.pinkDark,
            border: `2px solid ${currentIndex <= 0 ? "#e0e0e0" : theme.colors.pinkMedium}`,
            borderRadius: "20px",
            cursor: currentIndex <= 0 ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontFamily: theme.fonts.main,
          }}
        >
          ← Previous
        </button>
        <button
          onClick={goToNextClip}
          disabled={currentIndex >= clipList.length - 1}
          style={{
            padding: "10px 24px",
            backgroundColor:
              currentIndex >= clipList.length - 1 ? "#f0f0f0" : theme.colors.white,
            color:
              currentIndex >= clipList.length - 1 ? "#ccc" : theme.colors.pinkDark,
            border: `2px solid ${
              currentIndex >= clipList.length - 1 ? "#e0e0e0" : theme.colors.pinkMedium
            }`,
            borderRadius: "20px",
            cursor: currentIndex >= clipList.length - 1 ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontFamily: theme.fonts.main,
          }}
        >
          Next →
        </button>
      </div>

      {/* Shortcuts */}
      <p
        style={{
          textAlign: "center",
          color: theme.colors.textMuted,
          fontSize: "12px",
        }}
      >
        ⌨️ Shortcuts: A = Accept | R = Reject | ← → = Navigate
      </p>
    </div>
  );
}