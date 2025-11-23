import { useQuery } from '@tanstack/react-query';
import { templatesApi } from '../api/templates';

interface UseTemplatesOptions {
  enabled?: boolean;
}

export function useTemplates(options?: UseTemplatesOptions) {
  return useQuery({
    queryKey: ['templates'],
    queryFn: templatesApi.getTemplates,
    ...options,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templatesApi.getTemplate(id),
    enabled: !!id,
  });
}
