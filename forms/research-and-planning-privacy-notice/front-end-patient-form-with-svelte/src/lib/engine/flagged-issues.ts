import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the information-governance officer.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];
	const ack = data.acknowledgementSignature;

	if (ack.agreed === false) {
		flags.push({
			id: 'FLAG-NOACK-001',
			category: 'Acknowledgement Not Given',
			message: 'Recipient has not acknowledged the research and planning privacy notice',
			priority: 'high'
		});
	}

	if (ack.type1OptOut === 'opt-out') {
		flags.push({
			id: 'FLAG-TYPE1-OPTOUT-001',
			category: 'Type 1 Opt-Out',
			message: 'Recipient has elected Type 1 opt-out — confidential patient information must not be shared from this practice for purposes beyond direct care',
			priority: 'high'
		});
	}

	if (ack.nationalDataOptOut === 'opt-out') {
		flags.push({
			id: 'FLAG-NATIONAL-OPTOUT-001',
			category: 'National Data Opt-Out',
			message: 'Recipient has elected the NHS National Data Opt-Out — data must not be used for research and planning across the wider NHS',
			priority: 'high'
		});
	}

	const name = ack.recipientTypedFullName.trim();
	if (name.length > 0 && name.length < 3) {
		flags.push({
			id: 'FLAG-NAME-001',
			category: 'Incomplete Name',
			message: 'Recipient typed name appears incomplete — please verify',
			priority: 'medium'
		});
	}

	const rd = data.recipientDetails;
	const missingFields: string[] = [];
	if (!rd.organisationName.trim()) missingFields.push('organisation name');
	if (!rd.recipientName.trim()) missingFields.push('recipient name');

	if (missingFields.length > 0) {
		flags.push({
			id: 'FLAG-CONFIG-001',
			category: 'Incomplete Recipient Details',
			message: `Recipient details are missing: ${missingFields.join(', ')}`,
			priority: 'high'
		});
	}

	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
