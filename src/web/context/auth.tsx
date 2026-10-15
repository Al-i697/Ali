import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthUserDto, SettingsDto, SystemInfo } from '@shared/dto';
import { api, setUnauthorizedHandler } from '@/lib/api';
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
      qc.setQueryData(qk.me, res.user);
      void qc.invalidateQueries({ queryKey: qk.settings });
    },
    [qc],
  );

  const setup = useCallback<AuthValue['setup']>(
    async (input) => {
      const res = await api.post<{ user: AuthUserDto }>('/auth/setup', input);
      qc.setQueryData(qk.me, res.user);
      void qc.invalidateQueries({ queryKey: qk.system });
    },
    [qc],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      qc.clear();
      qc.setQueryData(qk.me, null);
    }
  }, [qc]);

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
