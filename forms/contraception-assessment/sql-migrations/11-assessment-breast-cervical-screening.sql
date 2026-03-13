-- 11_assessment_breast_cervical_screening.sql
-- Breast and cervical screening section of the contraception assessment.

CREATE TABLE assessment_breast_cervical_screening (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    last_cervical_smear_date DATE,
    cervical_smear_result VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cervical_smear_result IN ('normal', 'abnormal', 'not-done', 'overdue', '')),
    cervical_smear_abnormality_details TEXT NOT NULL DEFAULT '',
    hpv_vaccination_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hpv_vaccination_status IN ('fully-vaccinated', 'partially-vaccinated', 'not-vaccinated', 'unknown', '')),
    breast_self_examination VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (breast_self_examination IN ('yes', 'no', '')),
    last_mammogram_date DATE,
    mammogram_result VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mammogram_result IN ('normal', 'abnormal', 'not-done', '')),
    mammogram_abnormality_details TEXT NOT NULL DEFAULT '',
    breast_lumps_or_changes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (breast_lumps_or_changes IN ('yes', 'no', '')),
    breast_change_details TEXT NOT NULL DEFAULT '',
    screening_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_breast_cervical_screening_updated_at
    BEFORE UPDATE ON assessment_breast_cervical_screening
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_breast_cervical_screening IS
    'Breast and cervical screening section: cervical smear, HPV vaccination, mammogram, breast examination. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_breast_cervical_screening.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_breast_cervical_screening.last_cervical_smear_date IS
    'Date of the most recent cervical smear.';
COMMENT ON COLUMN assessment_breast_cervical_screening.cervical_smear_result IS
    'Result of last cervical smear: normal, abnormal, not-done, overdue, or empty.';
COMMENT ON COLUMN assessment_breast_cervical_screening.cervical_smear_abnormality_details IS
    'Details of cervical smear abnormality if applicable.';
COMMENT ON COLUMN assessment_breast_cervical_screening.hpv_vaccination_status IS
    'HPV vaccination status: fully-vaccinated, partially-vaccinated, not-vaccinated, unknown, or empty.';
COMMENT ON COLUMN assessment_breast_cervical_screening.breast_self_examination IS
    'Whether the patient performs regular breast self-examination: yes, no, or empty.';
COMMENT ON COLUMN assessment_breast_cervical_screening.last_mammogram_date IS
    'Date of the most recent mammogram if applicable.';
COMMENT ON COLUMN assessment_breast_cervical_screening.mammogram_result IS
    'Result of last mammogram: normal, abnormal, not-done, or empty.';
COMMENT ON COLUMN assessment_breast_cervical_screening.mammogram_abnormality_details IS
    'Details of mammogram abnormality if applicable.';
COMMENT ON COLUMN assessment_breast_cervical_screening.breast_lumps_or_changes IS
    'Whether the patient has noticed breast lumps or changes: yes, no, or empty.';
COMMENT ON COLUMN assessment_breast_cervical_screening.breast_change_details IS
    'Details of breast lumps or changes.';
COMMENT ON COLUMN assessment_breast_cervical_screening.screening_notes IS
    'Additional clinician notes on screening.';
