import { Suspense } from 'react';
import EditForm from './EditForm';

function EditLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<EditLoadingFallback />}>
      <EditForm />
    </Suspense>
  );
}
