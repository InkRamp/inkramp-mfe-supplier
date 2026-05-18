const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asObject = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

export const parseResponse = (response: unknown): Record<string, unknown> => {
  const raw = asObject(response);
  if (typeof raw['body'] !== 'string') {
    return raw;
  }
  try {
    return asObject(JSON.parse(raw['body']));
  } catch {
    return raw;
  }
};

const getResponseData = (response: unknown): unknown => {
  const parsed = parseResponse(response);
  return parsed['data'] ?? parsed;
};

export const extractArray = <T>(response: unknown, normalize: (value: unknown) => T | null): T[] => {
  const data = getResponseData(response);
  if (!Array.isArray(data)) {
    return [];
  }
  return data
    .map(normalize)
    .filter((value): value is T => value !== null);
};

export const extractObject = <T>(response: unknown, normalize: (value: unknown) => T | null): T => {
  const value = normalize(getResponseData(response));
  if (value) {
    return value;
  }
  throw new Error('Unexpected response shape from API.');
};
