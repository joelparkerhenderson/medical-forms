-- 10_assessment_reproductive_genetics.sql
-- Reproductive genetics section of the genetic assessment.

CREATE TABLE assessment_reproductive_genetics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    planning_pregnancy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (planning_pregnancy IN ('yes', 'no', '')),
    currently_pregnant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_pregnant IN ('yes', 'no', '')),
    gestational_age_weeks INTEGER
        CHECK (gestational_age_weeks IS NULL OR (gestational_age_weeks >= 0 AND gestational_age_weeks <= 45)),
    history_of_recurrent_miscarriage VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_recurrent_miscarriage IN ('yes', 'no', '')),
    number_of_miscarriages INTEGER
        CHECK (number_of_miscarriages IS NULL OR number_of_miscarriages >= 0),
    history_of_stillbirth VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_stillbirth IN ('yes', 'no', '')),
    stillbirth_details TEXT NOT NULL DEFAULT '',
    history_of_neonatal_death VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_neonatal_death IN ('yes', 'no', '')),
    neonatal_death_details TEXT NOT NULL DEFAULT '',
    child_with_congenital_anomaly VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (child_with_congenital_anomaly IN ('yes', 'no', '')),
    congenital_anomaly_details TEXT NOT NULL DEFAULT '',
    known_carrier_status VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_carrier_status IN ('yes', 'no', '')),
    carrier_status_details TEXT NOT NULL DEFAULT '',
    partner_carrier_status VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (partner_carrier_status IN ('yes', 'no', 'unknown', '')),
    partner_carrier_details TEXT NOT NULL DEFAULT '',
    assisted_reproduction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (assisted_reproduction IN ('yes', 'no', '')),
    assisted_reproduction_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_reproductive_genetics_updated_at
    BEFORE UPDATE ON assessment_reproductive_genetics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_reproductive_genetics IS
    'Reproductive genetics section: pregnancy planning, miscarriage history, carrier status, and assisted reproduction. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_reproductive_genetics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_reproductive_genetics.planning_pregnancy IS
    'Whether the patient is planning a pregnancy: yes, no, or empty string.';
COMMENT ON COLUMN assessment_reproductive_genetics.currently_pregnant IS
    'Whether the patient is currently pregnant: yes, no, or empty string.';
COMMENT ON COLUMN assessment_reproductive_genetics.gestational_age_weeks IS
    'Current gestational age in weeks, NULL if not pregnant or unanswered.';
COMMENT ON COLUMN assessment_reproductive_genetics.history_of_recurrent_miscarriage IS
    'Whether there is a history of recurrent miscarriage (3 or more): yes, no, or empty string.';
COMMENT ON COLUMN assessment_reproductive_genetics.number_of_miscarriages IS
    'Number of miscarriages, NULL if unanswered.';
COMMENT ON COLUMN assessment_reproductive_genetics.history_of_stillbirth IS
    'Whether there is a history of stillbirth: yes, no, or empty string.';
COMMENT ON COLUMN assessment_reproductive_genetics.stillbirth_details IS
    'Details of stillbirth events.';
COMMENT ON COLUMN assessment_reproductive_genetics.history_of_neonatal_death IS
    'Whether there is a history of neonatal death: yes, no, or empty string.';
COMMENT ON COLUMN assessment_reproductive_genetics.neonatal_death_details IS
    'Details of neonatal death events.';
COMMENT ON COLUMN assessment_reproductive_genetics.child_with_congenital_anomaly IS
    'Whether the patient has a child with a congenital anomaly: yes, no, or empty string.';
COMMENT ON COLUMN assessment_reproductive_genetics.congenital_anomaly_details IS
    'Details of congenital anomaly in child.';
COMMENT ON COLUMN assessment_reproductive_genetics.known_carrier_status IS
    'Whether the patient is a known carrier of a genetic condition: yes, no, or empty string.';
COMMENT ON COLUMN assessment_reproductive_genetics.carrier_status_details IS
    'Details of known carrier status (e.g. cystic fibrosis, sickle cell).';
COMMENT ON COLUMN assessment_reproductive_genetics.partner_carrier_status IS
    'Whether the partner is a known carrier: yes, no, unknown, or empty string.';
COMMENT ON COLUMN assessment_reproductive_genetics.partner_carrier_details IS
    'Details of partner carrier status.';
COMMENT ON COLUMN assessment_reproductive_genetics.assisted_reproduction IS
    'Whether assisted reproduction is being considered or used: yes, no, or empty string.';
COMMENT ON COLUMN assessment_reproductive_genetics.assisted_reproduction_details IS
    'Details of assisted reproduction methods (e.g. PGT, donor gametes).';
