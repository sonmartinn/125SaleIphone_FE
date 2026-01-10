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
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

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
          subtitle: data.Decription || data.description || data.Description || data.subtitle || '',
          price: Number(data.price) || Number(data.PriceProduct) || 0,
          image: data.image || data.ImageProduct,
          category: (data.IdCategory === '1' || data.CategoryId === 1 || (data.category && data.category.includes('iphone'))) ? 'iphone' : 'accessory',
          isNew: data.isNew || false,
          variants: data.variants || [],
          originalPrice: data.originalPrice
        }

        setProduct(mappedProduct)
        // Select first variant if available
        if (mappedProduct.variants && mappedProduct.variants.length > 0) {
          setSelectedVariant(mappedProduct.variants[0])
        }
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
    if (!selectedVariant) {
      toast.error('Vui lòng chọn phiên bản sản phẩm')
      return
    }
    addToCart(product, selectedVariant.Color, selectedVariant.IdProductVar)
    toast.success('Đã thêm vào giỏ hàng!', {
      description: `${product.name} - ${selectedVariant.Color}`,
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
                    src={selectedVariant?.ImgPath || product.image}
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
                    {formatPrice(selectedVariant?.Price || product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-muted-foreground text-xl line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Variants Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-foreground mb-3 text-sm font-medium">
                      Chọn phiên bản
                    </h3>
                    <div className="space-y-3">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.IdProductVar}
                          onClick={() => setSelectedVariant(variant)}
                          className={`w-full rounded-lg border p-4 text-left transition-all ${
                            selectedVariant?.IdProductVar === variant.IdProductVar
                              ? 'border-apple-blue bg-blue-50 dark:bg-blue-950'
                              : 'border-border hover:border-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-foreground font-medium">
                                {variant.Color}
                              </div>
                              <div className="text-muted-foreground text-sm">
                                Kho: {variant.Stock} sản phẩm
                              </div>
                            </div>
                            <div className="text-foreground font-semibold text-lg">
                              {formatPrice(variant.Price)}
                            </div>
                          </div>
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
