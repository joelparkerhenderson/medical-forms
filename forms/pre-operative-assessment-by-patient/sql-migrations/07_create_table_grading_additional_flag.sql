-- Safety-critical flags that fire independently of ASA grade.
-- Many-to-one child of grading_result.

CREATE TABLE grading_additional_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    flag_id VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (category IN (
            'difficult-airway',
            'severe-cardiac',
            'severe-respiratory',
            'severe-renal',
            'severe-hepatic',
            'severe-anaemia',
            'coagulopathy',
            'uncontrolled-diabetes',
            'severe-frailty',
            'recent-covid-19',
            'fasting-violation',
            'missing-crossmatch',
            'high-risk-medication',
            'capacity-concern',
            'paediatric',
            'pregnancy',
            'safeguarding',
            'malignant-hyperthermia',
            'latex-allergy',
            'sux-apnoea',
            'pseudocholinesterase-deficiency',
            'malnutrition-risk',
            'other',
            ''
        )),
    priority VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (priority IN ('low', 'medium', 'high', '')),
    description VARCHAR(500) NOT NULL DEFAULT '',
    suggested_action VARCHAR(500) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_grading_additional_flag_grading_result_id
    ON grading_additional_flag(grading_result_id);

CREATE TRIGGER trg_grading_additional_flag_updated_at
    BEFORE UPDATE ON grading_additional_flag
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_additional_flag IS
    'Safety-critical flags that fire independently of the ASA grade, with priority and a suggested action for the perioperative team.';
COMMENT ON COLUMN grading_additional_flag.grading_result_id IS
    'Foreign key to the parent grading_result.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS
    'Stable flag identifier (e.g. F-DIFFICULT-AIRWAY-001).';
COMMENT ON COLUMN grading_additional_flag.category IS
    'Flag category.';
COMMENT ON COLUMN grading_additional_flag.priority IS
    'Priority: low, medium, high.';
COMMENT ON COLUMN grading_additional_flag.description IS
    'Human-readable description of what fired the flag.';
COMMENT ON COLUMN grading_additional_flag.suggested_action IS
    'Suggested clinical action (e.g. "prepare difficult-airway trolley").';

COMMENT ON COLUMN grading_additional_flag.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_additional_flag.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_additional_flag.updated_at IS
    'Timestamp when this row was last updated.';
