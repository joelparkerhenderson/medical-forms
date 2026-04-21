<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const e = assessment.data.endocrine;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Endocrine" description="Hormonal conditions">
	<SelectInput
		label="Do you have diabetes?"
		name="diabetes"
		options={[
			{ value: 'none', label: 'No' },
			{ value: 'type1', label: 'Type 1' },
			{ value: 'type2', label: 'Type 2' },
			{ value: 'gestational', label: 'Gestational' }
		]}
		bind:value={e.diabetes}
	/>
	{#if e.diabetes && e.diabetes !== 'none'}
		<SelectInput
			label="How well controlled is your diabetes?"
			name="diabetesCtrl"
			options={[
				{ value: 'well-controlled', label: 'Well controlled' },
				{ value: 'poorly-controlled', label: 'Poorly controlled' }
			]}
			bind:value={e.diabetesControl}
			required
		/>
		<RadioGroup label="Are you on insulin?" name="insulin" options={yesNo} bind:value={e.diabetesOnInsulin} />
	{/if}

	<RadioGroup label="Do you have thyroid disease?" name="thyroid" options={yesNo} bind:value={e.thyroidDisease} />
	{#if e.thyroidDisease === 'yes'}
		<SelectInput
			label="Thyroid condition"
			name="thyroidType"
			options={[
				{ value: 'hypothyroid', label: 'Underactive (hypothyroid)' },
				{ value: 'hyperthyroid', label: 'Overactive (hyperthyroid)' }
			]}
			bind:value={e.thyroidType}
			required
		/>
	{/if}

	<RadioGroup label="Do you have adrenal insufficiency?" name="adrenal" options={yesNo} bind:value={e.adrenalInsufficiency} />
</SectionCard>
