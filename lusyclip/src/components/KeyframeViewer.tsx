type KeyframeViewerProps = {
  clipId: string;
  numFrames: number;
};

export default function KeyframeViewer({ clipId, numFrames }: KeyframeViewerProps) {
  return (
    <div>
      {[...Array(numFrames)].map((_, i) => {
        const frameNumber = String(i + 1).padStart(4, "0"); // 1 → "0001", 2 → "0002", etc.
        return (
          <img
            key={i}
            src={`http://localhost:8000/clips/${clipId}/keyframes/kf_${frameNumber}.jpg`}
            alt={`Frame ${i + 1}`}
            width={100}
          />
        );
      })}
    </div>
  );
}