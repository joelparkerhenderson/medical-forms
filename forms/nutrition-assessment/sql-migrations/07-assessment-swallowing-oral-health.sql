-- 07_assessment_swallowing_oral_health.sql
-- Swallowing and oral health section of the nutrition assessment.

CREATE TABLE assessment_swallowing_oral_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    swallowing_difficulty VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (swallowing_difficulty IN ('yes', 'no', '')),
    dysphagia_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dysphagia_severity IN ('mild', 'moderate', 'severe', '')),
    dysphagia_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dysphagia_type IN ('oropharyngeal', 'oesophageal', 'both', 'unknown', '')),
    choking_episodes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (choking_episodes IN ('yes', 'no', '')),
    coughing_during_meals VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (coughing_during_meals IN ('yes', 'no', '')),
    salt_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (salt_referral IN ('yes', 'no', '')),
    dental_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dental_problems IN ('yes', 'no', '')),
    dental_problem_details TEXT NOT NULL DEFAULT '',
    dentures VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dentures IN ('yes', 'no', '')),
    dentures_fit_well VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dentures_fit_well IN ('yes', 'no', '')),
    oral_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oral_pain IN ('yes', 'no', '')),
    dry_mouth VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dry_mouth IN ('yes', 'no', '')),
    oral_thrush VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oral_thrush IN ('yes', 'no', '')),
    swallowing_oral_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_swallowing_oral_health_updated_at
    BEFORE UPDATE ON assessment_swallowing_oral_health
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_swallowing_oral_health IS
    'Swallowing and oral health section: dysphagia screening, dental status, and oral hygiene. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_swallowing_oral_health.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_swallowing_oral_health.swallowing_difficulty IS
    'Whether the patient has swallowing difficulties: yes, no, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.dysphagia_severity IS
    'Severity of dysphagia: mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.dysphagia_type IS
    'Type of dysphagia: oropharyngeal, oesophageal, both, unknown, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.choking_episodes IS
    'Whether the patient experiences choking episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.coughing_during_meals IS
    'Whether the patient coughs during or after meals: yes, no, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.salt_referral IS
    'Whether a SALT (Speech and Language Therapy) referral has been made: yes, no, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.dental_problems IS
    'Whether the patient has dental problems: yes, no, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.dental_problem_details IS
    'Details of dental problems if present.';
COMMENT ON COLUMN assessment_swallowing_oral_health.dentures IS
    'Whether the patient wears dentures: yes, no, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.dentures_fit_well IS
    'Whether dentures fit well: yes, no, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.oral_pain IS
    'Whether the patient has oral pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.dry_mouth IS
    'Whether the patient has dry mouth (xerostomia): yes, no, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.oral_thrush IS
    'Whether the patient has oral thrush (candidiasis): yes, no, or empty.';
COMMENT ON COLUMN assessment_swallowing_oral_health.swallowing_oral_notes IS
    'Additional clinician notes on swallowing and oral health.';
