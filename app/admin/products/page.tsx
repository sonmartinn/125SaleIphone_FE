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
import { ProductVariant } from '@/types/index'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  getProductsApi,
  deleteProductApi
} from '@/lib/api'

import { toast } from 'sonner'
import ProductModal from '@/components/ProductModal'

/* ================= TYPES ================= */

interface Product {
  id: number
  name: string
  price: number
  stock: number
  image?: string
}

/* ================= COMPONENT ================= */

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)


  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  /* ================= FETCH ================= */

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await getProductsApi()
      const list = Array.isArray(data) ? data : data.data || []

      const mapped: Product[] = list.map((p: any) => {
        const variants = p.product_variants || p.variants || []
        const first = variants[0] || {}

        return {
          id: p.IdProduct || p.id,
          name: p.NameProduct || p.name,
          price: Number(first.Price || first.price || 0),
          stock: variants.reduce(
            (t: number, v: any) =>
              t + Number(v.Stock || v.stock || 0),
            0
          ),
          image:
            first.ImgPath ||
            first.image ||
            p.ImageProduct ||
            p.image ||
            ''
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

  /* ================= CRUD ================= */

  const handleAdd = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    console.log('EDIT PRODUCT:', product)
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    try {
      await deleteProductApi(id)
      setProducts(prev => prev.filter(p => p.id.toString() !== id))
      toast.success('Đã xóa sản phẩm')
    } catch {
      toast.error('Xóa sản phẩm thất bại')
    }
  }

  /* ================= HELPERS ================= */

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0)

  const getStockBadge = (stock: number) => {
    if (stock > 10)
      return <Badge className="bg-green-500/10 text-green-500">Còn hàng</Badge>
    if (stock > 0)
      return <Badge className="bg-yellow-500/10 text-yellow-500">Sắp hết</Badge>
    return <Badge className="bg-red-500/10 text-red-500">Hết hàng</Badge>
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  /* ================= RENDER ================= */

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý sản phẩm
          </h1>
          <p className="text-muted-foreground mt-1">
            Thêm, chỉnh sửa và quản lý kho sản phẩm
          </p>
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
          <Button variant="outline" onClick={fetchProducts}>
            Thử lại
          </Button>
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
                  <TableRow key={product.id}>
                    <TableCell className="flex items-center gap-3">
                      <div className="w-12 h-12 border rounded-lg flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="text-muted-foreground" />
                        )}
                      </div>
                      {product.name}
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(product) 
                              setIsModalOpen(true)       
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={() => handleDelete(product.id.toString())}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onSuccess={fetchProducts}
      />
    </div>
  )
}
