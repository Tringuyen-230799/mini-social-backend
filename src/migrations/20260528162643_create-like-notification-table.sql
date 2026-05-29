CREATE TABLE post_likes (
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,  
    notifier_id INT NOT NULL, 
    receiver_id INT NOT NULL,
    notification_type VARCHAR(20) NOT NULL,
    entity_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (notifier_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_receiver ON notifications(receiver_id, created_at DESC);