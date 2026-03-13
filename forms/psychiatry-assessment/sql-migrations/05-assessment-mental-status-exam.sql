-- 05_assessment_mental_status_exam.sql
-- Mental status examination section of the psychiatry assessment.

CREATE TABLE assessment_mental_status_exam (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    appearance TEXT NOT NULL DEFAULT '',
    behaviour VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (behaviour IN ('cooperative', 'guarded', 'hostile', 'agitated', 'withdrawn', 'disinhibited', '')),
    psychomotor_activity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (psychomotor_activity IN ('normal', 'retarded', 'agitated', 'catatonic', '')),
    speech_rate VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (speech_rate IN ('normal', 'pressured', 'slow', 'mute', '')),
    speech_volume VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (speech_volume IN ('normal', 'loud', 'quiet', 'whispered', '')),
    speech_quality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (speech_quality IN ('normal', 'slurred', 'dysarthric', 'monotonous', '')),
    mood_subjective TEXT NOT NULL DEFAULT '',
    affect VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (affect IN ('euthymic', 'depressed', 'anxious', 'elevated', 'irritable', 'flat', 'labile', '')),
    affect_congruence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (affect_congruence IN ('congruent', 'incongruent', '')),
    thought_form VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (thought_form IN ('normal', 'circumstantial', 'tangential', 'loose-associations', 'flight-of-ideas', 'perseverative', 'thought-blocking', '')),
    thought_content TEXT NOT NULL DEFAULT '',
    delusions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (delusions IN ('yes', 'no', '')),
    delusion_details TEXT NOT NULL DEFAULT '',
    hallucinations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hallucinations IN ('yes', 'no', '')),
    hallucination_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (hallucination_type IN ('auditory', 'visual', 'tactile', 'olfactory', 'gustatory', 'multiple', '')),
    hallucination_details TEXT NOT NULL DEFAULT '',
    orientation_time VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_time IN ('yes', 'no', '')),
    orientation_place VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_place IN ('yes', 'no', '')),
    orientation_person VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_person IN ('yes', 'no', '')),
    concentration VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (concentration IN ('normal', 'impaired', '')),
    memory_short_term VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (memory_short_term IN ('normal', 'impaired', '')),
    memory_long_term VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (memory_long_term IN ('normal', 'impaired', '')),
    insight VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (insight IN ('good', 'partial', 'poor', 'absent', '')),
    judgement VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (judgement IN ('good', 'fair', 'poor', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_mental_status_exam_updated_at
    BEFORE UPDATE ON assessment_mental_status_exam
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_mental_status_exam IS
    'Mental status examination section: appearance, behaviour, speech, mood, affect, thought form/content, perceptions, cognition, and insight. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_mental_status_exam.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_mental_status_exam.appearance IS
    'Free-text description of the patient''s appearance, grooming, and attire.';
COMMENT ON COLUMN assessment_mental_status_exam.behaviour IS
    'Observed behaviour: cooperative, guarded, hostile, agitated, withdrawn, disinhibited, or empty.';
COMMENT ON COLUMN assessment_mental_status_exam.psychomotor_activity IS
    'Psychomotor activity level: normal, retarded, agitated, catatonic, or empty.';
COMMENT ON COLUMN assessment_mental_status_exam.speech_rate IS
    'Rate of speech: normal, pressured, slow, mute, or empty.';
COMMENT ON COLUMN assessment_mental_status_exam.affect IS
    'Observed affect: euthymic, depressed, anxious, elevated, irritable, flat, labile, or empty.';
COMMENT ON COLUMN assessment_mental_status_exam.affect_congruence IS
    'Whether affect is congruent or incongruent with reported mood.';
COMMENT ON COLUMN assessment_mental_status_exam.thought_form IS
    'Form of thought: normal, circumstantial, tangential, loose-associations, flight-of-ideas, perseverative, thought-blocking, or empty.';
COMMENT ON COLUMN assessment_mental_status_exam.delusions IS
    'Whether delusions are present.';
COMMENT ON COLUMN assessment_mental_status_exam.hallucinations IS
    'Whether hallucinations are present.';
COMMENT ON COLUMN assessment_mental_status_exam.hallucination_type IS
    'Type of hallucinations: auditory, visual, tactile, olfactory, gustatory, multiple, or empty.';
COMMENT ON COLUMN assessment_mental_status_exam.insight IS
    'Level of insight into illness: good, partial, poor, absent, or empty.';
COMMENT ON COLUMN assessment_mental_status_exam.judgement IS
    'Clinical assessment of judgement: good, fair, poor, or empty.';
