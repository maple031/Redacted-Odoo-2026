export interface HealthResponse {
  status: string
  service: string
}

/**
 * Calls the application health endpoint.
 *
 * Uses a relative /api/... path — the Vite dev-server proxy (or nginx in
 * production) routes it to the backend. Never hardcodes http://localhost:8080.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health')
  if (!res.ok) {
    throw new Error(`Health check failed with HTTP ${res.status}`)
  }
  return res.json() as Promise<HealthResponse>
}
