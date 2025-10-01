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

export function useTextSearch(
  regn?: string,
  syn?: string,
  cas?: string,
  options?: UseQueryOptions<Compound[]>
) {
  const params: Record<string, string> = {};
  if (regn) params.regn = regn;
  if (syn) params.syn = syn;
  if (cas) params.cas = cas;

  return useQuery<Compound[]>({
    queryKey: ['textSearch', regn, syn, cas],
    queryFn: () => ApiService.get<Compound[]>('/textsearch/', params),
    enabled: false,
    ...options
  });
}