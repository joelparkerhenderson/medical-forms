<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const rom = assessment.data.rangeOfMotion;

	const romOptions = [
		{ value: 'normal', label: 'Normal' },
		{ value: 'mildly-limited', label: 'Mildly limited' },
		{ value: 'moderately-limited', label: 'Moderately limited' },
		{ value: 'severely-limited', label: 'Severely limited' }
	];
</script>

<SectionCard title="Range of Motion" description="Assess range of motion in lower extremities">
	<h3 class="mb-3 text-sm font-semibold text-gray-700">Hip</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput label="Hip Flexion" name="hipFlexion" options={romOptions} bind:value={rom.hipFlexion} />
		<SelectInput label="Hip Extension" name="hipExtension" options={romOptions} bind:value={rom.hipExtension} />
	</div>

	<h3 class="mb-3 mt-4 text-sm font-semibold text-gray-700">Knee</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput label="Knee Flexion" name="kneeFlexion" options={romOptions} bind:value={rom.kneeFlexion} />
		<SelectInput label="Knee Extension" name="kneeExtension" options={romOptions} bind:value={rom.kneeExtension} />
	</div>

	<h3 class="mb-3 mt-4 text-sm font-semibold text-gray-700">Ankle</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput label="Ankle Dorsiflexion" name="ankleFlexion" options={romOptions} bind:value={rom.ankleFlexion} />
		<SelectInput label="Ankle Plantarflexion" name="ankleExtension" options={romOptions} bind:value={rom.ankleExtension} />
	</div>

	<div class="mt-4">
		<TextArea
			label="Additional ROM Notes"
			name="romNotes"
			bind:value={rom.notes}
			placeholder="Any additional observations about range of motion..."
		/>
	</div>
</SectionCard>
