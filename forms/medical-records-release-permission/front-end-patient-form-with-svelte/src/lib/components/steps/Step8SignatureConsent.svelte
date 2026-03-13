<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const s = assessment.data.signatureConsent;
</script>

<SectionCard title="Signature & Consent" description="Confirm your consent to release the specified medical records">
	<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
		<p class="font-medium text-gray-900">Declaration</p>
		<p class="mt-1">
			By confirming below, I authorize the release of the medical records specified in this form
			to the named recipient for the stated purpose. I understand that I may revoke this
			authorization at any time in writing, and that records released prior to revocation
			cannot be recalled.
		</p>
	</div>

	<RadioGroup
		label="I confirm my consent to release my medical records as specified in this form"
		name="patientSignatureConfirmed"
		options={[
			{ value: 'yes', label: 'I confirm and consent' },
			{ value: 'no', label: 'I do not consent' }
		]}
		bind:value={s.patientSignatureConfirmed}
		required
	/>

	<TextInput
		label="Signature Date"
		name="signatureDate"
		type="date"
		bind:value={s.signatureDate}
		required
	/>

	<div class="mt-6 border-t border-gray-200 pt-6">
		<h3 class="mb-4 text-lg font-semibold text-gray-900">Witness Details (if applicable)</h3>
		<p class="mb-4 text-sm text-gray-500">
			A witness signature is recommended for vulnerable patients or when a parent/guardian is involved.
		</p>

		<TextInput
			label="Witness Name"
			name="witnessName"
			bind:value={s.witnessName}
			placeholder="Full name of witness"
		/>

		{#if s.witnessName}
			<RadioGroup
				label="Witness signature confirmed"
				name="witnessSignatureConfirmed"
				options={[
					{ value: 'yes', label: 'Confirmed' },
					{ value: 'no', label: 'Not confirmed' }
				]}
				bind:value={s.witnessSignatureConfirmed}
			/>

			<TextInput
				label="Witness Date"
				name="witnessDate"
				type="date"
				bind:value={s.witnessDate}
			/>
		{/if}
	</div>

	<div class="mt-6 border-t border-gray-200 pt-6">
		<h3 class="mb-4 text-lg font-semibold text-gray-900">Parent / Guardian (if applicable)</h3>
		<p class="mb-4 text-sm text-gray-500">
			Complete this section only if the patient is under 18 or lacks capacity to consent.
		</p>

		<TextInput
			label="Parent / Guardian Name"
			name="parentGuardianName"
			bind:value={s.parentGuardianName}
			placeholder="Full name of parent or guardian (if applicable)"
		/>
	</div>
</SectionCard>
