-- 08-assessment-respiratory.sql
-- Step 6: respiratory examination and investigations.

CREATE TABLE assessment_respiratory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    breath_sounds VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (breath_sounds IN ('normal', 'reduced', 'bronchial', 'silent', '')),
    wheeze VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wheeze IN ('yes', 'no', '')),
    crackles VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (crackles IN ('yes', 'no', '')),
    crepitations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (crepitations IN ('yes', 'no', '')),
    chest_wall_deformity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chest_wall_deformity IN ('yes', 'no', '')),

    asthma VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (asthma IN ('none', 'controlled', 'uncontrolled', '')),
    copd VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (copd IN ('none', 'mild', 'moderate', 'severe', '')),

    cxr_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cxr_performed IN ('yes', 'no', '')),
    cxr_findings TEXT NOT NULL DEFAULT '',
    pft_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pft_performed IN ('yes', 'no', '')),
    pft_fev1_percent_predicted NUMERIC(4,1),
    pft_fev1_fvc_ratio NUMERIC(3,2),

    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('never', 'ex', 'current', '')),
    pack_years NUMERIC(5,1),

    covid_history VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (covid_history IN ('never', 'recovered', 'recent', 'long-covid', '')),
    days_since_covid INTEGER,
    covid_unresolved_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (covid_unresolved_symptoms IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_respiratory_updated_at
    BEFORE UPDATE ON assessment_respiratory
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_respiratory IS
    'Step 6: respiratory examination, asthma / COPD assessment, PFT and CXR summary, smoking status, and COVID-19 history.';
COMMENT ON COLUMN assessment_respiratory.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_respiratory.breath_sounds IS
    'Breath sounds on auscultation: normal, reduced, bronchial, silent.';
COMMENT ON COLUMN assessment_respiratory.wheeze IS
    'Presence of wheeze on auscultation.';
COMMENT ON COLUMN assessment_respiratory.crackles IS
    'Presence of crackles.';
COMMENT ON COLUMN assessment_respiratory.crepitations IS
    'Presence of crepitations.';
COMMENT ON COLUMN assessment_respiratory.chest_wall_deformity IS
    'Presence of chest-wall deformity.';
COMMENT ON COLUMN assessment_respiratory.asthma IS
    'Asthma status: none, controlled, uncontrolled.';
COMMENT ON COLUMN assessment_respiratory.copd IS
    'COPD severity: none, mild, moderate, severe.';
COMMENT ON COLUMN assessment_respiratory.cxr_performed IS
    'Whether a chest X-ray was performed or reviewed.';
COMMENT ON COLUMN assessment_respiratory.cxr_findings IS
    'Free-text CXR findings.';
COMMENT ON COLUMN assessment_respiratory.pft_performed IS
    'Whether pulmonary function tests were performed or reviewed.';
COMMENT ON COLUMN assessment_respiratory.pft_fev1_percent_predicted IS
    'FEV1 as percent of predicted.';
COMMENT ON COLUMN assessment_respiratory.pft_fev1_fvc_ratio IS
    'FEV1/FVC ratio (0.00 to 1.00).';
COMMENT ON COLUMN assessment_respiratory.smoking_status IS
    'Smoking status: never, ex, current.';
COMMENT ON COLUMN assessment_respiratory.pack_years IS
    'Cumulative pack-years of smoking.';
COMMENT ON COLUMN assessment_respiratory.covid_history IS
    'COVID-19 history category: never, recovered, recent, long-covid.';
COMMENT ON COLUMN assessment_respiratory.days_since_covid IS
    'Days since last acute COVID-19 infection.';
COMMENT ON COLUMN assessment_respiratory.covid_unresolved_symptoms IS
    'Whether the patient has unresolved COVID-19 symptoms.';
