import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface NavLinkCompatProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'className'
> {
  to: string
  className?: string
  activeClassName?: string
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, to, ...props }, ref) => {
    const pathname = usePathname()
    const isActive = pathname === to

    return (
      <Link
        ref={ref}
        href={to}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    )
  }
)

NavLink.displayName = 'NavLink'

export { NavLink }
