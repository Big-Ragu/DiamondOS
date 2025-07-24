"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Calendar, 
  BarChart3, 
  Settings,
  Home,
  Gamepad2
} from "lucide-react"

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  badge?: string
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and quick actions"
  },
  {
    title: "Live Games",
    href: "/games/live",
    icon: Gamepad2,
    description: "Active games and scorekeeping"
  },
  {
    title: "Teams",
    href: "/teams",
    icon: Users,
    description: "Manage teams and players"
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: Calendar,
    description: "Game scheduling and calendar"
  },
  {
    title: "Standings",
    href: "/standings",
    icon: Trophy,
    description: "League standings and playoffs"
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Advanced statistics and insights"
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "League and system settings"
  }
]

interface MainNavigationProps {
  className?: string
}

export function MainNavigation({ className }: MainNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("space-y-2", className)}>
      {navigationItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive 
                ? "bg-baseball-primary text-white hover:bg-baseball-primary/90" 
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <div className="flex flex-col">
              <span>{item.title}</span>
              {item.description && (
                <span className="text-xs opacity-70">{item.description}</span>
              )}
            </div>
            {item.badge && (
              <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

interface BreadcrumbProps {
  items: Array<{
    title: string
    href?: string
  }>
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      <Link href="/" className="hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span>/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.title}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.title}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export { navigationItems }