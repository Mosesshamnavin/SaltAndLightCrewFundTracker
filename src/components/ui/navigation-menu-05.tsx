'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface AppNavigationMenuProps {
  items: NavItem[];
}

export function AppNavigationMenu({ items }: AppNavigationMenuProps) {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-0 space-x-0 flex items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                active={isActive}
                asChild
                className={cn(
                  'group relative inline-flex h-full items-center justify-center gap-2 px-4 py-5 text-sm font-medium transition-colors duration-150 cursor-pointer',
                  // Active: warm amber bottom border line
                  'after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:transition-all after:duration-200',
                  isActive
                    ? 'text-amber-400 after:bg-amber-400'
                    : 'text-stone-400 hover:text-stone-100 after:bg-transparent',
                  'focus:outline-none',
                )}
              >
                <Link href={item.href} className="flex items-center gap-2">
                  <Icon
                    size={15}
                    className={cn(
                      'transition-colors duration-150 shrink-0',
                      isActive ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300',
                    )}
                  />
                  <span className="tracking-wide text-xs font-semibold uppercase">{item.label}</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
