import { useQuery } from '@tanstack/react-query';
import { templateApi, type TemplateListParams } from '../api';

export function useTemplates(params?: TemplateListParams) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templateApi.list(params),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templateApi.getById(id),
    enabled: !!id,
  });
}
