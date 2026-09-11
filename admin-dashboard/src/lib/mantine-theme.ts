'use client';

import { createTheme, type MantineColorsTuple } from '@mantine/core';

const teal: MantineColorsTuple = [
  '#e6f7f0',
  '#b3e8d4',
  '#80d9b8',
  '#4dca9c',
  '#26be87',
  '#0e9b6d',
  '#0b8560',
  '#096f53',
  '#075946',
  '#054339',
];

export const theme = createTheme({
  primaryColor: 'teal',
  primaryShade: { light: 5, dark: 5 },
  colors: {
    teal,
    dark: [
      '#d3e4fe',
      '#bcc7de',
      '#bccac0',
      '#6d7a72',
      '#535f58',
      '#545f73',
      '#0b1c30',
      '#f8f9ff',
      '#f8f9ff',
      '#0b1c30',
    ],
    gray: [
      '#f8fafc',
      '#f1f5f9',
      '#e2e8f0',
      '#cbd5e1',
      '#94a3b8',
      '#64748b',
      '#475569',
      '#334155',
      '#1e293b',
      '#0f172a',
    ],
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '56px', lineHeight: '64px', fontWeight: '700' },
      h2: { fontSize: '32px', lineHeight: '40px', fontWeight: '600' },
      h3: { fontSize: '24px', lineHeight: '32px', fontWeight: '600' },
      h4: { fontSize: '20px', lineHeight: '28px', fontWeight: '600' },
      h5: { fontSize: '16px', lineHeight: '24px', fontWeight: '600' },
    },
  },
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.05em',
          fontSize: '14px',
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: '#ffffff',
          color: '#0b1c30',
          borderColor: '#e2e8f0',
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
    },
    Table: {
      styles: {
        th: {
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        },
      },
    },
  },
});
