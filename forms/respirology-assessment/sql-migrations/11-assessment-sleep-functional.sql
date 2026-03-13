-- 11_assessment_sleep_functional.sql
-- Sleep and functional section of the respirology assessment.

CREATE TABLE assessment_sleep_functional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    sleep_quality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sleep_quality IN ('good', 'fair', 'poor', '')),
    snoring VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (snoring IN ('yes', 'no', '')),
    witnessed_apnoeas VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (witnessed_apnoeas IN ('yes', 'no', '')),
    daytime_sleepiness VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (daytime_sleepiness IN ('none', 'mild', 'moderate', 'severe', '')),
    epworth_sleepiness_score INTEGER
        CHECK (epworth_sleepiness_score IS NULL OR (epworth_sleepiness_score >= 0 AND epworth_sleepiness_score <= 24)),
    sleep_study_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sleep_study_performed IN ('yes', 'no', '')),
    osa_diagnosed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (osa_diagnosed IN ('yes', 'no', '')),
    cpap_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cpap_use IN ('yes', 'no', '')),
    cpap_compliance VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cpap_compliance IN ('good', 'fair', 'poor', '')),
    adl_independence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (adl_independence IN ('independent', 'some-assistance', 'dependent', '')),
    mobility_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mobility_level IN ('unrestricted', 'limited', 'housebound', 'bedbound', '')),
    employment_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_impact IN ('none', 'reduced-hours', 'unable-to-work', 'retired', '')),
    exercise_tolerance TEXT NOT NULL DEFAULT '',
    quality_of_life_impact VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (quality_of_life_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    pulmonary_rehabilitation VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (pulmonary_rehabilitation IN ('completed', 'ongoing', 'declined', 'not-offered', '')),
    advance_care_planning VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (advance_care_planning IN ('yes', 'no', '')),
    advance_care_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sleep_functional_updated_at
    BEFORE UPDATE ON assessment_sleep_functional
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sleep_functional IS
    'Sleep and functional section: sleep quality, OSA screening, CPAP compliance, ADL, mobility, and quality of life. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sleep_functional.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sleep_functional.sleep_quality IS
    'Overall sleep quality: good, fair, poor, or empty.';
COMMENT ON COLUMN assessment_sleep_functional.snoring IS
    'Whether the patient snores.';
COMMENT ON COLUMN assessment_sleep_functional.witnessed_apnoeas IS
    'Whether bed partner has witnessed apnoea episodes.';
COMMENT ON COLUMN assessment_sleep_functional.daytime_sleepiness IS
    'Severity of daytime sleepiness: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_sleep_functional.epworth_sleepiness_score IS
    'Epworth Sleepiness Scale score (0-24). Score >=10 suggests excessive daytime sleepiness.';
COMMENT ON COLUMN assessment_sleep_functional.osa_diagnosed IS
    'Whether obstructive sleep apnoea has been diagnosed.';
COMMENT ON COLUMN assessment_sleep_functional.cpap_use IS
    'Whether the patient uses CPAP therapy.';
COMMENT ON COLUMN assessment_sleep_functional.cpap_compliance IS
    'CPAP compliance: good, fair, poor, or empty.';
COMMENT ON COLUMN assessment_sleep_functional.adl_independence IS
    'Independence in activities of daily living: independent, some-assistance, dependent, or empty.';
COMMENT ON COLUMN assessment_sleep_functional.mobility_level IS
    'Mobility level: unrestricted, limited, housebound, bedbound, or empty.';
COMMENT ON COLUMN assessment_sleep_functional.quality_of_life_impact IS
    'Impact of respiratory symptoms on quality of life: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_sleep_functional.pulmonary_rehabilitation IS
    'Pulmonary rehabilitation status: completed, ongoing, declined, not-offered, or empty.';
COMMENT ON COLUMN assessment_sleep_functional.advance_care_planning IS
    'Whether advance care planning has been discussed.';
