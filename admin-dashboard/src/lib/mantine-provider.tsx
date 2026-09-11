'use client';

import { MantineProvider as BaseMantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { theme } from './mantine-theme';

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseMantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      {children}
    </BaseMantineProvider>
  );
}
