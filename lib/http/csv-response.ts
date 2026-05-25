const safeCsvFilenamePattern = /^[A-Za-z0-9._-]+\.csv$/;

export function createCsvDownloadResponse(csv: string, filename: string) {
  if (!safeCsvFilenamePattern.test(filename)) {
    throw new Error("Unsafe CSV filename.");
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
