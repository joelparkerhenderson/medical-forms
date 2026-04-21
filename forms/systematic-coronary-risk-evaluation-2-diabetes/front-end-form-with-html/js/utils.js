/**
 * SCORE2-Diabetes Utility Functions
 */

export function riskCategoryLabel(category) {
    const labels = { veryHigh: 'Very High Risk', high: 'High Risk', moderate: 'Moderate Risk', low: 'Low Risk', draft: 'Draft' };
    return labels[category] || 'Unknown';
}

export function calculateBmi(heightCm, weightKg) {
    if (heightCm == null || weightKg == null || heightCm <= 0) return null;
    const hM = heightCm / 100;
    return Math.round((weightKg / (hM * hM)) * 10) / 10;
}

export function hasEstablishedCvd(data) {
    const cv = data.cardiovascularHistory;
    return cv.previousMi === 'yes' || cv.previousStroke === 'yes' || cv.previousTia === 'yes' ||
        cv.peripheralArterialDisease === 'yes' || cv.heartFailure === 'yes';
}

export function hba1cMmolMol(data) {
    const val = data.diabetesHistory.hba1cValue;
    if (val == null) return null;
    if (data.diabetesHistory.hba1cUnit === 'percent') {
        return Math.round((val - 2.15) * 10.929 * 10) / 10;
    }
    return val;
}

export function isLikelyDraft(data) {
    return data.patientDemographics.fullName.trim() === '' &&
        data.patientDemographics.dateOfBirth === '' &&
        data.diabetesHistory.hba1cValue == null &&
        data.bloodPressure.systolicBp == null;
}
