export function createDefaultAssessment() {
    return {
        personalInformation: {
            fullName: '', dateOfBirth: '', sex: '',
            addressLine1: '', addressLine2: '', city: '', postcode: '',
            phone: '', email: '',
            emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: ''
        },
        insuranceAndId: {
            insuranceProvider: '', policyNumber: '', nhsNumber: '',
            gpName: '', gpPracticeName: '', gpPhone: ''
        },
        reasonForVisit: {
            primaryReason: '', urgencyLevel: '', referringProvider: '',
            symptomDuration: '', additionalDetails: ''
        },
        medicalHistory: {
            chronicConditions: [], previousSurgeries: '',
            previousHospitalizations: '', ongoingTreatments: ''
        },
        medications: [],
        allergies: [],
        familyHistory: {
            heartDisease: 'no', heartDiseaseDetails: '',
            cancer: 'no', cancerDetails: '',
            diabetes: 'no', diabetesDetails: '',
            stroke: 'no', strokeDetails: '',
            mentalIllness: 'no', mentalIllnessDetails: '',
            geneticConditions: 'no', geneticConditionsDetails: ''
        },
        socialHistory: {
            smokingStatus: '', smokingPackYears: null,
            alcoholFrequency: '', alcoholUnitsPerWeek: null,
            drugUse: '', drugDetails: '',
            occupation: '', exerciseFrequency: '', dietQuality: ''
        },
        reviewOfSystems: {
            constitutional: '', heent: '', cardiovascular: '', respiratory: '',
            gastrointestinal: '', genitourinary: '', musculoskeletal: '',
            neurological: '', psychiatric: '', skin: ''
        },
        consentAndPreferences: {
            consentToTreatment: '', privacyAcknowledgement: '',
            communicationPreference: '', advanceDirectives: '',
            advanceDirectiveDetails: ''
        }
    };
}
