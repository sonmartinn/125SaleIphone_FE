'use client'

import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getProductsApi } from '@/lib/api'

interface ProductUI {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
}

const AccessoriesPage: React.FC = () => {
  const [accessories, setAccessories] = useState<ProductUI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        setLoading(true)

        const res = await getProductsApi()

        // Lọc phụ kiện: IdCategory === '02'
        const accessoryProducts = res
          .filter((p: any) => p.IdCategory === '02')
          .map((p: any) => {
            const variant = p.variants?.[0]

            return {
              id: p.IdProduct,
              name: p.NameProduct,
              description: p.Decription,
              price: variant?.Price ?? 0,
              image: variant?.ImgPath ?? '/no-image.png',
              stock: variant?.Stock ?? 0,
            }
          })

        setAccessories(accessoryProducts)
      } catch (err: any) {
        setError(err.message || 'Không thể tải sản phẩm')
      } finally {
        setLoading(false)
      }
    }

    fetchAccessories()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-12">
        {/* Hero */}
        <section className="from-background to-secondary bg-linear-to-b py-20 text-center">
          <div className="apple-container">
            <h1 className="apple-heading-hero text-foreground mb-4">
              Phụ kiện
            </h1>
            <p className="apple-text-large text-muted-foreground mx-auto max-w-2xl">
              Khám phá phụ kiện tuyệt vời cho iPhone của bạn
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="bg-secondary py-16">
          <div className="apple-container-wide">
            {loading && (
              <p className="text-center text-muted-foreground">
                Đang tải sản phẩm...
              </p>
            )}

            {error && (
              <p className="text-center text-red-500">{error}</p>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {accessories.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default AccessoriesPage
