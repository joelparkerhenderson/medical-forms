-- 09_assessment_uniform_id_badge.sql
-- Uniform and ID badge section of the onboarding assessment.

CREATE TABLE assessment_uniform_id_badge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    uniform_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uniform_required IN ('yes', 'no', '')),
    uniform_ordered VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uniform_ordered IN ('yes', 'no', '')),
    uniform_received VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uniform_received IN ('yes', 'no', '')),
    uniform_size VARCHAR(20) NOT NULL DEFAULT '',
    id_badge_photo_taken VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (id_badge_photo_taken IN ('yes', 'no', '')),
    id_badge_issued VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (id_badge_issued IN ('yes', 'no', '')),
    id_badge_number VARCHAR(50) NOT NULL DEFAULT '',
    access_card_issued VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (access_card_issued IN ('yes', 'no', '')),
    access_card_areas TEXT NOT NULL DEFAULT '',
    locker_allocated VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (locker_allocated IN ('yes', 'no', '')),
    locker_number VARCHAR(20) NOT NULL DEFAULT '',
    uniform_id_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_uniform_id_badge_updated_at
    BEFORE UPDATE ON assessment_uniform_id_badge
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_uniform_id_badge IS
    'Uniform and ID badge section: uniform ordering, ID badge, access cards, locker. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_uniform_id_badge.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_uniform_id_badge.uniform_required IS
    'Whether a uniform is required for this role: yes, no, or empty.';
COMMENT ON COLUMN assessment_uniform_id_badge.uniform_ordered IS
    'Whether the uniform has been ordered: yes, no, or empty.';
COMMENT ON COLUMN assessment_uniform_id_badge.uniform_received IS
    'Whether the uniform has been received: yes, no, or empty.';
COMMENT ON COLUMN assessment_uniform_id_badge.uniform_size IS
    'Uniform size requested.';
COMMENT ON COLUMN assessment_uniform_id_badge.id_badge_photo_taken IS
    'Whether an ID badge photo has been taken: yes, no, or empty.';
COMMENT ON COLUMN assessment_uniform_id_badge.id_badge_issued IS
    'Whether the ID badge has been issued: yes, no, or empty.';
COMMENT ON COLUMN assessment_uniform_id_badge.id_badge_number IS
    'ID badge number.';
COMMENT ON COLUMN assessment_uniform_id_badge.access_card_issued IS
    'Whether a building access card has been issued: yes, no, or empty.';
COMMENT ON COLUMN assessment_uniform_id_badge.access_card_areas IS
    'Areas the access card grants entry to.';
COMMENT ON COLUMN assessment_uniform_id_badge.locker_allocated IS
    'Whether a locker has been allocated: yes, no, or empty.';
COMMENT ON COLUMN assessment_uniform_id_badge.locker_number IS
    'Locker number allocated.';
COMMENT ON COLUMN assessment_uniform_id_badge.uniform_id_notes IS
    'Additional notes on uniform and ID badge.';
