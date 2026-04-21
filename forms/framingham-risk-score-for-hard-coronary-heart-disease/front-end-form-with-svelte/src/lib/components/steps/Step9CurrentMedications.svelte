<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const med = assessment.data.currentMedications;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="Current medication use helps identify treatment gaps and informs clinical recommendations.">
	<RadioGroup label="Currently on Statin Therapy?" name="onStatin" options={yesNoOptions} bind:value={med.onStatin} />
	<TextInput label="Statin Name (if applicable)" name="statinName" bind:value={med.statinName} placeholder="e.g. Atorvastatin 20mg" />

	<RadioGroup label="Currently on Aspirin?" name="onAspirin" options={yesNoOptions} bind:value={med.onAspirin} />
	<RadioGroup label="Currently on Antihypertensive?" name="onAntihypertensive" options={yesNoOptions} bind:value={med.onAntihypertensive} />
	<TextInput label="Antihypertensive Name (if applicable)" name="antihypertensiveName" bind:value={med.antihypertensiveName} placeholder="e.g. Lisinopril 10mg" />

	<div class="mb-4">
		<label for="otherMedications" class="mb-1 block text-sm font-medium text-gray-700">Other Medications</label>
		<textarea id="otherMedications" name="otherMedications" rows="3" bind:value={med.otherMedications} placeholder="List any other current medications" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"></textarea>
	</div>
</SectionCard>
