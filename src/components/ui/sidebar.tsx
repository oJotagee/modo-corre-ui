"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

// Sidebar do padrão Modo Corre: branca, logo no topo, item ativo em verde-claro,
// recolhível (só ícones). O estado "recolhido" vem de quem usa o componente.

type SidebarContextValue = { collapsed: boolean };
const SidebarContext = React.createContext<SidebarContextValue>({ collapsed: false });
const useSidebar = () => React.useContext(SidebarContext);

function Sidebar({
  className,
  collapsed = false,
  children,
  ...props
}: React.ComponentProps<"aside"> & { collapsed?: boolean }) {
  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside
        data-slot="sidebar"
        data-collapsed={collapsed}
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
          collapsed ? "w-[72px]" : "w-60",
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { collapsed } = useSidebar();
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex h-24 shrink-0 items-center", collapsed ? "justify-center px-2" : "px-6", className)}
      {...props}
    />
  );
}

function SidebarNav({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar-nav"
      aria-label="Navegação principal"
      className={cn("flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3", className)}
      {...props}
    />
  );
}

/** Link de navegação. Use `render` para trocar o `<a>` (ex.: Link do Next). */
function SidebarNavLink({
  className,
  active = false,
  icon,
  size = "default",
  render,
  children,
  ...props
}: useRender.ComponentProps<"a"> & {
  active?: boolean;
  icon?: React.ReactNode;
  size?: "default" | "lg";
}) {
  const { collapsed } = useSidebar();
  const label = typeof children === "string" ? children : undefined;
  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        "aria-current": active ? "page" : undefined,
        "aria-label": collapsed ? label : undefined,
        title: collapsed ? label : undefined,
        className: cn(
          "flex items-center gap-3 rounded-lg text-[15px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:shrink-0",
          size === "lg" ? "px-3 py-3 [&_svg]:size-5" : "py-2.5 [&_svg]:size-[18px]",
          size !== "lg" && (collapsed ? "justify-center px-0" : "px-3"),
          active
            ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground [&_svg]:text-sidebar-primary"
            : "text-sidebar-foreground hover:bg-muted hover:text-foreground [&_svg]:text-muted-foreground",
          className,
        ),
        children: (
          <>
            {icon}
            {collapsed && size !== "lg" ? null : children}
          </>
        ),
      },
      props,
    ),
    state: { slot: "sidebar-nav-link", active },
  });
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" className={cn("mt-auto shrink-0 p-3", className)} {...props} />;
}

/** Botão de recolher/expandir; o estado fica com quem usa o Sidebar. */
function SidebarCollapseButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { collapsed } = useSidebar();
  const label = collapsed ? "Expandir menu" : "Recolher menu";
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      title={label}
      className={cn("h-10 w-full text-sidebar-foreground hover:bg-muted hover:text-foreground", className)}
      {...props}
    >
      {collapsed ? <ChevronRightIcon aria-hidden /> : <ChevronLeftIcon aria-hidden />}
    </Button>
  );
}

export { Sidebar, SidebarCollapseButton, SidebarFooter, SidebarHeader, SidebarNav, SidebarNavLink, useSidebar };
