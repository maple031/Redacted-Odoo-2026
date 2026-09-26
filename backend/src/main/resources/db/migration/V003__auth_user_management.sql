ALTER TABLE app_user RENAME COLUMN username TO login_id;
ALTER TABLE app_user RENAME COLUMN enabled TO active;
ALTER TABLE app_user ALTER COLUMN login_id TYPE VARCHAR(12);

ALTER TABLE app_user DROP CONSTRAINT app_user_username_key;
ALTER TABLE app_user DROP CONSTRAINT app_user_email_key;
ALTER TABLE app_user ADD CONSTRAINT app_user_login_id_length_check CHECK (char_length(trim(login_id)) BETWEEN 6 AND 12);
ALTER TABLE app_user ADD COLUMN role VARCHAR(30) NOT NULL DEFAULT 'WAREHOUSE_STAFF';
ALTER TABLE app_user ADD CONSTRAINT app_user_role_check CHECK (role IN ('INVENTORY_MANAGER', 'WAREHOUSE_STAFF'));
ALTER TABLE app_user ADD COLUMN last_login_at TIMESTAMPTZ;

CREATE UNIQUE INDEX app_user_login_id_lower_uidx ON app_user (lower(login_id));
CREATE UNIQUE INDEX app_user_email_lower_uidx ON app_user (lower(email));

CREATE TABLE password_reset_challenge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_user(id),
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT password_reset_attempt_count_nonnegative CHECK (attempt_count >= 0)
);

CREATE INDEX password_reset_challenge_user_idx ON password_reset_challenge (user_id);
CREATE TRIGGER app_user_set_updated_at BEFORE UPDATE ON app_user FOR EACH ROW EXECUTE FUNCTION set_updated_at();
