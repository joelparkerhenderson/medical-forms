/** Calculate age from date of birth string. */
export function calculateAge(dob) {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

/** REBA risk level label. */
export function rebaRiskLevel(score) {
    if (score <= 1) return 'Negligible risk';
    if (score <= 3) return 'Low risk';
    if (score <= 7) return 'Medium risk';
    if (score <= 10) return 'High risk';
    return 'Very high risk';
}

/** REBA score label with risk level. */
export function rebaScoreLabel(score) {
    const risk = rebaRiskLevel(score);
    return 'REBA ' + score + ' - ' + risk;
}

/** REBA risk level CSS class name. */
export function rebaRiskColor(score) {
    if (score <= 1) return 'risk-negligible';
    if (score <= 3) return 'risk-low';
    if (score <= 7) return 'risk-medium';
    if (score <= 10) return 'risk-high';
    return 'risk-very-high';
}

/** Action level description for a given REBA score. */
export function rebaActionLevel(score) {
    if (score <= 1) return 'No action required';
    if (score <= 3) return 'Action may be necessary';
    if (score <= 7) return 'Action necessary';
    if (score <= 10) return 'Action necessary soon';
    return 'Immediate action required';
}
