CREATE TABLE pre_operative_assessment_by_patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    weight NUMERIC(5,1) CHECK (weight IS NULL OR weight > 0),
    height NUMERIC(5,1) CHECK (height IS NULL OR height > 0),
    bmi NUMERIC(4,1) CHECK (bmi IS NULL OR (bmi >= 10 AND bmi <= 100)),
    planned_procedure TEXT NOT NULL DEFAULT '',
    procedure_urgency TEXT NOT NULL DEFAULT '' CHECK (procedure_urgency IN ('elective', 'urgent', 'emergency', '')),
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hypertension TEXT NOT NULL DEFAULT '' CHECK (hypertension IN ('yes', 'no', '')),
    hypertension_controlled TEXT NOT NULL DEFAULT '' CHECK (hypertension_controlled IN ('yes', 'no', '')),
    ischemic_heart_disease TEXT NOT NULL DEFAULT '' CHECK (ischemic_heart_disease IN ('yes', 'no', '')),
    ihd_details TEXT NOT NULL DEFAULT '',
    heart_failure TEXT NOT NULL DEFAULT '' CHECK (heart_failure IN ('yes', 'no', '')),
    heart_failure_nyha TEXT NOT NULL DEFAULT '' CHECK (heart_failure_nyha IN ('1', '2', '3', '4', '')),
    valvular_disease TEXT NOT NULL DEFAULT '' CHECK (valvular_disease IN ('yes', 'no', '')),
    valvular_details TEXT NOT NULL DEFAULT '',
    arrhythmia TEXT NOT NULL DEFAULT '' CHECK (arrhythmia IN ('yes', 'no', '')),
    arrhythmia_type TEXT NOT NULL DEFAULT '',
    pacemaker TEXT NOT NULL DEFAULT '' CHECK (pacemaker IN ('yes', 'no', '')),
    recent_mi TEXT NOT NULL DEFAULT '' CHECK (recent_mi IN ('yes', 'no', '')),
    recent_mi_weeks INTEGER CHECK (recent_mi_weeks IS NULL OR recent_mi_weeks >= 0),
    asthma TEXT NOT NULL DEFAULT '' CHECK (asthma IN ('yes', 'no', '')),
    asthma_frequency TEXT NOT NULL DEFAULT '' CHECK (asthma_frequency IN ( 'intermittent', 'mild-persistent', 'moderate-persistent', 'severe-persistent', '' )),
    copd TEXT NOT NULL DEFAULT '' CHECK (copd IN ('yes', 'no', '')),
    copd_severity TEXT NOT NULL DEFAULT '' CHECK (copd_severity IN ('mild', 'moderate', 'severe', '')),
    osa TEXT NOT NULL DEFAULT '' CHECK (osa IN ('yes', 'no', '')),
    osa_cpap TEXT NOT NULL DEFAULT '' CHECK (osa_cpap IN ('yes', 'no', '')),
    smoking TEXT NOT NULL DEFAULT '' CHECK (smoking IN ('current', 'ex', 'never', '')),
    smoking_pack_years INTEGER CHECK (smoking_pack_years IS NULL OR smoking_pack_years >= 0),
    recent_urti TEXT NOT NULL DEFAULT '' CHECK (recent_urti IN ('yes', 'no', '')),
    ckd TEXT NOT NULL DEFAULT '' CHECK (ckd IN ('yes', 'no', '')),
    ckd_stage TEXT NOT NULL DEFAULT '' CHECK (ckd_stage IN ('1', '2', '3', '4', '5', '')),
    dialysis TEXT NOT NULL DEFAULT '' CHECK (dialysis IN ('yes', 'no', '')),
    dialysis_type TEXT NOT NULL DEFAULT '' CHECK (dialysis_type IN ('haemodialysis', 'peritoneal', '')),
    liver_disease TEXT NOT NULL DEFAULT '' CHECK (liver_disease IN ('yes', 'no', '')),
    cirrhosis TEXT NOT NULL DEFAULT '' CHECK (cirrhosis IN ('yes', 'no', '')),
    child_pugh_score TEXT NOT NULL DEFAULT '' CHECK (child_pugh_score IN ('A', 'B', 'C', '')),
    hepatitis TEXT NOT NULL DEFAULT '' CHECK (hepatitis IN ('yes', 'no', '')),
    hepatitis_type TEXT NOT NULL DEFAULT '',
    diabetes TEXT NOT NULL DEFAULT '' CHECK (diabetes IN ('type1', 'type2', 'gestational', 'none', '')),
    diabetes_control TEXT NOT NULL DEFAULT '' CHECK (diabetes_control IN ('well-controlled', 'poorly-controlled', '')),
    diabetes_on_insulin TEXT NOT NULL DEFAULT '' CHECK (diabetes_on_insulin IN ('yes', 'no', '')),
    thyroid_disease TEXT NOT NULL DEFAULT '' CHECK (thyroid_disease IN ('yes', 'no', '')),
    thyroid_type TEXT NOT NULL DEFAULT '' CHECK (thyroid_type IN ('hypothyroid', 'hyperthyroid', '')),
    adrenal_insufficiency TEXT NOT NULL DEFAULT '' CHECK (adrenal_insufficiency IN ('yes', 'no', '')),
    stroke_or_tia TEXT NOT NULL DEFAULT '' CHECK (stroke_or_tia IN ('yes', 'no', '')),
    stroke_details TEXT NOT NULL DEFAULT '',
    epilepsy TEXT NOT NULL DEFAULT '' CHECK (epilepsy IN ('yes', 'no', '')),
    epilepsy_controlled TEXT NOT NULL DEFAULT '' CHECK (epilepsy_controlled IN ('yes', 'no', '')),
    neuromuscular_disease TEXT NOT NULL DEFAULT '' CHECK (neuromuscular_disease IN ('yes', 'no', '')),
    neuromuscular_details TEXT NOT NULL DEFAULT '',
    raised_icp TEXT NOT NULL DEFAULT '' CHECK (raised_icp IN ('yes', 'no', '')),
    bleeding_disorder TEXT NOT NULL DEFAULT '' CHECK (bleeding_disorder IN ('yes', 'no', '')),
    bleeding_details TEXT NOT NULL DEFAULT '',
    on_anticoagulants TEXT NOT NULL DEFAULT '' CHECK (on_anticoagulants IN ('yes', 'no', '')),
    anticoagulant_type TEXT NOT NULL DEFAULT '',
    sickle_cell_disease TEXT NOT NULL DEFAULT '' CHECK (sickle_cell_disease IN ('yes', 'no', '')),
    sickle_cell_trait TEXT NOT NULL DEFAULT '' CHECK (sickle_cell_trait IN ('yes', 'no', '')),
    anaemia TEXT NOT NULL DEFAULT '' CHECK (anaemia IN ('yes', 'no', '')),
    rheumatoid_arthritis TEXT NOT NULL DEFAULT '' CHECK (rheumatoid_arthritis IN ('yes', 'no', '')),
    cervical_spine_issues TEXT NOT NULL DEFAULT '' CHECK (cervical_spine_issues IN ('yes', 'no', '')),
    limited_neck_movement TEXT NOT NULL DEFAULT '' CHECK (limited_neck_movement IN ('yes', 'no', '')),
    limited_mouth_opening TEXT NOT NULL DEFAULT '' CHECK (limited_mouth_opening IN ('yes', 'no', '')),
    dental_issues TEXT NOT NULL DEFAULT '' CHECK (dental_issues IN ('yes', 'no', '')),
    dental_details TEXT NOT NULL DEFAULT '',
    previous_difficult_airway TEXT NOT NULL DEFAULT '' CHECK (previous_difficult_airway IN ('yes', 'no', '')),
    mallampati_score TEXT NOT NULL DEFAULT '' CHECK (mallampati_score IN ('1', '2', '3', '4', '')),
    gord TEXT NOT NULL DEFAULT '' CHECK (gord IN ('yes', 'no', '')),
    hiatus_hernia TEXT NOT NULL DEFAULT '' CHECK (hiatus_hernia IN ('yes', 'no', '')),
    nausea TEXT NOT NULL DEFAULT '' CHECK (nausea IN ('yes', 'no', '')),
    name TEXT NOT NULL DEFAULT '',
    dose TEXT NOT NULL DEFAULT '',
    frequency TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    allergen TEXT NOT NULL DEFAULT '',
    reaction TEXT NOT NULL DEFAULT '',
    severity TEXT NOT NULL DEFAULT '' CHECK (severity IN ('mild', 'moderate', 'anaphylaxis', '')),
    allergy_sort_order INTEGER NOT NULL DEFAULT 0,
    previous_anaesthesia TEXT NOT NULL DEFAULT '' CHECK (previous_anaesthesia IN ('yes', 'no', '')),
    anaesthesia_problems TEXT NOT NULL DEFAULT '' CHECK (anaesthesia_problems IN ('yes', 'no', '')),
    anaesthesia_problem_details TEXT NOT NULL DEFAULT '',
    family_mh_history TEXT NOT NULL DEFAULT '' CHECK (family_mh_history IN ('yes', 'no', '')),
    family_mh_details TEXT NOT NULL DEFAULT '',
    ponv TEXT NOT NULL DEFAULT '' CHECK (ponv IN ('yes', 'no', '')),
    alcohol TEXT NOT NULL DEFAULT '' CHECK (alcohol IN ('none', 'occasional', 'moderate', 'heavy', '')),
    alcohol_units_per_week INTEGER CHECK (alcohol_units_per_week IS NULL OR alcohol_units_per_week >= 0),
    recreational_drugs TEXT NOT NULL DEFAULT '' CHECK (recreational_drugs IN ('yes', 'no', '')),
    drug_details TEXT NOT NULL DEFAULT '',
    exercise_tolerance TEXT NOT NULL DEFAULT '' CHECK (exercise_tolerance IN ( 'unable', 'light-housework', 'climb-stairs', 'moderate-exercise', 'vigorous-exercise', '' )),
    estimated_mets NUMERIC(3,1) CHECK (estimated_mets IS NULL OR estimated_mets >= 0),
    mobility_aids TEXT NOT NULL DEFAULT '' CHECK (mobility_aids IN ('yes', 'no', '')),
    recent_decline TEXT NOT NULL DEFAULT '' CHECK (recent_decline IN ('yes', 'no', '')),
    possibly_pregnant TEXT NOT NULL DEFAULT '' CHECK (possibly_pregnant IN ('yes', 'no', '')),
    pregnancy_confirmed TEXT NOT NULL DEFAULT '' CHECK (pregnancy_confirmed IN ('yes', 'no', '')),
    gestation_weeks INTEGER CHECK (gestation_weeks IS NULL OR (gestation_weeks >= 0 AND gestation_weeks <= 45))
);

CREATE TRIGGER trg_assessment_updated_at
    BEFORE UPDATE ON assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment IS
    'Flat assessment table: parent assessment merged with every assessment_<section> child. Generated by bin/generate-sql-flat.py.';

-- Renamed columns (section prefix applied on conflict):
--   assessment_allergy.sort_order -> assessment.allergy_sort_order


-- ========================================================================
-- 19-asa-rule.sql
-- ========================================================================

-- ============================================================
-- 19_asa_rule.sql
-- Reference table: ASA grading rules + seed data.
-- ============================================================
-- Contains all 42 declarative ASA rules from asa-rules.ts.
-- Each rule maps a clinical condition to an ASA grade.
-- The evaluate logic lives in the application layer; this
-- table preserves the rule catalogue for audit and reporting.
-- ============================================================

CREATE TABLE asa_rule (
    -- Primary key: the rule code (e.g. CV-001)
    id          TEXT PRIMARY KEY,

    -- Body system the rule belongs to
    system      TEXT NOT NULL,

    -- Human-readable description of the condition
    description TEXT NOT NULL,

    -- ASA grade this rule assigns (1-5)
    grade       INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 5),

    -- Audit timestamps
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_asa_rule_updated_at
    BEFORE UPDATE ON asa_rule
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE asa_rule IS
    'Reference table of ASA grading rules. Seed data mirrors asa-rules.ts. Used for audit trail.';
COMMENT ON COLUMN asa_rule.id IS
    'Rule code (e.g. CV-001). Stable identifier shared with application code.';
COMMENT ON COLUMN asa_rule.system IS
    'Body system or category (e.g. Cardiovascular, Respiratory).';
COMMENT ON COLUMN asa_rule.description IS
    'Human-readable condition description (e.g. Controlled hypertension).';
COMMENT ON COLUMN asa_rule.grade IS
    'ASA grade assigned when this rule fires: 1 (healthy) to 5 (moribund).';
COMMENT ON COLUMN asa_rule.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN asa_rule.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

-- ──────────────────────────────────────────────────────────────
-- Seed data: all 42 ASA rules from asa-rules.ts
-- ──────────────────────────────────────────────────────────────

INSERT INTO asa_rule (id, system, description, grade) VALUES
    -- Cardiovascular (10 rules)
    ('CV-001', 'Cardiovascular',      'Controlled hypertension',                   2),
    ('CV-002', 'Cardiovascular',      'Uncontrolled hypertension',                 3),
    ('CV-003', 'Cardiovascular',      'Stable ischaemic heart disease',            2),
    ('CV-004', 'Cardiovascular',      'Recent myocardial infarction (<3 months)',   4),
    ('CV-005', 'Cardiovascular',      'Heart failure NYHA I-II',                   2),
    ('CV-006', 'Cardiovascular',      'Heart failure NYHA III',                    3),
    ('CV-007', 'Cardiovascular',      'Heart failure NYHA IV',                     4),
    ('CV-008', 'Cardiovascular',      'Valvular heart disease',                    3),
    ('CV-009', 'Cardiovascular',      'Arrhythmia',                                2),
    ('CV-010', 'Cardiovascular',      'Pacemaker/ICD in situ',                     2),

    -- Respiratory (7 rules)
    ('RS-001', 'Respiratory',         'Mild/intermittent asthma',                  2),
    ('RS-002', 'Respiratory',         'Moderate-severe persistent asthma',         3),
    ('RS-003', 'Respiratory',         'Mild COPD',                                 2),
    ('RS-004', 'Respiratory',         'Moderate COPD',                             3),
    ('RS-005', 'Respiratory',         'Severe COPD',                               3),
    ('RS-006', 'Respiratory',         'Obstructive sleep apnoea',                  2),
    ('RS-007', 'Respiratory',         'Current smoker',                            2),

    -- Renal (3 rules)
    ('RN-001', 'Renal',              'CKD Stage 1-3',                             2),
    ('RN-002', 'Renal',              'CKD Stage 4-5',                             3),
    ('RN-003', 'Renal',              'On dialysis',                               3),

    -- Hepatic (3 rules)
    ('HP-001', 'Hepatic',            'Liver disease (non-cirrhotic)',              2),
    ('HP-002', 'Hepatic',            'Cirrhosis Child-Pugh A',                    3),
    ('HP-003', 'Hepatic',            'Cirrhosis Child-Pugh B/C',                  4),

    -- Endocrine (4 rules)
    ('EN-001', 'Endocrine',          'Well-controlled diabetes',                  2),
    ('EN-002', 'Endocrine',          'Poorly controlled diabetes',                3),
    ('EN-003', 'Endocrine',          'Thyroid disease',                           2),
    ('EN-004', 'Endocrine',          'Adrenal insufficiency',                     3),

    -- Neurological (5 rules)
    ('NR-001', 'Neurological',       'Previous stroke/TIA',                       3),
    ('NR-002', 'Neurological',       'Controlled epilepsy',                       2),
    ('NR-003', 'Neurological',       'Uncontrolled epilepsy',                     3),
    ('NR-004', 'Neurological',       'Neuromuscular disease',                     3),
    ('NR-005', 'Neurological',       'Raised intracranial pressure',              4),

    -- Haematological (4 rules)
    ('HM-001', 'Haematological',     'Bleeding disorder',                         3),
    ('HM-002', 'Haematological',     'On anticoagulants',                         2),
    ('HM-003', 'Haematological',     'Sickle cell disease',                       3),
    ('HM-004', 'Haematological',     'Anaemia',                                   2),

    -- Obesity (2 rules)
    ('OB-001', 'Obesity',            'BMI 30-39 (Obese)',                         2),
    ('OB-002', 'Obesity',            'BMI ≥40 (Morbid obesity)',                  3),

    -- Functional Capacity (1 rule)
    ('FC-001', 'Functional Capacity', 'Poor functional capacity (<4 METs)',        3),

    -- Demographics (1 rule)
    ('AG-001', 'Demographics',       'Age >80 years',                             2),

    -- Social History (2 rules)
    ('SH-001', 'Social',            'Heavy alcohol use',                          2),
    ('SH-002', 'Social',            'Recreational drug use',                      2);

-- ========================================================================
-- 20-grading-result.sql
-- ========================================================================

-- ============================================================
-- 20_grading_result.sql
-- Computed ASA grading result (1:1 with assessment).
-- ============================================================
-- Stores the output of the ASA grading engine. Created when
-- the patient submits the questionnaire and the engine runs.
-- Supports clinician override with documented reason.
-- ============================================================

CREATE TABLE grading_result (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Computed ASA grade (highest grade from all fired rules; 1 if none fired)
    asa_grade           INTEGER NOT NULL CHECK (asa_grade BETWEEN 1 AND 5),

    -- Clinician override: when clinical judgement differs from computed grade
    asa_grade_override  INTEGER CHECK (asa_grade_override IS NULL OR asa_grade_override BETWEEN 1 AND 6),
    override_reason     TEXT NOT NULL DEFAULT ''
                        CHECK (asa_grade_override IS NULL OR override_reason != ''),

    -- Timestamp of when the grading engine ran
    graded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    '1:1 with assessment. Stores computed ASA grade and optional clinician override.';
COMMENT ON COLUMN grading_result.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN grading_result.asa_grade IS
    'Computed ASA grade (1-5). Determined by the highest-grade fired rule; defaults to 1 (healthy).';
COMMENT ON COLUMN grading_result.asa_grade_override IS
    'Clinician-assigned ASA grade override (1-6). NULL means no override. 6 = brain-dead donor.';
COMMENT ON COLUMN grading_result.override_reason IS
    'Free-text justification for overriding the computed grade. Required when override is set.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading engine produced this result.';
COMMENT ON COLUMN grading_result.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

-- ========================================================================
-- 21-grading-fired-rule.sql
-- ========================================================================

-- ============================================================
-- 21_grading_fired_rule.sql
-- Fired rules for a grading result (many-to-one).
-- ============================================================
-- Each row records one ASA rule that fired during grading.
-- Rule metadata is denormalized (copied at grading time) so
-- the audit trail survives future rule catalogue changes.
-- Also holds an FK to asa_rule for join queries.
-- ============================================================

CREATE TABLE grading_fired_rule (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Many-to-one: one grading result can have many fired rules
    grading_result_id   UUID NOT NULL REFERENCES grading_result(id) ON DELETE CASCADE,

    -- FK to the rule catalogue (may be NULL if rule is retired)
    asa_rule_id         TEXT REFERENCES asa_rule(id) ON DELETE SET NULL,

    -- Denormalized snapshot of the rule at grading time
    rule_system         TEXT NOT NULL,
    rule_description    TEXT NOT NULL,
    rule_grade          INTEGER NOT NULL CHECK (rule_grade BETWEEN 1 AND 5),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all fired rules for a grading result
CREATE INDEX idx_grading_fired_rule_grading_result_id
    ON grading_fired_rule(grading_result_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Many-to-one with grading_result. Each row is one ASA rule that fired. Denormalized for audit.';
COMMENT ON COLUMN grading_fired_rule.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'FK to grading_result. One result may have many fired rules.';
COMMENT ON COLUMN grading_fired_rule.asa_rule_id IS
    'FK to asa_rule catalogue. SET NULL on delete so audit rows survive rule removal.';
COMMENT ON COLUMN grading_fired_rule.rule_system IS
    'Body system at grading time (denormalized from asa_rule).';
COMMENT ON COLUMN grading_fired_rule.rule_description IS
    'Rule description at grading time (denormalized from asa_rule).';
COMMENT ON COLUMN grading_fired_rule.rule_grade IS
    'ASA grade at grading time (denormalized from asa_rule).';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN grading_fired_rule.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

-- ========================================================================
-- 22-grading-additional-flag.sql
-- ========================================================================

-- ============================================================
-- 22_grading_additional_flag.sql
-- Additional safety flags for a grading result (many-to-one).
-- ============================================================
-- Each row is a safety-critical alert detected by the flagged
-- issues engine, independent of ASA grade. Maps from the
-- AdditionalFlag TypeScript interface.
-- ============================================================

CREATE TABLE grading_additional_flag (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Many-to-one: one grading result can have many flags
    grading_result_id   UUID NOT NULL REFERENCES grading_result(id) ON DELETE CASCADE,

    -- Flag identification (matches the application-side flag id)
    flag_id             TEXT NOT NULL,

    -- Flag details
    category            TEXT NOT NULL,
    message             TEXT NOT NULL,
    priority            TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all flags for a grading result
CREATE INDEX idx_grading_additional_flag_grading_result_id
    ON grading_additional_flag(grading_result_id);

-- Prevent duplicate flags per grading result
CREATE UNIQUE INDEX idx_grading_additional_flag_unique
    ON grading_additional_flag(grading_result_id, flag_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_grading_additional_flag_updated_at
    BEFORE UPDATE ON grading_additional_flag
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_additional_flag IS
    'Many-to-one with grading_result. Safety-critical alerts detected by the flagged issues engine.';
COMMENT ON COLUMN grading_additional_flag.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN grading_additional_flag.grading_result_id IS
    'FK to grading_result. One result may have many flags.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS
    'Application-side flag identifier (e.g. FLAG-AIRWAY-001).';
COMMENT ON COLUMN grading_additional_flag.category IS
    'Flag category (e.g. Airway, Allergy, Cardiac).';
COMMENT ON COLUMN grading_additional_flag.message IS
    'Human-readable alert message for the anaesthetist.';
COMMENT ON COLUMN grading_additional_flag.priority IS
    'Alert priority: high, medium, or low.';
COMMENT ON COLUMN grading_additional_flag.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN grading_additional_flag.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';

COMMENT ON TABLE pre_operative_assessment_by_patient IS
    'Pre operative assessment by patient.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.patient_id IS
    'Foreign key to the patient table.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.weight IS
    'Weight.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.height IS
    'Height.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.bmi IS
    'BMI.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.planned_procedure IS
    'Planned procedure.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.procedure_urgency IS
    'Procedure urgency. One of: elective, urgent, emergency.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.status IS
    'Lifecycle status of this row.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.hypertension IS
    'Hypertension. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.hypertension_controlled IS
    'Hypertension controlled. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.ischemic_heart_disease IS
    'Ischemic heart disease. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.ihd_details IS
    'IHD details.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.heart_failure IS
    'Heart failure. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.heart_failure_nyha IS
    'Heart failure nyha. One of: 1, 2, 3, 4.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.valvular_disease IS
    'Valvular disease. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.valvular_details IS
    'Valvular details.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.arrhythmia IS
    'Arrhythmia. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.arrhythmia_type IS
    'Arrhythmia type.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.pacemaker IS
    'Pacemaker. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.recent_mi IS
    'Recent MI. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.recent_mi_weeks IS
    'Recent MI weeks.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.asthma IS
    'Asthma. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.asthma_frequency IS
    'Asthma frequency. One of: intermittent, mild-persistent, moderate-persistent, severe-persistent.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.copd IS
    'COPD. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.copd_severity IS
    'COPD severity. One of: mild, moderate, severe.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.osa IS
    'Osa. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.osa_cpap IS
    'Osa cpap. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.smoking IS
    'Smoking. One of: current, ex, never.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.smoking_pack_years IS
    'Smoking pack years.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.recent_urti IS
    'Recent urti. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.ckd IS
    'CKD. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.ckd_stage IS
    'CKD stage. One of: 1, 2, 3, 4, 5.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.dialysis IS
    'Dialysis. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.dialysis_type IS
    'Dialysis type. One of: haemodialysis, peritoneal.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.liver_disease IS
    'Liver disease. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.cirrhosis IS
    'Cirrhosis. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.child_pugh_score IS
    'Child pugh score. One of: A, B, C.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.hepatitis IS
    'Hepatitis. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.hepatitis_type IS
    'Hepatitis type.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.diabetes IS
    'Diabetes. One of: type1, type2, gestational, none.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.diabetes_control IS
    'Diabetes control. One of: well-controlled, poorly-controlled.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.diabetes_on_insulin IS
    'Diabetes on insulin. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.thyroid_disease IS
    'Thyroid disease. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.thyroid_type IS
    'Thyroid type. One of: hypothyroid, hyperthyroid.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.adrenal_insufficiency IS
    'Adrenal insufficiency. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.stroke_or_tia IS
    'Stroke or TIA. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.stroke_details IS
    'Stroke details.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.epilepsy IS
    'Epilepsy. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.epilepsy_controlled IS
    'Epilepsy controlled. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.neuromuscular_disease IS
    'Neuromuscular disease. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.neuromuscular_details IS
    'Neuromuscular details.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.raised_icp IS
    'Raised icp. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.bleeding_disorder IS
    'Bleeding disorder. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.bleeding_details IS
    'Bleeding details.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.on_anticoagulants IS
    'On anticoagulants. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.anticoagulant_type IS
    'Anticoagulant type.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.sickle_cell_disease IS
    'Sickle cell disease. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.sickle_cell_trait IS
    'Sickle cell trait. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.anaemia IS
    'Anaemia. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.rheumatoid_arthritis IS
    'Rheumatoid arthritis. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.cervical_spine_issues IS
    'Cervical spine issues. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.limited_neck_movement IS
    'Limited neck movement. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.limited_mouth_opening IS
    'Limited mouth opening. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.dental_issues IS
    'Dental issues. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.dental_details IS
    'Dental details.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.previous_difficult_airway IS
    'Previous difficult airway. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.mallampati_score IS
    'Mallampati score. One of: 1, 2, 3, 4.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.gord IS
    'Gord. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.hiatus_hernia IS
    'Hiatus hernia. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.nausea IS
    'Nausea. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.name IS
    'Name.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.dose IS
    'Dose.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.frequency IS
    'Frequency.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.sort_order IS
    'Sort order.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.allergen IS
    'Allergen.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.reaction IS
    'Reaction.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.severity IS
    'Severity. One of: mild, moderate, anaphylaxis.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.allergy_sort_order IS
    'Allergy sort order.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.previous_anaesthesia IS
    'Previous anaesthesia. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.anaesthesia_problems IS
    'Anaesthesia problems. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.anaesthesia_problem_details IS
    'Anaesthesia problem details.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.family_mh_history IS
    'Family mh history. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.family_mh_details IS
    'Family mh details.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.ponv IS
    'Ponv. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.alcohol IS
    'Alcohol. One of: none, occasional, moderate, heavy.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.alcohol_units_per_week IS
    'Alcohol units per week.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.recreational_drugs IS
    'Recreational drugs. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.drug_details IS
    'Drug details.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.exercise_tolerance IS
    'Exercise tolerance. One of: unable, light-housework, climb-stairs, moderate-exercise, vigorous-exercise.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.estimated_mets IS
    'Estimated METS.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.mobility_aids IS
    'Mobility aids. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.recent_decline IS
    'Recent decline. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.possibly_pregnant IS
    'Possibly pregnant. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.pregnancy_confirmed IS
    'Pregnancy confirmed. One of: yes, no.';
COMMENT ON COLUMN pre_operative_assessment_by_patient.gestation_weeks IS
    'Gestation weeks.';
