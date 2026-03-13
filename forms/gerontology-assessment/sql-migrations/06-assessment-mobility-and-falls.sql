-- 06_assessment_mobility_and_falls.sql
-- Mobility and falls section of the gerontology assessment.

CREATE TABLE assessment_mobility_and_falls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    mobility_level VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (mobility_level IN ('fully-mobile', 'mobile-with-aid', 'mobile-with-assistance', 'wheelchair', 'bed-bound', '')),
    mobility_aid_type VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (mobility_aid_type IN ('walking-stick', 'zimmer-frame', 'rollator', 'wheelchair', 'none', '')),
    gait_abnormality VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gait_abnormality IN ('yes', 'no', '')),
    gait_abnormality_details TEXT NOT NULL DEFAULT '',
    timed_up_and_go_seconds NUMERIC(5,1)
        CHECK (timed_up_and_go_seconds IS NULL OR timed_up_and_go_seconds >= 0),
    history_of_falls VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_falls IN ('yes', 'no', '')),
    falls_in_last_12_months INTEGER
        CHECK (falls_in_last_12_months IS NULL OR falls_in_last_12_months >= 0),
    fall_related_injury VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fall_related_injury IN ('yes', 'no', '')),
    fall_injury_details TEXT NOT NULL DEFAULT '',
    fear_of_falling VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fear_of_falling IN ('yes', 'no', '')),
    balance_impairment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (balance_impairment IN ('yes', 'no', '')),
    postural_hypotension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (postural_hypotension IN ('yes', 'no', '')),
    home_hazards_identified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (home_hazards_identified IN ('yes', 'no', '')),
    home_hazard_details TEXT NOT NULL DEFAULT '',
    mobility_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_mobility_and_falls_updated_at
    BEFORE UPDATE ON assessment_mobility_and_falls
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_mobility_and_falls IS
    'Mobility and falls section: mobility level, gait, Timed Up and Go, fall history, and home hazards. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_mobility_and_falls.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_mobility_and_falls.mobility_level IS
    'Overall mobility level: fully-mobile, mobile-with-aid, mobile-with-assistance, wheelchair, bed-bound, or empty string.';
COMMENT ON COLUMN assessment_mobility_and_falls.mobility_aid_type IS
    'Type of mobility aid used: walking-stick, zimmer-frame, rollator, wheelchair, none, or empty string.';
COMMENT ON COLUMN assessment_mobility_and_falls.gait_abnormality IS
    'Whether a gait abnormality is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_mobility_and_falls.gait_abnormality_details IS
    'Details of gait abnormality.';
COMMENT ON COLUMN assessment_mobility_and_falls.timed_up_and_go_seconds IS
    'Timed Up and Go test result in seconds, NULL if not performed.';
COMMENT ON COLUMN assessment_mobility_and_falls.history_of_falls IS
    'Whether there is a history of falls: yes, no, or empty string.';
COMMENT ON COLUMN assessment_mobility_and_falls.falls_in_last_12_months IS
    'Number of falls in the last 12 months, NULL if unanswered.';
COMMENT ON COLUMN assessment_mobility_and_falls.fall_related_injury IS
    'Whether any fall resulted in injury: yes, no, or empty string.';
COMMENT ON COLUMN assessment_mobility_and_falls.fall_injury_details IS
    'Details of fall-related injuries (e.g. fracture, head injury).';
COMMENT ON COLUMN assessment_mobility_and_falls.fear_of_falling IS
    'Whether the patient has a fear of falling: yes, no, or empty string.';
COMMENT ON COLUMN assessment_mobility_and_falls.balance_impairment IS
    'Whether balance impairment is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_mobility_and_falls.postural_hypotension IS
    'Whether postural hypotension is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_mobility_and_falls.home_hazards_identified IS
    'Whether home hazards have been identified: yes, no, or empty string.';
COMMENT ON COLUMN assessment_mobility_and_falls.home_hazard_details IS
    'Details of home hazards identified.';
COMMENT ON COLUMN assessment_mobility_and_falls.mobility_notes IS
    'Free-text notes on mobility and falls assessment.';
