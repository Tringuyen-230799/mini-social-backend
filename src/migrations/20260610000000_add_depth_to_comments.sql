-- Add depth column to comments table
ALTER TABLE comments 
ADD COLUMN depth INTEGER NOT NULL DEFAULT 0;

ALTER TABLE comments 
ADD CONSTRAINT check_comment_depth CHECK (depth >= 0 AND depth <= 3);