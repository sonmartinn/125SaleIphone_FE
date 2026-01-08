'use client'

import React, { useState } from 'react'
import {
    Package,
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Tag
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

const mockProducts = [
    { id: 1, name: 'iPhone 15 Pro Max', category: 'Smartphone', price: '34,990,000₫', stock: 15, status: 'in-stock', image: '/placeholder.svg' },
    { id: 2, name: 'iPhone 15 Pro', category: 'Smartphone', price: '28,990,000₫', stock: 8, status: 'low-stock', image: '/placeholder.svg' },
    { id: 3, name: 'MacBook Air M3', category: 'Laptop', price: '27,990,000₫', stock: 0, status: 'out-of-stock', image: '/placeholder.svg' },
    { id: 4, name: 'AirPods Pro 2', category: 'Audio', price: '6,190,000₫', stock: 42, status: 'in-stock', image: '/placeholder.svg' },
]

export default function AdminProducts() {
    const [searchTerm, setSearchTerm] = useState('')

    const getStockBadge = (status: string) => {
        switch (status) {
            case 'in-stock':
                return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none">Còn hàng</Badge>
            case 'low-stock':
                return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-none">Sắp hết</Badge>
            case 'out-of-stock':
                return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none">Hết hàng</Badge>
            default:
                return null
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
                    <p className="text-muted-foreground mt-1">Quản lý kho hàng và thông tin sản phẩm của bạn.</p>
                </div>
                <Button className="apple-button-primary w-fit">
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
                <Button variant="outline" className="rounded-xl border-none bg-background/50">
                    Danh mục
                </Button>
            </div>

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
                        {mockProducts.map((product) => (
                            <TableRow key={product.id} className="hover:bg-secondary/30 transition-colors border-border/50">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background border p-1 shadow-sm">
                                            <ImageIcon size={24} className="text-muted-foreground/30" />
                                        </div>
                                        <span className="line-clamp-1">{product.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Tag size={14} />
                                        {product.category}
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold text-foreground">
                                    {product.price}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {product.stock} sản phẩm
                                </TableCell>
                                <TableCell>
                                    {getStockBadge(product.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Edit2 className="mr-2 h-4 w-4" /> Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                                                <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
