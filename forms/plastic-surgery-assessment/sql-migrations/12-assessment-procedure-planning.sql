-- 12_assessment_procedure_planning.sql
-- Procedure planning and consent section of the plastic surgery assessment.

CREATE TABLE assessment_procedure_planning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    proposed_procedure TEXT NOT NULL DEFAULT '',
    procedure_complexity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (procedure_complexity IN ('1', '2', '3', '4', '')),
    surgical_approach VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (surgical_approach IN ('open', 'endoscopic', 'microsurgical', 'minimally-invasive', 'combined', '')),
    expected_duration_minutes INTEGER
        CHECK (expected_duration_minutes IS NULL OR expected_duration_minutes >= 0),
    expected_hospital_stay VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (expected_hospital_stay IN ('day-case', 'overnight', '2-3-days', '4-7-days', 'greater-7-days', '')),
    flap_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (flap_type IN ('local', 'regional', 'distant', 'free', 'skin-graft', 'tissue-expansion', 'implant', 'n-a', '')),
    implant_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (implant_required IN ('yes', 'no', '')),
    implant_details TEXT NOT NULL DEFAULT '',
    vte_risk VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (vte_risk IN ('low', 'moderate', 'high', '')),
    antibiotic_prophylaxis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antibiotic_prophylaxis IN ('yes', 'no', '')),
    anticipated_risks TEXT NOT NULL DEFAULT '',
    alternative_treatments TEXT NOT NULL DEFAULT '',
    consent_discussion VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_discussion IN ('yes', 'no', '')),
    consent_form_signed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_form_signed IN ('yes', 'no', '')),
    cooling_off_period_offered VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cooling_off_period_offered IN ('yes', 'no', 'n-a', '')),
    follow_up_plan TEXT NOT NULL DEFAULT '',
    procedure_planning_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_procedure_planning_updated_at
    BEFORE UPDATE ON assessment_procedure_planning
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_procedure_planning IS
    'Procedure planning and consent section: proposed procedure, complexity, approach, consent, follow-up. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_procedure_planning.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_procedure_planning.procedure_complexity IS
    'Surgical complexity score: 1 (minor), 2 (intermediate), 3 (major), 4 (major plus/emergency), or empty.';
COMMENT ON COLUMN assessment_procedure_planning.surgical_approach IS
    'Surgical approach: open, endoscopic, microsurgical, minimally-invasive, combined, or empty.';
COMMENT ON COLUMN assessment_procedure_planning.expected_duration_minutes IS
    'Expected duration of surgery in minutes.';
COMMENT ON COLUMN assessment_procedure_planning.expected_hospital_stay IS
    'Expected hospital stay: day-case, overnight, 2-3-days, 4-7-days, greater-7-days, or empty.';
COMMENT ON COLUMN assessment_procedure_planning.flap_type IS
    'Flap or reconstruction type: local, regional, distant, free, skin-graft, tissue-expansion, implant, n-a, or empty.';
COMMENT ON COLUMN assessment_procedure_planning.vte_risk IS
    'Venous thromboembolism risk: low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_procedure_planning.consent_discussion IS
    'Whether consent discussion has taken place: yes, no, or empty.';
COMMENT ON COLUMN assessment_procedure_planning.cooling_off_period_offered IS
    'Whether a cooling-off period was offered (required for cosmetic procedures): yes, no, n-a, or empty.';
