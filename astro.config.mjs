import { defineConfig } from 'astro/config';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env')) loadEnvFile('.env');

const site = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { build: { sourcemap: false } },
});
