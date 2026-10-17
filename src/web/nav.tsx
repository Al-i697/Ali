import type { LucideIcon } from 'lucide-react';
import { BookOpenCheck, CalendarClock, CalendarDays, ClipboardList, FileBarChart, FlaskConical, HeartHandshake, LayoutDashboard, MessagesSquare, Settings, Users } from 'lucide-react';

// سجل التنقل: لإضافة صفحة جديدة أضف عنصرًا هنا ومسارًا في App.tsx (انظر docs/ADDING-A-MODULE.md).
export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** يظهر في شريط التنقل السفلي بالجوال */
  mobile?: boolean;
};

export const NAV: NavItem[] = [
  { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard, end: true, mobile: true },
  { to: '/classes', label: 'الشعب والطلاب', icon: Users, mobile: true },
  { to: '/class', label: 'إدارة الصف', icon: MessagesSquare, mobile: true },
  { to: '/lessons', label: 'التحضير', icon: BookOpenCheck },
  { to: '/assessments', label: 'التقويم المستمر', icon: ClipboardList, mobile: true },
  { to: '/support', label: 'الخطط العلاجية والإثرائية', icon: HeartHandshake },
  { to: '/lab', label: 'المختبر والأنشطة', icon: FlaskConical },
  { to: '/timetable', label: 'الجدول الأسبوعي', icon: CalendarClock },
  { to: '/tasks', label: 'المهام والتقويم', icon: CalendarDays },
  { to: '/reports', label: 'التقارير', icon: FileBarChart },
  { to: '/settings', label: 'الإعدادات', icon: Settings },
];
