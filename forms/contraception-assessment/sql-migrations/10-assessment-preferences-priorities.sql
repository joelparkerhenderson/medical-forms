-- 10_assessment_preferences_priorities.sql
-- Preferences and priorities section of the contraception assessment.

CREATE TABLE assessment_preferences_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    most_important_factor VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (most_important_factor IN ('effectiveness', 'low-side-effects', 'non-hormonal', 'long-acting', 'easy-to-use', 'reversible', 'period-control', 'other', '')),
    most_important_factor_other TEXT NOT NULL DEFAULT '',
    preference_for_hormonal VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (preference_for_hormonal IN ('happy-with-hormonal', 'prefer-non-hormonal', 'no-preference', '')),
    preference_for_long_acting VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (preference_for_long_acting IN ('prefer-larc', 'prefer-short-acting', 'no-preference', '')),
    comfortable_with_procedure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (comfortable_with_procedure IN ('yes', 'no', '')),
    wants_period_control VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (wants_period_control IN ('lighter', 'no-periods', 'regular', 'no-preference', '')),
    fertility_timeline VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (fertility_timeline IN ('within-1-year', '1-3-years', '3-5-years', 'no-more-children', 'unsure', '')),
    partner_involvement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (partner_involvement IN ('yes', 'no', '')),
    partner_preferences TEXT NOT NULL DEFAULT '',
    previous_method_preferences TEXT NOT NULL DEFAULT '',
    preferences_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_preferences_priorities_updated_at
    BEFORE UPDATE ON assessment_preferences_priorities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_preferences_priorities IS
    'Preferences and priorities section: method preferences, hormonal preference, period control, fertility timeline. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_preferences_priorities.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_preferences_priorities.most_important_factor IS
    'Most important factor in contraceptive choice: effectiveness, low-side-effects, non-hormonal, long-acting, easy-to-use, reversible, period-control, other, or empty.';
COMMENT ON COLUMN assessment_preferences_priorities.most_important_factor_other IS
    'Details if most important factor is other.';
COMMENT ON COLUMN assessment_preferences_priorities.preference_for_hormonal IS
    'Preference regarding hormonal methods: happy-with-hormonal, prefer-non-hormonal, no-preference, or empty.';
COMMENT ON COLUMN assessment_preferences_priorities.preference_for_long_acting IS
    'Preference for long-acting vs short-acting: prefer-larc, prefer-short-acting, no-preference, or empty.';
COMMENT ON COLUMN assessment_preferences_priorities.comfortable_with_procedure IS
    'Whether the patient is comfortable with a fitting procedure (IUD/implant): yes, no, or empty.';
COMMENT ON COLUMN assessment_preferences_priorities.wants_period_control IS
    'Desired effect on periods: lighter, no-periods, regular, no-preference, or empty.';
COMMENT ON COLUMN assessment_preferences_priorities.fertility_timeline IS
    'When the patient wants to conceive: within-1-year, 1-3-years, 3-5-years, no-more-children, unsure, or empty.';
COMMENT ON COLUMN assessment_preferences_priorities.partner_involvement IS
    'Whether the partner is involved in the contraceptive decision: yes, no, or empty.';
COMMENT ON COLUMN assessment_preferences_priorities.partner_preferences IS
    'Partner preferences regarding contraception if applicable.';
COMMENT ON COLUMN assessment_preferences_priorities.previous_method_preferences IS
    'Methods the patient has expressed interest in based on previous experience.';
COMMENT ON COLUMN assessment_preferences_priorities.preferences_notes IS
    'Additional clinician notes on preferences and priorities.';
