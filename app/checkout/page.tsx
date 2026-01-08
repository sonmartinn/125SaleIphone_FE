'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Loader2, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { checkoutApi, sendMailApi } from '@/lib/api'

const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    note: ''
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?from=/checkout')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

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
        setShippingInfo(prev => ({
          ...prev,
          fullName: data.full_name || '',
          phone: data.phone || '',
          address: data.address || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}${shippingInfo.note ? ` (${shippingInfo.note})` : ''}`

      // Prepare order data for Laravel API
      const orderData = {
        user_id: user.id,
        items: items,
        total_amount: totalPrice,
        shipping_address: fullAddress,
        phone: shippingInfo.phone,
        payment_method: paymentMethod,
        recipient_name: shippingInfo.fullName, // Send recipient name if needed backend
        email: user.email // Ensure email is sent
      }

      console.log('Sending order data:', orderData);

      // Call Laravel API
      const result = await checkoutApi(orderData)
      console.log('Checkout result:', result);

      // If successful, send confirmation email
      try {
        await sendMailApi({
          email: user.email,
          order_id: result.order_id || result.id || 'N/A', // Adjust based on actual response
          total_amount: totalPrice,
          items: items
        })
      } catch (mailError) {
        console.error("Failed to send email:", mailError)
        // Don't block success just because email failed, but maybe notify user?
      }

      clearCart()
      toast.success('Đặt hàng thành công!', {
        description: 'Cảm ơn bạn đã mua sắm tại Apple Store'
      })
      router.push('/profile')
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error(error.message || 'Không thể đặt hàng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    // Only redirect if not already redirecting for auth
    if (isAuthenticated || !authLoading) {
      // Adding a small delay or check to avoid conflict? No, should be fine.
      // But better to wrap in useEffect to avoid state update during render if strictly following React rules
    }
    // We can return null and redirect in useEffect, but for simplicity:
    // If returning null/redirecting here, it causes issues during render.
    // Better to handle in useEffect.
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-12">
        <section className="bg-background py-16">
          <div className="apple-container-wide">
            <h1 className="apple-heading-section text-foreground mb-12">
              Thanh toán
            </h1>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {/* Shipping Info */}
                <div className="space-y-8 lg:col-span-2">
                  {/* Delivery Info */}
                  <div className="apple-card p-6">
                    <h2 className="text-foreground mb-6 text-xl font-semibold">
                      Thông tin giao hàng
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input
                          id="fullName"
                          value={shippingInfo.fullName}
                          onChange={e =>
                            setShippingInfo({
                              ...shippingInfo,
                              fullName: e.target.value
                            })
                          }
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={e =>
                            setShippingInfo({
                              ...shippingInfo,
                              phone: e.target.value
                            })
                          }
                          className="mt-2"
                          placeholder="0912 345 678"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Input
                          id="address"
                          value={shippingInfo.address}
                          onChange={e =>
                            setShippingInfo({
                              ...shippingInfo,
                              address: e.target.value
                            })
                          }
                          className="mt-2"
                          placeholder="Số nhà, tên đường"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Thành phố</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={e =>
                            setShippingInfo({
                              ...shippingInfo,
                              city: e.target.value
                            })
                          }
                          className="mt-2"
                          placeholder="Hồ Chí Minh"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                        <Input
                          id="note"
                          value={shippingInfo.note}
                          onChange={e =>
                            setShippingInfo({
                              ...shippingInfo,
                              note: e.target.value
                            })
                          }
                          className="mt-2"
                          placeholder="Giao giờ hành chính"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="apple-card p-6">
                    <h2 className="text-foreground mb-6 text-xl font-semibold">
                      Phương thức thanh toán
                    </h2>

                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <div className="space-y-4">
                        <label
                          htmlFor="cod"
                          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${paymentMethod === 'cod'
                            ? 'border-foreground bg-secondary'
                            : 'border-border hover:border-foreground/50'
                            }`}
                        >
                          <RadioGroupItem value="cod" id="cod" />
                          <Banknote className="text-muted-foreground h-6 w-6" />
                          <div>
                            <p className="text-foreground font-medium">
                              Thanh toán khi nhận hàng (COD)
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Thanh toán bằng tiền mặt khi nhận hàng
                            </p>
                          </div>
                        </label>

                        <label
                          htmlFor="bank"
                          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${paymentMethod === 'bank'
                            ? 'border-foreground bg-secondary'
                            : 'border-border hover:border-foreground/50'
                            }`}
                        >
                          <RadioGroupItem value="bank" id="bank" />
                          <CreditCard className="text-muted-foreground h-6 w-6" />
                          <div>
                            <p className="text-foreground font-medium">
                              Chuyển khoản ngân hàng
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Chuyển khoản qua tài khoản ngân hàng
                            </p>
                          </div>
                        </label>

                        <label
                          htmlFor="momo"
                          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${paymentMethod === 'momo'
                            ? 'border-foreground bg-secondary'
                            : 'border-border hover:border-foreground/50'
                            }`}
                        >
                          <RadioGroupItem value="momo" id="momo" />
                          <Smartphone className="text-muted-foreground h-6 w-6" />
                          <div>
                            <p className="text-foreground font-medium">
                              Ví MoMo
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Thanh toán qua ứng dụng MoMo
                            </p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="apple-card sticky top-24 p-6">
                    <h2 className="text-foreground mb-6 text-xl font-semibold">
                      Đơn hàng của bạn
                    </h2>

                    {/* Items */}
                    <div className="mb-6 space-y-4">
                      {items.map(item => (
                        <div
                          key={`${item.product.id}-${item.selectedColor}-${item.selectedStorage}`}
                          className="flex gap-4"
                        >
                          <div className="bg-secondary flex h-16 w-16 shrink-0 items-center justify-center rounded-lg">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="h-12 w-12 object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground line-clamp-1 text-sm font-medium">
                              {item.product.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              SL: {item.quantity}
                            </p>
                            <p className="text-foreground text-sm font-medium">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-border mb-6 space-y-3 border-t pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tạm tính</span>
                        <span className="text-foreground">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Phí vận chuyển
                        </span>
                        <span className="text-green-500">Miễn phí</span>
                      </div>
                      <div className="border-border border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-foreground text-lg font-semibold">
                            Tổng cộng
                          </span>
                          <span className="text-foreground text-lg font-semibold">
                            {formatPrice(totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

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
                      ) : (
                        'Đặt hàng'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default CheckoutPage
