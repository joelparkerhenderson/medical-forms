CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    takes_regular_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_regular_medications IN ('yes', 'no', '')),
    current_hrt VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_hrt IN ('yes', 'no', '')),
    current_hrt_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (current_hrt_type IN ('oestrogen-only', 'combined', 'tibolone', 'local-oestrogen', '')),
    current_hrt_route VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (current_hrt_route IN ('oral', 'transdermal-patch', 'transdermal-gel', 'vaginal', 'implant', '')),
    current_hrt_duration VARCHAR(50) NOT NULL DEFAULT '',
    previous_hrt VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_hrt IN ('yes', 'no', '')),
    previous_hrt_details TEXT NOT NULL DEFAULT '',
    reason_for_stopping_hrt TEXT NOT NULL DEFAULT '',
    takes_herbal_supplements VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_herbal_supplements IN ('yes', 'no', '')),
    herbal_supplement_details TEXT NOT NULL DEFAULT '',
    takes_anticoagulants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_anticoagulants IN ('yes', 'no', '')),
    anticoagulant_details TEXT NOT NULL DEFAULT '',
    medication_notes TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Individual medication entries (one-to-many child)

COMMENT ON TABLE assessment_current_medications IS
    'Assessment current medications.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_current_medications.takes_regular_medications IS
    'Takes regular medications. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.current_hrt IS
    'Current hrt. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.current_hrt_type IS
    'Current hrt type. One of: oestrogen-only, combined, tibolone, local-oestrogen.';
COMMENT ON COLUMN assessment_current_medications.current_hrt_route IS
    'Current hrt route. One of: oral, transdermal-patch, transdermal-gel, vaginal, implant.';
COMMENT ON COLUMN assessment_current_medications.current_hrt_duration IS
    'Current hrt duration.';
COMMENT ON COLUMN assessment_current_medications.previous_hrt IS
    'Previous hrt. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.previous_hrt_details IS
    'Previous hrt details.';
COMMENT ON COLUMN assessment_current_medications.reason_for_stopping_hrt IS
    'Reason for stopping hrt.';
COMMENT ON COLUMN assessment_current_medications.takes_herbal_supplements IS
    'Takes herbal supplements. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.herbal_supplement_details IS
    'Herbal supplement details.';
COMMENT ON COLUMN assessment_current_medications.takes_anticoagulants IS
    'Takes anticoagulants. One of: yes, no.';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_details IS
    'Anticoagulant details.';
COMMENT ON COLUMN assessment_current_medications.medication_notes IS
    'Medication notes.';
COMMENT ON COLUMN assessment_current_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_current_medications.deleted_at IS
    'Timestamp when this row was deleted.';
