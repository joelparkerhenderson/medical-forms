CREATE TABLE pvt_rule (
    -- Rule identifier (e.g. PVT-001)
    id              TEXT PRIMARY KEY,

    -- Rule metadata
    category        TEXT NOT NULL,
    description     TEXT NOT NULL,
    risk_level      TEXT NOT NULL CHECK (risk_level IN ('high', 'medium', 'low')),

    -- Audit timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_pvt_rule_updated_at
    BEFORE UPDATE ON pvt_rule
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- Seed all 20 PVT risk rules
-- ──────────────────────────────────────────────────────────────

-- HIGH RISK (PVT-001 to PVT-005)
INSERT INTO pvt_rule (id, category, description, risk_level) VALUES
    ('PVT-001', 'Overall Risk',       'Estimated 10-year CVD risk >= 20%',                                                                  'high'),
    ('PVT-002', 'Renal / Diabetes',   'Diabetes with eGFR < 30 (severe CKD with diabetes)',                                                 'high'),
    ('PVT-003', 'Blood Pressure',     'Systolic BP >= 180 mmHg (hypertensive crisis)',                                                      'high'),
    ('PVT-004', 'Multiple Factors',   'Multiple major risk factors (>= 3 of: diabetes, smoking, BP >= 160, TC >= 280, eGFR < 45)',          'high'),
    ('PVT-005', 'Diabetes / Smoking', 'HbA1c >= 10% with current smoking',                                                                 'high');

-- MEDIUM RISK (PVT-006 to PVT-015)
INSERT INTO pvt_rule (id, category, description, risk_level) VALUES
    ('PVT-006', 'Overall Risk',    '10-year risk 7.5-19.9% (intermediate risk)',         'medium'),
    ('PVT-007', 'Smoking',         'Current smoker',                                     'medium'),
    ('PVT-008', 'Diabetes',        'Diabetes present',                                   'medium'),
    ('PVT-009', 'Renal Function',  'eGFR 15-44 mL/min (CKD stage 3b-4)',               'medium'),
    ('PVT-010', 'Blood Pressure',  'Systolic BP 140-179 mmHg (hypertension)',            'medium'),
    ('PVT-011', 'Cholesterol',     'Total cholesterol >= 240 mg/dL',                     'medium'),
    ('PVT-012', 'Cholesterol',     'HDL cholesterol < 40 mg/dL (low)',                   'medium'),
    ('PVT-013', 'BMI',             'BMI >= 30 (obese)',                                  'medium'),
    ('PVT-014', 'Medications',     'On antihypertensive medication (known hypertension)', 'medium'),
    ('PVT-015', 'Renal Function',  'Albuminuria (uACR > 30 mg/g)',                      'medium');

-- LOW RISK / PROTECTIVE (PVT-016 to PVT-020)
INSERT INTO pvt_rule (id, category, description, risk_level) VALUES
    ('PVT-016', 'Cholesterol',     'HDL cholesterol >= 60 mg/dL (protective)',           'low'),
    ('PVT-017', 'Smoking',         'Non-smoker',                                         'low'),
    ('PVT-018', 'Blood Pressure',  'Normal BP (< 120/80 mmHg), no treatment',           'low'),
    ('PVT-019', 'Renal Function',  'eGFR >= 90 mL/min (normal renal function)',          'low'),
    ('PVT-020', 'BMI',             'BMI 18.5-24.9 (normal weight)',                      'low');

COMMENT ON TABLE pvt_rule IS
    'Catalogue of 20 PVT risk rules evaluated during PREVENT risk grading.';
COMMENT ON COLUMN pvt_rule.id IS
    'Rule identifier (e.g. PVT-001). Application-defined, not auto-generated.';
COMMENT ON COLUMN pvt_rule.category IS
    'Clinical category (e.g. Blood Pressure, Cholesterol, Renal Function).';
COMMENT ON COLUMN pvt_rule.description IS
    'Human-readable description of the rule condition.';
COMMENT ON COLUMN pvt_rule.risk_level IS
    'Risk level: high, medium, or low.';
COMMENT ON COLUMN pvt_rule.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN pvt_rule.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
