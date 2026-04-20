-- 06_assessment_temporal_pattern.sql
-- Temporal pattern section of the sundowner syndrome assessment.

CREATE TABLE assessment_temporal_pattern (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    onset_time VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (onset_time IN ('early-afternoon', 'late-afternoon', 'evening', 'night', 'variable', '')),
    typical_onset_hour INTEGER
        CHECK (typical_onset_hour IS NULL OR (typical_onset_hour >= 0 AND typical_onset_hour <= 23)),
    peak_severity_time VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (peak_severity_time IN ('late-afternoon', 'evening', 'early-night', 'throughout-night', '')),
    typical_duration_hours INTEGER
        CHECK (typical_duration_hours IS NULL OR (typical_duration_hours >= 0 AND typical_duration_hours <= 24)),
    episode_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (episode_frequency IN ('daily', 'most-days', 'several-weekly', 'weekly', 'occasionally', '')),
    seasonal_pattern VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (seasonal_pattern IN ('yes', 'no', '')),
    seasonal_pattern_details TEXT NOT NULL DEFAULT '',
    worse_with_daylight_changes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (worse_with_daylight_changes IN ('yes', 'no', '')),
    symptoms_resolve_by_morning VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (symptoms_resolve_by_morning IN ('yes', 'no', '')),
    pattern_duration_months INTEGER
        CHECK (pattern_duration_months IS NULL OR pattern_duration_months >= 0),
    pattern_worsening VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pattern_worsening IN ('yes', 'no', '')),
    temporal_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_temporal_pattern_updated_at
    BEFORE UPDATE ON assessment_temporal_pattern
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_temporal_pattern IS
    'Temporal pattern section: onset time, duration, frequency, and seasonal patterns of sundowning episodes. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_temporal_pattern.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_temporal_pattern.onset_time IS
    'Typical time of day for symptom onset: early-afternoon, late-afternoon, evening, night, variable, or empty.';
COMMENT ON COLUMN assessment_temporal_pattern.typical_onset_hour IS
    'Typical hour of day (0-23) when symptoms begin.';
COMMENT ON COLUMN assessment_temporal_pattern.peak_severity_time IS
    'Time of peak symptom severity: late-afternoon, evening, early-night, throughout-night, or empty.';
COMMENT ON COLUMN assessment_temporal_pattern.typical_duration_hours IS
    'Typical duration of an episode in hours.';
COMMENT ON COLUMN assessment_temporal_pattern.episode_frequency IS
    'Frequency of episodes: daily, most-days, several-weekly, weekly, occasionally, or empty.';
COMMENT ON COLUMN assessment_temporal_pattern.seasonal_pattern IS
    'Whether symptoms show a seasonal pattern (e.g. worse in winter): yes, no, or empty.';
COMMENT ON COLUMN assessment_temporal_pattern.seasonal_pattern_details IS
    'Details of seasonal variation in symptoms.';
COMMENT ON COLUMN assessment_temporal_pattern.worse_with_daylight_changes IS
    'Whether symptoms worsen with daylight saving time or seasonal light changes: yes, no, or empty.';
COMMENT ON COLUMN assessment_temporal_pattern.symptoms_resolve_by_morning IS
    'Whether symptoms typically resolve by morning: yes, no, or empty.';
COMMENT ON COLUMN assessment_temporal_pattern.pattern_duration_months IS
    'How many months the sundowning pattern has been observed.';
COMMENT ON COLUMN assessment_temporal_pattern.pattern_worsening IS
    'Whether the pattern has been worsening over time: yes, no, or empty.';
COMMENT ON COLUMN assessment_temporal_pattern.temporal_notes IS
    'Additional clinician notes on temporal patterns.';
