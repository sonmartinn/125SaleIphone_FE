'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } =
    useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Use query param 'from' instead of state for Next.js navigation
      router.push('/auth?from=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center pt-12">
          <div className="py-20 text-center">
            <ShoppingBag className="text-muted-foreground mx-auto mb-6 h-16 w-16" />
            <h1 className="apple-heading-product text-foreground mb-4">
              Giỏ hàng của bạn đang trống
            </h1>
            <p className="text-muted-foreground mb-8">
              Hãy khám phá các sản phẩm tuyệt vời của chúng tôi
            </p>
            <Link
              href="/iphone"
              className="apple-button-primary inline-flex items-center justify-center"
            >
              Mua sắm ngay
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-12">
        <section className="bg-background py-16">
          <div className="apple-container-wide">
            <h1 className="apple-heading-section text-foreground mb-12">
              Giỏ hàng
            </h1>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="space-y-6 lg:col-span-2">
                {items.map(item => (
                  <div
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedStorage}`}
                    className="apple-card flex flex-col gap-6 p-6 sm:flex-row"
                  >
                    {/* Image */}
                    <div className="bg-secondary flex h-32 w-full shrink-0 items-center justify-center rounded-xl sm:w-32">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-4/5 w-4/5 object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-foreground mb-1 text-lg font-semibold">
                        {item.product.name}
                      </h3>
                      <p className="text-muted-foreground mb-2 text-sm">
                        {item.selectedColor && `${item.selectedColor}`}
                        {item.selectedStorage && ` • ${item.selectedStorage}`}
                      </p>
                      <p className="text-foreground text-lg font-medium">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="border-border flex items-center gap-3 rounded-full border px-2 py-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="hover:bg-secondary rounded-full p-1 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="hover:bg-secondary rounded-full p-1 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="apple-card sticky top-24 p-6">
                  <h2 className="text-foreground mb-6 text-xl font-semibold">
                    Tổng đơn hàng
                  </h2>

                  <div className="mb-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Sản phẩm ({totalItems})
                      </span>
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
                    <div className="border-border border-t pt-4">
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
                    onClick={handleCheckout}
                    className="apple-button-primary w-full"
                    size="lg"
                  >
                    Tiến hành thanh toán
                  </Button>

                  <p className="text-muted-foreground mt-4 text-center text-xs">
                    Hỗ trợ trả góp 0% lãi suất
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default CartPage
