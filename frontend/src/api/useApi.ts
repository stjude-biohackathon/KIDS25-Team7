import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { Compound, CompoundOld } from '../types/types';
import { ApiService } from './api.service';

export function useGetCompounds(options?: UseQueryOptions<CompoundOld[]>) {
  return useQuery<CompoundOld[]>({
    queryKey: ['compounds'],
    queryFn: () => ApiService.get('/compoundsOld'),
    enabled: true,
    ...options
  })
}

export function useSearchDatabase(query: string, options?: UseQueryOptions<Compound[]>) {
  return useQuery<Compound[]>({
    queryKey: ['search', query],
    queryFn: () => ApiService.get<Compound[]>('/substructure/', { query }),
    enabled: false,
    ...options
  });
}