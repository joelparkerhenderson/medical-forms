-- 05_assessment_aq10_questionnaire.sql
-- AQ-10 questionnaire section of the autism assessment.

CREATE TABLE assessment_aq10_questionnaire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Each AQ-10 item uses a 4-point Likert scale: definitely_agree, slightly_agree, slightly_disagree, definitely_disagree
    q01_notice_small_sounds VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (q01_notice_small_sounds IN ('definitely_agree', 'slightly_agree', 'slightly_disagree', 'definitely_disagree', '')),
    q02_concentrate_whole_picture VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (q02_concentrate_whole_picture IN ('definitely_agree', 'slightly_agree', 'slightly_disagree', 'definitely_disagree', '')),
    q03_easy_multitask VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (q03_easy_multitask IN ('definitely_agree', 'slightly_agree', 'slightly_disagree', 'definitely_disagree', '')),
    q04_easy_go_back_and_forth VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (q04_easy_go_back_and_forth IN ('definitely_agree', 'slightly_agree', 'slightly_disagree', 'definitely_disagree', '')),
    q05_easy_read_between_lines VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (q05_easy_read_between_lines IN ('definitely_agree', 'slightly_agree', 'slightly_disagree', 'definitely_disagree', '')),
    q06_easy_detect_feeling_bored VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (q06_easy_detect_feeling_bored IN ('definitely_agree', 'slightly_agree', 'slightly_disagree', 'definitely_disagree', '')),
    q07_easy_work_out_intentions VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (q07_easy_work_out_intentions IN ('definitely_agree', 'slightly_agree', 'slightly_disagree', 'definitely_disagree', '')),
    q08_easy_imagine_as_character VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (q08_easy_imagine_as_character IN ('definitely_agree', 'slightly_agree', 'slightly_disagree', 'definitely_disagree', '')),
    q09_find_social_situations_easy VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (q09_find_social_situations_easy IN ('definitely_agree', 'slightly_agree', 'slightly_disagree', 'definitely_disagree', '')),
    q10_difficult_work_out_friends VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (q10_difficult_work_out_friends IN ('definitely_agree', 'slightly_agree', 'slightly_disagree', 'definitely_disagree', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_aq10_questionnaire_updated_at
    BEFORE UPDATE ON assessment_aq10_questionnaire
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_aq10_questionnaire IS
    'AQ-10 (Autism Spectrum Quotient - 10 item) questionnaire responses. Each item scores 0 or 1. Total range 0-10. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_aq10_questionnaire.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_aq10_questionnaire.q01_notice_small_sounds IS
    'AQ-10 Q1: I often notice small sounds when others do not.';
COMMENT ON COLUMN assessment_aq10_questionnaire.q02_concentrate_whole_picture IS
    'AQ-10 Q2: I usually concentrate more on the whole picture, rather than small details.';
COMMENT ON COLUMN assessment_aq10_questionnaire.q03_easy_multitask IS
    'AQ-10 Q3: I find it easy to do more than one thing at once.';
COMMENT ON COLUMN assessment_aq10_questionnaire.q04_easy_go_back_and_forth IS
    'AQ-10 Q4: If there is an interruption, I can switch back to what I was doing very quickly.';
COMMENT ON COLUMN assessment_aq10_questionnaire.q05_easy_read_between_lines IS
    'AQ-10 Q5: I find it easy to read between the lines when someone is talking to me.';
COMMENT ON COLUMN assessment_aq10_questionnaire.q06_easy_detect_feeling_bored IS
    'AQ-10 Q6: I know how to tell if someone listening to me is getting bored.';
COMMENT ON COLUMN assessment_aq10_questionnaire.q07_easy_work_out_intentions IS
    'AQ-10 Q7: When I am reading a story, I find it difficult to work out the characters intentions.';
COMMENT ON COLUMN assessment_aq10_questionnaire.q08_easy_imagine_as_character IS
    'AQ-10 Q8: I like to collect information about categories of things.';
COMMENT ON COLUMN assessment_aq10_questionnaire.q09_find_social_situations_easy IS
    'AQ-10 Q9: I find it easy to work out what someone is thinking or feeling just by looking at their face.';
COMMENT ON COLUMN assessment_aq10_questionnaire.q10_difficult_work_out_friends IS
    'AQ-10 Q10: I find it difficult to work out peoples intentions.';
