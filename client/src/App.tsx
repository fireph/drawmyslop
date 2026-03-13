import { useEffect, useState } from "react";

export default function App() {
  const [health, setHealth] = useState<string>("checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setHealth(data.status))
      .catch(() => setHealth("unreachable"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold tracking-tight">Draw My Slop</h1>
      <div className="px-4 py-2 rounded-lg bg-gray-800 text-sm font-mono">
        API status:{" "}
        <span
          className={
            health === "ok" ? "text-green-400" : "text-yellow-400"
          }
        >
          {health}
        </span>
      </div>
    </div>
  );
}
