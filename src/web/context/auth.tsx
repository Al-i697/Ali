import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AuthUserDto, SettingsDto, SystemInfo } from '@shared/dto';
import { api, errorMessage, setUnauthorizedHandler } from '@/lib/api';
import { qk, useMe, useSettings, useSystemInfo } from '@/lib/queries';
import { applyTheme, watchSystemTheme, readThemePref } from '@/lib/theme';

type AuthValue = {
  user: AuthUserDto | null;
  settings: SettingsDto | undefined;
  system: SystemInfo | undefined;
  /** يحمّل المعلومات الأساسية (النظام + المستخدم) لأول مرة */
  booting: boolean;
  bootError: unknown;
  login: (input: { email: string; password: string; remember: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  setup: (input: { fullName: string; email: string; password: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

/**
 * يُسقط بيانات المستخدم السابق من ذاكرة الاستعلامات (مع إبقاء حالة الدخول ومعلومات النظام).
 * ضروري على الأجهزة المشتركة: من يدخل بعد انتهاء جلسة غيره لا يجوز أن يرى بياناته المخزّنة ولو لحظة.
 * ملاحظة: لا نستعمل queryClient.clear() لأن المراقِبين المركَّبين (useMe) يبقون مرتبطين بالاستعلام المحذوف
 * فلا يتلقون تحديثات setQueryData اللاحقة، فتبقى الواجهة ترى المستخدم القديم.
 */
function dropUserData(qc: QueryClient) {
  qc.removeQueries({ predicate: (q) => q.queryKey[0] !== qk.me[0] && q.queryKey[0] !== qk.system[0] });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const system = useSystemInfo();
  const me = useMe();
  const user = me.data ?? null;
  const settings = useSettings(!!user && !user.mustChangePassword);

  // انتهاء الجلسة في أي طلب → العودة لشاشة الدخول
  useEffect(() => {
    setUnauthorizedHandler(() => {
      qc.setQueryData(qk.me, null);
      dropUserData(qc);
    });
    return () => setUnauthorizedHandler(null);
  }, [qc]);

  // تطبيق السمة المحفوظة في الخادم (تتبع المعلم عبر الأجهزة)
  const themePref = settings.data?.preferences.theme;
  useEffect(() => {
    if (themePref) applyTheme(themePref);
  }, [themePref]);
  useEffect(() => watchSystemTheme(() => readThemePref()), []);

  const login = useCallback<AuthValue['login']>(
    async (input) => {
      const res = await api.post<{ user: AuthUserDto }>('/auth/login', input);
      dropUserData(qc);
      qc.setQueryData(qk.me, res.user);
    },
    [qc],
  );

  const setup = useCallback<AuthValue['setup']>(
    async (input) => {
      const res = await api.post<{ user: AuthUserDto }>('/auth/setup', input);
      dropUserData(qc);
      qc.setQueryData(qk.me, res.user);
      void qc.invalidateQueries({ queryKey: qk.system });
    },
    [qc],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // فشل الخروج (انقطاع الاتصال مثلًا): نبقى في مكاننا ونُنبّه، بدل إيهام المستخدم بأنه خرج والجلسة قائمة
      toast.error(`تعذّر تسجيل الخروج: ${errorMessage(e)}`);
      return;
    }
    // إعادة تحميل كاملة: تُفرَّغ ذاكرة الاستعلامات وحالة الواجهة كلها فلا يبقى أثر لبيانات المستخدم
    window.location.assign('/login');
  }, []);

  const refreshUser = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: qk.me });
  }, [qc]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      settings: settings.data,
      system: system.data,
      booting: system.isPending || me.isPending,
      bootError: system.error ?? me.error,
      login,
      logout,
      setup,
      refreshUser,
    }),
    [user, settings.data, system.data, system.isPending, me.isPending, system.error, me.error, login, logout, setup, refreshUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth يتطلب AuthProvider');
  return v;
}

/** المستخدم المسجَّل (يُستعمل داخل المسارات المحمية فقط) */
export function useUser(): AuthUserDto {
  const { user } = useAuth();
  if (!user) throw new Error('لا يوجد مستخدم مسجّل');
  return user;
}
