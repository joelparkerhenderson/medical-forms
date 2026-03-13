-- ============================================================
-- 11_assessment_recommendations.sql
-- Recommendations and action plan (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_recommendations (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    equipment_changes           TEXT NOT NULL DEFAULT '',
    workstation_modifications   TEXT NOT NULL DEFAULT '',
    training_required           TEXT NOT NULL DEFAULT '',
    break_schedule              TEXT NOT NULL DEFAULT '',
    follow_up_date              DATE,
    referrals                   TEXT NOT NULL DEFAULT '',

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_recommendations_updated_at
    BEFORE UPDATE ON assessment_recommendations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_recommendations IS
    'Recommendations and action plan: equipment changes, workstation modifications, training, break schedule, follow-up, referrals.';
COMMENT ON COLUMN assessment_recommendations.equipment_changes IS
    'Free-text description of recommended equipment changes.';
COMMENT ON COLUMN assessment_recommendations.workstation_modifications IS
    'Free-text description of recommended workstation modifications.';
COMMENT ON COLUMN assessment_recommendations.training_required IS
    'Free-text description of training requirements.';
COMMENT ON COLUMN assessment_recommendations.break_schedule IS
    'Free-text description of recommended break schedule.';
COMMENT ON COLUMN assessment_recommendations.follow_up_date IS
    'Recommended follow-up assessment date. NULL if not specified.';
COMMENT ON COLUMN assessment_recommendations.referrals IS
    'Free-text description of referrals (e.g. physiotherapy, occupational health).';
