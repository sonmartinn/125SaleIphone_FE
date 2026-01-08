'use client'

import React, { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    MoreVertical,
    Search,
    ShoppingBag,
    Loader2,
    AlertCircle,
    Trash2,
    ChevronDown,
    Truck,
    PackageCheck,
    Clock,
    XCircle,
    CheckCircle2
} from 'lucide-react'
import { getOrdersApi, updateOrderStatusApi, deleteOrderApi } from '@/lib/api'
import { toast } from 'sonner'

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setIsLoading(true)
            const data = await getOrdersApi()
            setOrders(Array.isArray(data) ? data : (data.data || []))
            setError(null)
        } catch (err: any) {
            console.error('Fetch orders error:', err)
            setError('Không thể tải danh sách đơn hàng. Vui lòng kiểm tra API /api/orders.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateStatus = async (id: string | number, status: number) => {
        try {
            await updateOrderStatusApi(id, status)
            setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
            toast.success('Đã cập nhật trạng thái đơn hàng')
        } catch (err: any) {
            toast.error(err.message || 'Không thể cập nhật trạng thái')
        }
    }

    const handleDelete = async (id: string | number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return
        try {
            await deleteOrderApi(id)
            setOrders(orders.filter(o => o.id !== id))
            toast.success('Đã xóa đơn hàng')
        } catch (err: any) {
            toast.error('Không thể xóa đơn hàng')
        }
    }

    const filteredOrders = orders.filter(order =>
        order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusInfo = (status: number) => {
        switch (status) {
            case 0: return { label: 'Đang xử lý', className: 'bg-yellow-500/10 text-yellow-500', icon: Clock }
            case 1: return { label: 'Đang giao', className: 'bg-blue-500/10 text-blue-500', icon: Truck }
            case 2: return { label: 'Đã giao', className: 'bg-purple-500/10 text-purple-500', icon: PackageCheck }
            case 3: return { label: 'Hoàn thành', className: 'bg-green-500/10 text-green-500', icon: CheckCircle2 }
            case 4: return { label: 'Đã hủy', className: 'bg-red-500/10 text-red-500', icon: XCircle }
            default: return { label: 'Chờ xác nhận', className: 'bg-secondary text-muted-foreground', icon: Clock }
        }
    }

    const formatPrice = (price: any) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
                    <p className="text-muted-foreground mt-1">Theo dõi và cập nhật trạng thái đơn hàng của khách.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-secondary/20 p-4 rounded-xl backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo mã đơn hoặc tên khách..."
                        className="pl-10 border-none bg-background/50 focus-visible:ring-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="rounded-xl border-none bg-background/50" onClick={fetchOrders}>
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
                    <Button variant="outline" onClick={fetchOrders}>Thử lại</Button>
                </div>
            ) : (
                <div className="rounded-xl border-none bg-secondary/20 backdrop-blur-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-secondary/50">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead>Mã đơn</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Tổng tiền</TableHead>
                                <TableHead>Phương thức</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                                const status = getStatusInfo(order.status)
                                const StatusIcon = status.icon
                                return (
                                    <TableRow key={order.id} className="hover:bg-secondary/30 transition-colors border-border/50">
                                        <TableCell className="font-mono text-xs font-medium">
                                            #{order.id}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{order.recipient_name || 'Khách lẻ'}</p>
                                                <p className="text-xs text-muted-foreground">{order.phone}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatPrice(order.total_amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize border-secondary bg-secondary/30">
                                                {order.payment_method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className={`h-8 rounded-full border-none px-3 text-xs ${status.className} hover:${status.className}`}>
                                                        <StatusIcon size={14} className="mr-1.5" />
                                                        {status.label}
                                                        <ChevronDown size={12} className="ml-1.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-40 rounded-xl">
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 0)} className="cursor-pointer">
                                                        <Clock size={14} className="mr-2" /> Đang xử lý
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 1)} className="cursor-pointer">
                                                        <Truck size={14} className="mr-2" /> Đang giao
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 2)} className="cursor-pointer">
                                                        <PackageCheck size={14} className="mr-2" /> Đã giao
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 3)} className="cursor-pointer">
                                                        <CheckCircle2 size={14} className="mr-2" /> Hoàn thành
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 4)} className="cursor-pointer text-red-500 focus:text-red-500">
                                                        <XCircle size={14} className="mr-2" /> Hủy đơn
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                                onClick={() => handleDelete(order.id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        Không tìm thấy đơn hàng nào.
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
