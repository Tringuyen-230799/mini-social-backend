-- Add reply_user_id column to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS reply_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create index for reply_user_id
CREATE INDEX IF NOT EXISTS idx_comments_reply_user_id ON comments(reply_user_id);
