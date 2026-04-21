<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumericSelect from '$lib/components/ui/NumericSelect.svelte';

	const o = assessment.data.occupationalVaccinations;

	const statusOptions = [
		{ value: '0', label: 'Not Given' },
		{ value: '1', label: 'Partial' },
		{ value: '2', label: 'Complete' }
	];
</script>

<SectionCard title="Occupational Vaccinations" description="Record occupation-related vaccination requirements and status.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Occupation" name="occupation" bind:value={o.occupation} placeholder="e.g. Nurse, Teacher, Laboratory Worker" />
		<RadioGroup
			label="Is the patient a healthcare worker?"
			name="healthcareWorker"
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
			bind:value={o.healthcareWorker}
		/>
	</div>

	<NumericSelect label="Hepatitis B (Occupational)" name="hepatitisBOccupational" options={statusOptions} bind:numericValue={o.hepatitisBOccupational} />
	<NumericSelect label="Influenza (Occupational)" name="influenzaOccupational" options={statusOptions} bind:numericValue={o.influenzaOccupational} />
	<NumericSelect label="Varicella (Chickenpox)" name="varicella" options={statusOptions} bind:numericValue={o.varicella} />
	<NumericSelect label="BCG (Tuberculosis)" name="bcgTuberculosis" options={statusOptions} bind:numericValue={o.bcgTuberculosis} />
</SectionCard>
