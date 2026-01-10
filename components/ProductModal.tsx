'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription, // Thêm import này
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { addProductApi, updateProductApi } from '@/lib/api'

interface ProductModalProps {
    isOpen: boolean
    onClose: () => void
    product: any | null
    onSuccess: () => void
}

export default function ProductModal({ isOpen, onClose, product, onSuccess }: ProductModalProps) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        IdProduct: '',
        NameProduct: '',
        Description: '',
        IdCategory: '1',
        Color: '',
        Price: '',
        Stock: '',
        ImgPath: ''
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (product) {
            setFormData({
                IdProduct: product.id?.toString() || '',
                NameProduct: product.name || '',
                Description: product.description || '',
                IdCategory: product.category === 'Điện thoại' ? '1' : '2',
                Color: '',
                Price: product.price ? product.price.toString() : '',
                Stock: product.stock ? product.stock.toString() : '',
                ImgPath: product.image || ''
            })
        } else {
            setFormData({
                IdProduct: '',
                NameProduct: '',
                Description: '',
                IdCategory: '1',
                Color: '',
                Price: '',
                Stock: '',
                ImgPath: ''
            })
        }
        setStep(1)
    }, [product, isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (value: string) => {
        setFormData(prev => ({ ...prev, IdCategory: value }))
    }

    const handleNext = () => {
        if (!formData.NameProduct.trim()) {
            toast.error('Vui lòng nhập tên sản phẩm')
            return
        }
        setStep(2)
    }

    const handlePrev = () => setStep(1)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.Price || Number(formData.Price) <= 0) {
            toast.error('Vui lòng nhập giá bán hợp lệ')
            return
        }
        if (!formData.Stock || Number(formData.Stock) < 0) {
            toast.error('Vui lòng nhập số lượng tồn kho hợp lệ')
            return
        }

        try {
            setIsLoading(true)

            const payload = {
                ...formData,
                Price: Number(formData.Price),
                Stock: Number(formData.Stock),
                IdCategory: Number(formData.IdCategory)
            }

            if (product) {
                await updateProductApi(formData.IdProduct, payload)
                toast.success('Cập nhật sản phẩm thành công')
            } else {
                await addProductApi(payload)
                toast.success('Thêm sản phẩm mới thành công')
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            toast.error(err.message || 'Có lỗi xảy ra')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[560px] border-none bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </DialogTitle>
                    <DialogDescription>
                        {product
                            ? 'Chỉnh sửa thông tin chi tiết của sản phẩm hiện có trong hệ thống.'
                            : 'Thêm một sản phẩm mới vào kho hàng. Vui lòng nhập đầy đủ thông tin.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {step === 1 && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="NameProduct">Tên sản phẩm</Label>
                                <Input
                                    id="NameProduct"
                                    name="NameProduct"
                                    value={formData.NameProduct}
                                    onChange={handleInputChange}
                                    placeholder="iPhone 15 Pro Max"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Loại sản phẩm</Label>
                                <Select
                                    value={formData.IdCategory}
                                    onValueChange={handleCategoryChange}
                                    required
                                >
                                    <SelectTrigger id="category" className="w-full">
                                        <SelectValue placeholder="Chọn loại sản phẩm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Điện thoại</SelectItem>
                                        <SelectItem value="2">Phụ kiện</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Description">Mô tả sản phẩm</Label>
                                <Textarea
                                    id="Description"
                                    name="Description"
                                    value={formData.Description}
                                    onChange={handleInputChange}
                                    placeholder="Mô tả chi tiết về sản phẩm..."
                                    className="min-h-[120px] resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="Color">Màu sắc (các màu cách nhau bằng dấu phẩy)</Label>
                                <Input
                                    id="Color"
                                    name="Color"
                                    value={formData.Color}
                                    onChange={handleInputChange}
                                    placeholder="Đen, Trắng, Xanh"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="Price">Giá bán (VNĐ)</Label>
                                    <Input
                                        id="Price"
                                        type="number"
                                        name="Price"
                                        value={formData.Price}
                                        onChange={handleInputChange}
                                        placeholder="34990000"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="Stock">Số lượng tồn kho</Label>
                                    <Input
                                        id="Stock"
                                        type="number"
                                        name="Stock"
                                        value={formData.Stock}
                                        onChange={handleInputChange}
                                        placeholder="50"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ImgPath">Link hình ảnh (URL)</Label>
                                <Input
                                    id="ImgPath"
                                    name="ImgPath"
                                    value={formData.ImgPath}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-6 flex flex-col sm:flex-row sm:justify-between gap-3">
                        {step === 2 && (
                            <Button type="button" variant="outline" onClick={handlePrev} className="w-full sm:w-auto">
                                Quay lại
                            </Button>
                        )}
                        {step === 1 && (
                            <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
                                Tiếp tục
                            </Button>
                        )}
                        {step === 2 && (
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {product ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        )}
                        {step === 1 && <div className="hidden sm:block" />}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}