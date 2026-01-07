import React from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="apple-card flex h-full flex-col p-6">
        {/* Badge */}
        {product.isNew && (
          <Badge className="bg-accent text-accent-foreground mb-4 self-start font-medium">
            Mới
          </Badge>
        )}

        {/* Image */}
        <div className="bg-secondary relative mb-6 flex aspect-square items-center justify-center overflow-hidden rounded-xl">
          <img
            src={product.image}
            alt={product.name}
            className="h-4/5 w-4/5 object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col">
          {/* Colors indicator */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-3 flex gap-1">
              {product.colors.slice(0, 4).map((_, idx) => (
                <div
                  key={idx}
                  className="border-border h-3 w-3 rounded-full border"
                  style={{
                    backgroundColor: [
                      '#1d1d1f',
                      '#f5f5f7',
                      '#a1c4fd',
                      '#fda1a1'
                    ][idx % 4]
                  }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-muted-foreground ml-1 text-[10px]">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}

          <h3 className="apple-heading-product text-foreground mb-1">
            {product.name}
          </h3>

          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
            {product.subtitle}
          </p>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-foreground text-lg font-medium">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-muted-foreground text-sm line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
