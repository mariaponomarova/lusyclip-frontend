import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getClips, getClipCounts } from "../services/apiClient";
import { theme } from "../theme";

const CATEGORIES = ["all", "accepted", "review", "rejected"];
const categoryEmoji: Record<string, string> = {
  all: "🌸",
  accepted: "✅",
  review: "🔍",
  rejected: "❌",
};

const PAGE_SIZE = 52;

interface HumanReview {
  decision: string;
  reviewer: string;
  reviewed_at: string;
}

interface ClipEntry {
  clip_id: string;
  human_review?: HumanReview;
}

export default function ClipListPage() {
  const [clips, setClips] = useState<ClipEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("review");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [totalClips, setTotalClips] = useState(0);

  useEffect(() => {
    getClipCounts().then(setCounts).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getClips(category, page, PAGE_SIZE)
      .then((data) => {
        setClips(data.clips);
        setTotalClips(data.total);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [category, page]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setPage(1);
  }, [category]);

  const totalPages = Math.ceil(totalClips / PAGE_SIZE);

  return (
    <div
      style={{
        padding: "32px",
        width: "100%",
        maxWidth: "100%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: theme.colors.pinkDark,
          }}
        >
          🌸 LusyClip Review Tool 🌸
        </h1>
        <p style={{ color: theme.colors.textLight }}>
          Browse and classify stage lighting clips
        </p>
      </div>

      <Link
        to="/history"
        style={{
          display: "inline-block",
          padding: "10px 24px",
          backgroundColor: theme.colors.white,
          color: theme.colors.pinkDark,
          border: `2px solid ${theme.colors.pinkMedium}`,
          borderRadius: "24px",
          textDecoration: "none",
          fontWeight: 600,
          fontFamily: theme.fonts.main,
          marginBottom: "24px",
        }}
      >
        📋 Review History
      </Link>

      {/* Category Buttons with Counts */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "10px 24px",
              backgroundColor:
                category === cat ? theme.colors.pink : theme.colors.white,
              color:
                category === cat ? theme.colors.white : theme.colors.pinkDark,
              border: `2px solid ${theme.colors.pinkMedium}`,
              borderRadius: "24px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: theme.fonts.main,
            }}
          >
            {categoryEmoji[cat]} {cat.toUpperCase()}
            {cat !== "all" && counts[cat] !== undefined && (
              <span style={{ marginLeft: "6px", opacity: 0.8 }}>
                ({counts[cat].toLocaleString()})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Clip Count & Page Info */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "24px",
          padding: "12px 24px",
          backgroundColor: theme.colors.cardBg,
          borderRadius: "16px",
          border: `1px solid ${theme.colors.borderLight}`,
        }}
      >
        {loading ? (
          <span>Loading... 💫</span>
        ) : (
          <span style={{ fontWeight: 600 }}>
            {totalClips.toLocaleString()} clips in {categoryEmoji[category]}{" "}
            {category.toUpperCase()} — Page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Clip Grid */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            width: "100%",
          }}
        >
          {clips.map((clip) => (
            <Link
              key={clip.clip_id}
              to={`/clips/${clip.clip_id}?category=${category}&page=${page}`}
              style={{
                textDecoration: "none",
                color: theme.colors.textDark,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: "12px",
                  border: clip.human_review
                    ? `3px solid ${
                        clip.human_review.decision === "accepted"
                          ? "#a5d6a7"
                          : "#ef9a9a"
                      }`
                    : `1px solid ${theme.colors.borderLight}`,
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(255, 105, 180, 0.2)";
                  if (!clip.human_review) {
                    e.currentTarget.style.borderColor = theme.colors.pink;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  if (!clip.human_review) {
                    e.currentTarget.style.borderColor = theme.colors.borderLight;
                  }
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    backgroundColor: "#000",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={`http://localhost:8000/clips/${clip.clip_id}/keyframes/kf_0010.jpg`}
                    alt={clip.clip_id}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ padding: "10px 12px", minHeight: "70px" }}>
                  {/* Review info */}
                  {clip.human_review && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              clip.human_review.decision === "accepted"
                                ? theme.colors.greenDark
                                : theme.colors.redDark,
                          }}
                        >
                          {clip.human_review.decision === "accepted"
                            ? "✅ Accepted"
                            : "❌ Rejected"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: theme.colors.textMuted,
                        }}
                      >
                        {clip.human_review.reviewer} ·{" "}
                        {new Date(
                          clip.human_review.reviewed_at
                        ).toLocaleDateString()}
                      </div>
                    </>
                  )}

                  {/* Clip ID */}
                  <div
                    style={{
                      fontSize: "10px",
                      color: theme.colors.textMuted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: clip.human_review ? "4px" : "0px",
                      textAlign: clip.human_review ? "left" : "center",
                    }}
                  >
                    {clip.clip_id}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            marginTop: "32px",
          }}
        >
          <button
            onClick={() => setPage(1)}
            disabled={page <= 1}
            style={{
              padding: "8px 16px",
              backgroundColor: page <= 1 ? "#f0f0f0" : theme.colors.white,
              color: page <= 1 ? "#ccc" : theme.colors.pinkDark,
              border: `2px solid ${
                page <= 1 ? "#e0e0e0" : theme.colors.pinkMedium
              }`,
              borderRadius: "20px",
              cursor: page <= 1 ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontFamily: theme.fonts.main,
            }}
          >
            ⏮ First
          </button>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            style={{
              padding: "8px 20px",
              backgroundColor: page <= 1 ? "#f0f0f0" : theme.colors.white,
              color: page <= 1 ? "#ccc" : theme.colors.pinkDark,
              border: `2px solid ${
                page <= 1 ? "#e0e0e0" : theme.colors.pinkMedium
              }`,
              borderRadius: "20px",
              cursor: page <= 1 ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontFamily: theme.fonts.main,
            }}
          >
            ← Prev
          </button>

          <span
            style={{
              padding: "8px 20px",
              backgroundColor: theme.colors.pink,
              color: theme.colors.white,
              borderRadius: "20px",
              fontWeight: 700,
              fontFamily: theme.fonts.main,
            }}
          >
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            style={{
              padding: "8px 20px",
              backgroundColor:
                page >= totalPages ? "#f0f0f0" : theme.colors.white,
              color: page >= totalPages ? "#ccc" : theme.colors.pinkDark,
              border: `2px solid ${
                page >= totalPages ? "#e0e0e0" : theme.colors.pinkMedium
              }`,
              borderRadius: "20px",
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontFamily: theme.fonts.main,
            }}
          >
            Next →
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            style={{
              padding: "8px 16px",
              backgroundColor:
                page >= totalPages ? "#f0f0f0" : theme.colors.white,
              color: page >= totalPages ? "#ccc" : theme.colors.pinkDark,
              border: `2px solid ${
                page >= totalPages ? "#e0e0e0" : theme.colors.pinkMedium
              }`,
              borderRadius: "20px",
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontFamily: theme.fonts.main,
            }}
          >
            Last ⏭
          </button>
        </div>
      )}
    </div>
  );
}