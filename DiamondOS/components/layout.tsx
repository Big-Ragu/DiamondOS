"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { MainNavigation, Breadcrumb } from "./navigation"
import { Button } from "./ui/button"
import { Menu, X, Bell, Search, User } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

interface SidebarProps {
  children?: React.ReactNode
  className?: string
}

interface HeaderProps {
  title?: string
  description?: string
  breadcrumb?: Array<{ title: string; href?: string }>
  actions?: React.ReactNode
  className?: string
}

interface ContentProps {
  children: React.ReactNode
  className?: string
}

// Main Layout Component
export function Layout({ children, className }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search teams, players, games..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <main>{children}</main>
      </div>
    </div>
  )
}

// Sidebar Component
export function Sidebar({ children, className }: SidebarProps) {
  return (
    <div className={cn("flex h-full flex-col overflow-y-auto", className)}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-baseball-primary text-white font-bold">
            ⚾
          </div>
          <span className="text-lg font-bold text-baseball-primary">
            DiamondOS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col gap-y-5 px-6 py-4">
        <MainNavigation />
        {children}
      </div>
    </div>
  )
}

// Page Header Component
export function PageHeader({ 
  title, 
  description, 
  breadcrumb, 
  actions, 
  className 
}: HeaderProps) {
  return (
    <div className={cn("border-b bg-background px-4 py-6 sm:px-6 lg:px-8", className)}>
      {breadcrumb && (
        <Breadcrumb items={breadcrumb} className="mb-4" />
      )}
      
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h1 className="text-2xl font-bold tracking-tight text-baseball-primary">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// Content Container Component
export function Content({ children, className }: ContentProps) {
  return (
    <div className={cn("px-4 py-6 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  )
}

// Grid Layout Component
export function GridLayout({ 
  children, 
  cols = 1, 
  className 
}: { 
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  className?: string 
}) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }

  return (
    <div className={cn("grid gap-6", gridClasses[cols], className)}>
      {children}
    </div>
  )
}