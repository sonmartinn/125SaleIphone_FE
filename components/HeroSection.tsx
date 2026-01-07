import React from 'react'
import Link from 'next/link'
import { getFeaturedProduct } from '@/data/products'

const HeroSection: React.FC = () => {
  const featured = getFeaturedProduct()

  if (!featured) return null

  return (
    <section className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="from-background via-background to-secondary absolute inset-0 bg-gradient-to-b opacity-50" />

      <div className="apple-container relative z-10 py-20 text-center">
        {/* Content */}
        <div className="animate-fade-in">
          <h1 className="apple-heading-hero text-foreground mb-4">
            {featured.name}
          </h1>
          <p className="apple-text-large text-muted-foreground mx-auto mb-8 max-w-2xl">
            {featured.subtitle}
          </p>

          {/* CTAs */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/product/${featured.id}`}
              className="apple-button-primary min-w-[160px] text-center"
            >
              Mua ngay
            </Link>
            <Link
              href="/iphone"
              className="apple-button-secondary min-w-[160px] text-center"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="animate-fade-in-up mt-8">
          <div className="relative mx-auto max-w-3xl">
            <img
              src={featured.image}
              alt={featured.name}
              className="animate-float h-auto max-h-[500px] w-full object-contain drop-shadow-2xl"
            />

            {/* Glow effect */}
            <div className="bg-accent absolute inset-0 -z-10 scale-75 rounded-full opacity-20 blur-3xl" />
          </div>
        </div>

        {/* Price */}
        <div className="animate-fade-in mt-8">
          <p className="text-muted-foreground">
            Từ{' '}
            <span className="text-foreground font-medium">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(featured.price)}
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
