'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  Search,
  MoreVertical,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

import { getUsersApi, updateUserRoleApi } from '@/lib/api'

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
      const res = await getUsersApi()
      setUsers(Array.isArray(res) ? res : res.data || [])
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách người dùng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeRole = async (user: any, newRole: string) => {
    if (user.Role === newRole) return

    try {
      await updateUserRoleApi(user.IdUser, newRole)

      setUsers(prev =>
        prev.map(u =>
          u.IdUser === user.IdUser ? { ...u, Role: newRole } : u
        )
      )

      toast.success('Đã cập nhật vai trò')
    } catch (err) {
      console.error(err)
      toast.error('Không thể cập nhật vai trò')
    }
  }

  const filteredUsers = users.filter(user =>
    user.UserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
        <p className="text-muted-foreground mt-1">
          Chỉ cho phép thay đổi vai trò người dùng
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4 bg-secondary/20 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchUsers}>
          Làm mới
        </Button>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-destructive">
          <AlertCircle size={40} />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchUsers}>Thử lại</Button>
        </div>
      ) : (
        <div className="rounded-xl bg-secondary/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <TableRow key={user.IdUser}>
                  <TableCell className="font-medium">
                    {user.UserName}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {user.Email}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.Role === '01' ? (
                        <>
                          <ShieldCheck size={14} className="text-blue-500" />
                          Admin
                        </>
                      ) : (
                        <>
                          <Users size={14} />
                          User
                        </>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          disabled={user.Role === '02'}
                          onClick={() => handleChangeRole(user, '02')}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          User
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          disabled={user.Role === '01'}
                          onClick={() => handleChangeRole(user, '01')}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                          Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Không có người dùng
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
