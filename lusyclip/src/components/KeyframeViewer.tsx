import { theme } from "../theme";

type KeyframeViewerProps = {
  clipId: string;
  numFrames: number;
};

export default function KeyframeViewer({ clipId, numFrames }: KeyframeViewerProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "8px",
      }}
    >
      {[...Array(numFrames)].map((_, i) => {
        const frameNumber = String(i + 1).padStart(4, "0");
        return (
          <img
            key={i}
            src={`http://localhost:8000/clips/${clipId}/keyframes/kf_${frameNumber}.jpg`}
            alt={`Frame ${i + 1}`}
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "16/9",
              objectFit: "cover",
              borderRadius: "8px",
              border: `1px solid ${theme.colors.borderLight}`,
            }}
          />
        );
      })}
    </div>
  );
}