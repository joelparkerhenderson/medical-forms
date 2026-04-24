CREATE TABLE assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    postcode VARCHAR(20) NOT NULL DEFAULT '',
    date_of_birth DATE,
    nhs_number VARCHAR(20) NOT NULL DEFAULT '',
    gp_name VARCHAR(255) NOT NULL DEFAULT '',
    gp_practice VARCHAR(255) NOT NULL DEFAULT '',
    gp_address TEXT NOT NULL DEFAULT '',
    gp_phone VARCHAR(30) NOT NULL DEFAULT '',
    has_mental_capacity VARCHAR(5) NOT NULL DEFAULT '' CHECK (has_mental_capacity IN ('yes', 'no', '')),
    understands_consequences VARCHAR(5) NOT NULL DEFAULT '' CHECK (understands_consequences IN ('yes', 'no', '')),
    made_voluntarily VARCHAR(5) NOT NULL DEFAULT '' CHECK (made_voluntarily IN ('yes', 'no', '')),
    capacity_assessment_date DATE,
    capacity_assessor_name VARCHAR(255) NOT NULL DEFAULT '',
    capacity_assessor_role VARCHAR(100) NOT NULL DEFAULT '',
    capacity_notes TEXT NOT NULL DEFAULT '',
    circumstances_description TEXT NOT NULL DEFAULT '',
    specific_conditions TEXT NOT NULL DEFAULT '',
    applies_if_terminally_ill VARCHAR(5) NOT NULL DEFAULT '' CHECK (applies_if_terminally_ill IN ('yes', 'no', '')),
    applies_if_permanently_unconscious VARCHAR(5) NOT NULL DEFAULT '' CHECK (applies_if_permanently_unconscious IN ('yes', 'no', '')),
    applies_if_severely_brain_damaged VARCHAR(5) NOT NULL DEFAULT '' CHECK (applies_if_severely_brain_damaged IN ('yes', 'no', '')),
    applies_if_advanced_dementia VARCHAR(5) NOT NULL DEFAULT '' CHECK (applies_if_advanced_dementia IN ('yes', 'no', '')),
    other_circumstances TEXT NOT NULL DEFAULT '',
    refuses_cardiopulmonary_resuscitation VARCHAR(5) NOT NULL DEFAULT '' CHECK (refuses_cardiopulmonary_resuscitation IN ('yes', 'no', '')),
    refuses_mechanical_ventilation VARCHAR(5) NOT NULL DEFAULT '' CHECK (refuses_mechanical_ventilation IN ('yes', 'no', '')),
    refuses_artificial_nutrition VARCHAR(5) NOT NULL DEFAULT '' CHECK (refuses_artificial_nutrition IN ('yes', 'no', '')),
    refuses_artificial_hydration VARCHAR(5) NOT NULL DEFAULT '' CHECK (refuses_artificial_hydration IN ('yes', 'no', '')),
    refuses_antibiotics VARCHAR(5) NOT NULL DEFAULT '' CHECK (refuses_antibiotics IN ('yes', 'no', '')),
    refuses_blood_transfusion VARCHAR(5) NOT NULL DEFAULT '' CHECK (refuses_blood_transfusion IN ('yes', 'no', '')),
    refuses_dialysis VARCHAR(5) NOT NULL DEFAULT '' CHECK (refuses_dialysis IN ('yes', 'no', '')),
    other_treatments_refused TEXT NOT NULL DEFAULT '',
    treatment_refusal_details TEXT NOT NULL DEFAULT '',
    includes_life_sustaining_treatment VARCHAR(5) NOT NULL DEFAULT '' CHECK (includes_life_sustaining_treatment IN ('yes', 'no', '')),
    understands_may_result_in_death VARCHAR(5) NOT NULL DEFAULT '' CHECK (understands_may_result_in_death IN ('yes', 'no', '')),
    life_sustaining_treatments_specified TEXT NOT NULL DEFAULT '',
    is_written_and_signed VARCHAR(5) NOT NULL DEFAULT '' CHECK (is_written_and_signed IN ('yes', 'no', '')),
    is_witnessed VARCHAR(5) NOT NULL DEFAULT '' CHECK (is_witnessed IN ('yes', 'no', '')),
    witness_confirmation TEXT NOT NULL DEFAULT '',
    has_exceptions VARCHAR(5) NOT NULL DEFAULT '' CHECK (has_exceptions IN ('yes', 'no', '')),
    exception_details TEXT NOT NULL DEFAULT '',
    pain_management_wishes TEXT NOT NULL DEFAULT '',
    comfort_care_wishes TEXT NOT NULL DEFAULT '',
    emergency_exception_details TEXT NOT NULL DEFAULT '',
    condition_specific_exceptions TEXT NOT NULL DEFAULT '',
    preferred_place_of_care TEXT NOT NULL DEFAULT '',
    preferred_place_of_death TEXT NOT NULL DEFAULT '',
    spiritual_or_religious_wishes TEXT NOT NULL DEFAULT '',
    organ_donation_wishes VARCHAR(20) NOT NULL DEFAULT '' CHECK (organ_donation_wishes IN ('yes', 'no', 'undecided', '')),
    organ_donation_details TEXT NOT NULL DEFAULT '',
    other_wishes TEXT NOT NULL DEFAULT '',
    people_to_notify TEXT NOT NULL DEFAULT '',
    has_health_welfare_lpa VARCHAR(5) NOT NULL DEFAULT '' CHECK (has_health_welfare_lpa IN ('yes', 'no', '')),
    lpa_registered_with_opg VARCHAR(5) NOT NULL DEFAULT '' CHECK (lpa_registered_with_opg IN ('yes', 'no', '')),
    lpa_registration_date DATE,
    attorney_name VARCHAR(255) NOT NULL DEFAULT '',
    attorney_address TEXT NOT NULL DEFAULT '',
    attorney_phone VARCHAR(30) NOT NULL DEFAULT '',
    replacement_attorney_name VARCHAR(255) NOT NULL DEFAULT '',
    lpa_authority_scope TEXT NOT NULL DEFAULT '',
    lpa_conflicts_with_adrt VARCHAR(5) NOT NULL DEFAULT '' CHECK (lpa_conflicts_with_adrt IN ('yes', 'no', '')),
    lpa_conflict_details TEXT NOT NULL DEFAULT '',
    reviewed_by_healthcare_professional VARCHAR(5) NOT NULL DEFAULT '' CHECK (reviewed_by_healthcare_professional IN ('yes', 'no', '')),
    reviewer_name VARCHAR(255) NOT NULL DEFAULT '',
    reviewer_role VARCHAR(100) NOT NULL DEFAULT '',
    reviewer_registration_number VARCHAR(50) NOT NULL DEFAULT '',
    review_date DATE,
    reviewer_confirms_capacity VARCHAR(5) NOT NULL DEFAULT '' CHECK (reviewer_confirms_capacity IN ('yes', 'no', '')),
    reviewer_confirms_informed VARCHAR(5) NOT NULL DEFAULT '' CHECK (reviewer_confirms_informed IN ('yes', 'no', '')),
    clinical_notes TEXT NOT NULL DEFAULT '',
    concerns_raised TEXT NOT NULL DEFAULT '',
    reviewer_signature_obtained VARCHAR(5) NOT NULL DEFAULT '' CHECK (reviewer_signature_obtained IN ('yes', 'no', '')),
    maker_signature_obtained VARCHAR(5) NOT NULL DEFAULT '' CHECK (maker_signature_obtained IN ('yes', 'no', '')),
    maker_signature_date DATE,
    witness_name VARCHAR(255) NOT NULL DEFAULT '',
    witness_address TEXT NOT NULL DEFAULT '',
    witness_signature_obtained VARCHAR(5) NOT NULL DEFAULT '' CHECK (witness_signature_obtained IN ('yes', 'no', '')),
    witness_signature_date DATE,
    second_witness_name VARCHAR(255) NOT NULL DEFAULT '',
    second_witness_signature_obtained VARCHAR(5) NOT NULL DEFAULT '' CHECK (second_witness_signature_obtained IN ('yes', 'no', '')),
    declaration_statement_agreed VARCHAR(5) NOT NULL DEFAULT '' CHECK (declaration_statement_agreed IN ('yes', 'no', '')),
    legal_notes TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_assessment_updated_at
    BEFORE UPDATE ON assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment IS
    'Flat assessment table: parent assessment merged with every assessment_<section> child. Generated by bin/generate-sql-flat.py.';

COMMENT ON COLUMN assessment.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment.patient_id IS
    'Foreign key to the patient table.';
COMMENT ON COLUMN assessment.status IS
    'Lifecycle status of this row.';
COMMENT ON COLUMN assessment.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment.full_name IS
    'Full name.';
COMMENT ON COLUMN assessment.address IS
    'Address.';
COMMENT ON COLUMN assessment.postcode IS
    'Postcode.';
COMMENT ON COLUMN assessment.date_of_birth IS
    'Date of birth.';
COMMENT ON COLUMN assessment.nhs_number IS
    'NHS number.';
COMMENT ON COLUMN assessment.gp_name IS
    'GP name.';
COMMENT ON COLUMN assessment.gp_practice IS
    'GP practice.';
COMMENT ON COLUMN assessment.gp_address IS
    'GP address.';
COMMENT ON COLUMN assessment.gp_phone IS
    'GP phone.';
COMMENT ON COLUMN assessment.has_mental_capacity IS
    'Has mental capacity. One of: yes, no.';
COMMENT ON COLUMN assessment.understands_consequences IS
    'Understands consequences. One of: yes, no.';
COMMENT ON COLUMN assessment.made_voluntarily IS
    'Made voluntarily. One of: yes, no.';
COMMENT ON COLUMN assessment.capacity_assessment_date IS
    'Capacity assessment date.';
COMMENT ON COLUMN assessment.capacity_assessor_name IS
    'Capacity assessor name.';
COMMENT ON COLUMN assessment.capacity_assessor_role IS
    'Capacity assessor role.';
COMMENT ON COLUMN assessment.capacity_notes IS
    'Capacity notes.';
COMMENT ON COLUMN assessment.circumstances_description IS
    'Circumstances description.';
COMMENT ON COLUMN assessment.specific_conditions IS
    'Specific conditions.';
COMMENT ON COLUMN assessment.applies_if_terminally_ill IS
    'Applies if terminally ill. One of: yes, no.';
COMMENT ON COLUMN assessment.applies_if_permanently_unconscious IS
    'Applies if permanently unconscious. One of: yes, no.';
COMMENT ON COLUMN assessment.applies_if_severely_brain_damaged IS
    'Applies if severely brain damaged. One of: yes, no.';
COMMENT ON COLUMN assessment.applies_if_advanced_dementia IS
    'Applies if advanced dementia. One of: yes, no.';
COMMENT ON COLUMN assessment.other_circumstances IS
    'Other circumstances.';
COMMENT ON COLUMN assessment.refuses_cardiopulmonary_resuscitation IS
    'Refuses cardiopulmonary resuscitation. One of: yes, no.';
COMMENT ON COLUMN assessment.refuses_mechanical_ventilation IS
    'Refuses mechanical ventilation. One of: yes, no.';
COMMENT ON COLUMN assessment.refuses_artificial_nutrition IS
    'Refuses artificial nutrition. One of: yes, no.';
COMMENT ON COLUMN assessment.refuses_artificial_hydration IS
    'Refuses artificial hydration. One of: yes, no.';
COMMENT ON COLUMN assessment.refuses_antibiotics IS
    'Refuses antibiotics. One of: yes, no.';
COMMENT ON COLUMN assessment.refuses_blood_transfusion IS
    'Refuses blood transfusion. One of: yes, no.';
COMMENT ON COLUMN assessment.refuses_dialysis IS
    'Refuses dialysis. One of: yes, no.';
COMMENT ON COLUMN assessment.other_treatments_refused IS
    'Other treatments refused.';
COMMENT ON COLUMN assessment.treatment_refusal_details IS
    'Treatment refusal details.';
COMMENT ON COLUMN assessment.includes_life_sustaining_treatment IS
    'Includes life sustaining treatment. One of: yes, no.';
COMMENT ON COLUMN assessment.understands_may_result_in_death IS
    'Understands may result in death. One of: yes, no.';
COMMENT ON COLUMN assessment.life_sustaining_treatments_specified IS
    'Life sustaining treatments specified.';
COMMENT ON COLUMN assessment.is_written_and_signed IS
    'Is written and signed. One of: yes, no.';
COMMENT ON COLUMN assessment.is_witnessed IS
    'Is witnessed. One of: yes, no.';
COMMENT ON COLUMN assessment.witness_confirmation IS
    'Witness confirmation.';
COMMENT ON COLUMN assessment.has_exceptions IS
    'Has exceptions. One of: yes, no.';
COMMENT ON COLUMN assessment.exception_details IS
    'Exception details.';
COMMENT ON COLUMN assessment.pain_management_wishes IS
    'Pain management wishes.';
COMMENT ON COLUMN assessment.comfort_care_wishes IS
    'Comfort care wishes.';
COMMENT ON COLUMN assessment.emergency_exception_details IS
    'Emergency exception details.';
COMMENT ON COLUMN assessment.condition_specific_exceptions IS
    'Condition specific exceptions.';
COMMENT ON COLUMN assessment.preferred_place_of_care IS
    'Preferred place of care.';
COMMENT ON COLUMN assessment.preferred_place_of_death IS
    'Preferred place of death.';
COMMENT ON COLUMN assessment.spiritual_or_religious_wishes IS
    'Spiritual or religious wishes.';
COMMENT ON COLUMN assessment.organ_donation_wishes IS
    'Organ donation wishes. One of: yes, no, undecided.';
COMMENT ON COLUMN assessment.organ_donation_details IS
    'Organ donation details.';
COMMENT ON COLUMN assessment.other_wishes IS
    'Other wishes.';
COMMENT ON COLUMN assessment.people_to_notify IS
    'People to notify.';
COMMENT ON COLUMN assessment.has_health_welfare_lpa IS
    'Has health welfare lpa. One of: yes, no.';
COMMENT ON COLUMN assessment.lpa_registered_with_opg IS
    'Lpa registered with opg. One of: yes, no.';
COMMENT ON COLUMN assessment.lpa_registration_date IS
    'Lpa registration date.';
COMMENT ON COLUMN assessment.attorney_name IS
    'Attorney name.';
COMMENT ON COLUMN assessment.attorney_address IS
    'Attorney address.';
COMMENT ON COLUMN assessment.attorney_phone IS
    'Attorney phone.';
COMMENT ON COLUMN assessment.replacement_attorney_name IS
    'Replacement attorney name.';
COMMENT ON COLUMN assessment.lpa_authority_scope IS
    'Lpa authority scope.';
COMMENT ON COLUMN assessment.lpa_conflicts_with_adrt IS
    'Lpa conflicts with adrt. One of: yes, no.';
COMMENT ON COLUMN assessment.lpa_conflict_details IS
    'Lpa conflict details.';
COMMENT ON COLUMN assessment.reviewed_by_healthcare_professional IS
    'Reviewed by healthcare professional. One of: yes, no.';
COMMENT ON COLUMN assessment.reviewer_name IS
    'Reviewer name.';
COMMENT ON COLUMN assessment.reviewer_role IS
    'Reviewer role.';
COMMENT ON COLUMN assessment.reviewer_registration_number IS
    'Reviewer registration number.';
COMMENT ON COLUMN assessment.review_date IS
    'Review date.';
COMMENT ON COLUMN assessment.reviewer_confirms_capacity IS
    'Reviewer confirms capacity. One of: yes, no.';
COMMENT ON COLUMN assessment.reviewer_confirms_informed IS
    'Reviewer confirms informed. One of: yes, no.';
COMMENT ON COLUMN assessment.clinical_notes IS
    'Clinical notes.';
COMMENT ON COLUMN assessment.concerns_raised IS
    'Concerns raised.';
COMMENT ON COLUMN assessment.reviewer_signature_obtained IS
    'Reviewer signature obtained. One of: yes, no.';
COMMENT ON COLUMN assessment.maker_signature_obtained IS
    'Maker signature obtained. One of: yes, no.';
COMMENT ON COLUMN assessment.maker_signature_date IS
    'Maker signature date.';
COMMENT ON COLUMN assessment.witness_name IS
    'Witness name.';
COMMENT ON COLUMN assessment.witness_address IS
    'Witness address.';
COMMENT ON COLUMN assessment.witness_signature_obtained IS
    'Witness signature obtained. One of: yes, no.';
COMMENT ON COLUMN assessment.witness_signature_date IS
    'Witness signature date.';
COMMENT ON COLUMN assessment.second_witness_name IS
    'Second witness name.';
COMMENT ON COLUMN assessment.second_witness_signature_obtained IS
    'Second witness signature obtained. One of: yes, no.';
COMMENT ON COLUMN assessment.declaration_statement_agreed IS
    'Declaration statement agreed. One of: yes, no.';
COMMENT ON COLUMN assessment.legal_notes IS
    'Legal notes.';
