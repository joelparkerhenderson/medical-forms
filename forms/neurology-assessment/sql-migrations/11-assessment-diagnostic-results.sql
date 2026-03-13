-- 11_assessment_diagnostic_results.sql
-- Diagnostic results section of the neurology assessment.

CREATE TABLE assessment_diagnostic_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    ct_head VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ct_head IN ('yes', 'no', '')),
    ct_head_date DATE,
    ct_head_result TEXT NOT NULL DEFAULT '',
    mri_brain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mri_brain IN ('yes', 'no', '')),
    mri_brain_date DATE,
    mri_brain_result TEXT NOT NULL DEFAULT '',
    ct_angiography VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ct_angiography IN ('yes', 'no', '')),
    ct_angiography_result TEXT NOT NULL DEFAULT '',
    mr_angiography VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mr_angiography IN ('yes', 'no', '')),
    mr_angiography_result TEXT NOT NULL DEFAULT '',
    eeg VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (eeg IN ('yes', 'no', '')),
    eeg_date DATE,
    eeg_result TEXT NOT NULL DEFAULT '',
    emg_nerve_conduction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (emg_nerve_conduction IN ('yes', 'no', '')),
    emg_result TEXT NOT NULL DEFAULT '',
    lumbar_puncture VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lumbar_puncture IN ('yes', 'no', '')),
    lumbar_puncture_result TEXT NOT NULL DEFAULT '',
    carotid_doppler VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carotid_doppler IN ('yes', 'no', '')),
    carotid_doppler_result TEXT NOT NULL DEFAULT '',
    blood_tests_relevant TEXT NOT NULL DEFAULT '',
    diagnostic_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_diagnostic_results_updated_at
    BEFORE UPDATE ON assessment_diagnostic_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_diagnostic_results IS
    'Diagnostic results section: neuroimaging (CT, MRI, angiography), EEG, EMG, lumbar puncture, and vascular studies. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_diagnostic_results.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_diagnostic_results.ct_head IS
    'Whether a CT head was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_diagnostic_results.ct_head_date IS
    'Date of the CT head scan.';
COMMENT ON COLUMN assessment_diagnostic_results.ct_head_result IS
    'Free-text CT head findings.';
COMMENT ON COLUMN assessment_diagnostic_results.mri_brain IS
    'Whether an MRI brain was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_diagnostic_results.mri_brain_date IS
    'Date of the MRI brain scan.';
COMMENT ON COLUMN assessment_diagnostic_results.mri_brain_result IS
    'Free-text MRI brain findings.';
COMMENT ON COLUMN assessment_diagnostic_results.ct_angiography IS
    'Whether CT angiography was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_diagnostic_results.ct_angiography_result IS
    'Free-text CT angiography findings.';
COMMENT ON COLUMN assessment_diagnostic_results.mr_angiography IS
    'Whether MR angiography was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_diagnostic_results.mr_angiography_result IS
    'Free-text MR angiography findings.';
COMMENT ON COLUMN assessment_diagnostic_results.eeg IS
    'Whether an EEG was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_diagnostic_results.eeg_date IS
    'Date of the EEG.';
COMMENT ON COLUMN assessment_diagnostic_results.eeg_result IS
    'Free-text EEG findings.';
COMMENT ON COLUMN assessment_diagnostic_results.emg_nerve_conduction IS
    'Whether EMG/nerve conduction studies were performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_diagnostic_results.emg_result IS
    'Free-text EMG and nerve conduction study findings.';
COMMENT ON COLUMN assessment_diagnostic_results.lumbar_puncture IS
    'Whether a lumbar puncture was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_diagnostic_results.lumbar_puncture_result IS
    'Free-text lumbar puncture (CSF analysis) findings.';
COMMENT ON COLUMN assessment_diagnostic_results.carotid_doppler IS
    'Whether carotid Doppler ultrasound was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_diagnostic_results.carotid_doppler_result IS
    'Free-text carotid Doppler findings.';
COMMENT ON COLUMN assessment_diagnostic_results.blood_tests_relevant IS
    'Free-text relevant blood test results (FBC, coagulation, inflammatory markers, etc.).';
COMMENT ON COLUMN assessment_diagnostic_results.diagnostic_notes IS
    'Free-text clinician notes on diagnostic investigations.';
