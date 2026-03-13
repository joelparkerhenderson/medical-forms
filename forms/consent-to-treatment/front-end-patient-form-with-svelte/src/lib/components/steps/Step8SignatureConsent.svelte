<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const s = assessment.data.signatureConsent;
</script>

<SectionCard title="Signature & Consent" description="Final consent confirmation and signature details">
	<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
		<p class="font-medium">By confirming consent below, the patient agrees to the proposed procedure as described in this form.</p>
	</div>

	<RadioGroup
		label="Patient Consent"
		name="patientConsent"
		options={[
			{ value: 'yes', label: 'I consent to the proposed treatment' },
			{ value: 'no', label: 'I do not consent' }
		]}
		bind:value={s.patientConsent}
		required
	/>

	<TextInput label="Signature Date" name="signatureDate" type="date" bind:value={s.signatureDate} required />

	<div class="mt-4 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Witness Details</h3>
		<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
			<TextInput label="Witness Name" name="witnessName" bind:value={s.witnessName} required />
			<TextInput label="Witness Role" name="witnessRole" bind:value={s.witnessRole} placeholder="e.g., Staff Nurse" required />
		</div>
		<TextInput label="Witness Signature Date" name="witnessSignatureDate" type="date" bind:value={s.witnessSignatureDate} />
	</div>

	<div class="mt-4 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Clinician Details</h3>
		<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
			<TextInput label="Clinician Name" name="clinicianName" bind:value={s.clinicianName} required />
			<TextInput label="Clinician Role" name="clinicianRole" bind:value={s.clinicianRole} placeholder="e.g., Consultant Surgeon" required />
		</div>
		<TextInput label="Clinician Signature Date" name="clinicianSignatureDate" type="date" bind:value={s.clinicianSignatureDate} />
	</div>

	<div class="mt-4 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Interpreter (if applicable)</h3>
		<RadioGroup
			label="Was an interpreter used?"
			name="interpreterUsed"
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
			bind:value={s.interpreterUsed}
		/>

		{#if s.interpreterUsed === 'yes'}
			<TextInput label="Interpreter Name" name="interpreterName" bind:value={s.interpreterName} required />
		{/if}
	</div>
</SectionCard>
