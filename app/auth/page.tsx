'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const {
    login,
    register,
    // loginWithGoogle,
    // loginWithFacebook,
    isAuthenticated,
    user
  } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/iphone'

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.Role == '2' || user.Role === 2) {
        router.push('/admin')
      } else {
        router.push(from)
      }
    }
  }, [isAuthenticated, user, router, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const { error } = await login(formData.email, formData.password)
        if (error) {
          toast.error(error)
          return
        }

        toast.success('Đăng nhập thành công!')
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Mật khẩu xác nhận không khớp')
          return
        }

        if (formData.password.length < 6) {
          toast.error('Mật khẩu phải có ít nhất 6 ký tự')
          return
        }

        const { error } = await register(
          formData.name,
          formData.email,
          formData.password
        )

        try {
          await register(formData.name, formData.email, formData.password)
          toast.success('Đăng ký thành công! Vui lòng kiểm tra email')
          router.push(`/verify-email?email=${formData.email}`)
        } catch (err: any) {
          toast.error(err.message || 'Đăng ký thất bại')
        }
        if (error) {
          toast.error(error)
        } else {
          toast.success('Đăng ký thành công! Vui lòng kiểm tra email')
          router.push(`/verify-email?email=${formData.email}`)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // const handleGoogleLogin = async () => {
  //   const { error } = await loginWithGoogle()
  //   if (error) {
  //     toast.error('Không thể đăng nhập bằng Google. Vui lòng thử lại.')
  //   }
  // }

  // const handleFacebookLogin = async () => {
  //   const { error } = await loginWithFacebook()
  //   if (error) {
  //     toast.error('Không thể đăng nhập bằng Facebook. Vui lòng thử lại.')
  //   }
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="bg-secondary flex flex-1 items-center justify-center py-16 pt-12">
        <div className="mx-4 w-full max-w-md">
          <div className="apple-card p-8">
            {/* Logo */}
            <div className="mb-8 text-center">
              <svg
                className="mx-auto mb-4 h-10 w-10"
                viewBox="0 0 17 48"
                fill="currentColor"
              >
                <path d="M15.5752 19.0792C15.4636 19.1668 13.4622 20.2948 13.4622 22.8116C13.4622 25.7372 15.9968 26.7564 16.0728 26.7824C16.0604 26.8436 15.6656 28.1692 14.7308 29.52C13.9 30.7016 13.0196 31.88 11.6944 31.88C10.3692 31.88 10.0124 31.1016 8.4772 31.1016C6.9792 31.1016 6.4356 31.906 5.2212 31.906C4.0068 31.906 3.152 30.806 2.1792 29.4696C1.0524 27.8968 0.128 25.4428 0.128 23.1012C0.128 18.738 2.9788 16.404 5.7924 16.404C7.08 16.404 8.1456 17.258 8.9512 17.258C9.72 17.258 10.914 16.3548 12.3892 16.3548C12.9452 16.3548 14.9464 16.404 15.5752 19.0792ZM11.1344 14.658C11.7524 13.9288 12.1844 12.9216 12.1844 11.9144C12.1844 11.7772 12.172 11.6388 12.1476 11.5264C11.1468 11.5636 9.9572 12.1868 9.2528 13.0144C8.7092 13.646 8.1832 14.658 8.1832 15.678C8.1832 15.8284 8.2084 15.9788 8.2212 16.0272C8.284 16.0392 8.3844 16.0524 8.4848 16.0524C9.3856 16.0524 10.4908 15.4668 11.1344 14.658Z" />
              </svg>
              <h1 className="apple-heading-product text-foreground">
                {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {isLogin
                  ? 'Đăng nhập để tiếp tục mua sắm'
                  : 'Tạo tài khoản Apple Store của bạn'}
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="mb-6 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="border-border hover:bg-secondary flex h-12 w-full items-center justify-center gap-3"
              // onClick={handleGoogleLogin}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Tiếp tục với Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="border-border hover:bg-secondary flex h-12 w-full items-center justify-center gap-3"
              // onClick={handleFacebookLogin}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-medium">
                  Tiếp tục với Facebook
                </span>
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="border-border w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">Hoặc</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Họ và tên
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-2"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-2"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="mt-2"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {!isLogin && (
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Xác nhận mật khẩu
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value
                      })
                    }
                    className="mt-2"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="apple-button-primary w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : isLogin ? (
                  'Đăng nhập'
                ) : (
                  'Tạo tài khoản'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-apple-blue text-sm hover:underline"
              >
                {isLogin
                  ? 'Chưa có tài khoản? Đăng ký ngay'
                  : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AuthPage
