'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const { fetchUser } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      // Decode token từ URL-safe
      localStorage.setItem('access_token', decodeURIComponent(token))

      // Lấy thông tin user từ API
      fetchUser()
        .then(() => {
          toast.success('Đăng nhập Google thành công')
          router.replace('/') // Redirect về trang chính (app/page.tsx)
        })
        .catch(() => {
          toast.error('Không thể lấy thông tin người dùng')
          router.replace('/auth') // Về trang login nếu lỗi
        })
    } else {
      toast.error('Đăng nhập Google thất bại')
      router.replace('/auth')
    }
  }, [])

  return null
}
