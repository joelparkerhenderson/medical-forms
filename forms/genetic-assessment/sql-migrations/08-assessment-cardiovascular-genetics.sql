-- 08_assessment_cardiovascular_genetics.sql
-- Cardiovascular genetics section of the genetic assessment.

CREATE TABLE assessment_cardiovascular_genetics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    family_history_sudden_cardiac_death VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_sudden_cardiac_death IN ('yes', 'no', '')),
    sudden_cardiac_death_details TEXT NOT NULL DEFAULT '',
    family_history_cardiomyopathy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_cardiomyopathy IN ('yes', 'no', '')),
    cardiomyopathy_type VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (cardiomyopathy_type IN ('hypertrophic', 'dilated', 'arrhythmogenic', 'restrictive', 'other', '')),
    cardiomyopathy_details TEXT NOT NULL DEFAULT '',
    family_history_aortopathy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_aortopathy IN ('yes', 'no', '')),
    aortopathy_details TEXT NOT NULL DEFAULT '',
    family_history_arrhythmia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_arrhythmia IN ('yes', 'no', '')),
    arrhythmia_type VARCHAR(100) NOT NULL DEFAULT '',
    family_history_familial_hypercholesterolaemia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_familial_hypercholesterolaemia IN ('yes', 'no', '')),
    cholesterol_level_mmol_l NUMERIC(4,1),
    connective_tissue_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (connective_tissue_disorder IN ('yes', 'no', '')),
    connective_tissue_details TEXT NOT NULL DEFAULT '',
    cardiovascular_risk_score INTEGER
        CHECK (cardiovascular_risk_score IS NULL OR (cardiovascular_risk_score >= 0 AND cardiovascular_risk_score <= 10)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cardiovascular_genetics_updated_at
    BEFORE UPDATE ON assessment_cardiovascular_genetics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiovascular_genetics IS
    'Cardiovascular genetics section: sudden cardiac death, cardiomyopathy, aortopathy, arrhythmia, FH, and connective tissue disorders. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cardiovascular_genetics.family_history_sudden_cardiac_death IS
    'Whether there is a family history of sudden cardiac death under age 40: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.sudden_cardiac_death_details IS
    'Details of sudden cardiac death events in the family.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.family_history_cardiomyopathy IS
    'Whether there is a family history of cardiomyopathy: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.cardiomyopathy_type IS
    'Type of cardiomyopathy: hypertrophic, dilated, arrhythmogenic, restrictive, other, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.cardiomyopathy_details IS
    'Details of cardiomyopathy diagnosis.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.family_history_aortopathy IS
    'Whether there is a family history of aortopathy (e.g. Marfan syndrome): yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.aortopathy_details IS
    'Details of aortopathy.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.family_history_arrhythmia IS
    'Whether there is a family history of inherited arrhythmia syndromes: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.arrhythmia_type IS
    'Type of arrhythmia (e.g. Long QT, Brugada syndrome).';
COMMENT ON COLUMN assessment_cardiovascular_genetics.family_history_familial_hypercholesterolaemia IS
    'Whether there is a family history of familial hypercholesterolaemia: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.cholesterol_level_mmol_l IS
    'Total cholesterol level in mmol/L, NULL if unanswered.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.connective_tissue_disorder IS
    'Whether there is a suspected connective tissue disorder: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.connective_tissue_details IS
    'Details of connective tissue disorder.';
COMMENT ON COLUMN assessment_cardiovascular_genetics.cardiovascular_risk_score IS
    'Computed cardiovascular genetics risk sub-score, NULL if not yet scored.';
