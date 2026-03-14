import { useEffect, useState } from "react";
import CreatePrompt from "../components/CreatePrompt";
import PromptModal from "../components/PromptModal";
import { Prompt, PromptStatus } from "../lib/types";


const STATUS_STYLES: Record<PromptStatus, string> = {
  unclaimed: "bg-gray-700 text-gray-300",
  claimed: "bg-yellow-500/20 text-yellow-300",
  completed: "bg-green-500/20 text-green-400",
  expired: "bg-red-500/20 text-red-400",
};

export default function Prompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [promptIdView, setPromptIdView] = useState<string | undefined>(undefined);

  const fetchPrompts = () => {
    fetch("/api/prompts")
      .then((res) => res.json())
      .then((data) => {
        setPrompts(data);
        setLoading(false);
      })
      .catch(() => {
        setPrompts([]);
        setLoading(false);
      });
  }

  function handlePromptClick(promptId: string) {
    setPromptIdView(promptId);
  }

  useEffect(() => {
    fetchPrompts();
  }, []);

  return (
    <div>
      <PromptModal isOpen={promptIdView !== undefined} onClose={() => setPromptIdView(undefined)} promptId={promptIdView} />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <CreatePrompt onPromptCreated={fetchPrompts} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Prompts</h1>
          <span className="text-sm text-gray-500">{prompts.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-600 text-sm">
            Loading…
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-600">
            <span className="text-4xl">🎨</span>
            <p className="text-sm">No prompts yet. Create one yourself!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {prompts.map((prompt) => (
              <li
                key={prompt.id}
                className="flex items-center gap-4 rounded-xl bg-gray-800/60 border border-gray-700/50 px-5 py-4"
                onClick={() => handlePromptClick(prompt.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{prompt.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(prompt.createdAt).toLocaleString()} · {prompt.id}
                  </p>
                </div>
                <span
                  className={[
                    "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                    STATUS_STYLES[prompt.status],
                  ].join(" ")}
                >
                  {prompt.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
