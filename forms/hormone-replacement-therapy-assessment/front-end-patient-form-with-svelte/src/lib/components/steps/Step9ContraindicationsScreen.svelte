<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const c = assessment.data.contraindicationsScreen;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Contraindications Screen" description="Screening for conditions that may affect HRT prescribing">
	<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
		<p class="text-sm text-amber-800">
			Please answer the following questions carefully. Some conditions may mean that HRT is not suitable for you,
			or that a specific type of HRT may be preferred.
		</p>
	</div>

	<RadioGroup label="Have you ever had a blood clot (deep vein thrombosis or pulmonary embolism)?" name="vteHistory" options={yesNo} bind:value={c.vteHistory} />
	{#if c.vteHistory === 'yes'}
		<TextInput label="Please provide details" name="vteDetails" bind:value={c.vteDetails} placeholder="e.g., DVT left leg 2019, provoked/unprovoked" />
	{/if}

	<RadioGroup label="Have you ever been diagnosed with breast cancer?" name="breastCancerHistory" options={yesNo} bind:value={c.breastCancerHistory} />
	{#if c.breastCancerHistory === 'yes'}
		<TextInput label="Please provide details" name="breastCancerDetails" bind:value={c.breastCancerDetails} placeholder="e.g., ER+/PR+ breast cancer 2018, tamoxifen x 5 years" />
	{/if}

	<RadioGroup label="Do you have active liver disease?" name="liverDisease" options={yesNo} bind:value={c.liverDisease} />
	{#if c.liverDisease === 'yes'}
		<TextInput label="Please provide details" name="liverDiseaseDetails" bind:value={c.liverDiseaseDetails} />
	{/if}

	<RadioGroup label="Do you have any undiagnosed vaginal bleeding?" name="undiagnosedVaginalBleeding" options={yesNo} bind:value={c.undiagnosedVaginalBleeding} />

	<RadioGroup label="Are you or could you be pregnant?" name="pregnancy" options={yesNo} bind:value={c.pregnancy} />

	<RadioGroup label="Do you have active cardiovascular disease (recent stroke, heart attack, or angina)?" name="activeCardiovascularDisease" options={yesNo} bind:value={c.activeCardiovascularDisease} />
	{#if c.activeCardiovascularDisease === 'yes'}
		<TextInput label="Please provide details" name="activeCardiovascularDetails" bind:value={c.activeCardiovascularDetails} />
	{/if}
</SectionCard>
