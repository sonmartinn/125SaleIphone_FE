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
  const { items, updateQuantity, removeFromCart } = useCart()
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
      router.push('/auth?from=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  // Debug: Log items để kiểm tra cấu trúc dữ liệu
  console.log('🛒 Cart Items:', items)

  // Tính tổng tiền và số lượng trực tiếp từ items
  const totalPrice = items.reduce((sum, item) => {
    // Thử nhiều cách lấy giá
    let price = 0

    if (item.selectedVariant?.Price) {
      price = Number(item.selectedVariant.Price)
    } else if (item.product.price) {
      price = Number(item.product.price)
    } else if (item.product.variants && item.product.variants.length > 0) {
      // Nếu có variants, lấy giá của variant đầu tiên hoặc variant có màu trùng
      const matchingVariant = item.product.variants.find(
        v => v.Color === item.selectedColor
      ) || item.product.variants[0]
      price = Number(matchingVariant.Price)
    }

    console.log(`💰 Price for ${item.product.name}:`, price)
    return sum + (price * item.quantity)
  }, 0)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

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
                {items.map(item => {
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

                  console.log(`📱 ${item.product.name}:`, {
                    price,
                    image,
                    color,
                    hasVariant: !!item.selectedVariant,
                    hasVariantsArray: !!item.product.variants
                  })

                  const productId = item.product.id || (item.product as any).IdProduct || ''

                  return (
                    <div
                      key={`${productId}-${item.selectedColor || ''}-${item.selectedStorage || ''}`}
                      className="apple-card flex flex-col gap-6 p-6 sm:flex-row"
                    >
                      {/* Image */}
                      <div className="bg-secondary flex h-32 w-full shrink-0 items-center justify-center rounded-xl sm:w-32">
                        <img
                          src={image}
                          alt={item.product.name}
                          className="h-4/5 w-4/5 object-contain"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-foreground mb-1 text-lg font-semibold">
                          {item.product.name}
                        </h3>

                        {/* Hiển thị màu sắc và thông tin */}
                        <div className="text-muted-foreground mb-2 text-sm">
                          {color && <span>Màu: {color}</span>}
                          {item.selectedStorage && <span> • {item.selectedStorage}</span>}
                          {stock > 0 && <span> • Còn {stock} sản phẩm</span>}
                        </div>

                        {/* Giá gốc nếu có */}
                        {item.product.originalPrice && (
                          <p className="text-muted-foreground text-sm line-through mb-1">
                            {formatPrice(item.product.originalPrice)}
                          </p>
                        )}

                        {/* Giá hiện tại × số lượng */}
                        <p className="text-foreground mb-2 text-sm">
                          {formatPrice(price)} × {item.quantity}
                        </p>

                        {/* Tổng tiền */}
                        <p className="text-foreground text-lg font-medium">
                          {formatPrice(price * item.quantity)}
                        </p>

                        {/* Debug info - XÓA SAU KHI FIX */}

                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="border-border flex items-center gap-3 rounded-full border px-2 py-1">
                          <button
                            onClick={() =>
                              updateQuantity(productId, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="hover:bg-secondary rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(productId, item.quantity + 1)
                            }
                            disabled={stock > 0 && item.quantity >= stock}
                            className="hover:bg-secondary rounded-full p-1 transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
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
                    disabled={totalPrice === 0}
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