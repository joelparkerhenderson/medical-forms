-- 04_assessment_donor_type_registration.sql
-- Donor type and registration section of the organ donation assessment.

CREATE TABLE assessment_donor_type_registration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    donor_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (donor_type IN ('living', 'deceased-dbd', 'deceased-dcd', '')),
    registered_donor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (registered_donor IN ('yes', 'no', '')),
    organ_donor_register_checked VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (organ_donor_register_checked IN ('yes', 'no', '')),
    advance_directive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (advance_directive IN ('yes', 'no', '')),
    advance_directive_details TEXT NOT NULL DEFAULT '',
    organs_offered TEXT NOT NULL DEFAULT '',
    relationship_to_recipient VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (relationship_to_recipient IN ('spouse', 'parent', 'sibling', 'child', 'friend', 'altruistic', 'paired-exchange', 'other', '')),
    cause_of_death VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (cause_of_death IN ('traumatic-brain-injury', 'stroke', 'cardiac-arrest', 'anoxic-brain-injury', 'other', '')),
    cause_of_death_details TEXT NOT NULL DEFAULT '',
    time_of_death TIMESTAMPTZ,
    warm_ischaemia_minutes INTEGER
        CHECK (warm_ischaemia_minutes IS NULL OR warm_ischaemia_minutes >= 0),
    donor_type_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_donor_type_registration_updated_at
    BEFORE UPDATE ON assessment_donor_type_registration
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_donor_type_registration IS
    'Donor type and registration section: living vs deceased, organ donor register status, advance directive. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_donor_type_registration.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_donor_type_registration.donor_type IS
    'Type of donation: living, deceased-dbd (donation after brainstem death), deceased-dcd (donation after circulatory death), or empty.';
COMMENT ON COLUMN assessment_donor_type_registration.registered_donor IS
    'Whether the donor is on the organ donor register: yes, no, or empty.';
COMMENT ON COLUMN assessment_donor_type_registration.organ_donor_register_checked IS
    'Whether the organ donor register has been checked: yes, no, or empty.';
COMMENT ON COLUMN assessment_donor_type_registration.advance_directive IS
    'Whether the donor has an advance directive regarding organ donation: yes, no, or empty.';
COMMENT ON COLUMN assessment_donor_type_registration.advance_directive_details IS
    'Details of the advance directive if applicable.';
COMMENT ON COLUMN assessment_donor_type_registration.organs_offered IS
    'Organs being offered for donation (comma-separated or free text).';
COMMENT ON COLUMN assessment_donor_type_registration.relationship_to_recipient IS
    'Relationship of living donor to recipient: spouse, parent, sibling, child, friend, altruistic, paired-exchange, other, or empty.';
COMMENT ON COLUMN assessment_donor_type_registration.cause_of_death IS
    'Cause of death for deceased donors: traumatic-brain-injury, stroke, cardiac-arrest, anoxic-brain-injury, other, or empty.';
COMMENT ON COLUMN assessment_donor_type_registration.cause_of_death_details IS
    'Additional details about cause of death.';
COMMENT ON COLUMN assessment_donor_type_registration.time_of_death IS
    'Time of death for deceased donors.';
COMMENT ON COLUMN assessment_donor_type_registration.warm_ischaemia_minutes IS
    'Warm ischaemia time in minutes for DCD donors.';
COMMENT ON COLUMN assessment_donor_type_registration.donor_type_notes IS
    'Additional clinician notes on donor type and registration.';
