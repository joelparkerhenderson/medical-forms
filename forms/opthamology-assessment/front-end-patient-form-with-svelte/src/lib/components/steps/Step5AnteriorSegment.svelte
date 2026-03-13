<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const a = assessment.data.anteriorSegment;
	const normalAbnormal = [
		{ value: 'yes', label: 'Normal' },
		{ value: 'no', label: 'Abnormal' }
	];
</script>

<SectionCard title="Anterior Segment" description="Slit lamp examination findings">
	<RadioGroup label="Lids" name="lids" options={normalAbnormal} bind:value={a.lidsNormal} />
	{#if a.lidsNormal === 'no'}
		<TextArea label="Lid findings" name="lidsDetails" bind:value={a.lidsDetails} />
	{/if}

	<RadioGroup label="Conjunctiva" name="conj" options={normalAbnormal} bind:value={a.conjunctivaNormal} />
	{#if a.conjunctivaNormal === 'no'}
		<TextArea label="Conjunctival findings" name="conjDetails" bind:value={a.conjunctivaDetails} />
	{/if}

	<RadioGroup label="Cornea" name="cornea" options={normalAbnormal} bind:value={a.corneaNormal} />
	{#if a.corneaNormal === 'no'}
		<TextArea label="Corneal findings" name="corneaDetails" bind:value={a.corneaDetails} />
	{/if}

	<RadioGroup label="Anterior Chamber" name="ac" options={normalAbnormal} bind:value={a.anteriorChamberNormal} />
	{#if a.anteriorChamberNormal === 'no'}
		<TextArea label="Anterior chamber findings" name="acDetails" bind:value={a.anteriorChamberDetails} />
	{/if}

	<RadioGroup label="Iris" name="iris" options={normalAbnormal} bind:value={a.irisNormal} />
	{#if a.irisNormal === 'no'}
		<TextArea label="Iris findings" name="irisDetails" bind:value={a.irisDetails} />
	{/if}

	<RadioGroup label="Lens" name="lens" options={normalAbnormal} bind:value={a.lensNormal} />
	{#if a.lensNormal === 'no'}
		<TextArea label="Lens findings (e.g. cataract type/grade)" name="lensDetails" bind:value={a.lensDetails} />
	{/if}

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Intraocular Pressure (IOP)</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Right Eye IOP" name="iopRight" bind:value={a.iopRight} unit="mmHg" min={0} max={80} />
		<NumberInput label="Left Eye IOP" name="iopLeft" bind:value={a.iopLeft} unit="mmHg" min={0} max={80} />
	</div>

	<SelectInput
		label="IOP Measurement Method"
		name="iopMethod"
		options={[
			{ value: 'goldmann', label: 'Goldmann applanation' },
			{ value: 'tonopen', label: 'Tonopen' },
			{ value: 'icare', label: 'iCare rebound' },
			{ value: 'non-contact', label: 'Non-contact (air puff)' }
		]}
		bind:value={a.iopMethod}
	/>
</SectionCard>
