/**
 * Declarative REBA scoring rules.
 * Ported from reba-rules.ts in the Svelte patient form.
 */
export const rebaRules = [
    // ─── NECK POSTURE ────────────────────────────────────────
    { id: 'NECK-001', system: 'Neck', description: 'Neck flexed 0-20 degrees', score: 1,
      evaluate: (d) => d.postureAssessment.neckAngle === 'flexed-0-20' },
    { id: 'NECK-002', system: 'Neck', description: 'Neck flexed >20 degrees', score: 2,
      evaluate: (d) => d.postureAssessment.neckAngle === 'flexed-20-plus' },
    { id: 'NECK-003', system: 'Neck', description: 'Neck extended', score: 2,
      evaluate: (d) => d.postureAssessment.neckAngle === 'extended' },
    { id: 'NECK-004', system: 'Neck', description: 'Neck twisted or side-bending', score: 3,
      evaluate: (d) => d.postureAssessment.neckAngle === 'twisted' },

    // ─── TRUNK POSTURE ───────────────────────────────────────
    { id: 'TRUNK-001', system: 'Trunk', description: 'Trunk upright (neutral)', score: 1,
      evaluate: (d) => d.postureAssessment.trunkAngle === 'neutral' },
    { id: 'TRUNK-002', system: 'Trunk', description: 'Trunk flexed 0-20 degrees', score: 2,
      evaluate: (d) => d.postureAssessment.trunkAngle === 'flexed-0-20' },
    { id: 'TRUNK-003', system: 'Trunk', description: 'Trunk flexed 20-60 degrees', score: 3,
      evaluate: (d) => d.postureAssessment.trunkAngle === 'flexed-20-60' },
    { id: 'TRUNK-004', system: 'Trunk', description: 'Trunk flexed >60 degrees', score: 4,
      evaluate: (d) => d.postureAssessment.trunkAngle === 'flexed-60-plus' },
    { id: 'TRUNK-005', system: 'Trunk', description: 'Trunk twisted', score: 3,
      evaluate: (d) => d.postureAssessment.trunkAngle === 'twisted' },

    // ─── SHOULDER / UPPER ARM ────────────────────────────────
    { id: 'SHLDR-001', system: 'Shoulder', description: 'Shoulders raised or hunched', score: 2,
      evaluate: (d) => d.postureAssessment.shoulderPosition === 'raised' },
    { id: 'SHLDR-002', system: 'Shoulder', description: 'Arms abducted', score: 2,
      evaluate: (d) => d.postureAssessment.shoulderPosition === 'abducted' },
    { id: 'SHLDR-003', system: 'Shoulder', description: 'Arms flexed forward', score: 3,
      evaluate: (d) => d.postureAssessment.shoulderPosition === 'flexed' },

    // ─── WRIST ───────────────────────────────────────────────
    { id: 'WRIST-001', system: 'Wrist', description: 'Wrist flexed', score: 2,
      evaluate: (d) => d.postureAssessment.wristDeviation === 'flexed' },
    { id: 'WRIST-002', system: 'Wrist', description: 'Wrist extended', score: 2,
      evaluate: (d) => d.postureAssessment.wristDeviation === 'extended' },
    { id: 'WRIST-003', system: 'Wrist', description: 'Wrist ulnar deviation', score: 3,
      evaluate: (d) => d.postureAssessment.wristDeviation === 'ulnar-deviated' },
    { id: 'WRIST-004', system: 'Wrist', description: 'Wrist radial deviation', score: 2,
      evaluate: (d) => d.postureAssessment.wristDeviation === 'radial-deviated' },

    // ─── SITTING / STANDING POSTURE ──────────────────────────
    { id: 'POST-001', system: 'Posture', description: 'Slouched sitting posture', score: 2,
      evaluate: (d) => d.postureAssessment.sittingPosture === 'slouched' },
    { id: 'POST-002', system: 'Posture', description: 'Leaning forward while sitting', score: 2,
      evaluate: (d) => d.postureAssessment.sittingPosture === 'leaning-forward' },
    { id: 'POST-003', system: 'Posture', description: 'Asymmetric standing posture', score: 2,
      evaluate: (d) => d.postureAssessment.standingPosture === 'asymmetric' },

    // ─── WORKSTATION ─────────────────────────────────────────
    { id: 'WS-001', system: 'Workstation', description: 'Desk height incorrect', score: 1,
      evaluate: (d) => d.workstationSetup.deskHeight === 'too-low' || d.workstationSetup.deskHeight === 'too-high' },
    { id: 'WS-002', system: 'Workstation', description: 'Monitor not at eye level', score: 1,
      evaluate: (d) => d.workstationSetup.monitorHeight !== '' && d.workstationSetup.monitorHeight !== 'at-eye-level' },
    { id: 'WS-003', system: 'Workstation', description: 'Keyboard placement incorrect', score: 1,
      evaluate: (d) => d.workstationSetup.keyboardPlacement !== '' && d.workstationSetup.keyboardPlacement !== 'correct' },
    { id: 'WS-004', system: 'Workstation', description: 'Mouse awkward reach', score: 1,
      evaluate: (d) => d.workstationSetup.mousePlacement === 'awkward-reach' },

    // ─── REPETITIVE TASKS ────────────────────────────────────
    { id: 'REP-001', system: 'Repetition', description: 'Constant repetitive tasks', score: 2,
      evaluate: (d) => d.repetitiveTasks.frequency === 'constantly' },
    { id: 'REP-002', system: 'Repetition', description: 'Frequent repetitive tasks', score: 1,
      evaluate: (d) => d.repetitiveTasks.frequency === 'frequently' },
    { id: 'REP-003', system: 'Repetition', description: 'Heavy force required', score: 3,
      evaluate: (d) => d.repetitiveTasks.forceRequired === 'heavy' },
    { id: 'REP-004', system: 'Repetition', description: 'Moderate force required', score: 2,
      evaluate: (d) => d.repetitiveTasks.forceRequired === 'moderate' },

    // ─── MANUAL HANDLING ─────────────────────────────────────
    { id: 'MH-001', system: 'Manual Handling', description: 'Heavy load lifting (>20kg)', score: 3,
      evaluate: (d) => d.manualHandling.loadWeightKg !== null && d.manualHandling.loadWeightKg > 20 },
    { id: 'MH-002', system: 'Manual Handling', description: 'Moderate load lifting (10-20kg)', score: 2,
      evaluate: (d) => d.manualHandling.loadWeightKg !== null && d.manualHandling.loadWeightKg >= 10 && d.manualHandling.loadWeightKg <= 20 },
    { id: 'MH-003', system: 'Manual Handling', description: 'Frequent lifting required', score: 2,
      evaluate: (d) => d.manualHandling.liftingFrequency === 'frequent' || d.manualHandling.liftingFrequency === 'constant' },
    { id: 'MH-004', system: 'Manual Handling', description: 'Heavy push/pull forces', score: 2,
      evaluate: (d) => d.manualHandling.pushPullForces === 'heavy' },

    // ─── VIBRATION ───────────────────────────────────────────
    { id: 'VIB-001', system: 'Vibration', description: 'Vibration exposure present', score: 2,
      evaluate: (d) => d.repetitiveTasks.vibrationExposure === 'yes' },

    // ─── SYMPTOMS ────────────────────────────────────────────
    { id: 'SYM-001', system: 'Symptoms', description: 'Severe pain (8-10)', score: 3,
      evaluate: (d) => d.currentSymptoms.painSeverity !== null && d.currentSymptoms.painSeverity >= 8 },
    { id: 'SYM-002', system: 'Symptoms', description: 'Moderate pain (5-7)', score: 2,
      evaluate: (d) => d.currentSymptoms.painSeverity !== null && d.currentSymptoms.painSeverity >= 5 && d.currentSymptoms.painSeverity <= 7 },
    { id: 'SYM-003', system: 'Symptoms', description: 'Unable to work due to symptoms', score: 3,
      evaluate: (d) => d.currentSymptoms.impactOnWork === 'unable-to-work' },
    { id: 'SYM-004', system: 'Symptoms', description: 'Severe impact on work', score: 2,
      evaluate: (d) => d.currentSymptoms.impactOnWork === 'severe' }
];
