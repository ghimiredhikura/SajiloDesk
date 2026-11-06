// Owner-only moderation through Wrangler's authenticated Cloudflare account.
import { spawnSync } from 'node:child_process';
const [action = 'pending', rawId] = process.argv.slice(2);
if (!['pending','published','approve','delete'].includes(action)) throw new Error('Use: npm run community -- pending|published|approve ID|delete ID');
if (['approve','delete'].includes(action) && !/^[1-9]\d{0,14}$/.test(rawId || '')) throw new Error('Provide one numeric comment ID.');
const sql = action === 'pending' ? "SELECT id,thread,name,category,message,created_at FROM comments WHERE status='pending' ORDER BY id LIMIT 50" : action === 'published' ? "SELECT id,thread,name,category,message,created_at FROM comments WHERE status='published' ORDER BY id DESC LIMIT 50" : action === 'approve' ? `UPDATE comments SET status='published' WHERE id=${rawId} AND status='pending' RETURNING id,thread,name,message` : `DELETE FROM comments WHERE id=${rawId} RETURNING id`;
const result = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js','d1','execute','sajilodesk-community','--remote','--command',sql], { stdio: 'inherit' });
process.exit(result.status ?? 1);
