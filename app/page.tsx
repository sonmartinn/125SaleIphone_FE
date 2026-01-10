'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import ProductCard from '@/components/ProductCard'
import { getProductsApi } from '@/lib/api'
import { Product } from '@/types'
import { ArrowRight, Loader2 } from 'lucide-react'

const Index: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await getProductsApi()

        // Handle both direct array or wrapped in .data
        const fetchedProducts = Array.isArray(response) ? response : (response.data || [])

        // Map backend product structure to frontend Product interface
        const mappedProducts: Product[] = fetchedProducts.map((p: any) => {
          const variant = p.variants?.length ? p.variants[0] : null

          let category: 'iphone' | 'accessory' | null = null

          if (p.IdCategory === '1') category = 'iphone'
          else if (p.IdCategory === '2') category = 'accessory'

          return {
            id: String(p.IdProduct),
            name: p.NameProduct,
            subtitle: p.Decription || '',
            price: Number(variant?.Price ?? 0),
            image: variant?.ImgPath ?? '/images/default.png',
            category,
            isNew: false,
            isFeatured: false
          }
        })


        setProducts(mappedProducts)
      } catch (err: any) {
        console.error('Error fetching products:', err)
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const iphoneProducts = products.filter(
    p => p.category === 'iphone'
  )
  const accessories = products.filter(p => p.category === 'accessory').slice(0, 4)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-12">
        {/* Hero */}
        <HeroSection />

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-apple-blue" />
            <span className="ml-2 text-lg">Đang tải sản phẩm...</span>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center text-red-500">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-apple-blue px-6 py-2 text-white hover:bg-opacity-90 transition-all"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* iPhone Section */}
            <section className="bg-secondary py-20">
              <div className="apple-container-wide">
                <div className="mb-12 flex items-center justify-between">
                  <div>
                    <h2 className="apple-heading-section text-foreground mb-2">
                      iPhone
                    </h2>
                    <p className="apple-text-body text-muted-foreground">
                      Khám phá dòng iPhone mới nhất
                    </p>
                  </div>
                  <Link
                    href="/iphone"
                    className="text-apple-blue flex items-center gap-2 hover:underline"
                  >
                    Xem tất cả
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {iphoneProducts.slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>

            {/* Accessories Section */}
            <section className="bg-background py-20">
              <div className="apple-container-wide">
                <div className="mb-12 flex items-center justify-between">
                  <div>
                    <h2 className="apple-heading-section text-foreground mb-2">
                      Phụ kiện
                    </h2>
                    <p className="apple-text-body text-muted-foreground">
                      Nâng cao trải nghiệm iPhone của bạn
                    </p>
                  </div>
                  <Link
                    href="/accessories"
                    className="text-apple-blue flex items-center gap-2 hover:underline"
                  >
                    Xem tất cả
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {accessories.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>

            {/* Features Banner */}
            <section className="bg-foreground text-primary-foreground py-16">
              <div className="apple-container-wide">
                <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                  <div className="animate-fade-in">
                    <div className="mb-4 text-4xl">📦</div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Giao hàng miễn phí
                    </h3>
                    <p className="text-primary-foreground/70 text-sm">
                      Cho đơn hàng từ 1.000.000đ
                    </p>
                  </div>
                  <div
                    className="animate-fade-in"
                    style={{ animationDelay: '0.1s' }}
                  >
                    <div className="mb-4 text-4xl">🔄</div>
                    <h3 className="mb-2 text-lg font-semibold">Đổi trả dễ dàng</h3>
                    <p className="text-primary-foreground/70 text-sm">
                      Trong vòng 14 ngày
                    </p>
                  </div>
                  <div
                    className="animate-fade-in"
                    style={{ animationDelay: '0.2s' }}
                  >
                    <div className="mb-4 text-4xl">🛡️</div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Bảo hành chính hãng
                    </h3>
                    <p className="text-primary-foreground/70 text-sm">
                      12 tháng tại Apple
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Index
