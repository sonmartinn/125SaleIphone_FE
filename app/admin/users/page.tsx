'use client'

import React, { useState } from 'react'
import {
    Users,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    UserPlus,
    ShieldCheck,
    ShieldAlert
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

const mockUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@example.com', role: 'admin', status: 'active', joined: '2023-10-01' },
    { id: 2, name: 'Trần Thị B', email: 'thib@example.com', role: 'user', status: 'active', joined: '2023-11-15' },
    { id: 3, name: 'Lê Văn C', email: 'vanc@example.com', role: 'user', status: 'inactive', joined: '2023-12-05' },
    { id: 4, name: 'Phạm Thị D', email: 'thid@example.com', role: 'user', status: 'active', joined: '2024-01-10' },
]

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                    <p className="text-muted-foreground mt-1">Danh sách tất cả tài khoản trong hệ thống của bạn.</p>
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
                <Button variant="outline" className="rounded-xl border-none bg-background/50">
                    Lọc
                </Button>
            </div>

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
                        {mockUsers.map((user) => (
                            <TableRow key={user.id} className="hover:bg-secondary/30 transition-colors border-border/50">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-foreground font-semibold uppercase">
                                            {user.name.charAt(0)}
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
                                        {user.role}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none'}>
                                        {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.joined}
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
