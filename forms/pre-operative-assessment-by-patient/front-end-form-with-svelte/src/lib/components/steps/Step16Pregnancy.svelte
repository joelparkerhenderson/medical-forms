<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const p = assessment.data.pregnancy;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Pregnancy" description="This section applies to females of childbearing age">
	<RadioGroup label="Is there any possibility you could be pregnant?" name="possPregnant" options={yesNo} bind:value={p.possiblyPregnant} />
	{#if p.possiblyPregnant === 'yes'}
		<RadioGroup label="Has pregnancy been confirmed?" name="pregConfirmed" options={yesNo} bind:value={p.pregnancyConfirmed} />
		{#if p.pregnancyConfirmed === 'yes'}
			<NumberInput label="Gestation" name="gestWeeks" bind:value={p.gestationWeeks} unit="weeks" min={1} max={42} />
		{/if}
	{/if}
</SectionCard>
