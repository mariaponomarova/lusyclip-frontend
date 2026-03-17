import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReviewHistory } from "../services/apiClient";
import { theme } from "../theme";

interface ReviewEntry {
  clip_id: string;
  decision: string;
  reviewer: string;
  reviewed_at: string;
}

const PAGE_SIZE = 52;

export default function ReviewHistoryPage() {
  const [history, setHistory] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    getReviewHistory(page, PAGE_SIZE)
      .then((data) => {
        setHistory(data.history);
        setTotal(data.count);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div
      style={{
        padding: "32px",
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 700, color: theme.colors.pinkDark }}>
          📋 Review History
        </h1>
        <p style={{ color: theme.colors.textLight }}>
          All manually reviewed clips
        </p>
        <Link
          to="/"
          style={{
            color: theme.colors.pink,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Back to clips
        </Link>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            padding: "12px 24px",
            backgroundColor: "#e8f5e9",
            borderRadius: "16px",
            fontWeight: 600,
          }}
        >
          ✅ Accepted: {history.filter((h) => h.decision === "accepted").length}
        </div>
        <div
          style={{
            padding: "12px 24px",
            backgroundColor: "#ffebee",
            borderRadius: "16px",
            fontWeight: 600,
          }}
        >
          ❌ Rejected: {history.filter((h) => h.decision === "rejected").length}
        </div>
        <div
          style={{
            padding: "12px 24px",
            backgroundColor: theme.colors.cardBg,
            borderRadius: "16px",
            fontWeight: 600,
          }}
        >
          📊 Total: {total}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: "center", color: theme.colors.textLight }}>
          Loading... 💫
        </p>
      )}

      {/* History Grid */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            width: "100%",
          }}
        >
          {history.map((entry) => (
            <Link
              key={entry.clip_id}
              to={`/clips/${entry.clip_id}?category=${entry.decision}`}
              style={{
                textDecoration: "none",
                color: theme.colors.textDark,
              }}
            >
              <div
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: "12px",
                  border: `3px solid ${
                    entry.decision === "accepted" ? "#a5d6a7" : "#ef9a9a"
                  }`,
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(255, 105, 180, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    backgroundColor: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={`http://localhost:8000/clips/${entry.clip_id}/keyframes/kf_0010.jpg`}
                    alt={entry.clip_id}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ padding: "10px 12px" }}>
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
                          entry.decision === "accepted"
                            ? theme.colors.greenDark
                            : theme.colors.redDark,
                      }}
                    >
                      {entry.decision === "accepted" ? "✅ Accepted" : "❌ Rejected"}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: theme.colors.textMuted,
                    }}
                  >
                    {entry.reviewer} · {new Date(entry.reviewed_at).toLocaleDateString()}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: theme.colors.textMuted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: "4px",
                    }}
                  >
                    {entry.clip_id}
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
              border: `2px solid ${page <= 1 ? "#e0e0e0" : theme.colors.pinkMedium}`,
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
              border: `2px solid ${page <= 1 ? "#e0e0e0" : theme.colors.pinkMedium}`,
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
              backgroundColor: page >= totalPages ? "#f0f0f0" : theme.colors.white,
              color: page >= totalPages ? "#ccc" : theme.colors.pinkDark,
              border: `2px solid ${page >= totalPages ? "#e0e0e0" : theme.colors.pinkMedium}`,
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
              backgroundColor: page >= totalPages ? "#f0f0f0" : theme.colors.white,
              color: page >= totalPages ? "#ccc" : theme.colors.pinkDark,
              border: `2px solid ${page >= totalPages ? "#e0e0e0" : theme.colors.pinkMedium}`,
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