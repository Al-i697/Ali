import * as RadixTabs from '@radix-ui/react-tabs';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...rest }: ComponentPropsWithoutRef<typeof RadixTabs.List>) {
  return <RadixTabs.List className={cn('relative mb-5 flex gap-1 overflow-x-auto border-b border-line', className)} {...rest} />;
}

export function TabsTrigger({ className, children, ...rest }: ComponentPropsWithoutRef<typeof RadixTabs.Trigger> & { children: ReactNode }) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'relative -mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-[15px] font-medium text-muted transition-colors hover:text-ink data-[state=active]:border-brand data-[state=active]:text-brand',
        className,
      )}
      {...rest}
    >
      {children}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({ className, ...rest }: ComponentPropsWithoutRef<typeof RadixTabs.Content>) {
  return <RadixTabs.Content className={cn('outline-none', className)} {...rest} />;
}
