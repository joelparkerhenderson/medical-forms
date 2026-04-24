CREATE TABLE casualty_card_assessment_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with casualty_card (UNIQUE constraint)
    casualty_card_id          UUID NOT NULL UNIQUE REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- Clinical assessment
    working_diagnosis         TEXT NOT NULL DEFAULT '',
    differential_diagnoses    TEXT NOT NULL DEFAULT '',
    clinical_impression       TEXT NOT NULL DEFAULT '',
    risk_stratification       TEXT NOT NULL DEFAULT ''
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_assessment_plan_updated_at
    BEFORE UPDATE ON casualty_card_assessment_plan
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_assessment_plan IS
    '1:1 with casualty_card. Working diagnosis, differentials, clinical impression, and risk stratification.';
COMMENT ON COLUMN casualty_card_assessment_plan.casualty_card_id IS
    'FK to casualty_card (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN casualty_card_assessment_plan.working_diagnosis IS
    'Primary working diagnosis based on clinical assessment.';
COMMENT ON COLUMN casualty_card_assessment_plan.differential_diagnoses IS
    'List of differential diagnoses being considered.';
COMMENT ON COLUMN casualty_card_assessment_plan.clinical_impression IS
    'Overall clinical impression and summary of findings.';
COMMENT ON COLUMN casualty_card_assessment_plan.risk_stratification IS
    'Risk stratification assessment (e.g. HEART score, Wells score results).';
COMMENT ON COLUMN casualty_card_assessment_plan.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_assessment_plan.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_assessment_plan.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_assessment_plan.deleted_at IS
    'Timestamp when this row was deleted.';
