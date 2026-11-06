-- One-time migration for databases initialized with the initial three-thread CHECK.
-- Keep every existing row and ID; the Worker continues to enforce its thread allowlist.
CREATE TABLE comments_expanded (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread TEXT NOT NULL CHECK(length(thread) BETWEEN 1 AND 80),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('experience','correction','request')),
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published'))
);
INSERT INTO comments_expanded (id,thread,name,category,message,created_at,status)
SELECT id,thread,name,category,message,created_at,status FROM comments;
DROP TABLE comments;
ALTER TABLE comments_expanded RENAME TO comments;
CREATE INDEX comments_public ON comments(thread,status,id);
CREATE INDEX comments_review ON comments(status,created_at);
