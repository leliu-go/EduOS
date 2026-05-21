export default function LearningTasksLoading() {
  return (
    <div className="grid gap-4">
      <div className="h-32 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-md bg-muted" />
        <div className="h-28 animate-pulse rounded-md bg-muted" />
        <div className="h-28 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-48 animate-pulse rounded-md bg-muted" />
    </div>
  );
}
