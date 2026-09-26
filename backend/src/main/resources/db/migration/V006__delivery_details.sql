CREATE TABLE delivery_detail (
    operation_id UUID PRIMARY KEY REFERENCES inventory_operation(id),
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT delivery_detail_address_nonblank CHECK (trim(delivery_address) <> '')
);

CREATE TRIGGER delivery_detail_set_updated_at BEFORE UPDATE ON delivery_detail FOR EACH ROW EXECUTE FUNCTION set_updated_at();
