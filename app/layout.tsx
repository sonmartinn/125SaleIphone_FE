import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Chatbox from '@/components/Chatbox'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Apple Store - iPhone & Phụ kiện',
  description: 'Trải nghiệm mua sắm phụ kiện iPhone chính hãng'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Chatbox />
        </Providers>
      </body>
    </html>
  )
}
