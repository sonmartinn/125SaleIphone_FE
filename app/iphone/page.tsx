'use client'

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getIphones } from '@/data/products'

const IPhonePage: React.FC = () => {
  const iphones = getIphones()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-12">
        {/* Hero */}
        <section className="from-background to-secondary bg-linear-to-b py-20 text-center">
          <div className="apple-container">
            <h1 className="apple-heading-hero text-foreground mb-4">iPhone</h1>
            <p className="apple-text-large text-muted-foreground mx-auto max-w-2xl">
              Được thiết kế để bạn yêu thích. Được xây dựng để mạnh mẽ.
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="bg-secondary py-16">
          <div className="apple-container-wide">
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default IPhonePage
