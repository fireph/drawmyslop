import { useEffect, useRef, useState } from "react";
import { Prompt } from "../lib/types";
import { useUserId } from "../context/UserContext";

type Tool = "pen" | "eraser";

const colors = ["#ffffff", "#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc"];

interface Props {promptId: string;}

export default function DrawPrompt({ promptId }: Props) {
  const userId = useUserId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(4);

  const fetchPrompt = (promptId: string) => {
    fetch("/api/prompt/" + promptId)
      .then((res) => res.json())
      .then((data) => {
        setPrompt(data);
        setLoading(false);
      })
      .catch(() => {
        setPrompt(null);
        setLoading(false);
      });
  }

  useEffect(() => {
    setLoading(true);
    fetchPrompt(promptId);
  }, [promptId]);

  useEffect(() => {
    clearCanvas();
  }, [prompt?.status]);

  async function claimPrompt() {
    try {
      const res = await fetch(`/api/prompt/claim/${promptId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId || "",
      },
    });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to claim prompt");
      }
      setPrompt(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return {
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    isDrawing.current = true;
    lastPos.current = getPos(e);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current || !lastPos.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#111827" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPos.current = pos;
  }

  function stopDrawing() {
    isDrawing.current = false;
    lastPos.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  async function submitPrompt() {
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL("image/png");

    try {
      const res = await fetch(`/api/prompt/${promptId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId || "",
        },
        body: JSON.stringify({ imageData: dataUrl })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to claim prompt");
      }
      setPrompt(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  if (prompt?.status === "claimed" && prompt?.claimedBy === userId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 bg-gray-800/60 border border-gray-700/50">
        <h1 className="text-2xl font-bold text-white">Draw: {prompt?.text}</h1>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-gray-800/60 border border-gray-700/50">
          {/* Tool toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            {(["pen", "eraser"] as Tool[]).map((t) => (
              <button
                key={t}
                onClick={() => setTool(t)}
                className={[
                  "px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  tool === t
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-900 text-gray-400 hover:text-white",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Color swatches */}
          <div className="flex gap-1.5">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool("pen"); }}
                style={{ background: c }}
                className={[
                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                  color === c && tool === "pen" ? "border-white scale-110" : "border-transparent",
                ].join(" ")}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); setTool("pen"); }}
              className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent"
              title="Custom color"
            />
          </div>

          {/* Line width */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Size</span>
            <input
              type="range"
              min={1}
              max={32}
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
            <span className="text-xs text-gray-400 w-4">{lineWidth}</span>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              onClick={clearCanvas}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={submitPrompt}
              className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full rounded-xl border border-gray-700/50 cursor-crosshair touch-none"
          style={{ background: "#ffffff" }}
        />
      </div>
    );
  } else if (prompt?.status === "completed") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 bg-gray-800/60 border border-gray-700/50">
        <h1 className="text-2xl font-bold text-white">Prompt: {prompt?.text}</h1>
        <img src={`/uploads/${prompt.drawingFile}`} alt="Completed drawing" className="w-full rounded-xl border border-gray-700/50" />
      </div>
    )
  } else if (prompt?.status === "expired") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 bg-gray-800/60 border border-gray-700/50 text-center">
        <h1 className="text-2xl font-bold text-white">Prompt: {prompt?.text}</h1>
        <p className="text-lg text-white">This prompt has expired without being claimed. Better luck next time!</p>
      </div>
    )
  } else if (prompt?.status === "unclaimed") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 bg-gray-800/60 border border-gray-700/50 text-center">
        <h1 className="text-2xl font-bold text-white">Prompt: {prompt?.text}</h1>
        <button onClick={claimPrompt} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
          Claim Prompt!
        </button>
      </div>
    )
  } else {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 bg-gray-800/60 border border-gray-700/50 text-center">
        <p className="text-lg text-white">Something went wrong.</p>
      </div>
    );
  }
}