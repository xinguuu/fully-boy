'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/lib/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/browse';
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login.mutateAsync(data);
      router.push(redirectTo);
    } catch (error) {
      logger.error('Login failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-5xl font-extrabold text-primary-500 mb-2">
            🎮 Xingu
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            파티를 더 즐겁게!
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 animate-slide-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              다시 오신 것을 환영해요
            </h2>
            <p className="text-gray-600">
              로그인하고 게임을 만들어보세요
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                className={`
                  h-12 w-full px-4
                  border rounded-lg
                  bg-white
                  text-gray-900 placeholder:text-gray-400
                  transition-all duration-200 ease-out
                  hover:border-gray-400
                  focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                  focus:outline-none
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  ${errors.email ? 'border-red-500' : 'border-gray-300'}
                `}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`
                  h-12 w-full px-4
                  border rounded-lg
                  bg-white
                  text-gray-900 placeholder:text-gray-400
                  transition-all duration-200 ease-out
                  hover:border-gray-400
                  focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                  focus:outline-none
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  ${errors.password ? 'border-red-500' : 'border-gray-300'}
                `}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {login.isError && (
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg animate-slide-down">
                <p className="text-sm text-red-800 font-medium">
                  이메일 또는 비밀번호가 올바르지 않습니다
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={login.isPending}
              className="
                w-full h-12
                bg-primary-500 hover:bg-primary-600 active:bg-primary-700
                text-white font-semibold text-base
                rounded-lg
                transition-all duration-200 ease-out
                hover:scale-105 hover:shadow-lg
                active:scale-100
                disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100
                cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                flex items-center justify-center gap-2
              "
            >
              {login.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>

            {/* Signup Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-primary-500 hover:text-primary-600 transition-colors cursor-pointer hover:underline"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer font-medium"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
