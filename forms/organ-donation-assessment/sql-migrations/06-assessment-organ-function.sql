-- 06_assessment_organ_function.sql
-- Organ function assessment section of the organ donation assessment.

CREATE TABLE assessment_organ_function (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Renal function
    serum_creatinine NUMERIC(6,2)
        CHECK (serum_creatinine IS NULL OR serum_creatinine >= 0),
    egfr NUMERIC(6,1)
        CHECK (egfr IS NULL OR egfr >= 0),
    proteinuria VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (proteinuria IN ('yes', 'no', '')),
    renal_ultrasound_normal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (renal_ultrasound_normal IN ('yes', 'no', '')),
    renal_ultrasound_findings TEXT NOT NULL DEFAULT '',

    -- Hepatic function
    alt NUMERIC(6,1)
        CHECK (alt IS NULL OR alt >= 0),
    ast NUMERIC(6,1)
        CHECK (ast IS NULL OR ast >= 0),
    bilirubin NUMERIC(6,1)
        CHECK (bilirubin IS NULL OR bilirubin >= 0),
    albumin NUMERIC(5,1)
        CHECK (albumin IS NULL OR albumin >= 0),
    inr NUMERIC(4,2)
        CHECK (inr IS NULL OR inr >= 0),
    liver_steatosis VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (liver_steatosis IN ('none', 'mild', 'moderate', 'severe', '')),

    -- Cardiac function
    ecg_normal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ecg_normal IN ('yes', 'no', '')),
    ecg_findings TEXT NOT NULL DEFAULT '',
    echo_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (echo_performed IN ('yes', 'no', '')),
    lvef NUMERIC(5,1)
        CHECK (lvef IS NULL OR (lvef >= 0 AND lvef <= 100)),
    echo_findings TEXT NOT NULL DEFAULT '',
    troponin NUMERIC(8,3)
        CHECK (troponin IS NULL OR troponin >= 0),

    -- Pulmonary function
    pao2 NUMERIC(5,1)
        CHECK (pao2 IS NULL OR pao2 >= 0),
    fio2 NUMERIC(4,2)
        CHECK (fio2 IS NULL OR (fio2 >= 0 AND fio2 <= 1)),
    pf_ratio NUMERIC(5,1)
        CHECK (pf_ratio IS NULL OR pf_ratio >= 0),
    chest_xray_normal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chest_xray_normal IN ('yes', 'no', '')),
    chest_xray_findings TEXT NOT NULL DEFAULT '',
    bronchoscopy_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bronchoscopy_performed IN ('yes', 'no', '')),
    bronchoscopy_findings TEXT NOT NULL DEFAULT '',

    organ_function_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_organ_function_updated_at
    BEFORE UPDATE ON assessment_organ_function
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_organ_function IS
    'Organ function assessment section: renal, hepatic, cardiac, and pulmonary function tests. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_organ_function.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_organ_function.serum_creatinine IS
    'Serum creatinine in micromol/L.';
COMMENT ON COLUMN assessment_organ_function.egfr IS
    'Estimated glomerular filtration rate in mL/min/1.73m2.';
COMMENT ON COLUMN assessment_organ_function.proteinuria IS
    'Whether proteinuria is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_organ_function.renal_ultrasound_normal IS
    'Whether renal ultrasound is normal: yes, no, or empty.';
COMMENT ON COLUMN assessment_organ_function.renal_ultrasound_findings IS
    'Renal ultrasound findings if abnormal.';
COMMENT ON COLUMN assessment_organ_function.alt IS
    'Alanine transaminase in U/L.';
COMMENT ON COLUMN assessment_organ_function.ast IS
    'Aspartate transaminase in U/L.';
COMMENT ON COLUMN assessment_organ_function.bilirubin IS
    'Total bilirubin in micromol/L.';
COMMENT ON COLUMN assessment_organ_function.albumin IS
    'Serum albumin in g/L.';
COMMENT ON COLUMN assessment_organ_function.inr IS
    'International normalised ratio.';
COMMENT ON COLUMN assessment_organ_function.liver_steatosis IS
    'Degree of liver steatosis: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_organ_function.ecg_normal IS
    'Whether ECG is normal: yes, no, or empty.';
COMMENT ON COLUMN assessment_organ_function.ecg_findings IS
    'ECG findings if abnormal.';
COMMENT ON COLUMN assessment_organ_function.echo_performed IS
    'Whether echocardiogram was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_organ_function.lvef IS
    'Left ventricular ejection fraction percentage.';
COMMENT ON COLUMN assessment_organ_function.echo_findings IS
    'Echocardiogram findings.';
COMMENT ON COLUMN assessment_organ_function.troponin IS
    'Troponin level in ng/mL.';
COMMENT ON COLUMN assessment_organ_function.pao2 IS
    'Arterial partial pressure of oxygen in kPa.';
COMMENT ON COLUMN assessment_organ_function.fio2 IS
    'Fraction of inspired oxygen (0-1).';
COMMENT ON COLUMN assessment_organ_function.pf_ratio IS
    'PaO2/FiO2 ratio (P/F ratio).';
COMMENT ON COLUMN assessment_organ_function.chest_xray_normal IS
    'Whether chest X-ray is normal: yes, no, or empty.';
COMMENT ON COLUMN assessment_organ_function.chest_xray_findings IS
    'Chest X-ray findings if abnormal.';
COMMENT ON COLUMN assessment_organ_function.bronchoscopy_performed IS
    'Whether bronchoscopy was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_organ_function.bronchoscopy_findings IS
    'Bronchoscopy findings.';
COMMENT ON COLUMN assessment_organ_function.organ_function_notes IS
    'Additional clinician notes on organ function.';
