'use client'

import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import ProductCard from '@/components/ProductCard'
import { getIphones, getAccessories } from '@/data/products'
import { ArrowRight } from 'lucide-react'

const Index: React.FC = () => {
  const iphones = getIphones().slice(0, 4)
  const accessories = getAccessories().slice(0, 4)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-12">
        {/* Hero */}
        <HeroSection />

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
              {iphones.map(product => (
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
      </main>

      <Footer />
    </div>
  )
}

export default Index
