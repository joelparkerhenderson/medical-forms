<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const d = assessment.data.diagnosticResults;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Diagnostic Results" description="ECG, echocardiography, stress test, and catheterization findings">
	<RadioGroup label="Is the ECG normal?" name="ecgNormal" options={yesNo} bind:value={d.ecgNormal} />
	{#if d.ecgNormal === 'no'}
		<TextArea label="ECG findings" name="ecgFindings" bind:value={d.ecgFindings} placeholder="e.g. ST depression, LBBB, AF" />
	{/if}

	<RadioGroup label="Has an echocardiogram been performed?" name="echoPerformed" options={yesNo} bind:value={d.echoPerformed} />
	{#if d.echoPerformed === 'yes'}
		<NumberInput label="Left ventricular ejection fraction (LVEF)" name="echoLVEF" bind:value={d.echoLVEF} unit="%" min={5} max={80} />
		<TextArea label="Echocardiogram findings" name="echoFindings" bind:value={d.echoFindings} placeholder="e.g. Wall motion abnormalities, valve issues" />
	{/if}

	<RadioGroup label="Has a stress test been performed?" name="stressTest" options={yesNo} bind:value={d.stressTestPerformed} />
	{#if d.stressTestPerformed === 'yes'}
		<SelectInput
			label="Stress test result"
			name="stressTestResult"
			options={[
				{ value: 'normal', label: 'Normal' },
				{ value: 'abnormal', label: 'Abnormal' },
				{ value: 'inconclusive', label: 'Inconclusive' }
			]}
			bind:value={d.stressTestResult}
			required
		/>
		<TextArea label="Stress test details" name="stressTestDetails" bind:value={d.stressTestDetails} placeholder="e.g. Ischaemic changes, METs achieved" />
	{/if}

	<RadioGroup label="Has cardiac catheterization been performed?" name="cathPerformed" options={yesNo} bind:value={d.cathPerformed} />
	{#if d.cathPerformed === 'yes'}
		<TextArea label="Catheterization findings" name="cathFindings" bind:value={d.cathFindings} placeholder="e.g. LAD 80% stenosis, RCA 50% stenosis" />
	{/if}
</SectionCard>
