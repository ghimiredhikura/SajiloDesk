export const threads = ['korea-d2-extension', 'korea-d4-extension', 'korea-e9-extension', 'korea-address-change'] as const;
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
