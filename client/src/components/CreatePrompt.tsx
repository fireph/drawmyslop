import { useState } from "react";
import { useUserId } from "../context/UserContext";

interface Props {onPromptCreated?: () => void;}

export default function CreatePrompt({onPromptCreated}: Props) {
  const userId = useUserId();
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const prompt = e.target.prompt.value.trim();
    if (prompt.length === 0) {
      setError("Prompt cannot be empty");
      setMessage("");
      return;
    } else {
      setError("");
      setMessage("Submitting prompt...");
    }

    try {
      const res = await fetch("/api/prompt/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId || "",
        },
        body: JSON.stringify({ text: prompt }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit prompt");
      }
      const data = await res.json();
      setMessage("Prompt submitted successfully!");
      e.target.reset();
      onPromptCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setMessage("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/60 border border-gray-700/50 rounded-md p-4">
      <h1 className="text-2xl font-bold text-white">Create Prompt</h1>
      <div className="flex gap-3 mt-2">
        <input
          id="prompt"
          type="text"
          placeholder="A cat riding a skateboard"
          maxLength={200}
          className="mt-2 grow rounded-md bg-gray-800/60 border border-gray-700/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <input className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200" type="submit" value="Submit"/>
      </div>
      {message && <p className="text-sm text-green-500 mt-2">{message}</p>}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </form>
  );
}
