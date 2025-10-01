import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { Compound, CompoundDetail, VariantDetail } from '../types/types';
import { ApiService } from './api.service';

type QueryOptions<T> = Omit<UseQueryOptions<T, Error, T, readonly unknown[]>, 'queryKey' | 'queryFn'>;

export function useSearchDatabase(query: string, options?: QueryOptions<Compound[]>) {
  return useQuery<Compound[]>({
    queryKey: ['search', query],
    queryFn: () => ApiService.get<Compound[]>('/substructure/', { query }),
    enabled: false,
    ...options
  });
}

export function useGetCompoundDetail(regNumber: string, options?: QueryOptions<CompoundDetail>) {
  return useQuery<CompoundDetail>({
    queryKey: ['compound', regNumber],
    queryFn: () => ApiService.get<CompoundDetail>(`/regnumber/${regNumber}`),
    enabled: !!regNumber,
    ...options
  });
}

export function useGetVariantDetail(varNumber: string, options?: QueryOptions<VariantDetail>) {
  return useQuery<VariantDetail>({
    queryKey: ['variant', varNumber],
    queryFn: () => ApiService.get<VariantDetail>(`/variant/${varNumber}`),
    enabled: !!varNumber,
    ...options
  });
}

export function useTextSearch(
  regn?: string,
  syn?: string,
  cas?: string,
  options?: QueryOptions<Compound[]>
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