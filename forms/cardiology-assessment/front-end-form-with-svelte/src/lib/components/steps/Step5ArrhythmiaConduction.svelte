<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const a = assessment.data.arrhythmiaConduction;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Arrhythmia & Conduction" description="Atrial fibrillation, pacemaker, syncope, and palpitations">
	<RadioGroup label="Have you been diagnosed with atrial fibrillation?" name="af" options={yesNo} bind:value={a.atrialFibrillation} />
	{#if a.atrialFibrillation === 'yes'}
		<SelectInput
			label="Type of atrial fibrillation"
			name="afType"
			options={[
				{ value: 'paroxysmal', label: 'Paroxysmal (intermittent)' },
				{ value: 'persistent', label: 'Persistent' },
				{ value: 'permanent', label: 'Permanent' }
			]}
			bind:value={a.afType}
			required
		/>
	{/if}

	<RadioGroup label="Do you have any other arrhythmia?" name="otherArrhythmia" options={yesNo} bind:value={a.otherArrhythmia} />
	{#if a.otherArrhythmia === 'yes'}
		<TextInput label="Type of arrhythmia" name="otherArrhythmiaType" bind:value={a.otherArrhythmiaType} />
	{/if}

	<RadioGroup label="Do you have a pacemaker or ICD (implantable cardioverter-defibrillator)?" name="pacemaker" options={yesNo} bind:value={a.pacemaker} />
	{#if a.pacemaker === 'yes'}
		<SelectInput
			label="Device type"
			name="pacemakerType"
			options={[
				{ value: 'single-chamber', label: 'Single chamber pacemaker' },
				{ value: 'dual-chamber', label: 'Dual chamber pacemaker' },
				{ value: 'biventricular', label: 'Biventricular (CRT)' },
				{ value: 'icd', label: 'ICD' }
			]}
			bind:value={a.pacemakerType}
		/>
	{/if}

	<RadioGroup label="Have you experienced syncope (fainting/blackouts)?" name="syncope" options={yesNo} bind:value={a.syncope} />
	{#if a.syncope === 'yes'}
		<TextArea label="Syncope details" name="syncopeDetails" bind:value={a.syncopeDetails} placeholder="Describe circumstances, frequency" />
	{/if}

	<RadioGroup label="Do you experience palpitations?" name="palpitations" options={yesNo} bind:value={a.palpitations} />
</SectionCard>
