<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const s = assessment.data.sexualHealth;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Sexual Health" description="Sexual function assessment relevant to urological health">
	<RadioGroup label="Do you experience erectile dysfunction?" name="erectileDysfunction" options={yesNo} bind:value={s.erectileDysfunction} />

	<RadioGroup label="Have you noticed changes in libido (sex drive)?" name="libidoChanges" options={yesNo} bind:value={s.libidoChanges} />

	<RadioGroup label="Do you have any ejaculatory problems?" name="ejaculatoryProblems" options={yesNo} bind:value={s.ejaculatoryProblems} />
</SectionCard>
