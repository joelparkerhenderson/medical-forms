CREATE TABLE casualty_card_safeguarding_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with casualty_card (UNIQUE constraint)
    casualty_card_id              UUID NOT NULL UNIQUE REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- Safeguarding
    safeguarding_concern          TEXT NOT NULL DEFAULT ''
                                  CHECK (safeguarding_concern IN ('yes', 'no', '')),
    safeguarding_type             TEXT NOT NULL DEFAULT '',
    referral_made                 TEXT NOT NULL DEFAULT ''
                                  CHECK (referral_made IN ('yes', 'no', '')),
    -- Mental capacity and Mental Health Act
    mental_capacity_assessment    TEXT NOT NULL DEFAULT '',
    mental_health_act_status      TEXT NOT NULL DEFAULT '',
    -- Consent
    consent_for_treatment         TEXT NOT NULL DEFAULT ''
                                  CHECK (consent_for_treatment IN ('verbal', 'written', 'lacks-capacity', '')),
    -- Completing clinician
    completed_by_name             TEXT NOT NULL DEFAULT '',
    completed_by_role             TEXT NOT NULL DEFAULT '',
    completed_by_gmc_number       TEXT NOT NULL DEFAULT '',
    senior_reviewing_clinician    TEXT NOT NULL DEFAULT ''
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_safeguarding_consent_updated_at
    BEFORE UPDATE ON casualty_card_safeguarding_consent
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_safeguarding_consent IS
    '1:1 with casualty_card. Safeguarding concerns, mental capacity, consent, and completing clinician details.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.casualty_card_id IS
    'FK to casualty_card (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN casualty_card_safeguarding_consent.safeguarding_concern IS
    'Whether a safeguarding concern has been identified: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.safeguarding_type IS
    'Type of safeguarding concern (e.g. adult at risk, child protection, domestic abuse).';
COMMENT ON COLUMN casualty_card_safeguarding_consent.referral_made IS
    'Whether a safeguarding referral has been made: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.mental_capacity_assessment IS
    'Outcome of mental capacity assessment.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.mental_health_act_status IS
    'Mental Health Act section status if applicable (e.g. Section 2, Section 136).';
COMMENT ON COLUMN casualty_card_safeguarding_consent.consent_for_treatment IS
    'Type of consent obtained: verbal, written, lacks-capacity, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.completed_by_name IS
    'Name of the clinician who completed the casualty card.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.completed_by_role IS
    'Role of the completing clinician (e.g. SHO, Registrar, Consultant).';
COMMENT ON COLUMN casualty_card_safeguarding_consent.completed_by_gmc_number IS
    'GMC registration number of the completing clinician.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.senior_reviewing_clinician IS
    'Name of the senior clinician who reviewed the case.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_safeguarding_consent.deleted_at IS
    'Timestamp when this row was deleted.';
