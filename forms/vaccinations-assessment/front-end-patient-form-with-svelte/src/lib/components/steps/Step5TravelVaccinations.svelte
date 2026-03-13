<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumericSelect from '$lib/components/ui/NumericSelect.svelte';

	const t = assessment.data.travelVaccinations;

	const statusOptions = [
		{ value: '0', label: 'Not Given' },
		{ value: '1', label: 'Partial' },
		{ value: '2', label: 'Complete' }
	];
</script>

<SectionCard title="Travel Vaccinations" description="Record travel plans and associated vaccination status.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup
			label="Is travel planned?"
			name="travelPlanned"
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
			bind:value={t.travelPlanned}
		/>
		<TextInput label="Travel Destination" name="travelDestination" bind:value={t.travelDestination} placeholder="e.g. Sub-Saharan Africa, Southeast Asia" />
	</div>

	<NumericSelect label="Hepatitis A" name="hepatitisA" options={statusOptions} bind:numericValue={t.hepatitisA} />
	<NumericSelect label="Hepatitis B" name="hepatitisB" options={statusOptions} bind:numericValue={t.hepatitisB} />
	<NumericSelect label="Typhoid" name="typhoid" options={statusOptions} bind:numericValue={t.typhoid} />
	<NumericSelect label="Yellow Fever" name="yellowFever" options={statusOptions} bind:numericValue={t.yellowFever} />
	<NumericSelect label="Rabies" name="rabies" options={statusOptions} bind:numericValue={t.rabies} />
	<NumericSelect label="Japanese Encephalitis" name="japaneseEncephalitis" options={statusOptions} bind:numericValue={t.japaneseEncephalitis} />
</SectionCard>
