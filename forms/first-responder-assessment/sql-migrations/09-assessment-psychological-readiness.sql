-- 09_assessment_psychological_readiness.sql
-- Psychological readiness section of the first responder assessment.

CREATE TABLE assessment_psychological_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    stress_management VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (stress_management IN ('not-competent', 'developing', 'competent', 'expert', '')),
    resilience_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (resilience_level IN ('low', 'moderate', 'good', 'excellent', '')),
    ptsd_screening VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ptsd_screening IN ('yes', 'no', '')),
    ptsd_screening_result VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ptsd_screening_result IN ('negative', 'positive', 'inconclusive', '')),
    critical_incident_exposure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (critical_incident_exposure IN ('yes', 'no', '')),
    critical_incident_details TEXT NOT NULL DEFAULT '',
    critical_incident_debriefed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (critical_incident_debriefed IN ('yes', 'no', '')),
    sleep_quality VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sleep_quality IN ('good', 'fair', 'poor', '')),
    burnout_risk VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (burnout_risk IN ('low', 'moderate', 'high', '')),
    decision_making_under_pressure VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (decision_making_under_pressure IN ('not-competent', 'developing', 'competent', 'expert', '')),
    emotional_regulation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (emotional_regulation IN ('not-competent', 'developing', 'competent', 'expert', '')),
    psychological_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_psychological_readiness_updated_at
    BEFORE UPDATE ON assessment_psychological_readiness
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_psychological_readiness IS
    'Psychological readiness section: stress management, resilience, PTSD screening, critical incidents, and emotional regulation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_psychological_readiness.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_psychological_readiness.stress_management IS
    'Stress management competency level.';
COMMENT ON COLUMN assessment_psychological_readiness.resilience_level IS
    'Self-reported resilience level: low, moderate, good, excellent, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.ptsd_screening IS
    'Whether PTSD screening has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.ptsd_screening_result IS
    'PTSD screening result: negative, positive, inconclusive, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.critical_incident_exposure IS
    'Whether the responder has been exposed to critical incidents: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.critical_incident_details IS
    'Details of critical incident exposure.';
COMMENT ON COLUMN assessment_psychological_readiness.critical_incident_debriefed IS
    'Whether the responder received critical incident debriefing: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.sleep_quality IS
    'Self-reported sleep quality: good, fair, poor, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.burnout_risk IS
    'Assessed burnout risk: low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.decision_making_under_pressure IS
    'Decision making under pressure competency level.';
COMMENT ON COLUMN assessment_psychological_readiness.emotional_regulation IS
    'Emotional regulation competency level.';
COMMENT ON COLUMN assessment_psychological_readiness.psychological_notes IS
    'Additional notes on psychological readiness assessment.';
