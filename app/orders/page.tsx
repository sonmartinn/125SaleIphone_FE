'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Loader2, Package, ArrowLeft, CheckCircle2 } from 'lucide-react'

interface Product {
  IdProduct: string
  NameProduct: string
  ImageProduct: string
  PriceProduct: number
}

interface OrderItem {
  IdOrderItem: string
  IdOrder: string
  IdProduct: string
  Quantity: number
  UnitPrice: number
  product?: Product
}

interface OrderAddress {
  IdOrderAdd: string
  IdOrder: string
  FullName: string
  Phone: string
  Address: string
}

interface Order {
  IdOrder: string
  IdUser: string
  TotalPrice: number
  Status: number
  created_at: string
  updated_at: string
  items: OrderItem[]
  address?: OrderAddress
  status_text?: string
}

interface OrdersResponse {
  success: boolean
  data: Order[]
}

const OrdersPage: React.FC = () => {
  const router = useRouter()
  const { isAuthenticated, token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  const STATUS_MAP: Record<number, { text: string; color: string }> = {
    0: { text: 'Đang xử lý', color: 'text-yellow-600' },
    1: { text: 'Đang giao hàng', color: 'text-blue-600' },
    2: { text: 'Đã giao hàng', color: 'text-purple-600' },
    3: { text: 'Hoàn thành', color: 'text-green-600' },
    4: { text: 'Đã hủy', color: 'text-red-600' }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth?from=/orders')
      return
    }
    fetchOrders()
  }, [isAuthenticated])

  const fetchOrders = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token')
          router.push('/auth?from=/orders')
          return
        }
        throw new Error('Không thể tải danh sách đơn hàng')
      }

      const result: OrdersResponse = await response.json()
      console.log('📦 Orders Response:', JSON.stringify(result, null, 2))

      setOrders(result.data || [])
      setError(null)
    } catch (err: any) {
      console.error('❌ Fetch orders error:', err)
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.')
      toast.error('Lỗi khi tải đơn hàng')
    } finally {
      setIsLoading(false)
    }
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

  if (!isAuthenticated) {
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
            {/* Header */}
            <div className="mb-12 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="apple-heading-section text-foreground">
                Đơn hàng của tôi
              </h1>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="apple-card border-destructive/50 bg-destructive/5 p-6 text-center">
                <p className="text-foreground mb-4">{error}</p>
                <Button onClick={fetchOrders} className="apple-button-primary">
                  Thử lại
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && orders.length === 0 && (
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
            )}

            {/* Orders List */}
            {/* Orders List */}
            {!isLoading && !error && orders.length > 0 && (
              <div className="space-y-6">
                {orders.map((orderData) => {
                  const order = orderData as any
                  console.log('📦 Processed Order Item:', order)

                  // Helper function để lấy số từ mọi biến thể field
                  const getVal = (obj: any, keys: string[]) => {
                    for (const key of keys) {
                      const val = obj[key]
                      if (val !== undefined && val !== null && val !== "" && Number(val) !== 0) {
                        return Number(val)
                      }
                    }
                    // Fallback về giá trị đầu tiên có dữ liệu (kể cả là 0)
                    for (const key of keys) {
                      if (obj[key] !== undefined && obj[key] !== null) return Number(obj[key])
                    }
                    return 0
                  }

                  // Helper function để lấy chuỗi từ mọi biến thể field
                  const getStr = (obj: any, keys: string[]) => {
                    for (const key of keys) {
                      if (obj[key] && typeof obj[key] === 'string' && obj[key].trim() !== '') return obj[key]
                    }
                    return ''
                  }

                  // Mapping ID linh hoạt
                  const orderId = order.id || order.IdOrder || order.order_id || ''

                  // Thông tin khách hàng (Ưu tiên cấu trúc nested, sau đó là flat)
                  const fullname = order.address?.FullName || order.FullName || order.fullname || order.recipient_name || order.RecipientName || 'Khách hàng'
                  const phone = order.address?.Phone || order.Phone || order.phone || order.recipient_phone || order.PhoneNumber || ''
                  const address = order.address?.Address || order.Address || order.address || order.shipping_address || ''

                  // Tổng tiền (Hỗ trợ cực nhiều biến thể để không bao giờ bị 0đ)
                  const totalPrice = getVal(order, ['total_amount', 'TotalAmount', 'TotalPrice', 'total_price', 'total', 'Total', 'amount', 'Amount'])

                  const statusValue = order.Status !== undefined ? order.Status : (order.status !== undefined ? order.status : 0)
                  const statusInfo = STATUS_MAP[statusValue] || STATUS_MAP[0]

                  // Danh sách sản phẩm
                  const itemsList = order.items || order.order_items || order.Items || order.order_details || []
                  const createdAt = order.created_at || order.CreatedAt || order.Created_at || new Date().toISOString()

                  return (
                    <div key={orderId} className="apple-card p-6">
                      {/* Order Header */}
                      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Mã đơn hàng
                          </p>
                          <p className="text-foreground font-mono text-sm font-bold">
                            #{orderId}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:text-right">
                          <p className="text-muted-foreground text-sm">
                            {formatDate(createdAt)}
                          </p>
                          <p className={`text-sm font-medium ${statusInfo.color}`}>
                            {order.status_text || statusInfo.text}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="border-border mb-6 space-y-3 border-t pt-4">
                        {itemsList.length > 0 ? (
                          itemsList
                            .filter((item: any) => {
                              const itemPrice = getVal(item, ['price', 'Price', 'UnitPrice', 'unit_price', 'price_unit', 'amount', 'Amount'])
                                || getVal(item.product || {}, ['PriceProduct', 'price', 'Price', 'Price_Product'])
                                || 0
                              return itemPrice > 0
                            })
                            .map((item: any, index: number) => {
                              // Mapping Item linh hoạt (Hỗ trợ mọi biến thể giá)
                              const itemQuantity = Number(item.quantity || item.Quantity || item.SL || 1)
                              const itemPrice = getVal(item, ['price', 'Price', 'UnitPrice', 'unit_price', 'price_unit', 'amount', 'Amount'])
                                || getVal(item.product || {}, ['PriceProduct', 'price', 'Price', 'Price_Product'])
                                || 0

                              const productName = item.product?.name || item.product?.NameProduct || item.product_name || 'Sản phẩm'
                              const productImage = item.ImgPath || item.product?.image || item.product?.ImageProduct || item.product?.ImgPath || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'

                              return (
                                <div
                                  key={item.id || item.IdOrderItem || index}
                                  className="flex items-center gap-4"
                                >
                                  <div className="bg-secondary flex h-16 w-16 shrink-0 items-center justify-center rounded-lg">
                                    <img
                                      src={productImage}
                                      alt={productName}
                                      className="h-12 w-12 object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'
                                      }}
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-foreground truncate text-sm font-medium">
                                      {productName}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      {itemQuantity} × {formatPrice(itemPrice)}
                                    </p>
                                  </div>
                                  <p className="text-foreground whitespace-nowrap font-medium">
                                    {formatPrice(itemQuantity * itemPrice)}
                                  </p>
                                </div>
                              )
                            })
                        ) : (
                          <p className="text-muted-foreground text-sm py-4 text-center">
                            Không có thông tin sản phẩm
                          </p>
                        )}
                      </div>

                      {/* Order Address Info - Giao diện giống Checkout */}
                      <div className="border-border mb-6 space-y-3 border-t pt-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Họ và tên:</span>
                          <span className="text-foreground font-semibold">{fullname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Số điện thoại:</span>
                          <span className="text-foreground font-semibold">{phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Địa chỉ giao hàng:</span>
                          <span className="text-foreground font-semibold text-right max-w-[250px]">
                            {address}
                          </span>
                        </div>
                      </div>

                      {/* Order Summary - Giống hệt Checkout */}
                      <div className="border-border space-y-3 border-t pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tạm tính</span>
                          <span className="text-foreground">
                            {formatPrice(totalPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Phí vận chuyển</span>
                          <span className="text-green-500 font-medium">Miễn phí</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/50 pt-3">
                          <span className="text-foreground font-bold text-lg">Tổng thanh toán</span>
                          <p className="text-foreground text-xl font-bold">
                            {formatPrice(totalPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {(statusValue === 3 || statusValue === '3' || String(order.status).toUpperCase() === 'DELIVERED') && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <p className="text-sm font-medium text-green-600">
                            Đơn hàng đã hoàn thành
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default OrdersPage