'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Settings,
    LogOut,
    ChevronRight,
    Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Người dùng', href: '/admin/users', icon: Users },
]

const AdminSidebar = () => {
    const pathname = usePathname()

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-background/50 backdrop-blur-xl">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                        <ShoppingBag size={20} />
                    </div>
                    <span className="text-lg font-semibold tracking-tight">Admin Panel</span>
                </Link>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-foreground text-background shadow-md"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={cn("transition-transform group-hover:scale-110", isActive ? "text-background" : "text-muted-foreground")} />
                                {item.name}
                            </div>
                            {isActive && <ChevronRight size={14} className="opacity-50" />}
                        </Link>
                    )
                })}
            </nav>

            <div className="border-t p-4">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                >
                    <Settings size={18} />
                    Cài đặt
                </Link>
                <button
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-500/10"
                    onClick={() => console.log('Logout')}
                >
                    <LogOut size={18} />
                    Đăng xuất
                </button>
            </div>
        </div>
    )
}

export default AdminSidebar
