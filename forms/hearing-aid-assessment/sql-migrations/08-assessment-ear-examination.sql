-- 08_assessment_ear_examination.sql
-- Ear examination section of the hearing aid assessment.

CREATE TABLE assessment_ear_examination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    left_ear_canal VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (left_ear_canal IN ('normal', 'wax-impaction', 'infection', 'stenosis', 'other', '')),
    left_ear_canal_details TEXT NOT NULL DEFAULT '',
    right_ear_canal VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (right_ear_canal IN ('normal', 'wax-impaction', 'infection', 'stenosis', 'other', '')),
    right_ear_canal_details TEXT NOT NULL DEFAULT '',
    left_tympanic_membrane VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (left_tympanic_membrane IN ('normal', 'perforation', 'retraction', 'effusion', 'other', '')),
    left_tympanic_membrane_details TEXT NOT NULL DEFAULT '',
    right_tympanic_membrane VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (right_tympanic_membrane IN ('normal', 'perforation', 'retraction', 'effusion', 'other', '')),
    right_tympanic_membrane_details TEXT NOT NULL DEFAULT '',
    left_pinna VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (left_pinna IN ('normal', 'abnormal', '')),
    left_pinna_details TEXT NOT NULL DEFAULT '',
    right_pinna VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (right_pinna IN ('normal', 'abnormal', '')),
    right_pinna_details TEXT NOT NULL DEFAULT '',
    otoscopy_referral_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (otoscopy_referral_needed IN ('yes', 'no', '')),
    ear_examination_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_ear_examination_updated_at
    BEFORE UPDATE ON assessment_ear_examination
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_ear_examination IS
    'Ear examination section: ear canal, tympanic membrane, and pinna findings for both ears. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_ear_examination.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_ear_examination.left_ear_canal IS
    'Left ear canal finding: normal, wax-impaction, infection, stenosis, other, or empty string.';
COMMENT ON COLUMN assessment_ear_examination.left_ear_canal_details IS
    'Details of left ear canal finding.';
COMMENT ON COLUMN assessment_ear_examination.right_ear_canal IS
    'Right ear canal finding: normal, wax-impaction, infection, stenosis, other, or empty string.';
COMMENT ON COLUMN assessment_ear_examination.right_ear_canal_details IS
    'Details of right ear canal finding.';
COMMENT ON COLUMN assessment_ear_examination.left_tympanic_membrane IS
    'Left tympanic membrane finding: normal, perforation, retraction, effusion, other, or empty string.';
COMMENT ON COLUMN assessment_ear_examination.left_tympanic_membrane_details IS
    'Details of left tympanic membrane finding.';
COMMENT ON COLUMN assessment_ear_examination.right_tympanic_membrane IS
    'Right tympanic membrane finding: normal, perforation, retraction, effusion, other, or empty string.';
COMMENT ON COLUMN assessment_ear_examination.right_tympanic_membrane_details IS
    'Details of right tympanic membrane finding.';
COMMENT ON COLUMN assessment_ear_examination.left_pinna IS
    'Left pinna appearance: normal, abnormal, or empty string.';
COMMENT ON COLUMN assessment_ear_examination.left_pinna_details IS
    'Details of left pinna abnormality.';
COMMENT ON COLUMN assessment_ear_examination.right_pinna IS
    'Right pinna appearance: normal, abnormal, or empty string.';
COMMENT ON COLUMN assessment_ear_examination.right_pinna_details IS
    'Details of right pinna abnormality.';
COMMENT ON COLUMN assessment_ear_examination.otoscopy_referral_needed IS
    'Whether an ENT referral is needed based on otoscopy findings: yes, no, or empty string.';
COMMENT ON COLUMN assessment_ear_examination.ear_examination_notes IS
    'Free-text notes on ear examination.';
