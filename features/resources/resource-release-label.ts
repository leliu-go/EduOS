function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDate(value: Date | string | null) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

export function getResourceReleaseLabel(releaseAt: Date | string | null) {
  const value = toDate(releaseAt);

  if (!value) {
    return "立即开放";
  }

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(
    value.getHours(),
  )}:${pad(value.getMinutes())} 开放`;
}

export function formatDateTimeLocal(value: string | null) {
  const releaseAt = toDate(value);

  if (!releaseAt) {
    return "";
  }

  return `${releaseAt.getFullYear()}-${pad(releaseAt.getMonth() + 1)}-${pad(
    releaseAt.getDate(),
  )}T${pad(releaseAt.getHours())}:${pad(releaseAt.getMinutes())}`;
}
