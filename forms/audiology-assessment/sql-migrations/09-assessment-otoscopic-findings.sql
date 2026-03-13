-- 09_assessment_otoscopic_findings.sql
-- Otoscopic findings section of the audiology assessment.

CREATE TABLE assessment_otoscopic_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    right_ear_canal VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (right_ear_canal IN ('normal', 'occluded', 'inflamed', 'exostosis', 'other', '')),
    right_ear_canal_notes TEXT NOT NULL DEFAULT '',
    right_tympanic_membrane VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (right_tympanic_membrane IN ('normal', 'retracted', 'bulging', 'perforated', 'scarred', 'other', '')),
    right_tympanic_membrane_notes TEXT NOT NULL DEFAULT '',
    right_cerumen VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (right_cerumen IN ('none', 'partial', 'occluding', '')),

    left_ear_canal VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (left_ear_canal IN ('normal', 'occluded', 'inflamed', 'exostosis', 'other', '')),
    left_ear_canal_notes TEXT NOT NULL DEFAULT '',
    left_tympanic_membrane VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (left_tympanic_membrane IN ('normal', 'retracted', 'bulging', 'perforated', 'scarred', 'other', '')),
    left_tympanic_membrane_notes TEXT NOT NULL DEFAULT '',
    left_cerumen VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (left_cerumen IN ('none', 'partial', 'occluding', '')),

    otoscopy_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_otoscopic_findings_updated_at
    BEFORE UPDATE ON assessment_otoscopic_findings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_otoscopic_findings IS
    'Otoscopic findings section: visual examination of ear canals and tympanic membranes for both ears. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_otoscopic_findings.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_otoscopic_findings.right_ear_canal IS
    'Right ear canal status: normal, occluded, inflamed, exostosis, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_otoscopic_findings.right_ear_canal_notes IS
    'Additional notes about the right ear canal.';
COMMENT ON COLUMN assessment_otoscopic_findings.right_tympanic_membrane IS
    'Right tympanic membrane status: normal, retracted, bulging, perforated, scarred, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_otoscopic_findings.right_tympanic_membrane_notes IS
    'Additional notes about the right tympanic membrane.';
COMMENT ON COLUMN assessment_otoscopic_findings.right_cerumen IS
    'Right ear cerumen (wax) status: none, partial, occluding, or empty string if unanswered.';
COMMENT ON COLUMN assessment_otoscopic_findings.left_ear_canal IS
    'Left ear canal status: normal, occluded, inflamed, exostosis, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_otoscopic_findings.left_ear_canal_notes IS
    'Additional notes about the left ear canal.';
COMMENT ON COLUMN assessment_otoscopic_findings.left_tympanic_membrane IS
    'Left tympanic membrane status: normal, retracted, bulging, perforated, scarred, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_otoscopic_findings.left_tympanic_membrane_notes IS
    'Additional notes about the left tympanic membrane.';
COMMENT ON COLUMN assessment_otoscopic_findings.left_cerumen IS
    'Left ear cerumen (wax) status: none, partial, occluding, or empty string if unanswered.';
COMMENT ON COLUMN assessment_otoscopic_findings.otoscopy_notes IS
    'General notes from otoscopic examination.';
