const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export async function getApiData<T>(
  path: string,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/api${path}`, { signal });

  if (!response.ok) {
    throw new ApiError("تعذر تحميل بيانات المتجر حالياً.", response.status);
  }

  return response.json() as Promise<T>;
}
