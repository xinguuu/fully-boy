import { Suspense } from 'react';
import LoginForm from './LoginForm';

function LoginLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoadingFallback />}>
      <LoginForm />
    </Suspense>
  );
}
