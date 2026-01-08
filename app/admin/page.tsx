'use client'

import React, { useState, useEffect } from 'react'
import {
    Users,
    Package,
    ShoppingBag,
    TrendingUp,
    Laptop
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProductsApi, getUsersApi, getOrdersApi } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        {
            title: 'Tổng sản phẩm',
            value: '0',
            icon: Package,
            trend: 'Click để xem',
            trendUp: true,
            href: '/admin/products'
        },
        {
            title: 'Tổng người dùng',
            value: '0',
            icon: Users,
            trend: 'Quản lý ngay',
            trendUp: true,
            href: '/admin/users'
        },
        {
            title: 'Đơn hàng mới',
            value: '0',
            icon: ShoppingBag,
            trend: 'Chưa xử lý',
            trendUp: false,
            href: '/admin/orders'
        },
        {
            title: 'Mẹo quản trị',
            value: 'Tips',
            icon: Laptop,
            trend: 'Xem hướng dẫn',
            trendUp: true,
            href: '#'
        },
    ])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [products, users, orders] = await Promise.all([
                    getProductsApi(),
                    getUsersApi(),
                    getOrdersApi().catch(() => [])
                ])

                const productCount = Array.isArray(products) ? products.length : (products.data?.length || 0)
                const userCount = Array.isArray(users) ? users.length : (users.data?.length || 0)
                const orderCount = Array.isArray(orders) ? orders.length : (orders.data?.length || 0)

                setStats(prev => [
                    { ...prev[0], value: productCount.toString() },
                    { ...prev[1], value: userCount.toString() },
                    { ...prev[2], value: orderCount.toString() },
                    prev[3]
                ])
            } catch (error) {
                console.error('Stats fetch error:', error)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
                <p className="text-muted-foreground mt-1">Chào mừng bạn quay trở lại với bảng điều quản trị.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="hover:shadow-lg transition-all border-none bg-secondary/30 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm">
                                <stat.icon className="h-5 w-5 text-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <div className="flex items-center mt-2">
                                <TrendingUp size={14} className={stat.trendUp ? "text-green-500 mr-1" : "text-red-500 mr-1"} />
                                <p className={cn("text-xs font-medium", stat.trendUp ? "text-green-500" : "text-red-500")}>
                                    {stat.trend}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none bg-secondary/30 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Hướng dẫn quản trị</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Sử dụng thanh bên để truy cập các tính năng quản lý cốt lõi:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm text-foreground/80">
                        <li><strong>Quản lý sản phẩm:</strong> Thêm mới, chỉnh sửa thông tin hoặc xóa các dòng iPhone khỏi cửa hàng.</li>
                        <li><strong>Quản lý người dùng:</strong> Xem danh sách khách hàng và quản lý quyền truy cập.</li>
                        <li><strong>Quản lý đơn hàng:</strong> Theo dõi đơn hàng mới và cập nhật trạng thái giao hàng.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
