'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Loader2, Package, Settings } from 'lucide-react'

interface Order {
  id: string
  items: any
  total_amount: number
  shipping_address: string
  phone: string
  payment_method: string
  status: string
  created_at: string
}

interface Profile {
  full_name: string | null
  phone: string | null
  address: string | null
}

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    address: ''
  })
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?from=/profile')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      fetchOrders()
      fetchProfile()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const fetchProfile = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address
        })
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Đã cập nhật thông tin!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Không thể cập nhật thông tin')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      pending: { text: 'Chờ xác nhận', color: 'text-yellow-500' },
      confirmed: { text: 'Đã xác nhận', color: 'text-blue-500' },
      shipping: { text: 'Đang giao hàng', color: 'text-purple-500' },
      delivered: { text: 'Đã giao hàng', color: 'text-green-500' },
      cancelled: { text: 'Đã hủy', color: 'text-red-500' }
    }
    return statusMap[status] || { text: status, color: 'text-muted-foreground' }
  }

  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      cod: 'Thanh toán khi nhận hàng',
      bank: 'Chuyển khoản ngân hàng',
      momo: 'Ví MoMo'
    }
    return methodMap[method] || method
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-12">
        <section className="bg-background py-16">
          <div className="apple-container-wide">
            <div className="mb-12">
              <h1 className="apple-heading-section text-foreground">
                Xin chào, {profile.full_name || user?.email?.split('@')[0]}
              </h1>
              <p className="text-muted-foreground mt-2">{user?.email}</p>
            </div>

            <Tabs defaultValue="orders" className="space-y-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Đơn hàng
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Thông tin
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                {isLoadingOrders ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="apple-card p-12 text-center">
                    <Package className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                    <h3 className="text-foreground mb-2 text-xl font-semibold">
                      Chưa có đơn hàng nào
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!
                    </p>
                    <Button
                      onClick={() => router.push('/iphone')}
                      className="apple-button-primary"
                    >
                      Mua sắm ngay
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const status = getStatusText(order.status)
                      return (
                        <div key={order.id} className="apple-card p-6">
                          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-muted-foreground text-sm">
                                Mã đơn hàng
                              </p>
                              <p className="text-foreground font-mono text-sm">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-muted-foreground text-sm">
                                {formatDate(order.created_at)}
                              </p>
                              <p
                                className={`text-sm font-medium ${status.color}`}
                              >
                                {status.text}
                              </p>
                            </div>
                          </div>

                          <div className="border-border space-y-3 border-t pt-4">
                            {order.items.map((item: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-4"
                              >
                                <div className="bg-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                                  <img
                                    src={
                                      item.product?.image || '/placeholder.svg'
                                    }
                                    alt={item.product?.name}
                                    className="h-8 w-8 object-contain"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-foreground truncate text-sm font-medium">
                                    {item.product?.name}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    SL: {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border-border mt-4 flex flex-col justify-between gap-2 border-t pt-4 sm:flex-row sm:items-center">
                            <p className="text-muted-foreground text-sm">
                              {getPaymentMethodText(order.payment_method)}
                            </p>
                            <p className="text-foreground text-lg font-semibold">
                              {formatPrice(order.total_amount)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="apple-card max-w-xl p-6">
                  <h2 className="text-foreground mb-6 text-xl font-semibold">
                    Thông tin cá nhân
                  </h2>

                  {isLoadingProfile ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input
                          id="fullName"
                          value={profile.full_name || ''}
                          onChange={e =>
                            setProfile({
                              ...profile,
                              full_name: e.target.value
                            })
                          }
                          className="mt-2"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user?.email || ''}
                          className="mt-2"
                          disabled
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone || ''}
                          onChange={e =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          className="mt-2"
                          placeholder="0912 345 678"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Input
                          id="address"
                          value={profile.address || ''}
                          onChange={e =>
                            setProfile({ ...profile, address: e.target.value })
                          }
                          className="mt-2"
                          placeholder="Số nhà, đường, quận/huyện, thành phố"
                        />
                      </div>

                      <Button
                        onClick={handleSaveProfile}
                        className="apple-button-primary mt-4"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          'Lưu thay đổi'
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="apple-card max-w-xl p-6">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">
                    Tài khoản
                  </h2>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    Đăng xuất
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage
