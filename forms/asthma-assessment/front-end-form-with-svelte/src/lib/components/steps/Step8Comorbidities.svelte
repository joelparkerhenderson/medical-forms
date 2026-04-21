<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.comorbidities;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Comorbidities" description="Other conditions that may affect your asthma">
	<RadioGroup label="Do you have allergic rhinitis (hay fever)?" name="allergicRhinitis" options={yesNo} bind:value={c.allergicRhinitis} />

	<RadioGroup label="Do you have sinusitis?" name="sinusitis" options={yesNo} bind:value={c.sinusitis} />

	<RadioGroup label="Do you have nasal polyps?" name="nasalPolyps" options={yesNo} bind:value={c.nasalPolyps} />

	<RadioGroup label="Do you have GORD (gastro-oesophageal reflux disease)?" name="gord" options={yesNo} bind:value={c.gord} />

	<RadioGroup label="Do you have obesity?" name="obesity" options={yesNo} bind:value={c.obesity} />

	<RadioGroup label="Do you have anxiety?" name="anxiety" options={yesNo} bind:value={c.anxiety} />

	<RadioGroup label="Do you have depression?" name="depression" options={yesNo} bind:value={c.depression} />

	<RadioGroup label="Do you have eczema (atopic dermatitis)?" name="eczema" options={yesNo} bind:value={c.eczema} />

	<RadioGroup label="Do you have sleep apnoea?" name="sleepApnoea" options={yesNo} bind:value={c.sleepApnoea} />

	<RadioGroup label="Do you have vocal cord dysfunction?" name="vocalCordDysfunction" options={yesNo} bind:value={c.vocalCordDysfunction} />

	<TextArea
		label="Other comorbidities"
		name="otherComorbidities"
		bind:value={c.otherComorbidities}
		placeholder="List any other medical conditions..."
	/>
</SectionCard>
