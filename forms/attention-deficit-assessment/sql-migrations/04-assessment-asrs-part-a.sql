-- 04_assessment_asrs_part_a.sql
-- ASRS Part A screener section of the attention deficit assessment.

CREATE TABLE assessment_asrs_part_a (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    q1_wrapping_up_details INTEGER
        CHECK (q1_wrapping_up_details IS NULL OR (q1_wrapping_up_details >= 0 AND q1_wrapping_up_details <= 4)),
    q2_difficulty_ordering INTEGER
        CHECK (q2_difficulty_ordering IS NULL OR (q2_difficulty_ordering >= 0 AND q2_difficulty_ordering <= 4)),
    q3_remembering_appointments INTEGER
        CHECK (q3_remembering_appointments IS NULL OR (q3_remembering_appointments >= 0 AND q3_remembering_appointments <= 4)),
    q4_avoiding_starting INTEGER
        CHECK (q4_avoiding_starting IS NULL OR (q4_avoiding_starting >= 0 AND q4_avoiding_starting <= 4)),
    q5_fidgeting INTEGER
        CHECK (q5_fidgeting IS NULL OR (q5_fidgeting >= 0 AND q5_fidgeting <= 4)),
    q6_feeling_overly_active INTEGER
        CHECK (q6_feeling_overly_active IS NULL OR (q6_feeling_overly_active >= 0 AND q6_feeling_overly_active <= 4)),
    darkly_shaded_count INTEGER
        CHECK (darkly_shaded_count IS NULL OR (darkly_shaded_count >= 0 AND darkly_shaded_count <= 6)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_asrs_part_a_updated_at
    BEFORE UPDATE ON assessment_asrs_part_a
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_asrs_part_a IS
    'ASRS Part A screener section: 6 screening questions scored 0-4 (Never=0, Rarely=1, Sometimes=2, Often=3, Very Often=4). Items scored against clinically validated shaded thresholds. 4+ darkly shaded responses highly consistent with ADHD. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_asrs_part_a.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_asrs_part_a.q1_wrapping_up_details IS
    'Q1: How often do you have difficulty wrapping up the final details of a project? (0=Never, 4=Very Often).';
COMMENT ON COLUMN assessment_asrs_part_a.q2_difficulty_ordering IS
    'Q2: How often do you have difficulty getting things in order when you have to do a task that requires organisation? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_a.q3_remembering_appointments IS
    'Q3: How often do you have problems remembering appointments or obligations? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_a.q4_avoiding_starting IS
    'Q4: When you have a task that requires a lot of thought, how often do you avoid or delay getting started? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_a.q5_fidgeting IS
    'Q5: How often do you fidget or squirm with your hands or feet when you have to sit down for a long time? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_a.q6_feeling_overly_active IS
    'Q6: How often do you feel overly active and compelled to do things, like you were driven by a motor? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_a.darkly_shaded_count IS
    'Count of Part A responses that fall in the darkly shaded (clinically significant) range. 4+ is highly consistent with ADHD.';
