// Risk level label
export function riskLevelLabel(level) {
    switch (level) {
        case 'low': return 'Low Risk - Healthy, minimal risk factors';
        case 'medium': return 'Medium Risk - Controlled chronic conditions, some risk factors';
        case 'high': return 'High Risk - Uncontrolled conditions, multiple comorbidities';
        default: return 'Risk: ' + level;
    }
}

// Risk level color (CSS class names)
export function riskLevelColor(level) {
    switch (level) {
        case 'low': return 'risk-low';
        case 'medium': return 'risk-medium';
        case 'high': return 'risk-high';
        default: return 'risk-low';
    }
}

// Calculate age from date of birth string
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
