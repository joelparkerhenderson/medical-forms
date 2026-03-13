-- ============================================================
-- 12_diabetes_rule.sql
-- Reference catalogue of all 20 diabetes rules (DM-001 to DM-020).
-- ============================================================
-- Rows are seeded at deployment time and referenced by
-- grading_fired_rule for audit purposes.
-- ============================================================

CREATE TABLE diabetes_rule (
    -- Rule identifier (e.g. 'DM-001')
    id                  TEXT PRIMARY KEY,

    -- Clinical category (e.g. 'Glycaemic Control', 'Foot')
    category            TEXT NOT NULL,

    -- Human-readable description of the rule
    description         TEXT NOT NULL,

    -- Concern level when rule fires
    concern_level       TEXT NOT NULL CHECK (concern_level IN ('high', 'medium', 'low')),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_diabetes_rule_updated_at
    BEFORE UPDATE ON diabetes_rule
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed all 20 diabetes rules
INSERT INTO diabetes_rule (id, category, description, concern_level) VALUES
    ('DM-001', 'Glycaemic Control', 'HbA1c >= 86 mmol/mol (>= 10%) - very poor glycaemic control', 'high'),
    ('DM-002', 'Hypoglycaemia', 'Severe hypoglycaemia reported', 'high'),
    ('DM-003', 'Foot', 'Active foot ulcer present', 'high'),
    ('DM-004', 'Eye', 'Proliferative retinopathy detected', 'high'),
    ('DM-005', 'Renal', 'eGFR < 30 - severe renal impairment', 'high'),
    ('DM-006', 'Glycaemic Control', 'HbA1c 64-85 mmol/mol (8-9.9%) - suboptimal glycaemic control', 'medium'),
    ('DM-007', 'Hypoglycaemia', 'Recurrent hypoglycaemia reported', 'medium'),
    ('DM-008', 'Eye', 'Background retinopathy detected', 'medium'),
    ('DM-009', 'Renal', 'eGFR 30-59 - moderate renal impairment', 'medium'),
    ('DM-010', 'Renal', 'Microalbuminuria detected (elevated urine ACR)', 'medium'),
    ('DM-011', 'Neuropathy', 'Neuropathy symptoms reported', 'medium'),
    ('DM-012', 'Medication', 'Poor medication adherence (1-2 out of 5)', 'medium'),
    ('DM-013', 'Self-Care', 'BMI >= 35 - obesity class II or above', 'medium'),
    ('DM-014', 'Self-Care', 'Poor diet adherence (1-2 out of 5)', 'medium'),
    ('DM-015', 'Psychological', 'High diabetes distress (4-5 out of 5)', 'medium'),
    ('DM-016', 'Glycaemic Control', 'HbA1c at target (<= 53 mmol/mol / <= 7%)', 'low'),
    ('DM-017', 'Complications', 'No complications detected across all screening domains', 'low'),
    ('DM-018', 'Self-Care', 'Good self-care adherence (diet >= 4/5)', 'low'),
    ('DM-019', 'Self-Care', 'Physically active (regular or very active)', 'low'),
    ('DM-020', 'Psychological', 'Good psychological wellbeing (low distress, good coping)', 'low');

COMMENT ON TABLE diabetes_rule IS
    'Reference catalogue of all 20 diabetes assessment rules (DM-001 to DM-020). Seeded at deployment.';
COMMENT ON COLUMN diabetes_rule.id IS
    'Rule identifier (e.g. DM-001). Matches application-side rule IDs.';
COMMENT ON COLUMN diabetes_rule.category IS
    'Clinical category the rule evaluates (e.g. Glycaemic Control, Foot, Renal).';
COMMENT ON COLUMN diabetes_rule.description IS
    'Human-readable description of what the rule detects.';
COMMENT ON COLUMN diabetes_rule.concern_level IS
    'Clinical concern level when rule fires: high, medium, or low.';
