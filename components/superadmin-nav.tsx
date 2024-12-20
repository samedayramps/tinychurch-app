'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  Bell,
  ScrollText,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
  { name: 'Churches', href: '/superadmin/churches', icon: Building2 },
  { name: 'Users', href: '/superadmin/users', icon: Users },
  { name: 'Logs & Activity', href: '/superadmin/logs', icon: ScrollText },
  { name: 'Billing', href: '/superadmin/billing', icon: CreditCard },
  { name: 'Settings', href: '/superadmin/settings', icon: Settings },
  { name: 'Notifications', href: '/superadmin/notifications', icon: Bell },
]

export function SuperAdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col w-64 bg-card border-r">
      <div className="p-4">
        <h1 className="text-xl font-semibold text-foreground">TinyChurch Admin</h1>
      </div>
      
      <div className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm rounded-md transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
} 