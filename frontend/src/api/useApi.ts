import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
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

export function useSearchDatabaseMutation(
  options?: UseMutationOptions<Compound[], Error, {smiles: string}>
) {
  return useMutation<Compound[], Error, {smiles: string}>({
    mutationFn: (params) => ApiService.post<Compound[]>('/search', params),
    ...options
  });
}