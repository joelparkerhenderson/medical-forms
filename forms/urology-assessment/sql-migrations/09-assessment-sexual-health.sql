-- 09_assessment_sexual_health.sql
-- Sexual health section of the urology assessment.

CREATE TABLE assessment_sexual_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    sexually_active VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sexually_active IN ('yes', 'no', '')),
    erectile_dysfunction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (erectile_dysfunction IN ('yes', 'no', '')),
    erectile_dysfunction_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (erectile_dysfunction_severity IN ('mild', 'moderate', 'severe', '')),
    erectile_dysfunction_duration_months INTEGER
        CHECK (erectile_dysfunction_duration_months IS NULL OR erectile_dysfunction_duration_months >= 0),
    iief5_score INTEGER
        CHECK (iief5_score IS NULL OR (iief5_score >= 1 AND iief5_score <= 25)),
    ejaculatory_dysfunction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ejaculatory_dysfunction IN ('yes', 'no', '')),
    ejaculatory_dysfunction_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (ejaculatory_dysfunction_type IN ('premature', 'delayed', 'retrograde', 'anejaculation', '')),
    decreased_libido VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (decreased_libido IN ('yes', 'no', '')),
    testosterone_level_nmol_l NUMERIC(5,1)
        CHECK (testosterone_level_nmol_l IS NULL OR testosterone_level_nmol_l >= 0),
    pde5_inhibitor_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pde5_inhibitor_use IN ('yes', 'no', '')),
    pde5_inhibitor_name TEXT NOT NULL DEFAULT '',
    fertility_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fertility_concerns IN ('yes', 'no', '')),
    fertility_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sexual_health_updated_at
    BEFORE UPDATE ON assessment_sexual_health
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sexual_health IS
    'Sexual health section: erectile function, ejaculatory function, libido, and fertility. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sexual_health.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sexual_health.sexually_active IS
    'Whether patient is sexually active.';
COMMENT ON COLUMN assessment_sexual_health.erectile_dysfunction IS
    'Whether patient has erectile dysfunction.';
COMMENT ON COLUMN assessment_sexual_health.erectile_dysfunction_severity IS
    'Severity of erectile dysfunction: mild, moderate, severe, or empty string.';
COMMENT ON COLUMN assessment_sexual_health.erectile_dysfunction_duration_months IS
    'Duration of erectile dysfunction in months.';
COMMENT ON COLUMN assessment_sexual_health.iief5_score IS
    'International Index of Erectile Function (IIEF-5/SHIM) score (1-25); <=21 indicates ED.';
COMMENT ON COLUMN assessment_sexual_health.ejaculatory_dysfunction IS
    'Whether patient has ejaculatory dysfunction.';
COMMENT ON COLUMN assessment_sexual_health.ejaculatory_dysfunction_type IS
    'Type of ejaculatory dysfunction: premature, delayed, retrograde, anejaculation, or empty string.';
COMMENT ON COLUMN assessment_sexual_health.decreased_libido IS
    'Whether patient has decreased libido.';
COMMENT ON COLUMN assessment_sexual_health.testosterone_level_nmol_l IS
    'Serum testosterone level in nmol/L.';
COMMENT ON COLUMN assessment_sexual_health.pde5_inhibitor_use IS
    'Whether patient uses PDE5 inhibitors (e.g. sildenafil, tadalafil).';
COMMENT ON COLUMN assessment_sexual_health.pde5_inhibitor_name IS
    'Name and dose of PDE5 inhibitor.';
COMMENT ON COLUMN assessment_sexual_health.fertility_concerns IS
    'Whether patient has fertility concerns.';
COMMENT ON COLUMN assessment_sexual_health.fertility_details IS
    'Details of fertility concerns.';
