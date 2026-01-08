'use client'

import React, { useState, useEffect } from 'react'
import {
    Users,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    UserPlus,
    ShieldCheck,
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
import { getUsersApi, deleteUserApi } from '@/lib/api'
import { toast } from 'sonner'

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            const data = await getUsersApi()
            setUsers(Array.isArray(data) ? data : (data.data || []))
            setError(null)
        } catch (err: any) {
            console.error('Fetch users error:', err)
            setError('Không thể tải danh sách người dùng. Đảm bảo endpoint /api/users đã tồn tại.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return
        try {
            await deleteUserApi(id)
            setUsers(users.filter(u => u.id !== id))
            toast.success('Đã xóa người dùng thành công')
        } catch (err: any) {
            toast.error('Không thể xóa người dùng')
        }
    }

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                    <p className="text-muted-foreground mt-1">Danh sách tất cả tài khoản từ hệ thống.</p>
                </div>
                <Button className="apple-button-primary w-fit">
                    <UserPlus className="mr-2 h-4 w-4" /> Thêm người dùng
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-secondary/20 p-4 rounded-xl backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="pl-10 border-none bg-background/50 focus-visible:ring-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="rounded-xl border-none bg-background/50" onClick={fetchUsers}>
                    Làm mới
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl bg-destructive/5 text-destructive px-4 text-center">
                    <AlertCircle size={40} />
                    <p className="font-medium">{error}</p>
                    <Button variant="outline" onClick={fetchUsers}>Thử lại</Button>
                </div>
            ) : (
                <div className="rounded-xl border-none bg-secondary/20 backdrop-blur-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-secondary/50">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-[250px]">Người dùng</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ngày tham gia</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-secondary/30 transition-colors border-border/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-foreground font-semibold uppercase">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="line-clamp-1">{user.name}</p>
                                                <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 capitalize">
                                            {user.role === 'admin' ? (
                                                <ShieldCheck size={14} className="text-blue-500" />
                                            ) : (
                                                <Users size={14} className="text-muted-foreground" />
                                            )}
                                            {user.role || 'user'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'active' || !user.status ? 'default' : 'secondary'} className={(user.status === 'active' || !user.status) ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none'}>
                                            {(user.status === 'active' || !user.status) ? 'Hoạt động' : 'Vô hiệu'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '---'}
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
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-red-500 focus:text-red-500"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Không tìm thấy người dùng nào.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
