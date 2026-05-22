export function getFormDataEntry(formData: FormData, name: string) {
  const directValue = formData.get(name);

  if (directValue !== null) {
    return directValue;
  }

  for (const [key, value] of formData.entries()) {
    if (key === name || key.endsWith(`_${name}`)) {
      return value;
    }
  }

  return null;
}

export function getFormDataString(formData: FormData, name: string) {
  const value = getFormDataEntry(formData, name);

  return typeof value === "string" ? value : null;
}

export function getFormDataFile(formData: FormData, name: string) {
  const value = getFormDataEntry(formData, name);

  return value instanceof File ? value : null;
}
