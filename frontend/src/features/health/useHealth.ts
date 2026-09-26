import { useQuery } from '@tanstack/react-query'
import { fetchHealth, type HealthResponse } from '../../lib/api/health'

/** Polls /api/health every 30 seconds and exposes the result via TanStack Query. */
export function useHealth() {
  return useQuery<HealthResponse, Error>({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
  })
}
