<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.extraArticularFeatures;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Extra-articular Features" description="Manifestations beyond the joints">
	<h3 class="mb-3 font-semibold text-gray-800">Skin</h3>
	<RadioGroup label="Rheumatoid Nodules" name="rheumatoidNodules" options={yesNoOptions} bind:value={d.rheumatoidNodules} />
	<RadioGroup label="Skin Rash" name="skinRash" options={yesNoOptions} bind:value={d.skinRash} />
	{#if d.skinRash === 'yes'}
		<TextArea label="Skin Rash Details" name="skinRashDetails" bind:value={d.skinRashDetails} placeholder="Describe rash type, distribution..." />
	{/if}

	<h3 class="mb-3 mt-6 font-semibold text-gray-800">Eyes</h3>
	<RadioGroup label="Eye Dryness (Sjogren's)" name="eyeDryness" options={yesNoOptions} bind:value={d.eyeDryness} />
	<RadioGroup label="Uveitis" name="uveitis" options={yesNoOptions} bind:value={d.uveitis} />
	{#if d.uveitis === 'yes'}
		<TextArea label="Uveitis Details" name="uveitisDetails" bind:value={d.uveitisDetails} placeholder="Type, frequency, treatment..." />
	{/if}

	<h3 class="mb-3 mt-6 font-semibold text-gray-800">Lungs</h3>
	<RadioGroup label="Interstitial Lung Disease (ILD)" name="interstitialLungDisease" options={yesNoOptions} bind:value={d.interstitialLungDisease} />
	{#if d.interstitialLungDisease === 'yes'}
		<TextArea label="ILD Details" name="ildDetails" bind:value={d.ildDetails} placeholder="Type, severity, treatment..." />
	{/if}

	<h3 class="mb-3 mt-6 font-semibold text-gray-800">Cardiovascular</h3>
	<RadioGroup label="Cardiovascular Involvement" name="cardiovascularInvolvement" options={yesNoOptions} bind:value={d.cardiovascularInvolvement} />
	{#if d.cardiovascularInvolvement === 'yes'}
		<TextArea label="Cardiovascular Details" name="cardiovascularDetails" bind:value={d.cardiovascularDetails} placeholder="Pericarditis, vasculitis, etc..." />
	{/if}
</SectionCard>
