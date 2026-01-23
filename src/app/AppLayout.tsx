import { NavLink, Outlet, useLocation } from 'react-router';
import {
  LayoutGrid,
  NotebookText,
  Settings,
  Timer,
  History,
} from 'lucide-react';
import ColorSchemeToggle from '@/components/color-scheme-toggle';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const navItems = [
  { to: '/dashboard', label: '概览', icon: LayoutGrid },
  { to: '/practice', label: '练习', icon: Timer },
  { to: '/records', label: '我的记录', icon: History },
  { to: '/settings', label: '设置', icon: Settings },
];

const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SidebarProvider>
        <Sidebar collapsible="icon" variant="inset">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1 text-sm font-semibold group-data-[collapsible=icon]:justify-center">
              <NotebookText className="text-primary h-4 w-4" />
              <span className="whitespace-nowrap group-data-[collapsible=icon]:hidden">
                PaceMaster
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>导航</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map(item => {
                    const isActive =
                      location.pathname === item.to ||
                      location.pathname.startsWith(`${item.to}/`);
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <NavLink to={item.to}>
                            <Icon className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden">
                              {item.label}
                            </span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="text-muted-foreground px-2 text-xs">v1.0</div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="border-border flex items-center justify-between gap-2 border-b px-4 py-3 md:px-8">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm font-semibold">PaceMaster</span>
            </div>
            <div className="flex items-center gap-2">
              <ColorSchemeToggle />
              <ModeToggle />
            </div>
          </header>

          <main className="flex-1 px-4 pt-6 pb-8 md:px-8">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default AppLayout;
