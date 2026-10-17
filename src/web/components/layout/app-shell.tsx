import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { Ellipsis, LogOut, Menu as MenuIcon, Monitor, Moon, PanelRightClose, PanelRightOpen, Sun, UserRound, X } from 'lucide-react';
import { THEME_PREF, USER_ROLE, type ThemePref } from '@shared/constants';
import { useAuth, useUser } from '@/context/auth';
import { useAcademic } from '@/context/academic';
import { NAV } from '@/nav';
import { cn } from '@/lib/cn';
import { useLocalState } from '@/lib/hooks';
import { applyTheme, readThemePref } from '@/lib/theme';
import { api } from '@/lib/api';
import { Avatar, Badge, Menu, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, IconButton, Tip } from '@/components/ui';
import { FloatingClass } from '@/features/classroom/float/host';
import { Wordmark, LogoMark } from './logo';

function SideNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="التنقل الرئيسي" className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors',
              collapsed && 'justify-center px-0',
              isActive ? 'bg-brand-soft text-brand' : 'text-ink-2 hover:bg-surface-3 hover:text-ink',
            )
          }
        >
          {({ isActive }) => (
            <>
              {/* لسان الدفتر: شريط بارز على حافة البداية للعنصر النشط */}
              <span aria-hidden className={cn('absolute -end-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-s-full bg-brand transition-opacity', isActive ? 'opacity-100' : 'opacity-0')} />
              <item.icon className="size-5 shrink-0" aria-hidden />
              {collapsed ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function ThemeMenu() {
  const { settings } = useAuth();
  const [pref, setPref] = useState<ThemePref>(settings?.preferences.theme ?? readThemePref());
  useEffect(() => {
    if (settings) setPref(settings.preferences.theme);
  }, [settings]);

  const Icon = pref === 'dark' ? Moon : pref === 'light' ? Sun : Monitor;
  const change = (v: string) => {
    const next = v as ThemePref;
    setPref(next);
    applyTheme(next);
    // نحفظ التفضيل في الحساب ليتبع المعلم أجهزته (فشل الحفظ لا يمنع تطبيق السمة محليًا)
    api.patch('/settings', { preferences: { theme: next } }).catch(() => undefined);
  };
  return (
    <Menu
      align="end"
      trigger={
        <IconButton label="تغيير السمة">
          <Icon className="size-5" />
        </IconButton>
      }
    >
      <MenuLabel>مظهر الواجهة</MenuLabel>
      <MenuRadioGroup value={pref} onValueChange={change}>
        {THEME_PREF.items.map((t) => (
          <MenuRadioItem key={t.value} value={t.value}>
            {t.label}
          </MenuRadioItem>
        ))}
      </MenuRadioGroup>
    </Menu>
  );
}

function ContextSwitcher() {
  const { years, year, term, setYearId, setTermId } = useAcademic();
  if (!year) return null;
  return (
    <Menu
      align="end"
      trigger={
        <button className="hidden h-10 items-center gap-2 rounded-ctl border border-line bg-surface px-3 text-[14px] font-medium text-ink-2 shadow-card hover:bg-surface-3 sm:inline-flex" aria-label="تغيير العام والفصل">
          <span className="size-2 rounded-full bg-accent" aria-hidden />
          <span className="tnum">{year.name}</span>
          {term ? <span className="text-muted">· {term.name.replace('الدراسي ', '')}</span> : null}
        </button>
      }
    >
      <MenuLabel>العام الدراسي</MenuLabel>
      <MenuRadioGroup value={year.id} onValueChange={setYearId}>
        {years.map((y) => (
          <MenuRadioItem key={y.id} value={y.id}>
            {y.name}
            {y.isCurrent ? ' (الحالي)' : ''}
          </MenuRadioItem>
        ))}
      </MenuRadioGroup>
      <MenuSeparator />
      <MenuLabel>الفصل الدراسي</MenuLabel>
      <MenuRadioGroup value={term?.id ?? ''} onValueChange={setTermId}>
        {year.terms.map((t) => (
          <MenuRadioItem key={t.id} value={t.id}>
            {t.name}
          </MenuRadioItem>
        ))}
      </MenuRadioGroup>
    </Menu>
  );
}

function UserMenu() {
  const user = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <Menu
      align="end"
      trigger={
        <button className="flex items-center gap-2 rounded-full p-0.5 ps-3 hover:bg-surface-3" aria-label="قائمة الحساب">
          <span className="hidden max-w-36 truncate text-[14px] font-medium text-ink-2 md:block">{user.fullName}</span>
          <Avatar name={user.fullName} size={38} />
        </button>
      }
    >
      <div className="px-3 pb-2 pt-1.5">
        <div className="font-semibold text-ink">{user.fullName}</div>
        <div className="text-[13px] text-muted" dir="ltr">{user.email}</div>
        <Badge tone={user.role === 'admin' ? 'accent' : 'brand'} className="mt-1.5">{USER_ROLE.labels[user.role]}</Badge>
      </div>
      <MenuSeparator />
      <MenuItem icon={<UserRound className="size-4" />} onSelect={() => navigate('/settings')}>الإعدادات والحساب</MenuItem>
      <MenuItem
        icon={<LogOut className="size-4" />}
        danger
        onSelect={() => void logout()}
      >
        تسجيل الخروج
      </MenuItem>
    </Menu>
  );
}

function MobileBottomNav({ onMore }: { onMore: () => void }) {
  const items = NAV.filter((n) => n.mobile);
  return (
    <nav aria-label="تنقل سريع" className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 px-1 py-2 text-[11.5px] font-medium', isActive ? 'text-brand' : 'text-muted')}>
              {({ isActive }) => (
                <>
                  <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', isActive && 'bg-brand-soft')}>
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
        <li>
          <button onClick={onMore} className="flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[11.5px] font-medium text-muted" aria-label="المزيد من الأقسام">
            <span className="grid h-7 w-12 place-items-center rounded-full"><Ellipsis className="size-5" aria-hidden /></span>
            المزيد
          </button>
        </li>
      </ul>
    </nav>
  );
}

export function AppShell() {
  const user = useUser();
  const location = useLocation();
  const [collapsed, setCollapsed] = useLocalState('sijilli-nav-collapsed', false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => setDrawer(false), [location.pathname]);

  return (
    <div className="min-h-dvh">
      {/* الشريط الجانبي (الحاسوب) */}
      <aside
        aria-label="القائمة الجانبية"
        className={cn(
          'no-print fixed inset-y-0 start-0 z-30 hidden flex-col border-e border-line bg-surface transition-[width] duration-200 lg:flex',
          collapsed ? 'w-[84px]' : 'w-[268px]',
        )}
      >
        <div className={cn('flex h-[72px] items-center border-b border-line px-5', collapsed && 'justify-center px-0')}>
          {collapsed ? <LogoMark /> : <Wordmark />}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SideNav collapsed={collapsed} />
        </div>
        <div className="border-t border-line p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-muted hover:bg-surface-3 hover:text-ink', collapsed && 'justify-center px-0')}
            aria-label={collapsed ? 'توسيع القائمة' : 'طيّ القائمة'}
          >
            {collapsed ? <PanelRightOpen className="size-5 rtl:-scale-x-100" /> : <PanelRightClose className="size-5 rtl:-scale-x-100" />}
            {collapsed ? null : <span>طيّ القائمة</span>}
          </button>
        </div>
      </aside>

      {/* الدرج (الجوال والتابلت) */}
      <Dialog.Root open={drawer} onOpenChange={setDrawer}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay)] lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 start-0 z-50 flex w-[300px] max-w-[86vw] flex-col bg-surface shadow-modal outline-none data-[state=open]:animate-[slide-in-end_0.2s_ease-out] lg:hidden">
            <Dialog.Title className="sr-only">القائمة الرئيسية</Dialog.Title>
            <Dialog.Description className="sr-only">التنقل بين أقسام سجلي</Dialog.Description>
            <div className="flex h-[68px] items-center justify-between border-b border-line px-5">
              <Wordmark />
              <Dialog.Close className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-3" aria-label="إغلاق القائمة">
                <X className="size-5" />
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <SideNav onNavigate={() => setDrawer(false)} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:ps-[84px]' : 'lg:ps-[268px]')}>
        {user.isDemo ? (
          <div role="region" aria-label="تنبيه الحساب التجريبي" className="no-print bg-accent-soft px-4 py-1.5 text-center text-[13px] font-medium text-accent">
            {import.meta.env.VITE_DEMO
              ? 'معاينة تفاعلية: جرّب «إدارة الصف» فعليًا (تُمحى تجربتك عند إعادة التحميل)، وبقية الأقسام للتصفح. البيانات وهمية.'
              : 'حساب تجريبي: كل البيانات المعروضة وهمية لأغراض التوضيح فقط وليست لطلاب حقيقيين.'}
          </div>
        ) : null}
        <header className="no-print sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur sm:px-6">
          <Tip label="القائمة">
            <IconButton label="فتح القائمة" className="lg:hidden" onClick={() => setDrawer(true)}>
              <MenuIcon className="size-6" />
            </IconButton>
          </Tip>
          <div className="lg:hidden">
            <LogoMark className="size-8" />
          </div>
          <div className="flex-1" />
          <ContextSwitcher />
          <ThemeMenu />
          <UserMenu />
        </header>
        <main className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav onMore={() => setDrawer(true)} />
      <FloatingClass />
    </div>
  );
}
