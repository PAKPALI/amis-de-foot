import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { type LucideIcon } from 'lucide-react';

export interface SidebarNavItem {
    title: string;
    icon: LucideIcon;
    url?: string;
}

export interface SidebarNavSection {
    title: string;
    items: SidebarNavItem[];
}

export function NavMain({ sections = [] }: { sections: SidebarNavSection[] }) {
    const page = usePage();
    return (
        <>
            {sections.map((section) => (
                <SidebarGroup className="px-2 py-0" key={section.title}>
                    <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        {section.items.map((item) => {
                            const isActive = item.url
                                ? page.url === item.url || (item.url === '/settings/profile' && page.url.startsWith('/settings/'))
                                : false;
                            const label = item.url ? item.title : `${item.title} · À venir`;

                            return (
                                <SidebarMenuItem key={item.title}>
                                    {item.url ? (
                                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                                            <Link href={item.url} prefetch>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    ) : (
                                        <SidebarMenuButton disabled aria-label={label} tooltip={label} className="h-9 pr-16">
                                            <item.icon />
                                            <span className="min-w-0 flex-1 truncate whitespace-nowrap">{item.title}</span>
                                            <SidebarMenuBadge className="text-muted-foreground text-[9px] font-bold tracking-wide uppercase">
                                                À venir
                                            </SidebarMenuBadge>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
