export default function Home() {
  const steps = [
    {
      step: "1",
      title: "Browse Prompts",
      description:
        "Use the Prompts tab pick a prompt to draw or submit your own prompt!",
    },
    {
      step: "2",
      title: "Claim Prompt",
      description:
        "Claim a prompt to start drawing. You'll have 10 minutes to submit your drawing before it gets released back to the pool.",
    },
    {
      step: "3",
      title: "Start Drawing",
      description:
        "Submit your drawing when you are complete and release your home grown human slop to the world!",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-14">
      <div className="space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          Draw My Slop
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed">
          AI slop is lame, human slop is where it's at.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          How it works
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ step, title, description }) => (
            <div
              key={step}
              className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-5 space-y-2"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold">
                {step}
              </span>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
