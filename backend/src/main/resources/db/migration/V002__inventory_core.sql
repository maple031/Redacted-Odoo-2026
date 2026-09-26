-- Inventory foundation. Physical workflow behavior remains in the application.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

ALTER TABLE location
    ALTER COLUMN warehouse_id DROP NOT NULL,
    ADD COLUMN location_type VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    ADD CONSTRAINT location_type_check CHECK (location_type IN ('INTERNAL', 'VENDOR', 'CUSTOMER', 'LOSS', 'TRANSIT')),
    ADD CONSTRAINT location_warehouse_shape_check CHECK (
        (location_type = 'INTERNAL' AND warehouse_id IS NOT NULL)
        OR (location_type IN ('VENDOR', 'CUSTOMER', 'LOSS', 'TRANSIT') AND warehouse_id IS NULL)
    );

INSERT INTO location (warehouse_id, code, name, location_type)
VALUES
    (NULL, 'VENDOR', 'Vendor', 'VENDOR'),
    (NULL, 'CUSTOMER', 'Customer', 'CUSTOMER'),
    (NULL, 'LOSS', 'Loss', 'LOSS');

CREATE TABLE business_partner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    is_supplier BOOLEAN NOT NULL DEFAULT FALSE,
    is_customer BOOLEAN NOT NULL DEFAULT FALSE,
    email VARCHAR(255),
    phone VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT business_partner_name_nonblank CHECK (trim(name) <> ''),
    CONSTRAINT business_partner_role_check CHECK (is_supplier OR is_customer)
);

CREATE TABLE reorder_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES product(id),
    warehouse_id UUID NOT NULL REFERENCES warehouse(id),
    min_qty NUMERIC NOT NULL DEFAULT 0,
    target_qty NUMERIC,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT reorder_rule_min_qty_nonnegative CHECK (min_qty >= 0),
    CONSTRAINT reorder_rule_target_qty_valid CHECK (target_qty IS NULL OR target_qty >= min_qty),
    CONSTRAINT reorder_rule_product_warehouse_unique UNIQUE (product_id, warehouse_id)
);

CREATE TABLE inventory_operation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code VARCHAR(100) NOT NULL UNIQUE,
    operation_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    partner_id UUID REFERENCES business_partner(id),
    responsible_user_id UUID REFERENCES app_user(id),
    created_by_user_id UUID REFERENCES app_user(id),
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    kanban_rank BIGINT NOT NULL DEFAULT 1000,
    notes TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT inventory_operation_type_check CHECK (operation_type IN ('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT')),
    CONSTRAINT inventory_operation_status_check CHECK (status IN ('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED')),
    CONSTRAINT inventory_operation_partner_shape_check CHECK (
        (operation_type = 'RECEIPT' AND partner_id IS NOT NULL)
        OR (operation_type IN ('TRANSFER', 'ADJUSTMENT') AND partner_id IS NULL)
        OR operation_type = 'DELIVERY'
    ),
    CONSTRAINT inventory_operation_version_nonnegative CHECK (version >= 0)
);

CREATE TABLE operation_line (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID NOT NULL REFERENCES inventory_operation(id),
    product_id UUID NOT NULL REFERENCES product(id),
    source_location_id UUID REFERENCES location(id),
    destination_location_id UUID REFERENCES location(id),
    requested_qty NUMERIC NOT NULL,
    done_qty NUMERIC NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT operation_line_requested_qty_positive CHECK (requested_qty > 0),
    CONSTRAINT operation_line_done_qty_valid CHECK (done_qty >= 0 AND done_qty <= requested_qty),
    CONSTRAINT operation_line_distinct_endpoints CHECK (source_location_id IS DISTINCT FROM destination_location_id),
    CONSTRAINT operation_line_endpoint_present CHECK (source_location_id IS NOT NULL OR destination_location_id IS NOT NULL),
    CONSTRAINT operation_line_version_nonnegative CHECK (version >= 0)
);

CREATE TABLE inventory_adjustment_detail (
    operation_line_id UUID PRIMARY KEY REFERENCES operation_line(id),
    location_id UUID NOT NULL REFERENCES location(id),
    system_qty NUMERIC NOT NULL,
    counted_qty NUMERIC NOT NULL,
    reason_code VARCHAR(30) NOT NULL,
    counted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT adjustment_system_qty_nonnegative CHECK (system_qty >= 0),
    CONSTRAINT adjustment_counted_qty_nonnegative CHECK (counted_qty >= 0),
    CONSTRAINT adjustment_reason_code_check CHECK (reason_code IN ('PHYSICAL_COUNT', 'DAMAGE', 'LOSS', 'FOUND', 'INITIAL_STOCK', 'CORRECTION'))
);

CREATE TABLE stock_movement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_line_id UUID NOT NULL REFERENCES operation_line(id),
    product_id UUID NOT NULL REFERENCES product(id),
    source_location_id UUID NOT NULL REFERENCES location(id),
    destination_location_id UUID NOT NULL REFERENCES location(id),
    qty NUMERIC NOT NULL,
    reversal_of_movement_id UUID REFERENCES stock_movement(id),
    moved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID REFERENCES app_user(id),
    CONSTRAINT stock_movement_qty_positive CHECK (qty > 0),
    CONSTRAINT stock_movement_distinct_endpoints CHECK (source_location_id <> destination_location_id)
);

CREATE TABLE inventory_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES product(id),
    location_id UUID NOT NULL REFERENCES location(id),
    on_hand_qty NUMERIC NOT NULL DEFAULT 0,
    reserved_qty NUMERIC NOT NULL DEFAULT 0,
    available_qty NUMERIC GENERATED ALWAYS AS (on_hand_qty - reserved_qty) STORED,
    version BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT inventory_balance_product_location_unique UNIQUE (product_id, location_id),
    CONSTRAINT inventory_balance_on_hand_nonnegative CHECK (on_hand_qty >= 0),
    CONSTRAINT inventory_balance_reserved_nonnegative CHECK (reserved_qty >= 0),
    CONSTRAINT inventory_balance_reserved_within_on_hand CHECK (reserved_qty <= on_hand_qty),
    CONSTRAINT inventory_balance_version_nonnegative CHECK (version >= 0)
);

CREATE TABLE reservation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_line_id UUID NOT NULL REFERENCES operation_line(id),
    location_id UUID NOT NULL REFERENCES location(id),
    qty NUMERIC NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    CONSTRAINT reservation_qty_positive CHECK (qty > 0),
    CONSTRAINT reservation_status_check CHECK (status IN ('ACTIVE', 'CONSUMED', 'RELEASED'))
);

CREATE INDEX reservation_active_operation_line_idx ON reservation (operation_line_id) WHERE status = 'ACTIVE';
CREATE INDEX reservation_active_location_idx ON reservation (location_id) WHERE status = 'ACTIVE';

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_user_id UUID REFERENCES app_user(id),
    correlation_id UUID,
    before_state JSONB,
    after_state JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX inventory_operation_status_rank_idx ON inventory_operation (status, kanban_rank);
CREATE INDEX operation_line_operation_idx ON operation_line (operation_id);
CREATE INDEX stock_movement_product_moved_at_idx ON stock_movement (product_id, moved_at DESC);
CREATE INDEX inventory_balance_location_idx ON inventory_balance (location_id);
CREATE INDEX audit_log_entity_created_at_idx ON audit_log (entity_type, entity_id, created_at DESC);

CREATE TRIGGER business_partner_set_updated_at BEFORE UPDATE ON business_partner FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER reorder_rule_set_updated_at BEFORE UPDATE ON reorder_rule FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER inventory_operation_set_updated_at BEFORE UPDATE ON inventory_operation FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER operation_line_set_updated_at BEFORE UPDATE ON operation_line FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER inventory_balance_set_updated_at BEFORE UPDATE ON inventory_balance FOR EACH ROW EXECUTE FUNCTION set_updated_at();
