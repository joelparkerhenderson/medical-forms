<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const d = assessment.data.diagnosticResults;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Diagnostic Results" description="Imaging, EEG, EMG/NCS, and lumbar puncture findings">
	<RadioGroup label="Has MRI/CT brain been performed?" name="mriCt" options={yesNo} bind:value={d.mriCtPerformed} />
	{#if d.mriCtPerformed === 'yes'}
		<SelectInput
			label="MRI/CT finding"
			name="mriCtFinding"
			options={[
				{ value: 'normal', label: 'Normal' },
				{ value: 'infarct', label: 'Infarct' },
				{ value: 'haemorrhage', label: 'Haemorrhage' },
				{ value: 'mass', label: 'Mass/tumour' },
				{ value: 'demyelination', label: 'Demyelination' },
				{ value: 'atrophy', label: 'Atrophy' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={d.mriCtFinding}
		/>
		<TextArea label="Imaging details" name="mriCtDetails" bind:value={d.mriCtDetails} placeholder="Location, size, and clinical correlation" />
	{/if}

	<RadioGroup label="Has EEG been performed?" name="eeg" options={yesNo} bind:value={d.eegPerformed} />
	{#if d.eegPerformed === 'yes'}
		<SelectInput
			label="EEG finding"
			name="eegFinding"
			options={[
				{ value: 'normal', label: 'Normal' },
				{ value: 'epileptiform', label: 'Epileptiform discharges' },
				{ value: 'slow-wave', label: 'Generalised slowing' },
				{ value: 'focal-abnormality', label: 'Focal abnormality' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={d.eegFinding}
		/>
		<TextArea label="EEG details" name="eegDetails" bind:value={d.eegDetails} />
	{/if}

	<RadioGroup label="Has EMG/nerve conduction study been performed?" name="emgNcs" options={yesNo} bind:value={d.emgNcsPerformed} />
	{#if d.emgNcsPerformed === 'yes'}
		<TextArea label="EMG/NCS findings" name="emgNcsDetails" bind:value={d.emgNcsDetails} placeholder="e.g., demyelinating neuropathy, axonal loss, myopathic changes" />
	{/if}

	<RadioGroup label="Has lumbar puncture been performed?" name="lp" options={yesNo} bind:value={d.lumbarPuncturePerformed} />
	{#if d.lumbarPuncturePerformed === 'yes'}
		<TextArea label="Lumbar puncture findings" name="lpDetails" bind:value={d.lumbarPunctureDetails} placeholder="e.g., opening pressure, CSF analysis, oligoclonal bands" />
	{/if}
</SectionCard>
