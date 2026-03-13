-- 05_cholesterol.sql
-- Cholesterol lipid profile and statin status.

CREATE TABLE cholesterol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    total_cholesterol NUMERIC(5, 2)
        CHECK (total_cholesterol IS NULL OR (total_cholesterol >= 0 AND total_cholesterol <= 20)),
    hdl_cholesterol NUMERIC(5, 2)
        CHECK (hdl_cholesterol IS NULL OR (hdl_cholesterol >= 0 AND hdl_cholesterol <= 10)),
    total_hdl_ratio NUMERIC(5, 2)
        CHECK (total_hdl_ratio IS NULL OR (total_hdl_ratio >= 0 AND total_hdl_ratio <= 30)),
    on_statin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_statin IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_cholesterol_updated_at
    BEFORE UPDATE ON cholesterol
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE cholesterol IS
    'Cholesterol lipid profile and statin therapy status.';
COMMENT ON COLUMN cholesterol.total_cholesterol IS
    'Total cholesterol in mmol/L.';
COMMENT ON COLUMN cholesterol.hdl_cholesterol IS
    'HDL cholesterol in mmol/L.';
COMMENT ON COLUMN cholesterol.total_hdl_ratio IS
    'TC/HDL ratio (can be overridden or calculated).';
COMMENT ON COLUMN cholesterol.on_statin IS
    'Whether the patient is currently on statin therapy.';
