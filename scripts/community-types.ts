import { koreaThreads } from '../src/lib/korea-routes';
export const threads = koreaThreads;
export const categories = ['experience', 'correction', 'request'] as const;
export interface Statement {
  bind(...values: unknown[]): Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
export interface CommunityEnv {
  COMMUNITY_DB: { prepare(sql: string): Statement };
  COMMENT_SALT: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
  ADMIN_ACCESS_TEAM_DOMAIN?: string;
  ADMIN_ACCESS_AUD?: string;
  ADMIN_EMAIL?: string;
}
