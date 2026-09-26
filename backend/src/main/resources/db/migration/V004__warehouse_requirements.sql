ALTER TABLE warehouse RENAME COLUMN code TO short_code;
ALTER TABLE warehouse DROP CONSTRAINT warehouse_code_key;
ALTER TABLE warehouse ADD CONSTRAINT warehouse_short_code_nonblank CHECK (trim(short_code) <> '');
CREATE UNIQUE INDEX warehouse_short_code_lower_uidx ON warehouse (lower(short_code));
ALTER TABLE warehouse ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TRIGGER warehouse_set_updated_at BEFORE UPDATE ON warehouse FOR EACH ROW EXECUTE FUNCTION set_updated_at();
