import { NavMain, type SidebarNavSection } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    BookOpenText,
    ClipboardList,
    CreditCard,
    LayoutDashboard,
    ShieldCheck,
    UserRound,
    UsersRound,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdministration = auth.user?.role === 'administrator' || auth.user?.role === 'manager';

    const navigationSections: SidebarNavSection[] = [
        {
            title: 'Espace membre',
            items: [
                { title: 'Mon espace', url: '/mon-espace', icon: LayoutDashboard },
                { title: 'Mon profil', url: '/settings/profile', icon: UserRound },
                { title: 'Mon adhésion', url: '/mon-adhesion', icon: ClipboardList },
                { title: 'Cotisations', icon: CreditCard },
            ],
        },
        ...(isAdministration
            ? [
                  {
                      title: 'Gestion du club',
                      items: [
                          { title: 'Administration', url: '/administration', icon: ShieldCheck },
                          { title: 'Accès et rôles', url: '/administration/roles', icon: UsersRound },
                          { title: 'Adhésions', url: '/administration/adhesions', icon: ClipboardList },
                          { title: 'Cotisations', icon: CreditCard },
                          { title: 'Caisse', icon: Wallet },
                          { title: 'Rapports et statistiques', icon: BarChart3 },
                          { title: 'Activités du club', icon: Activity },
                          { title: 'Actualités', icon: BookOpenText },
                      ],
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="floating" className="p-4 group-data-[collapsible=icon]:p-2">
            <SidebarHeader className="px-3 pt-4 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="adf-sidebar-brand">
                            <Link href="/mon-espace" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain sections={navigationSections} />
            </SidebarContent>

            <SidebarFooter className="adf-sidebar-footer gap-3">
                <div className="text-muted-foreground px-3 text-xs group-data-[collapsible=icon]:hidden">Amis de foot · Le club, ensemble.</div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
