const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asObject = (value: unknown): Record<string, unknown> =>
  (isRecord(value) ? value : {});

export const parseResponse = (response: unknown): Record<string, unknown> => {
  const raw = asObject(response);
  if (typeof raw.body !== 'string') {
    return raw;
  }
  try {
    return asObject(JSON.parse(raw.body));
  } catch {
    return raw;
  }
};

export const pickList = <T>(
  payload: Record<string, unknown>,
  keys: string[]
): T[] => {
  const nested = asObject(payload.data);
  const fromData = keys.map((key) => nested[key]).find(Array.isArray);
  const fromRoot = keys.map((key) => payload[key]).find(Array.isArray);
  const list = fromData ?? fromRoot ?? payload;
  return Array.isArray(list) ? (list as T[]) : [];
};
