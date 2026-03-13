export function createDefaultAssessment() {
    return {
        demographics: {
            firstName: '', lastName: '', dateOfBirth: '', sex: '',
            occupation: '', employer: '', jobTitle: '', yearsInRole: null
        },
        workstationSetup: {
            deskHeight: '', chairType: '', chairAdjustability: '',
            monitorPosition: '', monitorDistance: '', monitorHeight: '',
            keyboardPlacement: '', mousePlacement: '', lighting: '', temperature: ''
        },
        postureAssessment: {
            sittingPosture: '', standingPosture: '',
            neckAngle: '', trunkAngle: '', shoulderPosition: '', wristDeviation: '',
            neckScore: null, trunkScore: null, legScore: null,
            upperArmScore: null, lowerArmScore: null, wristScore: null
        },
        repetitiveTasks: {
            taskDescription: '', frequency: '', durationPerSession: '',
            forceRequired: '', vibrationExposure: '', cycleTimeSeconds: null
        },
        manualHandling: {
            liftingFrequency: '', loadWeightKg: null, carryDistanceMetres: null,
            pushPullForces: '', teamLifting: '', mechanicalAidsAvailable: ''
        },
        currentSymptoms: {
            painLocations: [], painSeverity: null, onsetDate: '', duration: '',
            aggravatingFactors: '', relievingFactors: '', impactOnWork: ''
        },
        medicalHistory: {
            musculoskeletalConditions: [], previousInjuries: '', surgeries: '',
            chronicPain: '', rsiCarpalTunnel: '', backProblems: ''
        },
        currentInterventions: {
            ergonomicEquipment: [], physiotherapy: '', occupationalTherapy: '',
            workplaceAdjustments: '', medications: ''
        },
        psychosocialFactors: {
            jobSatisfaction: '', workload: '', stressLevel: '',
            breaksTaken: '', autonomy: '', employerSupport: ''
        },
        recommendations: {
            equipmentChanges: '', workstationModifications: '', trainingRequired: '',
            breakSchedule: '', followUpDate: '', referrals: ''
        }
    };
}
