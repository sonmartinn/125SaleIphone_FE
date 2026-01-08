'use client'

import React, { useState, useEffect } from 'react'
import {
    Package,
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Tag,
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
import { getProductsApi, deleteProductApi } from '@/lib/api'
import { toast } from 'sonner'
import ProductModal from '@/components/ProductModal'

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setIsLoading(true)
            const data = await getProductsApi()
            setProducts(Array.isArray(data) ? data : (data.data || []))
            setError(null)
        } catch (err: any) {
            console.error('Fetch users error:', err)
            setError(err.message || 'Không thể tải danh sách người dùng. Vui lòng kiểm tra backend.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddProduct = () => {
        setEditingProduct(null)
        setIsModalOpen(true)
    }

    const handleEditProduct = (product: any) => {
        setEditingProduct(product)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return

        try {
            await deleteProductApi(id)
            setProducts(products.filter(p => p.id !== id))
            toast.success('Đã xóa sản phẩm thành công')
        } catch (err: any) {
            toast.error(err.message || 'Không thể xóa sản phẩm')
        }
    }

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStockBadge = (stock: number) => {
        if (stock > 10) return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none">Còn hàng</Badge>
        if (stock > 0) return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-none">Sắp hết</Badge>
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none">Hết hàng</Badge>
    }

    const formatPrice = (price: any) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
                    <p className="text-muted-foreground mt-1">Quản lý kho hàng và thông tin sản phẩm từ hệ thống.</p>
                </div>
                <Button onClick={handleAddProduct} className="apple-button-primary w-fit">
                    <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm mới
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-secondary/20 p-4 rounded-xl backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm sản phẩm theo tên..."
                        className="pl-10 border-none bg-background/50 focus-visible:ring-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="rounded-xl border-none bg-background/50" onClick={fetchProducts}>
                    Làm mới
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl bg-destructive/5 text-destructive">
                    <AlertCircle size={40} />
                    <p className="font-medium">{error}</p>
                    <Button variant="outline" onClick={fetchProducts}>Thử lại</Button>
                </div>
            ) : (
                <div className="rounded-xl border-none bg-secondary/20 backdrop-blur-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-secondary/50">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-[300px]">Sản phẩm</TableHead>
                                <TableHead>Danh mục</TableHead>
                                <TableHead>Giá</TableHead>
                                <TableHead>Tồn kho</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                                <TableRow key={product.id} className="hover:bg-secondary/30 transition-colors border-border/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background border p-1 shadow-sm overflow-hidden">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
                                                ) : (
                                                    <ImageIcon size={24} className="text-muted-foreground/30" />
                                                )}
                                            </div>
                                            <span className="line-clamp-1">{product.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Tag size={14} />
                                            {product.category || 'Chưa phân loại'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-foreground">
                                        {formatPrice(product.price)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {product.stock || 0} sản phẩm
                                    </TableCell>
                                    <TableCell>
                                        {getStockBadge(product.stock || 0)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-full">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                                <DropdownMenuItem onClick={() => handleEditProduct(product)} className="cursor-pointer">
                                                    <Edit2 className="mr-2 h-4 w-4" /> Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-red-500 focus:text-red-500"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        Không tìm thấy sản phẩm nào.
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
                product={editingProduct}
                onSuccess={fetchProducts}
            />
        </div>
    )
}

