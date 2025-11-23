import { useQuery } from '@tanstack/react-query';
import { templatesApi } from '../api/templates';

interface UseTemplatesOptions {
  enabled?: boolean;
}

export function useTemplates(options?: UseTemplatesOptions) {
  return useQuery({
    queryKey: ['templates'],
    queryFn: templatesApi.getTemplates,
    staleTime: 10 * 60 * 1000, // 10 minutes - templates rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    ...options,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templatesApi.getTemplate(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - individual template rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
