/**
 * Detects additional flags that should be highlighted for the ergonomic assessor,
 * independent of REBA score. These are safety-critical or actionable alerts.
 * Ported from flagged-issues.ts in the Svelte patient form.
 */
export function detectAdditionalFlags(data) {
    const flags = [];

    // ─── Very high REBA posture scores ───────────────────────
    if (
        data.postureAssessment.trunkAngle === 'flexed-60-plus' ||
        data.postureAssessment.neckAngle === 'twisted'
    ) {
        flags.push({
            id: 'FLAG-POSTURE-001', category: 'Posture',
            message: 'Extreme posture detected - immediate intervention required',
            priority: 'high'
        });
    }

    // ─── Existing RSI/injury ─────────────────────────────────
    if (data.medicalHistory.rsiCarpalTunnel === 'yes') {
        flags.push({
            id: 'FLAG-RSI-001', category: 'Medical History',
            message: 'Existing RSI/carpal tunnel syndrome - high risk for aggravation',
            priority: 'high'
        });
    }

    if (data.medicalHistory.backProblems === 'yes') {
        flags.push({
            id: 'FLAG-BACK-001', category: 'Medical History',
            message: 'Existing back problems - requires modified ergonomic plan',
            priority: 'high'
        });
    }

    if (data.medicalHistory.chronicPain === 'yes') {
        flags.push({
            id: 'FLAG-CHRONIC-001', category: 'Medical History',
            message: 'Chronic pain condition - consider referral to pain management',
            priority: 'high'
        });
    }

    // ─── Heavy manual handling without aids ───────────────────
    if (
        data.manualHandling.loadWeightKg !== null &&
        data.manualHandling.loadWeightKg > 20 &&
        data.manualHandling.mechanicalAidsAvailable !== 'yes'
    ) {
        flags.push({
            id: 'FLAG-MANUAL-001', category: 'Manual Handling',
            message: 'Heavy lifting (>20kg) without mechanical aids - immediate risk',
            priority: 'high'
        });
    }

    if (
        data.manualHandling.liftingFrequency === 'constant' &&
        data.manualHandling.teamLifting !== 'yes'
    ) {
        flags.push({
            id: 'FLAG-MANUAL-002', category: 'Manual Handling',
            message: 'Constant lifting without team support',
            priority: 'medium'
        });
    }

    // ─── No breaks taken ─────────────────────────────────────
    if (data.psychosocialFactors.breaksTaken === 'none') {
        flags.push({
            id: 'FLAG-BREAKS-001', category: 'Work Pattern',
            message: 'No breaks taken - increased risk of musculoskeletal injury',
            priority: 'medium'
        });
    }

    if (data.psychosocialFactors.breaksTaken === 'rarely') {
        flags.push({
            id: 'FLAG-BREAKS-002', category: 'Work Pattern',
            message: 'Breaks taken rarely - recommend regular microbreaks',
            priority: 'medium'
        });
    }

    // ─── Vibration exposure ──────────────────────────────────
    if (data.repetitiveTasks.vibrationExposure === 'yes') {
        flags.push({
            id: 'FLAG-VIBRATION-001', category: 'Vibration',
            message: 'Vibration exposure present - monitor for HAVS symptoms',
            priority: 'medium'
        });
    }

    // ─── Poor workstation setup ──────────────────────────────
    const wsIssues = [];
    if (data.workstationSetup.deskHeight === 'too-low' || data.workstationSetup.deskHeight === 'too-high') {
        wsIssues.push('desk height');
    }
    if (data.workstationSetup.monitorHeight !== '' && data.workstationSetup.monitorHeight !== 'at-eye-level') {
        wsIssues.push('monitor height');
    }
    if (data.workstationSetup.keyboardPlacement !== '' && data.workstationSetup.keyboardPlacement !== 'correct') {
        wsIssues.push('keyboard placement');
    }
    if (data.workstationSetup.lighting === 'glare-present') {
        wsIssues.push('screen glare');
    }

    if (wsIssues.length >= 3) {
        flags.push({
            id: 'FLAG-WS-001', category: 'Workstation',
            message: 'Multiple workstation issues: ' + wsIssues.join(', '),
            priority: 'medium'
        });
    }

    // ─── Poor chair adjustability ────────────────────────────
    if (data.workstationSetup.chairAdjustability === 'no') {
        flags.push({
            id: 'FLAG-WS-002', category: 'Workstation',
            message: 'Non-adjustable chair - recommend ergonomic chair assessment',
            priority: 'medium'
        });
    }

    // ─── Severe symptoms ─────────────────────────────────────
    if (data.currentSymptoms.painSeverity !== null && data.currentSymptoms.painSeverity >= 8) {
        flags.push({
            id: 'FLAG-PAIN-001', category: 'Symptoms',
            message: 'Severe pain reported (' + data.currentSymptoms.painSeverity + '/10) - urgent clinical review',
            priority: 'high'
        });
    }

    if (data.currentSymptoms.impactOnWork === 'unable-to-work') {
        flags.push({
            id: 'FLAG-WORK-001', category: 'Symptoms',
            message: 'Unable to work due to symptoms - occupational health referral required',
            priority: 'high'
        });
    }

    // ─── Multiple pain locations ─────────────────────────────
    if (data.currentSymptoms.painLocations.length >= 3) {
        flags.push({
            id: 'FLAG-PAIN-002', category: 'Symptoms',
            message: 'Pain in ' + data.currentSymptoms.painLocations.length + ' body areas - comprehensive assessment needed',
            priority: 'medium'
        });
    }

    // ─── Previous musculoskeletal conditions ──────────────────
    if (data.medicalHistory.musculoskeletalConditions.length >= 2) {
        flags.push({
            id: 'FLAG-MSK-001', category: 'Medical History',
            message: data.medicalHistory.musculoskeletalConditions.length + ' pre-existing musculoskeletal conditions',
            priority: 'medium'
        });
    }

    // ─── High stress / poor support ──────────────────────────
    if (data.psychosocialFactors.stressLevel === 'very-high') {
        flags.push({
            id: 'FLAG-STRESS-001', category: 'Psychosocial',
            message: 'Very high stress level - psychosocial risk factors present',
            priority: 'medium'
        });
    }

    if (data.psychosocialFactors.employerSupport === 'poor') {
        flags.push({
            id: 'FLAG-SUPPORT-001', category: 'Psychosocial',
            message: 'Poor employer support - may hinder ergonomic improvements',
            priority: 'low'
        });
    }

    // ─── Prolonged tasks without breaks ──────────────────────
    if (
        data.repetitiveTasks.durationPerSession === 'more-than-4hrs' &&
        data.repetitiveTasks.frequency === 'constantly'
    ) {
        flags.push({
            id: 'FLAG-DURATION-001', category: 'Work Pattern',
            message: 'Constant repetitive tasks >4 hours per session - high repetitive strain risk',
            priority: 'high'
        });
    }

    // Sort: high > medium > low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return flags;
}
