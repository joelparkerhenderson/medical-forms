-- ============================================================
-- 07_care_quality.sql
-- Care Quality satisfaction domain (1:1 with encounter_satisfaction).
-- ============================================================
-- 3 Likert-scale questions (1-5) about care quality and involvement.
-- ============================================================

CREATE TABLE care_quality (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with encounter_satisfaction
    encounter_satisfaction_id   UUID NOT NULL UNIQUE REFERENCES encounter_satisfaction(id) ON DELETE CASCADE,

    -- Likert scores (1=Very Dissatisfied ... 5=Very Satisfied), NULL if unanswered
    involvement_in_decisions    SMALLINT CHECK (involvement_in_decisions BETWEEN 1 AND 5),
    treatment_plan_explanation  SMALLINT CHECK (treatment_plan_explanation BETWEEN 1 AND 5),
    confidence_in_care          SMALLINT CHECK (confidence_in_care BETWEEN 1 AND 5),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_care_quality_updated_at
    BEFORE UPDATE ON care_quality
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE care_quality IS
    '1:1 with encounter_satisfaction. Care Quality domain: 3 Likert-scale satisfaction questions.';
COMMENT ON COLUMN care_quality.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN care_quality.encounter_satisfaction_id IS
    'FK to encounter_satisfaction (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN care_quality.involvement_in_decisions IS
    'Satisfaction with involvement in care decisions (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN care_quality.treatment_plan_explanation IS
    'Satisfaction with treatment plan explanation (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN care_quality.confidence_in_care IS
    'Confidence in the care received (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN care_quality.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN care_quality.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
