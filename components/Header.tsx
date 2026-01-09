import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  const navLinks = [
    { name: 'iPhone', path: '/iphone' },
    { name: 'Phụ kiện', path: '/accessories' }
  ]

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-background/80 border-border fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-xl">
      <nav className="apple-container-wide">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <svg className="h-5 w-5" viewBox="0 0 17 48" fill="currentColor">
              <path d="M15.5752 19.0792C15.4636 19.1668 13.4622 20.2948 13.4622 22.8116C13.4622 25.7372 15.9968 26.7564 16.0728 26.7824C16.0604 26.8436 15.6656 28.1692 14.7308 29.52C13.9 30.7016 13.0196 31.88 11.6944 31.88C10.3692 31.88 10.0124 31.1016 8.4772 31.1016C6.9792 31.1016 6.4356 31.906 5.2212 31.906C4.0068 31.906 3.152 30.806 2.1792 29.4696C1.0524 27.8968 0.128 25.4428 0.128 23.1012C0.128 18.738 2.9788 16.404 5.7924 16.404C7.08 16.404 8.1456 17.258 8.9512 17.258C9.72 17.258 10.914 16.3548 12.3892 16.3548C12.9452 16.3548 14.9464 16.404 15.5752 19.0792ZM11.1344 14.658C11.7524 13.9288 12.1844 12.9216 12.1844 11.9144C12.1844 11.7772 12.172 11.6388 12.1476 11.5264C11.1468 11.5636 9.9572 12.1868 9.2528 13.0144C8.7092 13.646 8.1832 14.658 8.1832 15.678C8.1832 15.8284 8.2084 15.9788 8.2212 16.0272C8.284 16.0392 8.3844 16.0524 8.4848 16.0524C9.3856 16.0524 10.4908 15.4668 11.1344 14.658Z" />
            </svg>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(link => (
              <Link
                key={link.path}
                href={link.path}
                className="text-foreground/80 hover:text-foreground text-xs font-normal transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden p-1 transition-opacity hover:opacity-70 md:block">
              <Search className="h-4 w-4" />
            </button>

            <Link
              href="/cart"
              className="relative p-1 transition-opacity hover:opacity-70"
            >
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="bg-apple-blue absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href="/profile"
                  className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  Xin chào,{' '}
                  {user?.UserName || user?.Email?.split('@')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-apple-blue text-xs hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="hidden items-center gap-1 text-xs transition-opacity hover:opacity-70 md:flex"
              >
                <User className="h-4 w-4" />
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 md:hidden"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-border animate-fade-in border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-foreground/80 hover:text-foreground text-sm"
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-border border-t pt-4">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-foreground text-sm"
                    >
                      Tài khoản của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-apple-blue text-left text-sm"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-apple-blue text-sm"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
