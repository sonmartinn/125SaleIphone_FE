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
import { toast } from 'sonner'
import { Loader2, Package, Settings } from 'lucide-react'
import { getUsersApi, updateUserApi } from '@/lib/api'

interface Profile {
  full_name: string | null
  phone: string | null
  address: string | null
}

interface Order {
  id: string
  items: any[]
  total_amount: number
  payment_method: string
  status: string
  created_at: string
}

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    address: ''
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  const { token } = useAuth()

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?from=/profile')
    }
  }, [authLoading, isAuthenticated, router])

  // Lấy dữ liệu user và orders khi user có
  useEffect(() => {
    if (user?.IdUser) {
      fetchProfile(user.IdUser)
      fetchOrders()
    }
  }, [user])

  const fetchProfile = async (idUser: string) => {
    setIsLoadingProfile(true)
    try {
      const data = await getUsersApi() // Hoặc getUserByIdApi(idUser)
      if (data?.user) {
        setProfile({
          full_name: data.user.UserName || '',
          phone: data.user.Phone || '',
          address: data.user.Address || ''
        })
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message || error)
      toast.error('Không thể lấy thông tin người dùng')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const fetchOrders = async () => {
    if (!token) return
    setIsLoadingOrders(true)
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Không thể tải danh sách đơn hàng')

      const result = await response.json()
      setOrders(result.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Lỗi khi tải lịch sử đơn hàng')
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setIsSaving(true)

    try {
      const payload = {
        UserName: profile.full_name || null,
        Phone: profile.phone || null,
        Address: profile.address || null
      }
      await updateUserApi(user.IdUser, payload)
      toast.success('Đã cập nhật thông tin!')
    } catch (error: any) {
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

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

  if (authLoading || isLoadingProfile) {
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
                Xin chào, {profile.full_name || user?.Email?.split('@')[0]}
              </h1>
              <p className="text-muted-foreground mt-2">{user?.Email}</p>
            </div>

            <Tabs defaultValue="orders" className="space-y-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Đơn hàng
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Thông tin cá nhân
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
                    <h3 className="text-foreground mb-2 text-xl font-semibold">Chưa có đơn hàng nào</h3>
                    <p className="text-muted-foreground mb-6">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
                    <Button onClick={() => router.push('/iphone')} className="apple-button-primary">
                      Mua sắm ngay
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(orderData => {
                      const order = orderData as any

                      const getVal = (obj: any, keys: string[]) => {
                        for (const key of keys) {
                          const val = obj[key]
                          if (val !== undefined && val !== null && val !== "" && Number(val) !== 0) {
                            return Number(val)
                          }
                        }
                        return 0
                      }

                      const orderId = order.id || order.IdOrder || order.order_id || ''
                      const totalPrice = getVal(order, ['total_amount', 'TotalAmount', 'TotalPrice', 'total_price', 'total'])
                      const createdAt = order.created_at || order.CreatedAt || new Date().toISOString()

                      const STATUS_MAP: Record<number, { text: string; color: string }> = {
                        0: { text: 'Đang xử lý', color: 'text-yellow-600' },
                        1: { text: 'Đang giao hàng', color: 'text-blue-600' },
                        2: { text: 'Đã giao hàng', color: 'text-purple-600' },
                        3: { text: 'Hoàn thành', color: 'text-green-600' },
                        4: { text: 'Đã hủy', color: 'text-red-600' }
                      }
                      const statusValue = order.Status !== undefined ? order.Status : (order.status !== undefined ? order.status : 0)
                      const statusInfo = STATUS_MAP[statusValue] || STATUS_MAP[0]

                      const itemsList = order.items || order.order_items || order.Items || []

                      return (
                        <div key={orderId} className="apple-card p-6">
                          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-muted-foreground text-sm">Mã đơn hàng</p>
                              <p className="text-foreground font-mono text-sm font-bold">#{orderId}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-muted-foreground text-sm">{formatDate(createdAt)}</p>
                              <p className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</p>
                            </div>
                          </div>

                          <div className="border-border space-y-3 border-t pt-4">
                            {itemsList.map((item: any, idx: number) => {
                              const productName = item.product?.name || item.product?.NameProduct || item.product_name || 'Sản phẩm'
                              let image = item.ImgPath || item.product?.image || item.product?.ImageProduct || ''
                              if (!image || image.includes('placeholder.svg')) {
                                image = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'
                              }
                              const itemQuantity = Number(item.quantity || item.Quantity || 1)
                              const itemPrice = getVal(item, ['price', 'Price', 'UnitPrice', 'unit_price']) || getVal(item.product || {}, ['PriceProduct', 'price']) || 0

                              return (
                                <div key={idx} className="flex items-center gap-4">
                                  <div className="bg-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                                    <img
                                      src={image}
                                      alt={productName}
                                      className="h-12 w-12 object-contain"
                                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80' }}
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-foreground truncate text-sm font-medium">{productName}</p>
                                    <p className="text-muted-foreground text-xs">{itemQuantity} x {formatPrice(itemPrice)}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className="border-border mt-4 flex flex-col justify-between gap-2 border-t pt-4 sm:flex-row sm:items-center">
                            <p className="text-muted-foreground text-sm">
                              {order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' :
                                order.payment_method === 'BANK' ? 'Chuyển khoản ngân hàng' :
                                  order.payment_method === 'MOMO' ? 'Ví MoMo' : order.payment_method}
                            </p>
                            <p className="text-foreground text-lg font-semibold">{formatPrice(totalPrice)}</p>
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
                  <h2 className="text-foreground mb-6 text-xl font-semibold">Thông tin cá nhân</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input
                        id="fullName"
                        value={profile.full_name || ''}
                        onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                        className="mt-2"
                        placeholder={user?.UserName || 'Tên người dùng'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user?.Email || ''} className="mt-2" disabled />
                    </div>

                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        value={profile.phone || ''}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        className="mt-2"
                        placeholder={user?.Phone || 'Số điện thoại'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        value={profile.address || ''}
                        onChange={e => setProfile({ ...profile, address: e.target.value })}
                        className="mt-2"
                        placeholder={user?.Address || 'Địa chỉ'}
                      />
                    </div>

                    <Button onClick={handleSaveProfile} className="apple-button-primary mt-4" disabled={isSaving}>
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
                </div>

                <div className="apple-card max-w-xl p-6">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">Tài khoản</h2>
                  <Button variant="outline" onClick={handleLogout} className="border-red-500/50 text-red-500 hover:bg-red-500/10">
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
