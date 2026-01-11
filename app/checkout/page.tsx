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
import { toast } from 'sonner'
import { Loader2, CreditCard, Banknote, Smartphone } from 'lucide-react'

const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart()
  const { isAuthenticated, token } = useAuth()
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  // Tính tổng tiền từ items
  const totalPrice = items.reduce((sum, item) => {
    let price = 0
    if (item.selectedVariant?.Price) {
      price = Number(item.selectedVariant.Price)
    } else if (item.product.variants && item.product.variants.length > 0) {
      const matchingVariant = item.product.variants.find(
        v => v.Color === item.selectedColor
      ) || item.product.variants[0]
      price = Number(matchingVariant.Price)
    } else {
      price = Number(item.product.price)
    }
    return sum + (price * item.quantity)
  }, 0)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth?from=/checkout')
      return
    }
    fetchProfile()
  }, [isAuthenticated])

  useEffect(() => {
    if (items.length === 0 && isAuthenticated) {
      router.push('/cart')
    }
  }, [items, isAuthenticated])

  // Fetch profile với Accept JSON
  const fetchProfile = async () => {
    if (!token) return

    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json' // <-- thêm dòng này
        },
      })

      if (!response.ok) {
        console.warn('Profile endpoint not available:', response.status)
        return
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Profile response is not JSON')
        return
      }

      const data = await response.json()
<<<<<<< HEAD
      
=======

>>>>>>> restore-2h
      if (data.user) {
        setShippingInfo(prev => ({
          ...prev,
          fullName: data.user.FullName || data.user.name || '',
          phone: data.user.PhoneNumber || '',
          address: data.user.Address || ''
        }))
      }
    } catch (error) {
      console.warn('Could not fetch profile:', error)
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

    if (items.length === 0) {
      toast.error('Giỏ hàng trống')
      return
    }

    if (!token) {
      toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
      router.push('/auth?from=/checkout')
      return
    }

    setIsLoading(true)

    try {
      const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}` +
        (shippingInfo.note ? ` (${shippingInfo.note})` : '')

      const orderData = {
        fullname: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: fullAddress,
        payment_method: paymentMethod.toUpperCase(),
        items: items.map(item => ({
          IdProduct: item.product.id,
          Quantity: item.quantity,
          Price: item.selectedVariant?.Price || item.product.price
        }))
      }

      console.log('📦 Sending order:', orderData)

      const response = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const contentType = response.headers.get('content-type')
<<<<<<< HEAD
      
=======

>>>>>>> restore-2h
      if (!response.ok) {
        // Nếu token hết hạn hoặc không hợp lệ
        if (response.status === 401) {
          localStorage.removeItem('access_token')
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
          router.push('/auth?from=/checkout')
          setIsLoading(false)
          return
        }

        let errorMessage = 'Không thể đặt hàng'
<<<<<<< HEAD
        
=======

>>>>>>> restore-2h
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } else {
          const text = await response.text()
          console.error('API returned HTML:', text.substring(0, 200))
          errorMessage = `Lỗi hệ thống (${response.status}). Vui lòng kiểm tra API endpoint.`
        }
<<<<<<< HEAD
        
=======

>>>>>>> restore-2h
        throw new Error(errorMessage)
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API không trả về JSON. Kiểm tra Laravel routes.')
      }

      const result = await response.json()

      if (result.data?.payment_url) {
        toast.info('Đang chuyển hướng đến cổng thanh toán...')
        window.location.href = result.data.payment_url
        return
      }

      toast.success('Đặt hàng thành công!')
      clearCart()
<<<<<<< HEAD
      router.push('/orders')
=======

      // Chuyển hướng sau 2 giây để người dùng kịp thấy thông báo
      setTimeout(() => {
        router.push('/orders')
      }, 2000)
>>>>>>> restore-2h

    } catch (error: any) {
      console.error('❌ Checkout error:', error)
      toast.error(error.message || 'Không thể đặt hàng')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return null
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
                          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                            paymentMethod === 'cod'
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
                          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                            paymentMethod === 'bank'
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
                          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                            paymentMethod === 'momo'
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
                      {items.map(item => {
<<<<<<< HEAD
                        const price = item.selectedVariant?.Price || 
                          (item.product.variants?.find(v => v.Color === item.selectedColor)?.Price) ||
                          item.product.price
                        const image = item.selectedVariant?.ImgPath || item.product.image
=======
                        // Logic lấy giá linh hoạt
                        let price = 0
                        let image = item.product.image
                        let color = item.selectedColor || ''
                        let stock = 0

                        // Nếu có selectedVariant
                        if (item.selectedVariant) {
                          price = Number(item.selectedVariant.Price) || 0
                          image = item.selectedVariant.ImgPath || item.product.image
                          color = item.selectedVariant.Color || color
                          stock = item.selectedVariant.Stock || 0
                        }
                        // Nếu không có selectedVariant nhưng có variants array
                        else if (item.product.variants && item.product.variants.length > 0) {
                          const matchingVariant = item.product.variants.find(
                            v => v.Color === item.selectedColor
                          ) || item.product.variants[0]

                          price = Number(matchingVariant.Price) || 0
                          image = matchingVariant.ImgPath || item.product.image
                          color = matchingVariant.Color || color
                          stock = matchingVariant.Stock || 0
                        }
                        // Fallback về giá sản phẩm gốc
                        else {
                          price = Number(item.product.price) || 0
                        }
>>>>>>> restore-2h

                        return (
                          <div
                            key={`${item.product.id}-${item.selectedColor}-${item.selectedStorage}`}
                            className="flex gap-4"
                          >
                            <div className="bg-secondary flex h-16 w-16 shrink-0 items-center justify-center rounded-lg">
                              <img
                                src={image}
                                alt={item.product.name}
                                className="h-12 w-12 object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground line-clamp-1 text-sm font-medium">
                                {item.product.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
<<<<<<< HEAD
                                {item.selectedColor && `${item.selectedColor} • `}
                                SL: {item.quantity}
                              </p>
                              <p className="text-foreground text-sm font-medium">
                                {formatPrice(Number(price) * item.quantity)}
=======
                                {color && `${color} • `}
                                SL: {item.quantity}
                              </p>
                              <p className="text-foreground text-sm font-medium">
                                {formatPrice(price * item.quantity)}
>>>>>>> restore-2h
                              </p>
                            </div>
                          </div>
                        )
                      })}
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
                      disabled={isLoading || items.length === 0}
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
