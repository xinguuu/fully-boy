'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LoginForm from './LoginForm';

function LoginLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-gray-600 font-medium">로딩 중...</p>
      </div>
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
