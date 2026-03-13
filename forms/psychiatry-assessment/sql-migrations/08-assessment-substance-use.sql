-- 08_assessment_substance_use.sql
-- Substance use section of the psychiatry assessment.

CREATE TABLE assessment_substance_use (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    alcohol_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_use IN ('none', 'social', 'hazardous', 'harmful', 'dependent', '')),
    alcohol_units_per_week INTEGER
        CHECK (alcohol_units_per_week IS NULL OR alcohol_units_per_week >= 0),
    audit_score INTEGER
        CHECK (audit_score IS NULL OR (audit_score >= 0 AND audit_score <= 40)),
    tobacco_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tobacco_use IN ('never', 'former', 'current', '')),
    cigarettes_per_day INTEGER
        CHECK (cigarettes_per_day IS NULL OR cigarettes_per_day >= 0),
    cannabis_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cannabis_use IN ('never', 'former', 'occasional', 'regular', 'daily', '')),
    stimulant_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stimulant_use IN ('yes', 'no', '')),
    stimulant_details TEXT NOT NULL DEFAULT '',
    opioid_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (opioid_use IN ('yes', 'no', '')),
    opioid_details TEXT NOT NULL DEFAULT '',
    benzodiazepine_misuse VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (benzodiazepine_misuse IN ('yes', 'no', '')),
    novel_psychoactive_substances VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (novel_psychoactive_substances IN ('yes', 'no', '')),
    iv_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (iv_drug_use IN ('yes', 'no', '')),
    previous_detox VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_detox IN ('yes', 'no', '')),
    previous_detox_details TEXT NOT NULL DEFAULT '',
    substance_use_impact TEXT NOT NULL DEFAULT '',
    motivation_to_change VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (motivation_to_change IN ('pre-contemplation', 'contemplation', 'preparation', 'action', 'maintenance', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_substance_use_updated_at
    BEFORE UPDATE ON assessment_substance_use
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_substance_use IS
    'Substance use section: alcohol, tobacco, cannabis, stimulants, opioids, benzodiazepines, IV drug use, and motivation to change. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_substance_use.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_substance_use.alcohol_use IS
    'Alcohol use pattern: none, social, hazardous, harmful, dependent, or empty.';
COMMENT ON COLUMN assessment_substance_use.alcohol_units_per_week IS
    'Estimated alcohol units consumed per week.';
COMMENT ON COLUMN assessment_substance_use.audit_score IS
    'AUDIT (Alcohol Use Disorders Identification Test) score (0-40).';
COMMENT ON COLUMN assessment_substance_use.tobacco_use IS
    'Tobacco use status: never, former, current, or empty.';
COMMENT ON COLUMN assessment_substance_use.cannabis_use IS
    'Cannabis use frequency: never, former, occasional, regular, daily, or empty.';
COMMENT ON COLUMN assessment_substance_use.stimulant_use IS
    'Whether the patient uses stimulants (cocaine, amphetamines).';
COMMENT ON COLUMN assessment_substance_use.opioid_use IS
    'Whether the patient uses opioids (prescribed or illicit).';
COMMENT ON COLUMN assessment_substance_use.benzodiazepine_misuse IS
    'Whether the patient misuses benzodiazepines.';
COMMENT ON COLUMN assessment_substance_use.iv_drug_use IS
    'Whether the patient uses intravenous drugs.';
COMMENT ON COLUMN assessment_substance_use.previous_detox IS
    'Whether the patient has undergone previous detoxification.';
COMMENT ON COLUMN assessment_substance_use.motivation_to_change IS
    'Stage of change (Prochaska model): pre-contemplation, contemplation, preparation, action, maintenance, or empty.';
