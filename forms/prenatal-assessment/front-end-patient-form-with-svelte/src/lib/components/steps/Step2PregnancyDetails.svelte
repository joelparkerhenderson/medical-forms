<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const p = assessment.data.pregnancyDetails;
</script>

<SectionCard title="Pregnancy Details" description="Current pregnancy information">
	<NumberInput
		label="Gestational Age"
		name="gestationalWeeks"
		bind:value={p.gestationalWeeks}
		min={1}
		max={45}
		unit="weeks"
		required
	/>

	<TextInput
		label="Estimated Due Date"
		name="estimatedDueDate"
		type="date"
		bind:value={p.estimatedDueDate}
		required
	/>

	<SelectInput
		label="Conception Method"
		name="conceptionMethod"
		options={[
			{ value: 'natural', label: 'Natural conception' },
			{ value: 'ivf', label: 'IVF (In vitro fertilisation)' },
			{ value: 'iui', label: 'IUI (Intrauterine insemination)' },
			{ value: 'icsi', label: 'ICSI (Intracytoplasmic sperm injection)' },
			{ value: 'donor-egg', label: 'Donor egg' },
			{ value: 'donor-embryo', label: 'Donor embryo' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={p.conceptionMethod}
		required
	/>

	<RadioGroup
		label="Multiple Gestation (twins, triplets, etc.)"
		name="multipleGestation"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={p.multipleGestation}
		required
	/>

	<SelectInput
		label="Placenta Location"
		name="placentaLocation"
		options={[
			{ value: 'anterior', label: 'Anterior' },
			{ value: 'posterior', label: 'Posterior' },
			{ value: 'fundal', label: 'Fundal' },
			{ value: 'lateral', label: 'Lateral' },
			{ value: 'low-lying', label: 'Low-lying' },
			{ value: 'previa', label: 'Previa' }
		]}
		bind:value={p.placentaLocation}
	/>
</SectionCard>
