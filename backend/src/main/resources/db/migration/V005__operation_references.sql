ALTER TABLE inventory_operation
    ADD COLUMN reference_warehouse_id UUID NOT NULL REFERENCES warehouse(id);

CREATE TABLE operation_sequence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouse(id),
    operation_type VARCHAR(20) NOT NULL,
    next_value BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT operation_sequence_warehouse_type_unique UNIQUE (warehouse_id, operation_type),
    CONSTRAINT operation_sequence_next_value_positive CHECK (next_value > 0),
    CONSTRAINT operation_sequence_type_check CHECK (operation_type IN ('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'))
);

CREATE TRIGGER operation_sequence_set_updated_at BEFORE UPDATE ON operation_sequence FOR EACH ROW EXECUTE FUNCTION set_updated_at();
