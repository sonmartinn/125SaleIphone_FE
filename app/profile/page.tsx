'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Loader2, Package, Settings } from 'lucide-react'
import { getUsersApi, updateUserApi } from '@/lib/api'

interface Profile {
  full_name: string | null
  phone: string | null
  address: string | null
}

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    address: ''
  })
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?from=/profile')
    }
  }, [authLoading, isAuthenticated, router])

  // Lấy thông tin user từ API Laravel khi có user
  useEffect(() => {
    if (user?.IdUser) {
      fetchProfile(user.IdUser)
    }
  }, [user])

  const fetchProfile = async (idUser: string) => {
    setIsLoadingProfile(true)
    try {
      const data = await getUsersApi() // Hoặc gọi `/users/${idUser}` API
      // Nếu bạn đã có hàm getUserById trong api lib:
      // const data = await getUserByIdApi(idUser);

      if (data?.user) {
        setProfile({
          full_name: data.user.UserName || '',
          phone: data.user.Phone || '',
          address: data.user.Address || ''
        })
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message || error)
      toast.error('Không thể lấy thông tin người dùng')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleSaveProfile = async () => {
  if (!user) return;

  setIsSaving(true);

  try {
    // Chuyển '' thành null để tránh lỗi SQL NOT NULL
    const payload = {
      UserName: profile.full_name || null,
      Phone: profile.phone || null,
      Address: profile.address || null
    };

    await updateUserApi(user.IdUser, payload);

    toast.success('Đã cập nhật thông tin!');
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.error('Không thể cập nhật thông tin');
  } finally {
    setIsSaving(false);
  }
};


  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (authLoading || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-12">
        <section className="bg-background py-16">
          <div className="apple-container-wide">
            <div className="mb-12">
              <h1 className="apple-heading-section text-foreground">
                Xin chào, {profile.full_name || user?.Email?.split('@')[0]}
              </h1>
              <p className="text-muted-foreground mt-2">{user?.Email}</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-8">
              <TabsList className="grid w-full max-w-md grid-cols-1">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Thông tin cá nhân
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <div className="apple-card max-w-xl p-6">
                  <h2 className="text-foreground mb-6 text-xl font-semibold">
                    Thông tin cá nhân
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input
                        id="fullName"
                        value={profile.full_name || ''}
                        onChange={e =>
                          setProfile({ ...profile, full_name: e.target.value })
                        }
                        className="mt-2"
                        placeholder={user?.UserName || 'Tên người dùng'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.Email || ''}
                        className="mt-2"
                        disabled
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone || ''}
                        onChange={e =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        className="mt-2"
                        placeholder={user?.Phone || 'Số điện thoại'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        value={profile.address || ''}
                        onChange={e =>
                          setProfile({ ...profile, address: e.target.value })
                        }
                        className="mt-2"
                        placeholder={user?.Address || 'Địa chỉ'}
                      />
                    </div>

                    <Button
                      onClick={handleSaveProfile}
                      className="apple-button-primary mt-4"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        'Lưu thay đổi'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="apple-card max-w-xl p-6">
                  <h2 className="text-foreground mb-4 text-xl font-semibold">
                    Tài khoản
                  </h2>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    Đăng xuất
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage
