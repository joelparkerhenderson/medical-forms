CREATE TABLE reba_rule (
    -- Rule identifier (e.g. NECK-001, TRUNK-003)
    id              TEXT PRIMARY KEY,

    -- Body system or category
    system          TEXT NOT NULL,

    -- Human-readable description
    description     TEXT NOT NULL,

    -- Score contribution when rule fires
    score           INTEGER NOT NULL CHECK (score >= 0 AND score <= 15),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE reba_rule IS
    'Reference table of REBA scoring rules. Each rule has an ID, system, description, and score contribution.';
COMMENT ON COLUMN reba_rule.id IS
    'Rule identifier, e.g. NECK-001, TRUNK-003, WS-002.';
COMMENT ON COLUMN reba_rule.system IS
    'Body system or assessment category, e.g. Neck, Trunk, Workstation, Repetition, Manual Handling.';
COMMENT ON COLUMN reba_rule.description IS
    'Human-readable description of the condition this rule detects.';
COMMENT ON COLUMN reba_rule.score IS
    'REBA score contribution when the rule fires (0-15).';

-- ─── Seed REBA rules ─────────────────────────────────────
INSERT INTO reba_rule (id, system, description, score) VALUES
    ('NECK-001', 'Neck', 'Neck flexed 0-20 degrees', 1),
    ('NECK-002', 'Neck', 'Neck flexed >20 degrees', 2),
    ('NECK-003', 'Neck', 'Neck extended', 2),
    ('NECK-004', 'Neck', 'Neck twisted or side-bending', 3),
    ('TRUNK-001', 'Trunk', 'Trunk upright (neutral)', 1),
    ('TRUNK-002', 'Trunk', 'Trunk flexed 0-20 degrees', 2),
    ('TRUNK-003', 'Trunk', 'Trunk flexed 20-60 degrees', 3),
    ('TRUNK-004', 'Trunk', 'Trunk flexed >60 degrees', 4),
    ('TRUNK-005', 'Trunk', 'Trunk twisted', 3),
    ('SHLDR-001', 'Shoulder', 'Shoulders raised or hunched', 2),
    ('SHLDR-002', 'Shoulder', 'Arms abducted', 2),
    ('SHLDR-003', 'Shoulder', 'Arms flexed forward', 3),
    ('WRIST-001', 'Wrist', 'Wrist flexed', 2),
    ('WRIST-002', 'Wrist', 'Wrist extended', 2),
    ('WRIST-003', 'Wrist', 'Wrist ulnar deviation', 3),
    ('WRIST-004', 'Wrist', 'Wrist radial deviation', 2),
    ('POST-001', 'Posture', 'Slouched sitting posture', 2),
    ('POST-002', 'Posture', 'Leaning forward while sitting', 2),
    ('POST-003', 'Posture', 'Asymmetric standing posture', 2),
    ('WS-001', 'Workstation', 'Desk height incorrect', 1),
    ('WS-002', 'Workstation', 'Monitor not at eye level', 1),
    ('WS-003', 'Workstation', 'Keyboard placement incorrect', 1),
    ('WS-004', 'Workstation', 'Mouse awkward reach', 1),
    ('REP-001', 'Repetition', 'Constant repetitive tasks', 2),
    ('REP-002', 'Repetition', 'Frequent repetitive tasks', 1),
    ('REP-003', 'Repetition', 'Heavy force required', 3),
    ('REP-004', 'Repetition', 'Moderate force required', 2),
    ('MH-001', 'Manual Handling', 'Heavy load lifting (>20kg)', 3),
    ('MH-002', 'Manual Handling', 'Moderate load lifting (10-20kg)', 2),
    ('MH-003', 'Manual Handling', 'Frequent lifting required', 2),
    ('MH-004', 'Manual Handling', 'Heavy push/pull forces', 2),
    ('VIB-001', 'Vibration', 'Vibration exposure present', 2),
    ('SYM-001', 'Symptoms', 'Severe pain (8-10)', 3),
    ('SYM-002', 'Symptoms', 'Moderate pain (5-7)', 2),
    ('SYM-003', 'Symptoms', 'Unable to work due to symptoms', 3),
    ('SYM-004', 'Symptoms', 'Severe impact on work', 2);

COMMENT ON COLUMN reba_rule.created_at IS
    'Timestamp when this row was created.';
