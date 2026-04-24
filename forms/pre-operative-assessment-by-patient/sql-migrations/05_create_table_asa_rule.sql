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
CREATE TRIGGER trigger_asa_rule_updated_at
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
