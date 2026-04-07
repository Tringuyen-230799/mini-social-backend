-- Create images table
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_images_post_id ON images(post_id);