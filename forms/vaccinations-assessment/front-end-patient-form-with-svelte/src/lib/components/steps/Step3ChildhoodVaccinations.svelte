<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumericSelect from '$lib/components/ui/NumericSelect.svelte';

	const c = assessment.data.childhoodVaccinations;

	const statusOptions = [
		{ value: '0', label: 'Not Given' },
		{ value: '1', label: 'Partial' },
		{ value: '2', label: 'Complete' }
	];
</script>

<SectionCard title="Childhood Vaccinations" description="Record the status of childhood vaccinations. 0 = Not Given, 1 = Partial, 2 = Complete.">
	<NumericSelect label="DTaP/IPV/Hib/HepB (6-in-1)" name="dtapIpvHibHepb" options={statusOptions} bind:numericValue={c.dtapIpvHibHepb} />
	<NumericSelect label="Pneumococcal (PCV)" name="pneumococcal" options={statusOptions} bind:numericValue={c.pneumococcal} />
	<NumericSelect label="Rotavirus" name="rotavirus" options={statusOptions} bind:numericValue={c.rotavirus} />
	<NumericSelect label="Meningitis B (MenB)" name="meningitisB" options={statusOptions} bind:numericValue={c.meningitisB} />
	<NumericSelect label="MMR (Measles, Mumps, Rubella)" name="mmr" options={statusOptions} bind:numericValue={c.mmr} />
	<NumericSelect label="Hib/MenC Booster" name="hibMenc" options={statusOptions} bind:numericValue={c.hibMenc} />
	<NumericSelect label="Pre-school Booster (DTaP/IPV)" name="preschoolBooster" options={statusOptions} bind:numericValue={c.preschoolBooster} />
</SectionCard>
