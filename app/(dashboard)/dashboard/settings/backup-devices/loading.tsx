import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BackupDevicesSettingsLoading() {
  return (
    <div className="grid gap-6">
      <div className="h-20 rounded-lg border bg-muted/40" />
      <section className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card key={item} className="shadow-none">
            <CardHeader>
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="h-4 w-48 rounded bg-muted" />
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="h-4 rounded bg-muted" />
              <div className="h-4 rounded bg-muted" />
              <div className="h-9 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
