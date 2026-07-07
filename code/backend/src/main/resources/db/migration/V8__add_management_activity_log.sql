CREATE TABLE management_activity_log (
    id BIGSERIAL PRIMARY KEY,
    performed_by_id BIGINT NOT NULL,
    target_user_id BIGINT,
    action VARCHAR(50) NOT NULL,
    details VARCHAR(500),
    performed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    
    CONSTRAINT fk_management_log_performed_by FOREIGN KEY (performed_by_id) REFERENCES users(id),
    CONSTRAINT fk_management_log_target_user FOREIGN KEY (target_user_id) REFERENCES users(id)
);
