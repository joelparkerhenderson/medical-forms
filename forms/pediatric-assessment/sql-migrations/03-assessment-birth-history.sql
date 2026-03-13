-- 03_assessment_birth_history.sql
-- Birth history section of the pediatric assessment.

CREATE TABLE assessment_birth_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    gestational_age_weeks INTEGER
        CHECK (gestational_age_weeks IS NULL OR (gestational_age_weeks >= 20 AND gestational_age_weeks <= 45)),
    birth_weight_grams INTEGER
        CHECK (birth_weight_grams IS NULL OR (birth_weight_grams >= 250 AND birth_weight_grams <= 7000)),
    delivery_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (delivery_method IN ('vaginal', 'assisted-vaginal', 'elective-caesarean', 'emergency-caesarean', '')),
    apgar_score_1min INTEGER
        CHECK (apgar_score_1min IS NULL OR (apgar_score_1min >= 0 AND apgar_score_1min <= 10)),
    apgar_score_5min INTEGER
        CHECK (apgar_score_5min IS NULL OR (apgar_score_5min >= 0 AND apgar_score_5min <= 10)),
    nicu_admission VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nicu_admission IN ('yes', 'no', '')),
    nicu_duration_days INTEGER
        CHECK (nicu_duration_days IS NULL OR nicu_duration_days >= 0),
    birth_complications TEXT NOT NULL DEFAULT '',
    maternal_complications TEXT NOT NULL DEFAULT '',
    preterm VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (preterm IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_birth_history_updated_at
    BEFORE UPDATE ON assessment_birth_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_birth_history IS
    'Birth history section: gestational age, delivery details, Apgar scores, and NICU admission. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_birth_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_birth_history.gestational_age_weeks IS
    'Gestational age at birth in completed weeks.';
COMMENT ON COLUMN assessment_birth_history.birth_weight_grams IS
    'Birth weight in grams.';
COMMENT ON COLUMN assessment_birth_history.delivery_method IS
    'Method of delivery: vaginal, assisted-vaginal, elective-caesarean, emergency-caesarean, or empty.';
COMMENT ON COLUMN assessment_birth_history.apgar_score_1min IS
    'Apgar score at 1 minute (0-10).';
COMMENT ON COLUMN assessment_birth_history.apgar_score_5min IS
    'Apgar score at 5 minutes (0-10).';
COMMENT ON COLUMN assessment_birth_history.nicu_admission IS
    'Whether the neonate required NICU admission.';
COMMENT ON COLUMN assessment_birth_history.nicu_duration_days IS
    'Duration of NICU stay in days, if applicable.';
COMMENT ON COLUMN assessment_birth_history.birth_complications IS
    'Free-text description of any birth complications.';
COMMENT ON COLUMN assessment_birth_history.maternal_complications IS
    'Free-text description of any maternal complications during pregnancy or delivery.';
COMMENT ON COLUMN assessment_birth_history.preterm IS
    'Whether the child was born preterm (before 37 weeks).';
