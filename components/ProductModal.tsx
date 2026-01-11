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
import { addProductApi, updateVariantApi } from '@/lib/api'

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

  // Load dữ liệu khi edit
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
  }, [product, isOpen])

  // Handle input
  const handleChange = (field: keyof ProductForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...formData.variants]
    newVariants[index][field] = value
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Kiểm tra dữ liệu
    const firstVariant = formData.variants[0]
    if (!firstVariant.Color || !firstVariant.Price || !firstVariant.Stock) {
      toast.error('Vui lòng nhập đầy đủ màu, giá và số lượng cho variant')
      return
    }

    try {
      setIsLoading(true)

      if (product && firstVariant.IdProductVar) {
        // UPDATE variant
        const data = new FormData()
        data.append('Decription', formData.Decription)
        data.append('Price', firstVariant.Price.toString())
        data.append('Stock', firstVariant.Stock.toString())
        data.append('ImgPath', firstVariant.ImgPath)

        await updateVariantApi(formData.IdProduct, firstVariant.IdProductVar, data)
        toast.success('Cập nhật sản phẩm thành công')
      } else {
        // ADD new product
        const payload: any = {
          IdCategory: formData.IdCategory,
          NameProduct: formData.NameProduct,
          Decription: formData.Decription,
          variants: formData.variants.map(v => ({
            Color: v.Color,
            Price: Number(v.Price),
            Stock: Number(v.Stock),
            ImgPath: v.ImgPath || null
          }))
        }

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

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {!product && (
            <>
              <div>
                <Label>Tên sản phẩm</Label>
                <Input
                  value={formData.NameProduct}
                  onChange={e => handleChange('NameProduct', e.target.value)}
                  placeholder="Tên sản phẩm"
                />
              </div>

              <div>
                <Label>Loại sản phẩm</Label>
                <select
                  value={formData.IdCategory}
                  onChange={e => handleChange('IdCategory', e.target.value)}
                  className="w-full rounded-xl border p-2"
                >
                  <option value="01">Điện thoại</option>
                  <option value="02">Phụ kiện</option>
                </select>
              </div>
            </>
          )}

          <div>
            <Label>Mô tả</Label>
            <Textarea
              value={formData.Decription}
              onChange={e => handleChange('Decription', e.target.value)}
              placeholder="Mô tả sản phẩm"
            />
          </div>

          {formData.variants.map((variant, idx) => (
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
                    onChange={e => handleVariantChange(idx, 'Price', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Số lượng</Label>
                  <Input
                    type="number"
                    value={variant.Stock}
                    onChange={e => handleVariantChange(idx, 'Stock', Number(e.target.value))}
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
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
