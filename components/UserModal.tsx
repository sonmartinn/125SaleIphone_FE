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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { registerApi, updateUserApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    user: any | null
    onSuccess: () => void
}

export default function UserModal({ isOpen, onClose, user, onSuccess }: UserModalProps) {
    const [formData, setFormData] = useState({
        UserName: '',
        Email: '',
        Password: '',
        Password_confirmation: '',
        Role: 'user',
        Status: 'active'
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                UserName: user.name || '',
                Email: user.email || '',
                Password: '', // Don't show existing password
                Password_confirmation: '',
                Role: user.role || 'user',
                Status: user.status || 'active'
            })
        } else {
            setFormData({
                UserName: '',
                Email: '',
                Password: '',
                Password_confirmation: '',
                Role: 'user',
                Status: 'active'
            })
        }
    }, [user, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleRoleChange = (value: string) => {
        setFormData(prev => ({ ...prev, Role: value }))
    }

    const handleStatusChange = (value: string) => {
        setFormData(prev => ({ ...prev, Status: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            if (user) {
                // For update, we might only send changed fields
                const updateData: any = {
                    name: formData.UserName,
                    email: formData.Email,
                    role: formData.Role,
                    status: formData.Status
                }
                if (formData.Password) {
                    updateData.password = formData.Password
                }
                await updateUserApi(user.id, updateData)
                toast.success('Cập nhật người dùng thành công')
            } else {
                // For add, we use the register API logic or a separate admin-add-user API if available
                // Using registerApi for now as per routing provided
                await registerApi({
                    UserName: formData.UserName,
                    Email: formData.Email,
                    Password: formData.Password,
                    Password_confirmation: formData.Password_confirmation
                })
                // If backend supports role/status in registration or a separate endpoint is needed
                // we would handle it here. 
                toast.success('Thêm người dùng mới thành công')
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
            <DialogContent className="sm:max-w-[450px] border-none bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="UserName" className="text-sm font-medium">Họ và tên</Label>
                        <Input
                            id="UserName"
                            name="UserName"
                            value={formData.UserName}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            className="rounded-xl border-secondary/50 bg-secondary/20 focus-visible:ring-foreground"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="Email" className="text-sm font-medium">Email</Label>
                        <Input
                            id="Email"
                            name="Email"
                            type="email"
                            value={formData.Email}
                            onChange={handleChange}
                            placeholder="example@gmail.com"
                            className="rounded-xl border-secondary/50 bg-secondary/20 focus-visible:ring-foreground"
                            required
                        />
                    </div>

                    {!user && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="Password" className="text-sm font-medium">Mật khẩu</Label>
                                <Input
                                    id="Password"
                                    name="Password"
                                    type="password"
                                    value={formData.Password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="rounded-xl border-secondary/50 bg-secondary/20 focus-visible:ring-foreground"
                                    required={!user}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="Password_confirmation" className="text-sm font-medium">Xác nhận mật khẩu</Label>
                                <Input
                                    id="Password_confirmation"
                                    name="Password_confirmation"
                                    type="password"
                                    value={formData.Password_confirmation}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="rounded-xl border-secondary/50 bg-secondary/20 focus-visible:ring-foreground"
                                    required={!user}
                                />
                            </div>
                        </>
                    )}

                    {user && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Vai trò</Label>
                                <Select value={formData.Role} onValueChange={handleRoleChange}>
                                    <SelectTrigger className="rounded-xl border-secondary/50 bg-secondary/20">
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Trạng thái</Label>
                                <Select value={formData.Status} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="rounded-xl border-secondary/50 bg-secondary/20">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="active">Hoạt động</SelectItem>
                                        <SelectItem value="inactive">Vô hiệu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading} className="apple-button-primary rounded-xl min-w-[120px]">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (user ? 'Cập nhật' : 'Thêm mới')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
