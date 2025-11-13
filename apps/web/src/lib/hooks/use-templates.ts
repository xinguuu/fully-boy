import { useQuery } from '@tanstack/react-query';
import { templatesApi } from '../api/templates';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: templatesApi.getTemplates,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templatesApi.getTemplate(id),
    enabled: !!id,
  });
}
