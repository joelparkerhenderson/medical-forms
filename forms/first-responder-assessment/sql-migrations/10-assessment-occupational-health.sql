-- 10_assessment_occupational_health.sql
-- Occupational health section of the first responder assessment.

CREATE TABLE assessment_occupational_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    vision_test VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (vision_test IN ('pass', 'fail', 'refer', '')),
    vision_corrected VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vision_corrected IN ('yes', 'no', '')),
    hearing_test VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hearing_test IN ('pass', 'fail', 'refer', '')),
    hearing_aid_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hearing_aid_required IN ('yes', 'no', '')),
    immunisation_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (immunisation_status IN ('up-to-date', 'incomplete', 'unknown', '')),
    hepatitis_b_immune VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hepatitis_b_immune IN ('yes', 'no', '')),
    current_medications TEXT NOT NULL DEFAULT '',
    substance_misuse_screen VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (substance_misuse_screen IN ('negative', 'positive', 'not-done', '')),
    musculoskeletal_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (musculoskeletal_issues IN ('yes', 'no', '')),
    musculoskeletal_details TEXT NOT NULL DEFAULT '',
    respiratory_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (respiratory_issues IN ('yes', 'no', '')),
    respiratory_details TEXT NOT NULL DEFAULT '',
    skin_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (skin_conditions IN ('yes', 'no', '')),
    skin_condition_details TEXT NOT NULL DEFAULT '',
    sickness_absence_days INTEGER
        CHECK (sickness_absence_days IS NULL OR sickness_absence_days >= 0),
    occupational_health_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_occupational_health_updated_at
    BEFORE UPDATE ON assessment_occupational_health
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_occupational_health IS
    'Occupational health section: vision, hearing, immunisations, substance screening, musculoskeletal, respiratory, and sickness absence. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_occupational_health.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_occupational_health.vision_test IS
    'Vision test result: pass, fail, refer, or empty.';
COMMENT ON COLUMN assessment_occupational_health.vision_corrected IS
    'Whether the responder uses corrective lenses: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_health.hearing_test IS
    'Hearing test result: pass, fail, refer, or empty.';
COMMENT ON COLUMN assessment_occupational_health.hearing_aid_required IS
    'Whether a hearing aid is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_health.immunisation_status IS
    'Immunisation status: up-to-date, incomplete, unknown, or empty.';
COMMENT ON COLUMN assessment_occupational_health.hepatitis_b_immune IS
    'Whether the responder is hepatitis B immune: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_health.current_medications IS
    'Free-text list of current medications.';
COMMENT ON COLUMN assessment_occupational_health.substance_misuse_screen IS
    'Substance misuse screening result: negative, positive, not-done, or empty.';
COMMENT ON COLUMN assessment_occupational_health.musculoskeletal_issues IS
    'Whether the responder has musculoskeletal issues: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_health.musculoskeletal_details IS
    'Details of musculoskeletal issues.';
COMMENT ON COLUMN assessment_occupational_health.respiratory_issues IS
    'Whether the responder has respiratory issues: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_health.respiratory_details IS
    'Details of respiratory issues.';
COMMENT ON COLUMN assessment_occupational_health.skin_conditions IS
    'Whether the responder has skin conditions: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_health.skin_condition_details IS
    'Details of skin conditions.';
COMMENT ON COLUMN assessment_occupational_health.sickness_absence_days IS
    'Number of sickness absence days in the last 12 months.';
COMMENT ON COLUMN assessment_occupational_health.occupational_health_notes IS
    'Additional notes on occupational health assessment.';
