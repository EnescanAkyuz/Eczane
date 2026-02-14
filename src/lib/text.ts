const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  i: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeForCompare(value: string): string {
  return normalizeWhitespace(value)
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (char) => {
      return TURKISH_CHAR_MAP[char] ?? char;
    })
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function toSlug(value: string): string {
  return normalizeForCompare(value).replace(/\s+/g, "-");
}

export function fromSlug(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function removeDistrictSuffix(value: string): string {
  return normalizeWhitespace(value)
    .replace(/\b(ilcesi|ilçesi|ilce|ilçe|belediyesi|district|county)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const visited = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);
    result.push(item);
  }

  return result;
}
