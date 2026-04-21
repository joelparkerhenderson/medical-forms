<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const p = assessment.data.posteriorSegment;
	const normalAbnormal = [
		{ value: 'yes', label: 'Normal' },
		{ value: 'no', label: 'Abnormal' }
	];
</script>

<SectionCard title="Posterior Segment" description="Fundus examination findings">
	<RadioGroup label="Fundus" name="fundus" options={normalAbnormal} bind:value={p.fundusNormal} />
	{#if p.fundusNormal === 'no'}
		<TextArea label="Fundus findings" name="fundusDetails" bind:value={p.fundusDetails} />
	{/if}

	<RadioGroup label="Optic Disc" name="disc" options={normalAbnormal} bind:value={p.opticDiscNormal} />
	{#if p.opticDiscNormal === 'no'}
		<TextArea label="Optic disc findings" name="discDetails" bind:value={p.opticDiscDetails} />
	{/if}

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Cup-to-Disc Ratio</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Right Eye C/D Ratio" name="cdrRight" bind:value={p.cupToDiscRatioRight} placeholder="e.g. 0.3" />
		<TextInput label="Left Eye C/D Ratio" name="cdrLeft" bind:value={p.cupToDiscRatioLeft} placeholder="e.g. 0.3" />
	</div>

	<RadioGroup label="Macula" name="macula" options={normalAbnormal} bind:value={p.maculaNormal} />
	{#if p.maculaNormal === 'no'}
		<TextArea label="Macular findings" name="maculaDetails" bind:value={p.maculaDetails} />
	{/if}

	<RadioGroup label="Retinal Vessels" name="vessels" options={normalAbnormal} bind:value={p.retinalVesselsNormal} />
	{#if p.retinalVesselsNormal === 'no'}
		<TextArea label="Retinal vessel findings" name="vesselDetails" bind:value={p.retinalVesselsDetails} />
	{/if}

	<RadioGroup label="Vitreous" name="vitreous" options={normalAbnormal} bind:value={p.vitreousNormal} />
	{#if p.vitreousNormal === 'no'}
		<TextArea label="Vitreous findings" name="vitreousDetails" bind:value={p.vitreousDetails} />
	{/if}
</SectionCard>
