<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumericSelect from '$lib/components/ui/NumericSelect.svelte';

	const a = assessment.data.adultVaccinations;

	const statusOptions = [
		{ value: '0', label: 'Not Given' },
		{ value: '1', label: 'Partial' },
		{ value: '2', label: 'Complete' }
	];
</script>

<SectionCard title="Adult Vaccinations" description="Record the status of adult vaccinations. 0 = Not Given, 1 = Partial, 2 = Complete.">
	<NumericSelect label="Td/IPV Booster (Tetanus, Diphtheria, Polio)" name="tdIpvBooster" options={statusOptions} bind:numericValue={a.tdIpvBooster} />
	<NumericSelect label="HPV (Human Papillomavirus)" name="hpv" options={statusOptions} bind:numericValue={a.hpv} />
	<NumericSelect label="Meningitis ACWY" name="meningitisAcwy" options={statusOptions} bind:numericValue={a.meningitisAcwy} />
	<NumericSelect label="Influenza (Annual)" name="influenzaAnnual" options={statusOptions} bind:numericValue={a.influenzaAnnual} />
	<NumericSelect label="COVID-19" name="covid19" options={statusOptions} bind:numericValue={a.covid19} />
	<NumericSelect label="Shingles (Herpes Zoster)" name="shingles" options={statusOptions} bind:numericValue={a.shingles} />
	<NumericSelect label="Pneumococcal (PPV23)" name="pneumococcalPpv" options={statusOptions} bind:numericValue={a.pneumococcalPpv} />
</SectionCard>
