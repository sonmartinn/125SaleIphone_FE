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
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { addProductApi, updateProductApi } from '@/lib/api';

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
        IdProductVar: '',
        NameProduct: '',
        Decription: '',
        IdCategory: '1', // default 1 = điện thoại
        Color: '',
        Price: '',
        Stock: '',
        ImgPath: ''
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (product) {
            const variant = product.variants?.[0] || {}
            setFormData({
                IdProduct: product.IdProduct || '',
                IdProductVar: variant.IdProductVar || '',
                NameProduct: product.NameProduct || '',
                Decription: product.Decription || '',
                IdCategory: product.IdCategory || '1',
                Color: variant.Color || '',
                Price: variant.Price?.toString() || '',
                Stock: variant.Stock?.toString() || '',
                ImgPath: variant.ImgPath || ''
            })
        } else {
            setFormData({
                IdProduct: '',
                IdProductVar: '',
                NameProduct: '',
                Decription: '',
                IdCategory: '1',
                Color: '',
                Price: '',
                Stock: '',
                ImgPath: ''
            })
        }
        setStep(1)
    }, [product, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleNext = () => {
        if (!formData.NameProduct.trim() || !formData.IdCategory.trim()) {
            toast.error('Vui lòng nhập tên sản phẩm và chọn loại')
            return
        }
        setStep(2)
    }

    const handlePrev = () => setStep(1)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.Price || !formData.Stock) {
            toast.error('Vui lòng nhập giá và số lượng')
            return
        }

        try {
            setIsLoading(true)

            if (product) {
                // Update
                await updateProductApi(formData.IdProduct, formData)
                toast.success('Cập nhật sản phẩm thành công')
            } else {
                // Add new
                await addProductApi(formData)
                toast.success('Thêm sản phẩm mới thành công')
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                id="product-modal-content" // Fix aria-describedby warning
                className="sm:max-w-[500px] border-none bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl"
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="NameProduct">Tên sản phẩm</Label>
                                <Input
                                    name="NameProduct"
                                    value={formData.NameProduct}
                                    onChange={handleChange}
                                    placeholder="Nhập tên sản phẩm"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="IdCategory">Loại sản phẩm</Label>
                                <select                            
                                    name="IdCategory"
                                    value={formData.IdCategory}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border p-2"
                                >
                                    <option value="1">Điện thoại</option>
                                    <option value="2">Phụ kiện</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Decription">Mô tả sản phẩm</Label>
                                <Textarea
                                    name="Decription"
                                    value={formData.Decription}
                                    onChange={handleChange}
                                    placeholder="Mô tả chi tiết sản phẩm"
                                    className="min-h-[100px]"
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="Color">Màu sắc</Label>
                                <Input
                                    name="Color"
                                    value={formData.Color}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Đen, Trắng"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="Price">Giá bán (VNĐ)</Label>
                                    <Input
                                        type="number"
                                        name="Price"
                                        value={formData.Price}
                                        onChange={handleChange}
                                        placeholder="34990000"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="Stock">Số lượng tồn kho</Label>
                                    <Input
                                        type="number"
                                        name="Stock"
                                        value={formData.Stock}
                                        onChange={handleChange}
                                        placeholder="10"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ImgPath">Link hình ảnh (URL)</Label>
                                <Input
                                    name="ImgPath"
                                    value={formData.ImgPath}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.png"
                                />
                            </div>
                        </>
                    )}

                    <DialogFooter className="pt-4 flex justify-between">
                        {step === 2 ? (
                            <Button type="button" variant="outline" onClick={handlePrev}>
                                Quay lại
                            </Button>
                        ) : <div />}

                        {step === 1 ? (
                            <Button type="button" onClick={handleNext}>
                                Tiếp tục
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (product ? 'Cập nhật' : 'Thêm mới')}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
