-- 04_assessment_menopause_status.sql
-- Menopause status section of the HRT assessment.

CREATE TABLE assessment_menopause_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    menopausal_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (menopausal_status IN ('pre-menopausal', 'peri-menopausal', 'post-menopausal', 'surgical-menopause', '')),
    age_at_menopause INTEGER
        CHECK (age_at_menopause IS NULL OR (age_at_menopause >= 20 AND age_at_menopause <= 65)),
    premature_menopause VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (premature_menopause IN ('yes', 'no', '')),
    last_menstrual_period_date DATE,
    menstrual_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (menstrual_status IN ('regular', 'irregular', 'ceased', '')),
    cycle_changes TEXT NOT NULL DEFAULT '',
    surgical_menopause_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (surgical_menopause_type IN ('hysterectomy', 'bilateral-oophorectomy', 'both', '')),
    surgical_menopause_date DATE,
    fsh_level NUMERIC(6,1),
    oestradiol_level NUMERIC(8,1),
    hormone_testing_date DATE,
    menopause_duration_years INTEGER
        CHECK (menopause_duration_years IS NULL OR menopause_duration_years >= 0),
    menopause_status_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_menopause_status_updated_at
    BEFORE UPDATE ON assessment_menopause_status
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_menopause_status IS
    'Menopause status section: menopausal stage, surgical menopause, and hormone levels. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_menopause_status.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_menopause_status.menopausal_status IS
    'Current menopausal status: pre-menopausal, peri-menopausal, post-menopausal, surgical-menopause, or empty string.';
COMMENT ON COLUMN assessment_menopause_status.age_at_menopause IS
    'Age at menopause in years, NULL if pre-menopausal or unanswered.';
COMMENT ON COLUMN assessment_menopause_status.premature_menopause IS
    'Whether menopause occurred before age 40 (premature ovarian insufficiency): yes, no, or empty string.';
COMMENT ON COLUMN assessment_menopause_status.last_menstrual_period_date IS
    'Date of last menstrual period, NULL if surgical menopause or unanswered.';
COMMENT ON COLUMN assessment_menopause_status.menstrual_status IS
    'Current menstrual status: regular, irregular, ceased, or empty string.';
COMMENT ON COLUMN assessment_menopause_status.cycle_changes IS
    'Description of menstrual cycle changes.';
COMMENT ON COLUMN assessment_menopause_status.surgical_menopause_type IS
    'Type of surgical menopause: hysterectomy, bilateral-oophorectomy, both, or empty string.';
COMMENT ON COLUMN assessment_menopause_status.surgical_menopause_date IS
    'Date of surgical menopause, NULL if not applicable.';
COMMENT ON COLUMN assessment_menopause_status.fsh_level IS
    'Follicle-stimulating hormone level in IU/L, NULL if not tested.';
COMMENT ON COLUMN assessment_menopause_status.oestradiol_level IS
    'Oestradiol level in pmol/L, NULL if not tested.';
COMMENT ON COLUMN assessment_menopause_status.hormone_testing_date IS
    'Date of hormone level testing, NULL if not tested.';
COMMENT ON COLUMN assessment_menopause_status.menopause_duration_years IS
    'Number of years since menopause, NULL if pre-menopausal.';
COMMENT ON COLUMN assessment_menopause_status.menopause_status_notes IS
    'Free-text notes on menopause status.';
