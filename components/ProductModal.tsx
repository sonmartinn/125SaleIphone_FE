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
import { addProductApi, updateProductApi } from '@/lib/api'

interface Variant {
  IdProductVar?: string
  Color: string
  Price: number | string
  Stock: number | string
  ImgPath: string
}

interface ProductForm {
  IdProduct: string
  IdCategory: string
  NameProduct: string
  Decription: string
  variants: Variant[]
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: any | null
  onSuccess: () => void
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onSuccess
}: ProductModalProps) {

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const emptyForm: ProductForm = {
    IdProduct: '',
    IdCategory: '01', // default Điện thoại
    NameProduct: '',
    Decription: '',
    variants: [
      {
        Color: '',
        Price: 0,
        Stock: 0,
        ImgPath: ''
      }
    ]
  }

  const [formData, setFormData] = useState<ProductForm>(emptyForm)

  /* ================================
   * LOAD DATA KHI EDIT
   * ================================ */
  useEffect(() => {
    if (!isOpen) return

    if (product) {
      setFormData({
        IdProduct: product.IdProduct ?? '',
        IdCategory: product.IdCategory ?? '01',
        NameProduct: product.NameProduct ?? '',
        Decription: product.Decription ?? '',
        variants: product.variants?.length
          ? product.variants.map((v: any) => ({
              IdProductVar: v.IdProductVar ?? undefined,
              Color: v.Color ?? '',
              Price: v.Price ?? 0,
              Stock: v.Stock ?? 0,
              ImgPath: v.ImgPath ?? ''
            }))
          : [{
              Color: '',
              Price: 0,
              Stock: 0,
              ImgPath: ''
            }]
      })
    } else {
      setFormData(emptyForm)
    }

    setStep(1)
  }, [product, isOpen])

  /* ================================
   * HANDLE INPUT CHANGE
   * ================================ */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...formData.variants]
    newVariants[index][field] = value
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const handleNext = () => {
    if (!formData.NameProduct.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm')
      return
    }
    setStep(2)
  }

  const handlePrev = () => setStep(1)

  /* ================================
   * HANDLE SUBMIT
   * ================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (product && !formData.IdProduct) {
        toast.error('Thiếu IdProduct')
        return
    }

    const firstVariant = formData.variants[0]

    if (!firstVariant.Color || !firstVariant.Price || !firstVariant.Stock) {
      toast.error('Vui lòng nhập màu, giá và số lượng cho variant')
      return
    }

    const payload: any = {
        IdCategory: formData.IdCategory,
        NameProduct: formData.NameProduct,
        Decription: formData.Decription,
        variants: formData.variants.map(v => ({
            IdProductVar: v.IdProductVar ?? undefined,
            Color: v.Color,
            Price: Number(v.Price),
            Stock: Number(v.Stock),
            ImgPath: v.ImgPath || null
        }))
    }

    try {
        setIsLoading(true)
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
        toast.error(err?.message || 'Có lỗi xảy ra')
    } finally {
        setIsLoading(false)
    }
  }

  /* ================================
   * RENDER
   * ================================ */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* STEP 1: Product info */}
          {step === 1 && (
            <>
              <div>
                <Label>Tên sản phẩm</Label>
                <Input
                  name="NameProduct"
                  value={formData.NameProduct}
                  onChange={handleChange}
                  placeholder="Tên sản phẩm"
                />
              </div>

              <div>
                <Label>Loại sản phẩm</Label>
                <select
                  name="IdCategory"
                  value={formData.IdCategory}
                  onChange={handleChange}
                  className="w-full rounded-xl border p-2"
                >
                  <option value="01">Điện thoại</option>
                  <option value="02">Phụ kiện</option>
                </select>
              </div>

              <div>
                <Label>Mô tả</Label>
                <Textarea
                  name="Decription"
                  value={formData.Decription}
                  onChange={handleChange}
                  placeholder="Mô tả sản phẩm"
                />
              </div>
            </>
          )}

          {/* STEP 2: Variant info */}
          {step === 2 && formData.variants.map((variant, idx) => (
            <div key={idx} className="space-y-2">
              <div>
                <Label>Màu sắc</Label>
                <Input
                  value={variant.Color}
                  onChange={e => handleVariantChange(idx, 'Color', e.target.value)}
                  placeholder="Ví dụ: Đen, Trắng"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Giá (VNĐ)</Label>
                  <Input
                    type="number"
                    value={variant.Price}
                    onChange={e => handleVariantChange(idx, 'Price', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Số lượng</Label>
                  <Input
                    type="number"
                    value={variant.Stock}
                    onChange={e => handleVariantChange(idx, 'Stock', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Link hình ảnh</Label>
                <Input
                  value={variant.ImgPath}
                  onChange={e => handleVariantChange(idx, 'ImgPath', e.target.value)}
                  placeholder="https://example.com/image.png"
                />
              </div>
            </div>
          ))}

          <DialogFooter className="flex justify-between">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={handlePrev}>
                Quay lại
              </Button>
            )}
            {step === 1 ? (
              <Button type="button" onClick={handleNext}>
                Tiếp tục
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
