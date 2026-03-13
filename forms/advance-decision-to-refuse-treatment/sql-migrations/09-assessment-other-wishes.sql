-- 09_assessment_other_wishes.sql
-- Other wishes section of the advance decision to refuse treatment.

CREATE TABLE assessment_other_wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    preferred_place_of_care TEXT NOT NULL DEFAULT '',
    preferred_place_of_death TEXT NOT NULL DEFAULT '',
    spiritual_or_religious_wishes TEXT NOT NULL DEFAULT '',
    organ_donation_wishes VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (organ_donation_wishes IN ('yes', 'no', 'undecided', '')),
    organ_donation_details TEXT NOT NULL DEFAULT '',
    other_wishes TEXT NOT NULL DEFAULT '',
    people_to_notify TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_other_wishes_updated_at
    BEFORE UPDATE ON assessment_other_wishes
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_other_wishes IS
    'Other wishes section: non-binding preferences about care, death, and personal matters. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_other_wishes.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_other_wishes.preferred_place_of_care IS
    'Where the person would prefer to receive care (e.g. home, hospice).';
COMMENT ON COLUMN assessment_other_wishes.preferred_place_of_death IS
    'Where the person would prefer to die (e.g. home, hospice).';
COMMENT ON COLUMN assessment_other_wishes.spiritual_or_religious_wishes IS
    'Spiritual or religious considerations the person wishes to be respected.';
COMMENT ON COLUMN assessment_other_wishes.organ_donation_wishes IS
    'Whether the person wishes to donate organs: yes, no, undecided, or empty string if unanswered.';
COMMENT ON COLUMN assessment_other_wishes.organ_donation_details IS
    'Additional details about organ donation preferences.';
COMMENT ON COLUMN assessment_other_wishes.other_wishes IS
    'Any other wishes the person wants recorded alongside this advance decision.';
COMMENT ON COLUMN assessment_other_wishes.people_to_notify IS
    'People the person wants to be notified if this advance decision is invoked.';
