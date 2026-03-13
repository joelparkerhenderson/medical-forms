-- 09_assessment_people_important_to_me.sql
-- People important to me section of the advance statement about care.

CREATE TABLE assessment_people_important_to_me (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    primary_contact_name VARCHAR(255) NOT NULL DEFAULT '',
    primary_contact_relationship VARCHAR(100) NOT NULL DEFAULT '',
    primary_contact_phone VARCHAR(30) NOT NULL DEFAULT '',
    primary_contact_email VARCHAR(255) NOT NULL DEFAULT '',
    secondary_contact_name VARCHAR(255) NOT NULL DEFAULT '',
    secondary_contact_relationship VARCHAR(100) NOT NULL DEFAULT '',
    secondary_contact_phone VARCHAR(30) NOT NULL DEFAULT '',
    people_who_should_visit TEXT NOT NULL DEFAULT '',
    people_who_should_not_visit TEXT NOT NULL DEFAULT '',
    support_network_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_people_important_to_me_updated_at
    BEFORE UPDATE ON assessment_people_important_to_me
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_people_important_to_me IS
    'People important to me section: key contacts, relationships, and visiting preferences. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_people_important_to_me.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_people_important_to_me.primary_contact_name IS
    'Full name of the primary contact person.';
COMMENT ON COLUMN assessment_people_important_to_me.primary_contact_relationship IS
    'Relationship of the primary contact to the person (e.g. spouse, child, friend).';
COMMENT ON COLUMN assessment_people_important_to_me.primary_contact_phone IS
    'Phone number of the primary contact.';
COMMENT ON COLUMN assessment_people_important_to_me.primary_contact_email IS
    'Email address of the primary contact.';
COMMENT ON COLUMN assessment_people_important_to_me.secondary_contact_name IS
    'Full name of the secondary contact person.';
COMMENT ON COLUMN assessment_people_important_to_me.secondary_contact_relationship IS
    'Relationship of the secondary contact to the person.';
COMMENT ON COLUMN assessment_people_important_to_me.secondary_contact_phone IS
    'Phone number of the secondary contact.';
COMMENT ON COLUMN assessment_people_important_to_me.people_who_should_visit IS
    'People the person would like to visit them.';
COMMENT ON COLUMN assessment_people_important_to_me.people_who_should_not_visit IS
    'People the person does not want to visit them.';
COMMENT ON COLUMN assessment_people_important_to_me.support_network_details IS
    'Details about the person wider support network.';
