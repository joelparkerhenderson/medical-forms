<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const b = assessment.data.boneHealth;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Bone Health" description="Assessment of bone density and fracture risk">
	<RadioGroup label="Have you had a DEXA (bone density) scan?" name="dexaScan" options={yesNo} bind:value={b.dexaScan} />
	{#if b.dexaScan === 'yes'}
		<SelectInput
			label="DEXA result"
			name="dexaResult"
			options={[
				{ value: 'normal', label: 'Normal' },
				{ value: 'osteopenia', label: 'Osteopenia (reduced bone density)' },
				{ value: 'osteoporosis', label: 'Osteoporosis' }
			]}
			bind:value={b.dexaResult}
		/>
		<TextInput label="Date of DEXA scan" name="dexaDate" type="date" bind:value={b.dexaDate} />
	{/if}

	<RadioGroup label="Have you had any fractures?" name="fractureHistory" options={yesNo} bind:value={b.fractureHistory} />
	{#if b.fractureHistory === 'yes'}
		<TextInput label="Please provide fracture details" name="fractureDetails" bind:value={b.fractureDetails} placeholder="e.g., wrist fracture 2020, vertebral compression 2023" />
	{/if}

	<RadioGroup label="Have you noticed a loss of height?" name="heightLoss" options={yesNo} bind:value={b.heightLoss} />
	{#if b.heightLoss === 'yes'}
		<NumberInput label="Approximate height loss" name="heightLossCm" bind:value={b.heightLossCm} unit="cm" min={0} max={20} step={0.5} />
	{/if}

	<TextArea label="Other bone health risk factors" name="riskFactors" bind:value={b.riskFactors} placeholder="e.g., family history of osteoporosis, low body weight, corticosteroid use, early menopause..." />

	<SelectInput
		label="Calcium intake"
		name="calciumIntake"
		options={[
			{ value: 'adequate', label: 'Adequate (dairy, green vegetables daily)' },
			{ value: 'inadequate', label: 'Inadequate' },
			{ value: 'supplemented', label: 'Taking calcium supplements' }
		]}
		bind:value={b.calciumIntake}
	/>

	<SelectInput
		label="Vitamin D intake"
		name="vitaminDIntake"
		options={[
			{ value: 'adequate', label: 'Adequate (sunlight + diet)' },
			{ value: 'inadequate', label: 'Inadequate' },
			{ value: 'supplemented', label: 'Taking vitamin D supplements' }
		]}
		bind:value={b.vitaminDIntake}
	/>
</SectionCard>
