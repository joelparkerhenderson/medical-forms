-- 07_assessment_cervical_screening.sql
-- Cervical screening section of the gynaecology assessment.

CREATE TABLE assessment_cervical_screening (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    last_smear_date DATE,
    smear_result VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (smear_result IN ('normal', 'inadequate', 'low-grade-dyskaryosis', 'high-grade-dyskaryosis', 'invasive', 'never-had', '')),
    hpv_status VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hpv_status IN ('positive', 'negative', 'unknown', '')),
    hpv_vaccination VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hpv_vaccination IN ('yes', 'no', 'unknown', '')),
    colposcopy_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (colposcopy_history IN ('yes', 'no', '')),
    colposcopy_details TEXT NOT NULL DEFAULT '',
    cervical_treatment_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cervical_treatment_history IN ('yes', 'no', '')),
    cervical_treatment_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (cervical_treatment_type IN ('lletz', 'cone-biopsy', 'cryotherapy', 'other', '')),
    cervical_treatment_details TEXT NOT NULL DEFAULT '',
    screening_up_to_date VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (screening_up_to_date IN ('yes', 'no', '')),
    screening_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cervical_screening_updated_at
    BEFORE UPDATE ON assessment_cervical_screening
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cervical_screening IS
    'Cervical screening section: last smear, HPV status, colposcopy, and treatment history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cervical_screening.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cervical_screening.last_smear_date IS
    'Date of last cervical smear, NULL if never had or unanswered.';
COMMENT ON COLUMN assessment_cervical_screening.smear_result IS
    'Result of last smear: normal, inadequate, low-grade-dyskaryosis, high-grade-dyskaryosis, invasive, never-had, or empty string.';
COMMENT ON COLUMN assessment_cervical_screening.hpv_status IS
    'HPV test status: positive, negative, unknown, or empty string.';
COMMENT ON COLUMN assessment_cervical_screening.hpv_vaccination IS
    'Whether HPV vaccination has been received: yes, no, unknown, or empty string.';
COMMENT ON COLUMN assessment_cervical_screening.colposcopy_history IS
    'Whether the patient has had a colposcopy: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cervical_screening.colposcopy_details IS
    'Details of colposcopy findings.';
COMMENT ON COLUMN assessment_cervical_screening.cervical_treatment_history IS
    'Whether cervical treatment has been received: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cervical_screening.cervical_treatment_type IS
    'Type of cervical treatment: lletz, cone-biopsy, cryotherapy, other, or empty string.';
COMMENT ON COLUMN assessment_cervical_screening.cervical_treatment_details IS
    'Details of cervical treatment.';
COMMENT ON COLUMN assessment_cervical_screening.screening_up_to_date IS
    'Whether cervical screening is up to date: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cervical_screening.screening_notes IS
    'Free-text notes on cervical screening.';
