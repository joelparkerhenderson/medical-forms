-- 09_assessment_diagnostic_results.sql
-- Diagnostic results section of the cardiology assessment.

CREATE TABLE assessment_diagnostic_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    ecg_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ecg_performed IN ('yes', 'no', '')),
    ecg_date DATE,
    ecg_findings TEXT NOT NULL DEFAULT '',
    ecg_rhythm VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (ecg_rhythm IN ('sinus', 'atrial-fibrillation', 'atrial-flutter', 'svt', 'vt', 'paced', 'other', '')),
    echocardiogram_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (echocardiogram_performed IN ('yes', 'no', '')),
    echocardiogram_date DATE,
    echocardiogram_findings TEXT NOT NULL DEFAULT '',
    lvef_percent NUMERIC(4,1)
        CHECK (lvef_percent IS NULL OR (lvef_percent >= 0 AND lvef_percent <= 100)),
    exercise_test_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exercise_test_performed IN ('yes', 'no', '')),
    exercise_test_date DATE,
    exercise_test_result VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (exercise_test_result IN ('positive', 'negative', 'equivocal', 'inconclusive', '')),
    exercise_test_details TEXT NOT NULL DEFAULT '',
    coronary_angiogram_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (coronary_angiogram_performed IN ('yes', 'no', '')),
    coronary_angiogram_date DATE,
    coronary_angiogram_findings TEXT NOT NULL DEFAULT '',
    ct_coronary_angiogram_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ct_coronary_angiogram_performed IN ('yes', 'no', '')),
    ct_coronary_angiogram_findings TEXT NOT NULL DEFAULT '',
    bnp_pg_ml NUMERIC(8,1)
        CHECK (bnp_pg_ml IS NULL OR bnp_pg_ml >= 0),
    troponin_ng_l NUMERIC(8,2)
        CHECK (troponin_ng_l IS NULL OR troponin_ng_l >= 0),
    diagnostic_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_diagnostic_results_updated_at
    BEFORE UPDATE ON assessment_diagnostic_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_diagnostic_results IS
    'Diagnostic results section: ECG, echocardiogram, exercise test, angiogram, and blood markers. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_diagnostic_results.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_diagnostic_results.ecg_performed IS
    'Whether an ECG was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_diagnostic_results.ecg_date IS
    'Date of the most recent ECG.';
COMMENT ON COLUMN assessment_diagnostic_results.ecg_findings IS
    'Free-text ECG findings.';
COMMENT ON COLUMN assessment_diagnostic_results.ecg_rhythm IS
    'ECG rhythm: sinus, atrial-fibrillation, atrial-flutter, svt, vt, paced, other, or empty.';
COMMENT ON COLUMN assessment_diagnostic_results.echocardiogram_performed IS
    'Whether an echocardiogram was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_diagnostic_results.echocardiogram_date IS
    'Date of the most recent echocardiogram.';
COMMENT ON COLUMN assessment_diagnostic_results.echocardiogram_findings IS
    'Free-text echocardiogram findings.';
COMMENT ON COLUMN assessment_diagnostic_results.lvef_percent IS
    'Left ventricular ejection fraction as percentage from echocardiogram.';
COMMENT ON COLUMN assessment_diagnostic_results.exercise_test_performed IS
    'Whether an exercise tolerance test was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_diagnostic_results.exercise_test_date IS
    'Date of the exercise test.';
COMMENT ON COLUMN assessment_diagnostic_results.exercise_test_result IS
    'Exercise test result: positive, negative, equivocal, inconclusive, or empty.';
COMMENT ON COLUMN assessment_diagnostic_results.exercise_test_details IS
    'Details of exercise test including duration, workload, and symptoms.';
COMMENT ON COLUMN assessment_diagnostic_results.coronary_angiogram_performed IS
    'Whether a coronary angiogram was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_diagnostic_results.coronary_angiogram_date IS
    'Date of the coronary angiogram.';
COMMENT ON COLUMN assessment_diagnostic_results.coronary_angiogram_findings IS
    'Findings from coronary angiogram.';
COMMENT ON COLUMN assessment_diagnostic_results.ct_coronary_angiogram_performed IS
    'Whether a CT coronary angiogram was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_diagnostic_results.ct_coronary_angiogram_findings IS
    'Findings from CT coronary angiogram.';
COMMENT ON COLUMN assessment_diagnostic_results.bnp_pg_ml IS
    'B-type natriuretic peptide level in pg/mL.';
COMMENT ON COLUMN assessment_diagnostic_results.troponin_ng_l IS
    'High-sensitivity troponin level in ng/L.';
COMMENT ON COLUMN assessment_diagnostic_results.diagnostic_notes IS
    'Additional clinician notes on diagnostic results.';
