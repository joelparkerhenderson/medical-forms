<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const n = assessment.data.nutrition;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Nutrition" description="Weight changes, appetite, swallowing, and nutritional status">
	<RadioGroup label="Any weight changes in the last 6 months?" name="weightChange" options={yesNo} bind:value={n.weightChangeLastSixMonths} />
	{#if n.weightChangeLastSixMonths === 'yes'}
		<NumberInput label="How much weight change?" name="weightChangeKg" bind:value={n.weightChangeKg} unit="kg" min={0} max={100} step={0.1} />
		<SelectInput
			label="Weight change direction"
			name="weightChangeDirection"
			options={[
				{ value: 'gain', label: 'Weight gain' },
				{ value: 'loss', label: 'Weight loss' }
			]}
			bind:value={n.weightChangeDirection}
			required
		/>
	{/if}

	<SelectInput
		label="Appetite"
		name="appetite"
		options={[
			{ value: 'normal', label: 'Normal' },
			{ value: 'reduced', label: 'Reduced' },
			{ value: 'poor', label: 'Poor' }
		]}
		bind:value={n.appetite}
		required
	/>

	<RadioGroup label="Any swallowing difficulties (dysphagia)?" name="swallowingDifficulties" options={yesNo} bind:value={n.swallowingDifficulties} />

	<SelectInput
		label="Dental Status"
		name="dentalStatus"
		options={[
			{ value: 'good', label: 'Good' },
			{ value: 'fair', label: 'Fair' },
			{ value: 'poor', label: 'Poor' },
			{ value: 'edentulous', label: 'Edentulous (no teeth)' }
		]}
		bind:value={n.dentalStatus}
	/>

	<NumberInput label="Mini Nutritional Assessment (MNA) Score" name="mnaScore" bind:value={n.mnaScore} min={0} max={30} step={0.5} />
</SectionCard>
