<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const g = assessment.data.gastrointestinal;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Gastrointestinal" description="Stomach and digestive conditions">
	<RadioGroup label="Do you suffer from acid reflux / GORD?" name="gord" options={yesNo} bind:value={g.gord} />
	<RadioGroup label="Do you have a hiatus hernia?" name="hiatus" options={yesNo} bind:value={g.hiatusHernia} />
	<RadioGroup label="Do you often feel nauseous or vomit?" name="nausea" options={yesNo} bind:value={g.nausea} />
</SectionCard>
