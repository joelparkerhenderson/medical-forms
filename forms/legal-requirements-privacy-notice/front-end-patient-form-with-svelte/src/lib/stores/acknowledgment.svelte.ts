import type { AcknowledgmentData } from '$lib/types';

class AcknowledgmentStore {
	data = $state<AcknowledgmentData>({
		confirmed: false,
		fullName: '',
		acknowledgedDate: ''
	});

	submitted = $state(false);

	reset() {
		this.data = {
			confirmed: false,
			fullName: '',
			acknowledgedDate: ''
		};
		this.submitted = false;
	}
}

export const acknowledgment = new AcknowledgmentStore();
