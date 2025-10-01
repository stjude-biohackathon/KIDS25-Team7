import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { Compound, CompoundDetail } from '../types/types';
import { ApiService } from './api.service';

export function useSearchDatabase(query: string, options?: UseQueryOptions<Compound[]>) {
  return useQuery<Compound[]>({
    queryKey: ['search', query],
    queryFn: () => ApiService.get<Compound[]>('/substructure/', { query }),
    enabled: false,
    ...options
  });
}

export function useGetCompoundDetail(regNumber: string, options?: UseQueryOptions<CompoundDetail>) {
  return useQuery<CompoundDetail>({
    queryKey: ['compound', regNumber],
    queryFn: () => ApiService.get<CompoundDetail>(`/regnumber/${regNumber}`),
    enabled: !!regNumber,
    ...options
  });
}