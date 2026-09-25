DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_change_status') THEN CREATE TYPE profile_change_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED'); END IF; END $$;
CREATE TABLE IF NOT EXISTS profile_change_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    target_role VARCHAR(50) NOT NULL,
    proposed_changes TEXT NOT NULL,
    status profile_change_status NOT NULL DEFAULT 'PENDING',
    reviewed_by BIGINT REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
