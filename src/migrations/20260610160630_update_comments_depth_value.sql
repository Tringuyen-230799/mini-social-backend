WITH RECURSIVE comment_depth AS (
  -- Base case: top-level comments have depth 0
  SELECT id, parent_comment_id, 0 AS depth
  FROM comments
  WHERE parent_comment_id IS NULL
  
  UNION ALL
  
  -- Recursive case: child comments have parent depth + 1
  SELECT c.id, c.parent_comment_id, cd.depth + 1
  FROM comments c
  INNER JOIN comment_depth cd ON c.parent_comment_id = cd.id
)
UPDATE comments
SET depth = comment_depth.depth
FROM comment_depth
WHERE comments.id = comment_depth.id;