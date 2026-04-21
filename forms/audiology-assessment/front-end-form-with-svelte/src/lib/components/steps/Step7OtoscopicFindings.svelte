<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const o = assessment.data.otoscopicFindings;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	const canalOptions = [
		{ value: 'normal', label: 'Normal' },
		{ value: 'narrowed', label: 'Narrowed' },
		{ value: 'inflamed', label: 'Inflamed' },
		{ value: 'exostosis', label: 'Exostosis' },
		{ value: 'other', label: 'Other' }
	];

	const tmOptions = [
		{ value: 'normal', label: 'Normal' },
		{ value: 'retracted', label: 'Retracted' },
		{ value: 'perforated', label: 'Perforated' },
		{ value: 'scarred', label: 'Scarred' },
		{ value: 'effusion', label: 'Effusion visible' },
		{ value: 'other', label: 'Other' }
	];
</script>

<SectionCard title="Otoscopic Findings" description="External and middle ear examination">
	<h3 class="mb-3 font-semibold text-gray-800">Ear Canal</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput label="Right Ear Canal" name="earCanalRight" options={canalOptions} bind:value={o.earCanalRight} />
		<SelectInput label="Left Ear Canal" name="earCanalLeft" options={canalOptions} bind:value={o.earCanalLeft} />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Tympanic Membrane</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput label="Right Tympanic Membrane" name="tmRight" options={tmOptions} bind:value={o.tympanicMembraneRight} />
		<SelectInput label="Left Tympanic Membrane" name="tmLeft" options={tmOptions} bind:value={o.tympanicMembraneLeft} />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Middle Ear</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Right Middle Ear Findings" name="middleEarRight" bind:value={o.middleEarRight} placeholder="e.g., normal, effusion" />
		<TextInput label="Left Middle Ear Findings" name="middleEarLeft" bind:value={o.middleEarLeft} placeholder="e.g., normal, effusion" />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Ear Wax</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup label="Ear wax present (Right)?" name="earWaxRight" options={yesNo} bind:value={o.earWaxRight} />
		<RadioGroup label="Ear wax present (Left)?" name="earWaxLeft" options={yesNo} bind:value={o.earWaxLeft} />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Discharge</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup label="Discharge present (Right)?" name="dischargeRight" options={yesNo} bind:value={o.dischargeRight} />
		<RadioGroup label="Discharge present (Left)?" name="dischargeLeft" options={yesNo} bind:value={o.dischargeLeft} />
	</div>

	<RadioGroup label="Previous ear surgery?" name="previousSurgery" options={yesNo} bind:value={o.previousSurgery} />
	{#if o.previousSurgery === 'yes'}
		<TextInput label="Surgery details" name="previousSurgeryDetails" bind:value={o.previousSurgeryDetails} />
	{/if}
</SectionCard>
