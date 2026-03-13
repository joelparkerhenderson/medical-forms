-- ============================================================
-- 06_assessment_peripheral_blood_film.sql
-- Step 4: Peripheral Blood Film (1:1 with assessment).
-- ============================================================
-- Blood film morphology findings including red cell, white cell,
-- and platelet morphology, abnormal cells, and film quality.
-- ============================================================

CREATE TABLE assessment_peripheral_blood_film (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Blood film fields
    red_cell_morphology         TEXT NOT NULL DEFAULT '',
    white_blood_cell_differential TEXT NOT NULL DEFAULT '',
    platelet_morphology         TEXT NOT NULL DEFAULT '',
    abnormal_cell_morphology    TEXT NOT NULL DEFAULT '',
    film_quality                SMALLINT CHECK (film_quality IS NULL OR (film_quality >= 1 AND film_quality <= 5)),
    film_comments               TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_peripheral_blood_film_updated_at
    BEFORE UPDATE ON assessment_peripheral_blood_film
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_peripheral_blood_film IS
    '1:1 with assessment. Step 4: Peripheral Blood Film - morphology findings.';
COMMENT ON COLUMN assessment_peripheral_blood_film.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_peripheral_blood_film.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_peripheral_blood_film.red_cell_morphology IS
    'Red cell morphology description. Empty string if unanswered.';
COMMENT ON COLUMN assessment_peripheral_blood_film.white_blood_cell_differential IS
    'White blood cell differential description. Empty string if unanswered.';
COMMENT ON COLUMN assessment_peripheral_blood_film.platelet_morphology IS
    'Platelet morphology description. Empty string if unanswered.';
COMMENT ON COLUMN assessment_peripheral_blood_film.abnormal_cell_morphology IS
    'Abnormal cell morphology findings. Empty string if unanswered.';
COMMENT ON COLUMN assessment_peripheral_blood_film.film_quality IS
    'Film quality rating (1-5 scale). NULL if not assessed.';
COMMENT ON COLUMN assessment_peripheral_blood_film.film_comments IS
    'Additional comments on the blood film. Empty string if unanswered.';
COMMENT ON COLUMN assessment_peripheral_blood_film.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_peripheral_blood_film.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
