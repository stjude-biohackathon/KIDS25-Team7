import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { Compound } from '../types/types';
import { ApiService } from './api.service';

export function useGetCompounds(options?: UseQueryOptions<Compound[]>) {
  return useQuery<Compound[]>({
    queryKey: ['compounds'],
    queryFn: () => ApiService.get('/compounds'),
    enabled: true,
    ...options
  })
}