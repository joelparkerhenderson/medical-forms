-- 05_assessment_asrs_part_b.sql
-- ASRS Part B supplemental section of the attention deficit assessment.

CREATE TABLE assessment_asrs_part_b (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    q7_careless_mistakes INTEGER
        CHECK (q7_careless_mistakes IS NULL OR (q7_careless_mistakes >= 0 AND q7_careless_mistakes <= 4)),
    q8_difficulty_sustaining_attention INTEGER
        CHECK (q8_difficulty_sustaining_attention IS NULL OR (q8_difficulty_sustaining_attention >= 0 AND q8_difficulty_sustaining_attention <= 4)),
    q9_difficulty_listening INTEGER
        CHECK (q9_difficulty_listening IS NULL OR (q9_difficulty_listening >= 0 AND q9_difficulty_listening <= 4)),
    q10_difficulty_following_through INTEGER
        CHECK (q10_difficulty_following_through IS NULL OR (q10_difficulty_following_through >= 0 AND q10_difficulty_following_through <= 4)),
    q11_difficulty_keeping_quiet INTEGER
        CHECK (q11_difficulty_keeping_quiet IS NULL OR (q11_difficulty_keeping_quiet >= 0 AND q11_difficulty_keeping_quiet <= 4)),
    q12_finishing_others_sentences INTEGER
        CHECK (q12_finishing_others_sentences IS NULL OR (q12_finishing_others_sentences >= 0 AND q12_finishing_others_sentences <= 4)),
    q13_difficulty_waiting_turn INTEGER
        CHECK (q13_difficulty_waiting_turn IS NULL OR (q13_difficulty_waiting_turn >= 0 AND q13_difficulty_waiting_turn <= 4)),
    q14_interrupting_others INTEGER
        CHECK (q14_interrupting_others IS NULL OR (q14_interrupting_others >= 0 AND q14_interrupting_others <= 4)),
    q15_always_on_the_go INTEGER
        CHECK (q15_always_on_the_go IS NULL OR (q15_always_on_the_go >= 0 AND q15_always_on_the_go <= 4)),
    q16_difficulty_relaxing INTEGER
        CHECK (q16_difficulty_relaxing IS NULL OR (q16_difficulty_relaxing >= 0 AND q16_difficulty_relaxing <= 4)),
    q17_talking_too_much INTEGER
        CHECK (q17_talking_too_much IS NULL OR (q17_talking_too_much >= 0 AND q17_talking_too_much <= 4)),
    q18_losing_things INTEGER
        CHECK (q18_losing_things IS NULL OR (q18_losing_things >= 0 AND q18_losing_things <= 4)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_asrs_part_b_updated_at
    BEFORE UPDATE ON assessment_asrs_part_b
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_asrs_part_b IS
    'ASRS Part B supplemental section: 12 additional questions scored 0-4 (Never=0 to Very Often=4). These provide additional clinical information but are not part of the screening score. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_asrs_part_b.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_asrs_part_b.q7_careless_mistakes IS
    'Q7: How often do you make careless mistakes when working on a boring or difficult project? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q8_difficulty_sustaining_attention IS
    'Q8: How often do you have difficulty keeping your attention when doing boring or repetitive work? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q9_difficulty_listening IS
    'Q9: How often do you have difficulty concentrating on what people say to you even when they are speaking directly? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q10_difficulty_following_through IS
    'Q10: How often do you misplace or have difficulty finding things at home or work? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q11_difficulty_keeping_quiet IS
    'Q11: How often are you distracted by activity or noise around you? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q12_finishing_others_sentences IS
    'Q12: How often do you leave your seat in meetings or other situations where you are expected to remain seated? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q13_difficulty_waiting_turn IS
    'Q13: How often do you feel restless or fidgety? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q14_interrupting_others IS
    'Q14: How often do you have difficulty unwinding and relaxing when you have time to yourself? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q15_always_on_the_go IS
    'Q15: How often do you find yourself talking too much when you are in social situations? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q16_difficulty_relaxing IS
    'Q16: When in a conversation, how often do you find yourself finishing the sentences of others? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q17_talking_too_much IS
    'Q17: How often do you have difficulty waiting your turn in situations when turn-taking is required? (0-4).';
COMMENT ON COLUMN assessment_asrs_part_b.q18_losing_things IS
    'Q18: How often do you interrupt others when they are busy? (0-4).';
