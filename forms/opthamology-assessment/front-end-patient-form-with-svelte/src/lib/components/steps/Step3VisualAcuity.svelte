<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const va = assessment.data.visualAcuity;
</script>

<SectionCard title="Visual Acuity" description="Distance and near visual acuity measurements (Snellen notation, e.g. 6/6, 6/12, 6/60)">
	<h3 class="mb-3 font-semibold text-gray-800">Distance VA - Right Eye</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Uncorrected" name="distVaRightUncorrected" bind:value={va.distanceVaRightUncorrected} placeholder="e.g. 6/12" />
		<TextInput label="Best Corrected" name="distVaRightCorrected" bind:value={va.distanceVaRightCorrected} placeholder="e.g. 6/6" />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Distance VA - Left Eye</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Uncorrected" name="distVaLeftUncorrected" bind:value={va.distanceVaLeftUncorrected} placeholder="e.g. 6/12" />
		<TextInput label="Best Corrected" name="distVaLeftCorrected" bind:value={va.distanceVaLeftCorrected} placeholder="e.g. 6/6" />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Near VA</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Right Eye" name="nearVaRight" bind:value={va.nearVaRight} placeholder="e.g. N5" />
		<TextInput label="Left Eye" name="nearVaLeft" bind:value={va.nearVaLeft} placeholder="e.g. N5" />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Pinhole</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Right Eye" name="pinholeRight" bind:value={va.pinholeRight} placeholder="e.g. 6/6" />
		<TextInput label="Left Eye" name="pinholeLeft" bind:value={va.pinholeLeft} placeholder="e.g. 6/6" />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Refraction</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Right Eye" name="refractionRight" bind:value={va.refractionRight} placeholder="e.g. -2.50/-1.00x180" />
		<TextInput label="Left Eye" name="refractionLeft" bind:value={va.refractionLeft} placeholder="e.g. -2.00/-0.75x170" />
	</div>
</SectionCard>
