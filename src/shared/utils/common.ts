export const decodeBase64 = (cursor?: string): any => {
  if (!cursor?.length) return null;
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  return JSON.parse(decoded);
};

export const encodeBase64 = (payload: unknown): string => {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
};
