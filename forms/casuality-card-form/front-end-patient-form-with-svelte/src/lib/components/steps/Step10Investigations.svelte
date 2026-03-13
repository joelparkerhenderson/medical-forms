<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import type { ImagingStudy } from '$lib/engine/types';

	const inv = casualtyCard.data.investigations;

	function addImaging() {
		inv.imaging = [...inv.imaging, { type: '', site: '', findings: '' }];
	}

	function removeImaging(index: number) {
		inv.imaging = inv.imaging.filter((_: ImagingStudy, i: number) => i !== index);
	}
</script>

<SectionCard title="Investigations" description="Blood tests, imaging, ECG, and other investigations">
	<CheckboxGroup
		label="Blood Tests Requested"
		bind:values={inv.bloodTests}
		options={[
			{ value: 'fbc', label: 'FBC' },
			{ value: 'ue', label: 'U&E' },
			{ value: 'lfts', label: 'LFTs' },
			{ value: 'crp', label: 'CRP' },
			{ value: 'coagulation', label: 'Coagulation' },
			{ value: 'troponin', label: 'Troponin' },
			{ value: 'blood-gas', label: 'Blood Gas' },
			{ value: 'lactate', label: 'Lactate' },
			{ value: 'amylase', label: 'Amylase' },
			{ value: 'blood-cultures', label: 'Blood Cultures' },
			{ value: 'group-save', label: 'Group & Save' },
			{ value: 'crossmatch', label: 'Crossmatch' }
		]}
	/>

	<hr class="my-6 border-gray-200" />

	<TextArea label="Urinalysis (Dipstick Results)" name="urinalysis" bind:value={inv.urinalysis} rows={2} />
	<TextInput label="Pregnancy Test" name="pregnancyTest" bind:value={inv.pregnancyTest} placeholder="e.g. positive, negative, not indicated" />

	<hr class="my-6 border-gray-200" />

	<h3 class="mb-3 text-lg font-semibold text-gray-800">Imaging</h3>
	<div class="space-y-3">
		{#each inv.imaging as img, i (i)}
			<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
					<input type="text" placeholder="Type (e.g. X-ray, CT)" bind:value={img.type} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="text" placeholder="Site" bind:value={img.site} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="text" placeholder="Findings" bind:value={img.findings} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
				</div>
				<button type="button" onclick={() => removeImaging(i)} class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove imaging">&times;</button>
			</div>
		{/each}
		<button type="button" onclick={addImaging} class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">
			+ Add Imaging
		</button>
	</div>

	<hr class="my-6 border-gray-200" />

	<RadioGroup
		label="ECG Performed?"
		name="ecgPerformed"
		bind:value={inv.ecgPerformed}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>
	{#if inv.ecgPerformed === 'yes'}
		<TextArea label="ECG Findings" name="ecgFindings" bind:value={inv.ecgFindings} rows={2} />
	{/if}

	<TextArea label="Other Investigations" name="otherInvestigations" bind:value={inv.otherInvestigations} rows={2} />
</SectionCard>
