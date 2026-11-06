CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread TEXT NOT NULL CHECK(length(thread) BETWEEN 1 AND 80),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('experience','correction','request')),
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published'))
);
CREATE INDEX IF NOT EXISTS comments_public ON comments(thread,status,id);
CREATE INDEX IF NOT EXISTS comments_review ON comments(status,created_at);
CREATE TABLE IF NOT EXISTS comment_limits (key TEXT PRIMARY KEY, day TEXT NOT NULL, count INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS comment_limits_day ON comment_limits(day);
