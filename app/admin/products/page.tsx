'use client'

import React, { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { toast } from 'sonner'
import ProductModal from '@/components/ProductModal'
import { getProductsApi, deleteProductApi } from '@/lib/api'

// === TYPES ===
export interface Variant {
  IdProductVar?: string
  Color: string
  Price: number
  Stock: number
  ImgPath: string
}

export interface Product {
  IdProduct: string
  IdCategory?: string
  NameProduct: string
  Decription?: string
  price: number
  stock: number
  image?: string
  variants?: Variant[]
}

// Dùng cho ProductModal
export interface ProductForm {
  IdProduct: string
  IdCategory: string
  NameProduct: string
  Decription: string
  variants: Variant[]
}

// === COMPONENT ===
export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductForm | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await getProductsApi()
      const list = Array.isArray(data) ? data : data.data || []

      const mapped: Product[] = list.map((p: any) => {
        const variants = p.product_variants || p.variants || []
        const first = variants[0] || {}

        return {
          IdProduct: p.IdProduct?.toString() || p.id?.toString() || '',
          IdCategory: p.IdCategory || '01',
          NameProduct: p.NameProduct || p.name || '',
          Decription: p.Decription || '',
          price: Number(first.Price || first.price || 0),
          stock: variants.reduce((t: number, v: any) => t + Number(v.Stock || v.stock || 0), 0),
          image: first.ImgPath || first.image || p.ImageProduct || p.image || '',
          variants: variants.map((v: any) => ({
            IdProductVar: v.IdProductVar,
            Color: v.Color || '',
            Price: v.Price || 0,
            Stock: v.Stock || 0,
            ImgPath: v.ImgPath || ''
          }))
        }
      })

      setProducts(mapped)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }

  // === HANDLE MODAL ===
  const handleAdd = () => {
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    // Chuyển Product sang ProductForm
    const productForm: ProductForm = {
      IdProduct: product.IdProduct,
      IdCategory: product.IdCategory || '01',
      NameProduct: product.NameProduct,
      Decription: product.Decription || '',
      variants: product.variants?.map(v => ({
        IdProductVar: v.IdProductVar,
        Color: v.Color,
        Price: v.Price,
        Stock: v.Stock,
        ImgPath: v.ImgPath
      })) || [{ Color: '', Price: 0, Stock: 0, ImgPath: '' }]
    }

    setSelectedProduct(productForm)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    try {
      await deleteProductApi(id)
      setProducts(prev => prev.filter(p => p.IdProduct !== id))
      toast.success('Đã xóa sản phẩm')
    } catch {
      toast.error('Xóa sản phẩm thất bại')
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)

  const getStockBadge = (stock: number) => {
    if (stock > 10)
      return <Badge className="bg-green-500/10 text-green-500">Còn hàng</Badge>
    if (stock > 0)
      return <Badge className="bg-yellow-500/10 text-yellow-500">Sắp hết</Badge>
    return <Badge className="bg-red-500/10 text-red-500">Hết hàng</Badge>
  }

  const filteredProducts = products.filter(p =>
    p.NameProduct.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground mt-1">Thêm, chỉnh sửa và quản lý kho sản phẩm</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Tìm kiếm theo tên sản phẩm..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-destructive">
          <AlertCircle size={40} />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchProducts}>Thử lại</Button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <TableRow key={product.IdProduct}>
                    <TableCell className="flex items-center gap-3">
                      <div className="w-12 h-12 border rounded-lg flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.NameProduct} className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="text-muted-foreground" />
                        )}
                      </div>
                      {product.NameProduct}
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{getStockBadge(product.stock)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(product.IdProduct)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSuccess={fetchProducts}
      />
    </div>
  )
}
