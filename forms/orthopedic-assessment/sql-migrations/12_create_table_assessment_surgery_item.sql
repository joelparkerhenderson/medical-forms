CREATE TABLE assessment_surgery_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    surgical_history_id UUID NOT NULL
        REFERENCES assessment_surgical_history(id) ON DELETE CASCADE,

    procedure_name VARCHAR(255) NOT NULL DEFAULT '',
    date_performed DATE,
    surgeon VARCHAR(255) NOT NULL DEFAULT '',
    hospital VARCHAR(255) NOT NULL DEFAULT '',
    outcome VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (outcome IN ('good', 'fair', 'poor', 'complication', '')),
    outcome_details TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_surgery_item_updated_at
    BEFORE UPDATE ON assessment_surgery_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_surgery_item IS
    'Individual previous orthopedic surgery entry with procedure, date, and outcome.';
COMMENT ON COLUMN assessment_surgery_item.procedure_name IS
    'Name of the surgical procedure.';
COMMENT ON COLUMN assessment_surgery_item.date_performed IS
    'Date the surgery was performed.';
COMMENT ON COLUMN assessment_surgery_item.surgeon IS
    'Name of the operating surgeon.';
COMMENT ON COLUMN assessment_surgery_item.hospital IS
    'Hospital where the surgery was performed.';
COMMENT ON COLUMN assessment_surgery_item.outcome IS
    'Outcome of the surgery: good, fair, poor, complication, or empty.';
COMMENT ON COLUMN assessment_surgery_item.outcome_details IS
    'Details of the surgical outcome.';
COMMENT ON COLUMN assessment_surgery_item.sort_order IS
    'Display order of the item within the list.';

COMMENT ON COLUMN assessment_surgical_history.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_surgical_history.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_surgical_history.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_surgery_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_surgery_item.surgical_history_id IS
    'Foreign key to the assessment_surgical_history table.';
COMMENT ON COLUMN assessment_surgery_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_surgery_item.updated_at IS
    'Timestamp when this row was last updated.';
