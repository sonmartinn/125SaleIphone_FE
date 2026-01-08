'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addProductApi, updateProductApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ProductModalProps {
    isOpen: boolean
    onClose: () => void
    product: any | null
    onSuccess: () => void
}

export default function ProductModal({ isOpen, onClose, product, onSuccess }: ProductModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: '',
        image: '',
        description: ''
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price?.toString() || '',
                stock: product.stock?.toString() || '',
                category: product.category || '',
                image: product.image || '',
                description: product.description || ''
            })
        } else {
            setFormData({
                name: '',
                price: '',
                stock: '',
                category: '',
                image: '',
                description: ''
            })
        }
    }, [product, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            if (product) {
                await updateProductApi(product.id, formData)
                toast.success('Cập nhật sản phẩm thành công')
            } else {
                await addProductApi(formData)
                toast.success('Thêm sản phẩm mới thành công')
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] border-none bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Tên sản phẩm</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nhập tên sản phẩm (ví dụ: iPhone 15 Pro Max)"
                            className="rounded-xl border-secondary/50 bg-secondary/20 focus-visible:ring-foreground"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-medium">Giá bán (VNĐ)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="34990000"
                                className="rounded-xl border-secondary/50 bg-secondary/20 focus-visible:ring-foreground"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock" className="text-sm font-medium">Số lượng tồn kho</Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="10"
                                className="rounded-xl border-secondary/50 bg-secondary/20 focus-visible:ring-foreground"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium">Danh mục</Label>
                        <Input
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Ví dụ: Smartphone, Laptop..."
                            className="rounded-xl border-secondary/50 bg-secondary/20 focus-visible:ring-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-sm font-medium">Link hình ảnh (URL)</Label>
                        <Input
                            id="image"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.png"
                            className="rounded-xl border-secondary/50 bg-secondary/20 focus-visible:ring-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Mô tả sản phẩm</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Mô tả chi tiết sản phẩm..."
                            className="rounded-xl border-secondary/50 bg-secondary/20 focus-visible:ring-foreground min-h-[100px]"
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading} className="apple-button-primary rounded-xl min-w-[120px]">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (product ? 'Cập nhật' : 'Thêm mới')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
