'use client'

import React from 'react'
import { Bell, Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const AdminHeader = () => {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-background/50 px-8 backdrop-blur-xl">
            <div className="flex w-96 items-center gap-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm mọi thứ..."
                        className="h-10 border-none bg-secondary/50 pl-10 focus-visible:ring-1"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell size={20} className="text-muted-foreground" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
                </Button>
                <div className="h-8 w-px bg-border mx-2"></div>
                <div className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-secondary cursor-pointer transition-all">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none">Admin</p>
                        <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default AdminHeader
