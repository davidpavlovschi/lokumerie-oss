"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="font-display text-xl text-accent-secondary">
        L&apos;etagere s&apos;est effondree...
      </p>
      <p className="mt-2 text-sm text-text-secondary">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-xl bg-accent px-4 py-2 text-sm text-bg-base"
      >
        Reessayer
      </button>
    </div>
  );
}
