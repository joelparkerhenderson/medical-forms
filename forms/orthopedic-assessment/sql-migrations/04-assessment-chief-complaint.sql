-- 04_assessment_chief_complaint.sql
-- Chief complaint section of the orthopaedic assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    primary_complaint TEXT NOT NULL DEFAULT '',
    affected_region VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (affected_region IN ('shoulder', 'elbow', 'wrist', 'hand', 'hip', 'knee', 'ankle', 'foot', 'spine-cervical', 'spine-thoracic', 'spine-lumbar', 'other', '')),
    affected_side VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (affected_side IN ('left', 'right', 'bilateral', 'midline', '')),
    onset_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (onset_type IN ('acute-traumatic', 'acute-atraumatic', 'gradual', 'insidious', '')),
    onset_date DATE,
    mechanism_of_injury TEXT NOT NULL DEFAULT '',
    duration TEXT NOT NULL DEFAULT '',
    aggravating_factors TEXT NOT NULL DEFAULT '',
    relieving_factors TEXT NOT NULL DEFAULT '',
    previous_episodes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_episodes IN ('yes', 'no', '')),
    previous_episode_details TEXT NOT NULL DEFAULT '',
    work_related VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (work_related IN ('yes', 'no', '')),
    sport_related VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sport_related IN ('yes', 'no', '')),
    chief_complaint_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Chief complaint section: presenting problem, affected region, onset, and mechanism. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.primary_complaint IS
    'Primary reason for the orthopaedic consultation.';
COMMENT ON COLUMN assessment_chief_complaint.affected_region IS
    'Anatomical region affected: shoulder, elbow, wrist, hand, hip, knee, ankle, foot, spine regions, other, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.affected_side IS
    'Side affected: left, right, bilateral, midline, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.onset_type IS
    'Type of onset: acute-traumatic, acute-atraumatic, gradual, insidious, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.onset_date IS
    'Date of onset or injury.';
COMMENT ON COLUMN assessment_chief_complaint.mechanism_of_injury IS
    'Description of the mechanism of injury if traumatic.';
COMMENT ON COLUMN assessment_chief_complaint.duration IS
    'Duration of symptoms (free text).';
COMMENT ON COLUMN assessment_chief_complaint.aggravating_factors IS
    'Activities or positions that worsen symptoms.';
COMMENT ON COLUMN assessment_chief_complaint.relieving_factors IS
    'Activities or positions that relieve symptoms.';
COMMENT ON COLUMN assessment_chief_complaint.previous_episodes IS
    'Whether there have been previous episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.previous_episode_details IS
    'Details of previous episodes.';
COMMENT ON COLUMN assessment_chief_complaint.work_related IS
    'Whether the condition is work-related: yes, no, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.sport_related IS
    'Whether the condition is sport-related: yes, no, or empty.';
COMMENT ON COLUMN assessment_chief_complaint.chief_complaint_notes IS
    'Additional clinician notes on the chief complaint.';
