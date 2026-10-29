// Runtime do plugin Bubble: monta os componentes reais de @modo-corre/ui
// dentro de um Shadow DOM por elemento, isolando o CSS nos dois sentidos.
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Sidebar,
  SidebarCollapseButton,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavLink,
  Switch,
  Textarea,
} from "@modo-corre/ui";
import { createPortal } from "react-dom";
import {
  BanknoteIcon,
  BellIcon,
  BikeIcon,
  BookOpenIcon,
  BoxesIcon,
  BriefcaseIcon,
  ChartLineIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  CreditCardIcon,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  FileTextIcon,
  FilterIcon,
  FolderOpenIcon,
  HeadphonesIcon,
  HouseIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  ListIcon,
  Loader2Icon,
  LogOutIcon,
  MapPinIcon,
  MegaphoneIcon,
  MenuIcon,
  MessageCircleIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  RefreshCwIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  TicketIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UploadIcon,
  UserPlusIcon,
  XIcon,
  ZoomInIcon,
  type LucideIcon,
} from "lucide-react";
import { css, propertiesCss, fontsUrl, libraryVersion } from "virtual:mc-css";

type States = Record<string, unknown>;
type Emit = (event: string | null, states?: States) => void;
type WithEmit<P> = P & { emit: Emit };

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "default" | "xs" | "sm" | "lg";
type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

const BUTTON_VARIANTS: ButtonVariant[] = ["default", "outline", "secondary", "ghost", "destructive", "link"];
const BUTTON_SIZES: ButtonSize[] = ["default", "xs", "sm", "lg"];
const BADGE_VARIANTS: BadgeVariant[] = ["default", "secondary", "destructive", "outline", "ghost", "link"];

// O Bubble envia textos vazios como null/undefined e dropdowns como string livre.
function pick<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
const text = (value: unknown) => (value == null ? "" : String(value));
const bool = (value: unknown) => value === true || value === "true" || value === "yes";

// ---------------------------------------------------------------- Button

// Conjunto fechado de ícones Lucide: importar todos levaria o bundle a megabytes.
// Os nomes são os valores do dropdown "Ícone" do elemento no Bubble.
const ICONS: Record<string, LucideIcon | undefined> = {
  check: CheckIcon,
  "chevron-left": ChevronLeftIcon,
  "chevron-right": ChevronRightIcon,
  download: DownloadIcon,
  eye: EyeIcon,
  filter: FilterIcon,
  "layout-grid": LayoutGridIcon,
  list: ListIcon,
  "log-out": LogOutIcon,
  megaphone: MegaphoneIcon,
  menu: MenuIcon,
  pencil: PencilIcon,
  plus: PlusIcon,
  power: PowerIcon,
  refresh: RefreshCwIcon,
  save: SaveIcon,
  search: SearchIcon,
  ticket: TicketIcon,
  trash: Trash2Icon,
  upload: UploadIcon,
  x: XIcon,
  "zoom-in": ZoomInIcon,
  // Navegação (MC Sidebar)
  bank: LandmarkIcon,
  bell: BellIcon,
  book: BookOpenIcon,
  briefcase: BriefcaseIcon,
  "chart-line": ChartLineIcon,
  chat: MessageCircleIcon,
  "clipboard-list": ClipboardListIcon,
  "credit-card": CreditCardIcon,
  cubes: BoxesIcon,
  dashboard: LayoutDashboardIcon,
  file: FileIcon,
  "file-text": FileTextIcon,
  "folder-open": FolderOpenIcon,
  headphones: HeadphonesIcon,
  home: HouseIcon,
  "map-pin": MapPinIcon,
  money: BanknoteIcon,
  motorcycle: BikeIcon,
  settings: SettingsIcon,
  shield: ShieldIcon,
  "triangle-alert": TriangleAlertIcon,
  "user-plus": UserPlusIcon,
};

type MCButtonProps = {
  label?: string;
  variant?: string;
  size?: string;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  full_width?: boolean;
  icon?: string;
  icon_position?: string;
};

function MCButton({ emit, ...p }: WithEmit<MCButtonProps>) {
  // O Bubble devolve o valor padrão do campo quando ele fica vazio; um rótulo
  // só com espaços (ou espaço de largura zero) vale como "sem texto".
  const label = text(p.label).replace(/[\s\u200b]+/g, " ").trim();
  const loading = bool(p.loading);
  const Icon = ICONS[text(p.icon)];
  const iconEnd = p.icon_position === "end";
  const icon = Icon && !loading && <Icon data-icon={iconEnd ? "inline-end" : "inline-start"} aria-hidden />;
  return (
    <Button
      type="button"
      variant={pick(p.variant, BUTTON_VARIANTS, "default")}
      size={pick(p.size, BUTTON_SIZES, "default")}
      disabled={bool(p.disabled) || loading}
      aria-busy={loading || undefined}
      title={text(p.tooltip) || undefined}
      aria-label={!label ? text(p.tooltip) || undefined : undefined}
      className={bool(p.full_width) ? "w-full" : undefined}
      onClick={() => emit("clicked")}
    >
      {loading && <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />}
      {!iconEnd && icon}
      {label}
      {iconEnd && icon}
    </Button>
  );
}

// ---------------------------------------------------------------- Badge

type MCBadgeProps = { label?: string; variant?: string; dot?: boolean };

function MCBadge({ emit: _emit, ...p }: WithEmit<MCBadgeProps>) {
  return (
    <Badge variant={pick(p.variant, BADGE_VARIANTS, "default")}>
      {bool(p.dot) && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {text(p.label)}
    </Badge>
  );
}

// ---------------------------------------------------------------- Input

type MCInputProps = {
  value?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  invalid?: boolean;
  error_message?: string;
  accessible_label?: string;
  debounce_ms?: number;
  icon?: string;
};

const INPUT_TYPES = ["text", "search", "email", "number", "tel", "url", "password"];

function MCInput({ emit, ...p }: WithEmit<MCInputProps>) {
  const external = text(p.value);
  const [value, setValue] = React.useState(external);
  const timer = React.useRef<number | undefined>(undefined);
  const errorId = React.useId();

  // Valor inicial/dinâmico vindo do Bubble substitui o digitado e
  // mantém o estado "value" do elemento em sincronia.
  React.useEffect(() => {
    setValue(external);
    emit(null, { value: external });
  }, [external]);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const error = text(p.error_message);
  const invalid = bool(p.invalid) || error.length > 0;
  const delay = Number.isFinite(Number(p.debounce_ms)) ? Number(p.debounce_ms) : 300;
  // Ícone à esquerda dentro do campo (ex.: lupa da busca), sem moldura extra.
  const Icon = ICONS[text(p.icon)];

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="relative w-full">
      {Icon && (
        <Icon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      )}
      <Input
        className={Icon ? "pl-8" : undefined}
        type={pick(p.type, INPUT_TYPES, "text")}
        value={value}
        placeholder={text(p.placeholder) || undefined}
        disabled={bool(p.disabled)}
        aria-label={text(p.accessible_label) || text(p.placeholder) || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setValue(next);
          emit(null, { value: next });
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => emit("value_changed", { value: next }), delay);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            window.clearTimeout(timer.current);
            emit("submitted", { value: e.currentTarget.value });
          }
        }}
      />
      </div>
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Textarea

type MCTextareaProps = {
  value?: string;
  placeholder?: string;
  rows?: number;
  max_length?: number;
  disabled?: boolean;
  invalid?: boolean;
  error_message?: string;
  accessible_label?: string;
  debounce_ms?: number;
};

function MCTextarea({ emit, ...p }: WithEmit<MCTextareaProps>) {
  const external = text(p.value);
  const [value, setValue] = React.useState(external);
  const timer = React.useRef<number | undefined>(undefined);
  const errorId = React.useId();

  // Mesmo contrato do MC Input: o valor do Bubble substitui o digitado.
  React.useEffect(() => {
    setValue(external);
    emit(null, { value: external });
  }, [external]);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const error = text(p.error_message);
  const invalid = bool(p.invalid) || error.length > 0;
  const delay = Number.isFinite(Number(p.debounce_ms)) ? Number(p.debounce_ms) : 300;
  const rows = Number(p.rows) > 0 ? Number(p.rows) : 3;
  const max = Number(p.max_length) > 0 ? Number(p.max_length) : undefined;

  return (
    <div className="flex size-full flex-col gap-1">
      <Textarea
        className="min-h-0 flex-1 resize-none [field-sizing:fixed]"
        rows={rows}
        maxLength={max}
        value={value}
        placeholder={text(p.placeholder) || undefined}
        disabled={bool(p.disabled)}
        aria-label={text(p.accessible_label) || text(p.placeholder) || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setValue(next);
          emit(null, { value: next });
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => emit("value_changed", { value: next }), delay);
        }}
      />
      {(error || max) && (
        <div className="flex justify-between gap-2 text-xs">
          <p id={errorId} className="text-destructive">
            {error}
          </p>
          {max && (
            <span className="text-muted-foreground tabular-nums">
              {value.length}/{max}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Switch / Checkbox

type MCToggleProps = { checked?: boolean; label?: string; disabled?: boolean };

// Switch e Checkbox têm o mesmo contrato: o Bubble define o valor inicial,
// o clique publica "checked" e dispara "changed"; o workflow decide o resto.
function useToggle(emit: Emit, p: MCToggleProps) {
  const external = bool(p.checked);
  const [checked, setChecked] = React.useState(external);
  React.useEffect(() => {
    setChecked(external);
    emit(null, { checked: external });
  }, [external]);
  const onCheckedChange = (next: boolean) => {
    setChecked(next);
    emit("changed", { checked: next });
  };
  return { checked, onCheckedChange };
}

function MCSwitch({ emit, ...p }: WithEmit<MCToggleProps>) {
  const toggle = useToggle(emit, p);
  const label = text(p.label);
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground has-disabled:cursor-not-allowed has-disabled:opacity-50">
      <Switch {...toggle} disabled={bool(p.disabled)} aria-label={label ? undefined : "Alternar"} />
      {label}
    </label>
  );
}

function MCCheckbox({ emit, ...p }: WithEmit<MCToggleProps>) {
  const toggle = useToggle(emit, p);
  const label = text(p.label);
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground has-disabled:cursor-not-allowed has-disabled:opacity-50">
      <Checkbox {...toggle} disabled={bool(p.disabled)} aria-label={label ? undefined : "Marcar"} />
      {label}
    </label>
  );
}

// ---------------------------------------------------------------- Breadcrumb

type MCBreadcrumbProps = { labels?: unknown; hrefs?: unknown };

// O último item é a página atual (sem link); item sem destino vira texto.
function MCBreadcrumb({ emit: _emit, ...p }: WithEmit<MCBreadcrumbProps>) {
  const labels = asList(p.labels);
  const hrefs = asList(p.hrefs);
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {labels.map((label, i) => {
          const last = i === labels.length - 1;
          const href = hrefs[i] ?? "";
          return (
            <React.Fragment key={`${label}-${i}`}>
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : href ? (
                  <BreadcrumbLink href={href} className="text-primary hover:underline">
                    {label}
                  </BreadcrumbLink>
                ) : (
                  <span>{label}</span>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// ---------------------------------------------------------------- Pagination

type MCPaginationProps = {
  page?: number;
  total_pages?: number;
  disabled?: boolean;
  show_numbers?: boolean;
  summary?: string;
};

// Janela de páginas: 1 … p-1 p p+1 … N
export function pageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

function MCPagination({ emit, ...p }: WithEmit<MCPaginationProps>) {
  const total = Math.max(1, Math.floor(Number(p.total_pages) || 1));
  const page = Math.min(total, Math.max(1, Math.floor(Number(p.page) || 1)));
  const disabled = bool(p.disabled);
  const go = (n: number) => {
    if (disabled || n < 1 || n > total || n === page) return;
    emit("page_changed", { requested_page: n });
  };
  const summary = text(p.summary);

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
      <Pagination className={summary ? "mx-0 w-auto" : undefined}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled={disabled || page <= 1} onClick={() => go(page - 1)} />
          </PaginationItem>
          {bool(p.show_numbers) ? (
            pageWindow(page, total).map((n, i) => (
              <PaginationItem key={`${n}-${i}`}>
                {n === "…" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={n === page}
                    disabled={disabled}
                    aria-label={`Página ${n}`}
                    onClick={() => go(n)}
                  >
                    {n}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))
          ) : (
            <PaginationItem>
              <span className="px-2 text-sm text-muted-foreground" aria-live="polite">
                Página {page} de {total}
              </span>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext disabled={disabled || page >= total} onClick={() => go(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

// ---------------------------------------------------------------- Sidebar

type MCSidebarProps = {
  labels?: unknown;
  icons?: unknown;
  hrefs?: unknown;
  active?: string;
  logo_url?: string;
  logo_mark_url?: string;
  home_href?: string;
  storage_key?: string;
  mobile_trigger?: boolean;
};

const MOBILE_QUERY = "(max-width: 767px)";
const asList = (value: unknown): string[] => (Array.isArray(value) ? value.map(text) : []);
const isExternal = (href: string) => /^https?:\/\//i.test(href);

function readCollapsed(key: string) {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(() => window.matchMedia(query).matches);
  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

// Portais (gaveta, overlay) vão para um host próprio no <body>, também com
// Shadow DOM: ficam acima do layout do Bubble e continuam isolados.
let portalHost: HTMLElement | null = null;
function portalContainer() {
  if (portalHost?.isConnected) return portalHost;
  const host = document.createElement("div");
  host.setAttribute("data-mc-portal", "");
  // Grupos flutuantes do Bubble usam z-index ~1500; a gaveta precisa ficar acima.
  host.style.cssText = "position:relative;z-index:2000";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });
  adoptStyles(shadow);
  portalHost = document.createElement("div");
  portalHost.className = "mc-portal";
  shadow.appendChild(portalHost);
  return portalHost;
}

function MCSidebar({ emit, ...p }: WithEmit<MCSidebarProps>) {
  const labels = asList(p.labels);
  const icons = asList(p.icons);
  const hrefs = asList(p.hrefs);
  const items = labels.map((label, i) => ({ label, icon: icons[i] ?? "", href: hrefs[i] ?? "" }));
  const active = text(p.active);
  const home = text(p.home_href) || "dashboard";
  const storageKey = text(p.storage_key) || "mc-sidebar-collapsed";
  const mobile = useMediaQuery(MOBILE_QUERY);
  const [collapsed, setCollapsed] = React.useState(() => readCollapsed(storageKey));
  const [open, setOpen] = React.useState(false);

  // O Bubble usa o estado "collapsed" para ajustar a largura reservada.
  React.useEffect(() => emit(null, { collapsed: mobile ? false : collapsed }), [collapsed, mobile]);

  // Marca o documento para o header mostrar o botão de menu só onde há MC Sidebar.
  React.useEffect(() => {
    document.documentElement.setAttribute("data-mc-sidebar", "");
    return () => document.documentElement.removeAttribute("data-mc-sidebar");
  }, []);

  // Outros elementos (ex.: um botão no header) podem abrir a gaveta.
  React.useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("mcui:sidebar-open", onOpen);
    return () => window.removeEventListener("mcui:sidebar-open", onOpen);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(storageKey, next ? "1" : "0");
    } catch {
      // sem armazenamento local: vale só nesta página
    }
  };

  const links = (size: "default" | "lg") =>
    items.map(({ label, icon, href }) => {
      const Icon = ICONS[icon];
      const external = isExternal(href);
      return (
        <SidebarNavLink
          key={`${label}-${href}`}
          size={size}
          active={!!href && href === active}
          icon={Icon ? <Icon aria-hidden /> : undefined}
          href={href || undefined}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          render={href ? undefined : <span aria-disabled="true" />}
          onClick={() => setOpen(false)}
        >
          {label}
        </SidebarNavLink>
      );
    });

  const logo = (mark: boolean, width: number) => {
    const src = text(mark ? p.logo_mark_url : p.logo_url);
    return src ? <img src={src} alt="Modo Corre" width={width} className="block h-auto" /> : null;
  };

  if (!mobile) {
    return (
      <Sidebar collapsed={collapsed} className="fixed top-0 left-0 z-40 h-screen">
        <SidebarHeader>
          <a href={home} aria-label="Modo Corre — Início">
            {collapsed ? logo(true, 52) : logo(false, 156)}
          </a>
        </SidebarHeader>
        <SidebarNav>{links("default")}</SidebarNav>
        <SidebarFooter>
          <SidebarCollapseButton onClick={toggle} />
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <>
      {p.mobile_trigger !== false &&
        p.mobile_trigger !== ("no" as unknown) &&
        createPortal(
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setOpen(true)}
            className="fixed top-2.5 left-2 z-40 grid size-10 place-items-center rounded-lg text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <MenuIcon aria-hidden className="size-6" />
          </button>,
          portalContainer(),
        )}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          container={portalContainer()}
          className="w-72 gap-0 bg-sidebar p-0 font-sans"
        >
          <SheetHeader className="flex-row items-center justify-between border-b border-sidebar-border px-5 py-4">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <a href={home} aria-label="Modo Corre — Início">
              {logo(false, 140)}
            </a>
            <SheetClose
              render={<Button variant="ghost" size="icon" className="text-sidebar-foreground" aria-label="Fechar menu" />}
            >
              <XIcon aria-hidden className="size-5" />
            </SheetClose>
          </SheetHeader>
          <Sidebar className="h-auto min-h-0 w-full flex-1 border-0 bg-transparent">
            <SidebarNav className="p-3">{links("lg")}</SidebarNav>
          </Sidebar>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ---------------------------------------------------------------- User menu

// Avatar com o menu da conta (padrão do UserMenu do os-panel). Os itens só
// emitem o rótulo escolhido; o que cada um faz fica nos workflows do Bubble.
type MCUserMenuProps = {
  name?: string;
  subtitle?: string;
  avatar_url?: string;
  show_name?: boolean;
  labels?: unknown;
  icons?: unknown;
  danger_label?: string;
};

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

function MCUserMenu({ emit, ...p }: WithEmit<MCUserMenuProps>) {
  const name = text(p.name);
  const subtitle = text(p.subtitle);
  const avatar = text(p.avatar_url);
  const showName = bool(p.show_name);
  const labels = asList(p.labels);
  const icons = asList(p.icons);
  const danger = text(p.danger_label);
  const select = (label: string) => emit("item_selected", { selected_item: label });
  const icon = (key: string) => {
    const Icon = ICONS[key];
    return Icon ? <Icon aria-hidden /> : null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-auto min-w-0 gap-2.5 rounded-full border-transparent bg-transparent p-1 shadow-none hover:bg-muted data-popup-open:bg-muted"
            aria-label={name ? `Conta de ${name}` : "Conta"}
          >
            <Avatar size="lg">
              {avatar && <AvatarImage src={avatar} alt="" />}
              <AvatarFallback className="bg-(--ink) font-heading text-sm font-bold text-(--brand)">{initials(name)}</AvatarFallback>
            </Avatar>
            {showName && (
              <>
                <span className="max-w-48 truncate text-sm font-semibold text-foreground">{name}</span>
                <ChevronDownIcon aria-hidden className="size-4 text-muted-foreground" />
              </>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" container={portalContainer()} className="w-64 font-sans">
        {name && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[13px]">
                <span className="block text-xs font-normal text-muted-foreground">Conectado como</span>
                <span className="block truncate text-sm font-bold text-foreground" title={name}>
                  {name}
                </span>
                {subtitle && <span className="block truncate text-xs font-normal capitalize text-muted-foreground">{subtitle}</span>}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {(labels.length > 0 || danger) && <DropdownMenuSeparator />}
          </>
        )}
        {labels.length > 0 && (
          <DropdownMenuGroup>
            {labels.map((label, i) => (
              <DropdownMenuItem key={`${label}-${i}`} className="py-2" onClick={() => select(label)}>
                {icon(icons[i] ?? "")}
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        {danger && (
          <>
            {labels.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" className="py-2" onClick={() => select(danger)}>
                <LogOutIcon aria-hidden />
                {danger}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------- mount API

const COMPONENTS = {
  Button: MCButton,
  Badge: MCBadge,
  Input: MCInput,
  Pagination: MCPagination,
  Sidebar: MCSidebar,
  UserMenu: MCUserMenu,
  Textarea: MCTextarea,
  Switch: MCSwitch,
  Checkbox: MCCheckbox,
  Breadcrumb: MCBreadcrumb,
} as const;

type ComponentName = keyof typeof COMPONENTS;

let sheet: CSSStyleSheet | null = null;

// Fontes e @property precisam estar no documento: o Chrome ignora
// @font-face e @property declarados dentro de shadow roots.
function ensureDocumentGlobals() {
  if (document.getElementById("mc-ui-globals")) return;
  const style = document.createElement("style");
  style.id = "mc-ui-globals";
  style.textContent = propertiesCss;
  document.head.appendChild(style);
  if (fontsUrl) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontsUrl;
    // Texto só dentro de shadow roots nem sempre dispara o download das
    // faces declaradas no documento; pede explicitamente os pesos usados.
    link.onload = () => {
      for (const font of ['400 1em "Public Sans"', '500 1em "Public Sans"', '600 1em "Public Sans"', '500 1em "Archivo"'])
        document.fonts?.load(font).catch(() => {});
    };
    document.head.appendChild(link);
  }
}

function adoptStyles(shadow: ShadowRoot) {
  if ("adoptedStyleSheets" in shadow && typeof CSSStyleSheet !== "undefined") {
    try {
      if (!sheet) {
        sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
      }
      shadow.adoptedStyleSheets = [sheet];
      return;
    } catch {
      // cai no <style> abaixo
    }
  }
  const style = document.createElement("style");
  style.textContent = css;
  shadow.appendChild(style);
}

export type Handle = { update(props: Record<string, unknown>): void; unmount(): void };

function mount(host: HTMLElement, name: ComponentName, props: Record<string, unknown>, emit: Emit): Handle {
  const Component = COMPONENTS[name] as React.ComponentType<Record<string, unknown> & { emit: Emit }>;
  if (!Component) throw new Error(`[mc-ui] componente desconhecido: ${name}`);
  ensureDocumentGlobals();

  // Reaproveita o shadow root se o Bubble reinicializar o mesmo canvas.
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  shadow.replaceChildren();
  adoptStyles(shadow);
  const container = document.createElement("div");
  container.className = "mc-root";
  container.dataset.component = name;
  shadow.appendChild(container);

  let root: Root | null = createRoot(container);
  const safeEmit: Emit = (event, states) => {
    try {
      emit(event, states);
    } catch (err) {
      console.error("[mc-ui] erro ao notificar o Bubble", err);
    }
  };
  const render = (p: Record<string, unknown>) => root?.render(<Component {...p} emit={safeEmit} />);
  render(props);

  return {
    update: render,
    unmount() {
      root?.unmount();
      root = null;
      shadow.replaceChildren();
    },
  };
}

// ---------------------------------------------------------------- Bubble bridge

// Subconjunto da API "instance" que o Bubble passa aos elementos de plugin.
type BubbleInstance = {
  canvas: ArrayLike<HTMLElement>;
  publishState(name: string, value: unknown): void;
  triggerEvent(name: string): void;
};

// Campos "lista" chegam como objetos do Bubble com length() e get(início, n),
// não como arrays; viram arrays aqui.
type BubbleList = { length(): number; get(start: number, count: number): unknown[] };
function fromBubble(value: unknown): unknown {
  const list = value as BubbleList | null;
  if (list && typeof list === "object" && typeof list.get === "function" && typeof list.length === "function") {
    return list.get(0, list.length());
  }
  return value;
}

// Liga um elemento de plugin a um componente: monta no primeiro update e
// re-renderiza nos seguintes. Estados são publicados antes do evento, para que
// o workflow já leia o valor novo.
function bubbleElement(instance: BubbleInstance, name: ComponentName) {
  let handle: Handle | null = null;
  let last: Record<string, unknown> = {};
  const emit: Emit = (event, states) => {
    if (states) for (const [key, value] of Object.entries(states)) instance.publishState(key, value);
    if (event) instance.triggerEvent(event);
  };
  return {
    update(properties: Record<string, unknown>) {
      const props: Record<string, unknown> = {};
      for (const key of Object.keys(properties)) if (key !== "bubble") props[key] = fromBubble(properties[key]);
      last = props;
      if (handle) handle.update(props);
      else handle = mount(instance.canvas[0], name, props, emit);
    },
    // Ações "Reset group"/"Reset relevant inputs" do Bubble: remonta com os
    // últimos campos, descartando o que foi digitado (o Input volta ao valor inicial).
    reset() {
      handle?.unmount();
      handle = mount(instance.canvas[0], name, last, emit);
    },
    unmount() {
      handle?.unmount();
      handle = null;
    },
  };
}

const api = { mount, bubbleElement, version: libraryVersion, components: Object.keys(COMPONENTS) };
declare global {
  interface Window {
    MCUI?: typeof api;
  }
}
window.MCUI = api;
window.dispatchEvent(new Event("mcui:ready"));
