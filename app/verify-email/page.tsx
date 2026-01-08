'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')

  const { verifyEmail } = useAuth()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  if (!email) {
    return <p>Email không hợp lệ</p>
  }

  const handleVerify = async () => {
    setLoading(true)
    const { error } = await verifyEmail(email, code)
    setLoading(false)

    if (error) {
      toast.error(error)
      return
    }

    toast.success('Xác thực email thành công!')
    router.push('/auth')
  }

  return (
    <div className="mx-auto mt-20 max-w-sm space-y-4">
      <h1 className="text-xl font-semibold text-center">
        Xác thực Email
      </h1>

      <Input
        placeholder="Nhập mã xác thực"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <Button
        className="w-full"
        onClick={handleVerify}
        disabled={loading}
      >
        {loading ? 'Đang xác thực...' : 'Xác nhận'}
      </Button>
    </div>
  )
}
