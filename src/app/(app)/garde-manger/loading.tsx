export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-xl bg-bg-surface" />
      <div className="h-10 w-full animate-pulse rounded-xl bg-bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl bg-bg-surface"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
