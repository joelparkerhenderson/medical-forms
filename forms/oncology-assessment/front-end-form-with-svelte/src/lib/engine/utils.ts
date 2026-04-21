/** Calculate BMI from weight (kg) and height (cm). Returns null if inputs are invalid. */
export function calculateBMI(weightKg: number | null, heightCm: number | null): number | null {
	if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
	const heightM = heightCm / 100;
	return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/** Get BMI category label. */
export function bmiCategory(bmi: number | null): string {
	if (bmi === null) return '';
	if (bmi < 18.5) return 'Underweight';
	if (bmi < 25) return 'Normal';
	if (bmi < 30) return 'Overweight';
	if (bmi < 35) return 'Obese Class I';
	if (bmi < 40) return 'Obese Class II';
	return 'Obese Class III (Morbid)';
}

/** Calculate age from date of birth string. */
export function calculateAge(dob: string): number | null {
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

/** ECOG grade label. */
export function ecogGradeLabel(grade: number): string {
	switch (grade) {
		case 0:
			return 'ECOG 0 - Fully Active';
		case 1:
			return 'ECOG 1 - Restricted Strenuous Activity';
		case 2:
			return 'ECOG 2 - Ambulatory, Self-Care';
		case 3:
			return 'ECOG 3 - Limited Self-Care';
		case 4:
			return 'ECOG 4 - Completely Disabled';
		default:
			return `ECOG ${grade}`;
	}
}

/** ECOG grade colour class. */
export function ecogGradeColor(grade: number): string {
	switch (grade) {
		case 0:
			return 'bg-green-100 text-green-800 border-green-300';
		case 1:
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 2:
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 3:
			return 'bg-red-100 text-red-800 border-red-300';
		case 4:
			return 'bg-red-200 text-red-900 border-red-400';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** TNM stage formatted string. */
export function formatTNM(t: string, n: string, m: string): string {
	if (!t && !n && !m) return 'N/A';
	return `T${t || 'X'}N${n || 'X'}M${m || 'X'}`;
}

/** Overall stage label. */
export function stageLabel(stage: string): string {
	switch (stage) {
		case 'I':
			return 'Stage I';
		case 'II':
			return 'Stage II';
		case 'III':
			return 'Stage III';
		case 'IV':
			return 'Stage IV';
		default:
			return stage || 'Not staged';
	}
}

/** Cancer type display label. */
export function cancerTypeLabel(type: string): string {
	const labels: Record<string, string> = {
		breast: 'Breast',
		lung: 'Lung',
		colorectal: 'Colorectal',
		prostate: 'Prostate',
		melanoma: 'Melanoma',
		lymphoma: 'Lymphoma',
		leukaemia: 'Leukaemia',
		pancreatic: 'Pancreatic',
		ovarian: 'Ovarian',
		bladder: 'Bladder',
		renal: 'Renal',
		hepatocellular: 'Hepatocellular',
		gastric: 'Gastric',
		oesophageal: 'Oesophageal',
		'head-and-neck': 'Head and Neck',
		brain: 'Brain',
		sarcoma: 'Sarcoma',
		thyroid: 'Thyroid',
		cervical: 'Cervical',
		endometrial: 'Endometrial',
		other: 'Other'
	};
	return labels[type] || type || 'N/A';
}

/** Histology display label. */
export function histologyLabel(value: string): string {
	const labels: Record<string, string> = {
		adenocarcinoma: 'Adenocarcinoma',
		'invasive-ductal-carcinoma': 'Invasive ductal carcinoma',
		'invasive-lobular-carcinoma': 'Invasive lobular carcinoma',
		'mucinous-adenocarcinoma': 'Mucinous adenocarcinoma',
		'papillary-adenocarcinoma': 'Papillary adenocarcinoma',
		'signet-ring-cell-carcinoma': 'Signet ring cell carcinoma',
		'clear-cell-carcinoma': 'Clear cell carcinoma',
		cholangiocarcinoma: 'Cholangiocarcinoma',
		'squamous-cell-carcinoma': 'Squamous cell carcinoma',
		'basal-cell-carcinoma': 'Basal cell carcinoma',
		'transitional-cell-carcinoma': 'Transitional cell (urothelial) carcinoma',
		'nasopharyngeal-carcinoma': 'Nasopharyngeal carcinoma',
		'small-cell-carcinoma': 'Small cell carcinoma',
		'large-cell-carcinoma': 'Large cell carcinoma',
		'large-cell-neuroendocrine-carcinoma': 'Large cell neuroendocrine carcinoma',
		'neuroendocrine-tumour': 'Neuroendocrine tumour',
		'carcinoid-tumour': 'Carcinoid tumour',
		'merkel-cell-carcinoma': 'Merkel cell carcinoma',
		'renal-cell-carcinoma': 'Renal cell carcinoma',
		'hepatocellular-carcinoma': 'Hepatocellular carcinoma',
		'serous-carcinoma': 'Serous carcinoma',
		'endometrioid-carcinoma': 'Endometrioid carcinoma',
		'medullary-carcinoma': 'Medullary carcinoma',
		'anaplastic-carcinoma': 'Anaplastic carcinoma',
		'undifferentiated-carcinoma': 'Undifferentiated carcinoma',
		osteosarcoma: 'Osteosarcoma',
		chondrosarcoma: 'Chondrosarcoma',
		leiomyosarcoma: 'Leiomyosarcoma',
		rhabdomyosarcoma: 'Rhabdomyosarcoma',
		liposarcoma: 'Liposarcoma',
		fibrosarcoma: 'Fibrosarcoma',
		angiosarcoma: 'Angiosarcoma',
		'ewing-sarcoma': 'Ewing sarcoma',
		'gastrointestinal-stromal-tumour': 'Gastrointestinal stromal tumour (GIST)',
		'kaposi-sarcoma': 'Kaposi sarcoma',
		'hodgkin-lymphoma': 'Hodgkin lymphoma',
		'diffuse-large-b-cell-lymphoma': 'Diffuse large B-cell lymphoma',
		'follicular-lymphoma': 'Follicular lymphoma',
		'mantle-cell-lymphoma': 'Mantle cell lymphoma',
		'marginal-zone-lymphoma': 'Marginal zone lymphoma',
		'burkitt-lymphoma': 'Burkitt lymphoma',
		't-cell-lymphoma': 'T-cell lymphoma',
		'acute-myeloid-leukaemia': 'Acute myeloid leukaemia (AML)',
		'acute-lymphoblastic-leukaemia': 'Acute lymphoblastic leukaemia (ALL)',
		'chronic-lymphocytic-leukaemia': 'Chronic lymphocytic leukaemia (CLL)',
		'chronic-myeloid-leukaemia': 'Chronic myeloid leukaemia (CML)',
		'multiple-myeloma': 'Multiple myeloma',
		'myelodysplastic-syndrome': 'Myelodysplastic syndrome',
		'superficial-spreading-melanoma': 'Superficial spreading melanoma',
		'nodular-melanoma': 'Nodular melanoma',
		'lentigo-maligna-melanoma': 'Lentigo maligna melanoma',
		'acral-lentiginous-melanoma': 'Acral lentiginous melanoma',
		'uveal-melanoma': 'Uveal melanoma',
		'mucosal-melanoma': 'Mucosal melanoma',
		glioblastoma: 'Glioblastoma (GBM)',
		astrocytoma: 'Astrocytoma',
		oligodendroglioma: 'Oligodendroglioma',
		meningioma: 'Meningioma',
		medulloblastoma: 'Medulloblastoma',
		ependymoma: 'Ependymoma',
		seminoma: 'Seminoma',
		'non-seminomatous-germ-cell': 'Non-seminomatous germ cell tumour',
		teratoma: 'Teratoma',
		choriocarcinoma: 'Choriocarcinoma',
		'yolk-sac-tumour': 'Yolk sac tumour',
		mesothelioma: 'Mesothelioma',
		thymoma: 'Thymoma',
		phaeochromocytoma: 'Phaeochromocytoma',
		other: 'Other'
	};
	return labels[value] || value || 'N/A';
}

/** Karnofsky score to approximate ECOG mapping. */
export function karnofskyToECOG(kps: number | null): number | null {
	if (kps === null) return null;
	if (kps >= 90) return 0;
	if (kps >= 70) return 1;
	if (kps >= 50) return 2;
	if (kps >= 30) return 3;
	return 4;
}
