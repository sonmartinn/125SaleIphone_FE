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

const IPhonePage: React.FC = () => {
  const [iphones, setIphones] = useState<ProductUI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIphones = async () => {
      try {
        const res = await getProductsApi()

        // API trả về array trực tiếp
        const iphoneProducts = res
          .filter((p: any) => p.IdCategory === '01')
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

        setIphones(iphoneProducts)
      } catch (err: any) {
        setError(err.message || 'Không thể tải sản phẩm')
      } finally {
        setLoading(false)
      }
    }

    fetchIphones()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-12">
        {/* Hero */}
        <section className="from-background to-secondary bg-linear-to-b py-20 text-center">
          <div className="apple-container">
            <h1 className="apple-heading-hero mb-4">iPhone</h1>
            <p className="apple-text-large text-muted-foreground mx-auto max-w-2xl">
              Được thiết kế để bạn yêu thích. Được xây dựng để mạnh mẽ.
            </p>
          </div>
        </section>

        {/* Products */}
        <section className="bg-secondary py-16">
          <div className="apple-container-wide">
            {loading && (
              <p className="text-center text-muted-foreground">
                Đang tải sản phẩm...
              </p>
            )}

            {error && (
              <p className="text-center text-red-500">
                {error}
              </p>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {iphones.map((product, index) => (
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

export default IPhonePage
