'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { products } from '@/data/products' // Removed static import
import { useCart } from '@/context/CartContext'
import { toast } from 'sonner'
import { Check, ShoppingBag, Loader2 } from 'lucide-react'
import { getProductDetailApi } from '@/lib/api'
import { Product } from '@/types'

const ProductDetailPage: React.FC = () => {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true)
        // Correctly handle the API response which might be the object itself or wrapped
        const response = await getProductDetailApi(id)
        const data = response.data || response

        const mappedProduct: Product = {
          id: data.id?.toString() || data.IdProduct?.toString(),
          name: data.name || data.NameProduct,
          subtitle: data.description || data.Description || data.subtitle || '',
          price: Number(data.price) || Number(data.PriceProduct) || 0,
          image: data.image || data.ImageProduct,
          category: (data.CategoryId === 1 || (data.category && data.category.includes('iphone'))) ? 'iphone' : 'accessory',
          isNew: data.isNew || false,
          // Use hardcoded defaults if API doesn't return colors/storage yet, or map from variants if available
          colors: data.colors || ['Titan Tự Nhiên', 'Titan Xanh', 'Titan Trắng', 'Titan Đen'],
          storage: data.storage || ['128GB', '256GB', '512GB', '1TB'],
          originalPrice: data.originalPrice
        }

        setProduct(mappedProduct)
        setSelectedColor(mappedProduct.colors?.[0])
        setSelectedStorage(mappedProduct.storage?.[0])
      } catch (error) {
        console.error('Failed to fetch product:', error)
        toast.error('Không thể tải thông tin sản phẩm')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center pt-12">
          <Loader2 className="h-8 w-8 animate-spin text-apple-blue" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center pt-12">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-semibold">
              Không tìm thấy sản phẩm
            </h1>
            <Button onClick={() => router.push('/')}>Về trang chủ</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedStorage)
    toast.success('Đã thêm vào giỏ hàng!', {
      description: product.name,
      action: {
        label: 'Xem giỏ hàng',
        onClick: () => router.push('/cart')
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-12">
        <section className="bg-background py-16">
          <div className="apple-container-wide">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              {/* Image */}
              <div className="animate-fade-in">
                <div className="bg-secondary flex aspect-square items-center justify-center rounded-3xl p-8">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-4/5 w-4/5 object-contain"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="animate-slide-in-right">
                {product.isNew && (
                  <Badge className="bg-accent text-accent-foreground mb-4">
                    Mới
                  </Badge>
                )}

                <h1 className="apple-heading-section text-foreground mb-2">
                  {product.name}
                </h1>
                <p className="apple-text-large text-muted-foreground mb-8">
                  {product.subtitle}
                </p>

                {/* Price */}
                <div className="mb-8 flex items-baseline gap-3">
                  <span className="text-foreground text-3xl font-semibold">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-muted-foreground text-xl line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-foreground mb-3 text-sm font-medium">
                      Màu sắc:{' '}
                      <span className="text-muted-foreground">
                        {selectedColor}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`rounded-full border px-4 py-2 text-sm transition-all ${selectedColor === color
                              ? 'border-foreground bg-foreground text-primary-foreground'
                              : 'border-border hover:border-foreground'
                            }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Storage Selection */}
                {product.storage && product.storage.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-foreground mb-3 text-sm font-medium">
                      Dung lượng:{' '}
                      <span className="text-muted-foreground">
                        {selectedStorage}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {product.storage.map(storage => (
                        <button
                          key={storage}
                          onClick={() => setSelectedStorage(storage)}
                          className={`rounded-full border px-4 py-2 text-sm transition-all ${selectedStorage === storage
                              ? 'border-foreground bg-foreground text-primary-foreground'
                              : 'border-border hover:border-foreground'
                            }`}
                        >
                          {storage}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    onClick={handleAddToCart}
                    className="apple-button-primary flex flex-1 items-center justify-center gap-2"
                    size="lg"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Thêm vào giỏ hàng
                  </Button>
                </div>

                {/* Features */}
                <div className="border-border mt-12 border-t pt-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                      <span className="text-muted-foreground text-sm">
                        Giao hàng miễn phí toàn quốc
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                      <span className="text-muted-foreground text-sm">
                        Bảo hành 12 tháng chính hãng
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                      <span className="text-muted-foreground text-sm">
                        Đổi trả trong 14 ngày
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                      <span className="text-muted-foreground text-sm">
                        Hỗ trợ trả góp 0%
                      </span>
                    </div>
                  </div>
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

export default ProductDetailPage
