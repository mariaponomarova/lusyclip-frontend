import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ClipListPage() {
  const [clips, setClips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/clips")
      .then(res => res.json())
      .then(data => setClips(data.clips))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>All Clips</h1>
      <ul>
        {clips.map((clip) => (
          <li key={clip}>
            <Link to={`/clips/${clip}`}>{clip}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}