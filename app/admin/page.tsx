'use client'

import React from 'react'
import {
    Users,
    Package,
    ShoppingBag,
    TrendingUp,
    DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
    {
        title: 'Tổng sản phẩm',
        value: '128',
        icon: Package,
        trend: '+5.2%',
        trendUp: true,
    },
    {
        title: 'Tổng người dùng',
        value: '890',
        icon: Users,
        trend: '+18.1%',
        trendUp: true,
    },
]

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
                <p className="text-muted-foreground mt-1">Chào mừng bạn quay trở lại với bảng điều quản trị.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {stats.map((stat) => (
                    <Card key={stat.title} className="hover:shadow-lg transition-all border-none bg-secondary/30 backdrop-blur-sm p-2">
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
                                    {stat.trend} <span className="text-muted-foreground ml-1 font-normal text-[10px]">so với tháng trước</span>
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
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}

// Utility function to merge classes (copy if not found in utils)
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
