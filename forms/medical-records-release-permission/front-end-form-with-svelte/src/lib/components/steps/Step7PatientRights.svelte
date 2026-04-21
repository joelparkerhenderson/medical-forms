<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const r = assessment.data.patientRights;

	const acknowledgementOptions = [
		{ value: 'yes', label: 'I acknowledge' },
		{ value: 'no', label: 'I do not acknowledge' }
	];
</script>

<SectionCard title="Patient Rights" description="Please review and acknowledge the following rights">
	<div class="mb-6 space-y-4">
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
			<p class="font-medium text-gray-900">Right to Revoke</p>
			<p class="mt-1">
				You have the right to revoke this authorization at any time by providing written notice
				to your healthcare provider. Revocation will not apply to information already released
				in reliance on this authorization.
			</p>
		</div>

		<RadioGroup
			label="I acknowledge my right to revoke this authorization"
			name="acknowledgedRightToRevoke"
			options={acknowledgementOptions}
			bind:value={r.acknowledgedRightToRevoke}
			required
		/>
	</div>

	<div class="mb-6 space-y-4">
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
			<p class="font-medium text-gray-900">No Charge for Access</p>
			<p class="mt-1">
				Under the UK Data Protection Act 2018 and UK GDPR, you are entitled to receive a copy
				of your medical records free of charge. A reasonable fee may only be charged for
				additional copies or manifestly unfounded requests.
			</p>
		</div>

		<RadioGroup
			label="I acknowledge there is generally no charge for access to my records"
			name="acknowledgedNoChargeForAccess"
			options={acknowledgementOptions}
			bind:value={r.acknowledgedNoChargeForAccess}
		/>
	</div>

	<div class="space-y-4">
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
			<p class="font-medium text-gray-900">Data Protection</p>
			<p class="mt-1">
				Your medical records are protected under the UK Data Protection Act 2018 and UK GDPR.
				The recipient of your records is obligated to handle your data in accordance with these
				regulations and must not use the information for purposes beyond those stated in this authorization.
			</p>
		</div>

		<RadioGroup
			label="I acknowledge my data protection rights"
			name="acknowledgedDataProtection"
			options={acknowledgementOptions}
			bind:value={r.acknowledgedDataProtection}
			required
		/>
	</div>
</SectionCard>
