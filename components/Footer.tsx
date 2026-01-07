import React from 'react'
import Link from 'next/link'

const Footer: React.FC = () => {
  const footerLinks = {
    'Mua sắm và Tìm hiểu': [
      { name: 'iPhone', path: '/iphone' },
      { name: 'Phụ kiện', path: '/accessories' }
    ],
    'Tài khoản': [
      { name: 'Đăng nhập', path: '/auth' },
      { name: 'Giỏ hàng', path: '/cart' }
    ],
    'Giá trị cốt lõi': [
      { name: 'Trợ năng', path: '#' },
      { name: 'Môi trường', path: '#' },
      { name: 'Quyền riêng tư', path: '#' }
    ]
  }

  return (
    <footer className="bg-apple-gray-light mt-auto py-8">
      <div className="apple-container-wide">
        <p className="text-apple-text-tertiary border-apple-gray mb-6 border-b pb-6 text-xs">
          * Giá tham khảo và có thể thay đổi. Liên hệ để biết thêm chi tiết về
          chương trình trả góp và ưu đãi.
        </p>

        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-apple-text-primary mb-3 text-xs font-semibold">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.path}
                      className="text-apple-text-tertiary hover:text-apple-text-primary text-xs transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-apple-text-primary mb-3 text-xs font-semibold">
              Liên hệ
            </h4>
            <p className="text-apple-text-tertiary mb-2 text-xs">
              Hotline: 1800 1234
            </p>
            <p className="text-apple-text-tertiary text-xs">
              Email: support@applestore.vn
            </p>
          </div>
        </div>

        <div className="border-apple-gray border-t pt-6">
          <p className="text-apple-text-tertiary text-xs">
            Copyright © 2024 Apple Store Vietnam. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
