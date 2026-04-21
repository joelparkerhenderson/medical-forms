<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const s = assessment.data.currentSymptoms;
	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Symptoms" description="Report any symptoms you are currently experiencing">
	<RadioGroup
		label="Nausea or vomiting"
		name="nausea"
		options={yesNoOptions}
		bind:value={s.nausea}
	/>

	<RadioGroup
		label="Vaginal bleeding"
		name="bleeding"
		options={yesNoOptions}
		bind:value={s.bleeding}
	/>

	<RadioGroup
		label="Persistent or severe headache"
		name="headache"
		options={yesNoOptions}
		bind:value={s.headache}
	/>

	<RadioGroup
		label="Vision changes (blurring, flashing lights, spots)"
		name="visionChanges"
		options={yesNoOptions}
		bind:value={s.visionChanges}
	/>

	<RadioGroup
		label="Swelling / edema (face, hands, or feet)"
		name="edema"
		options={yesNoOptions}
		bind:value={s.edema}
	/>

	<RadioGroup
		label="Abdominal pain or cramping"
		name="abdominalPain"
		options={yesNoOptions}
		bind:value={s.abdominalPain}
	/>

	<RadioGroup
		label="Reduced fetal movement"
		name="reducedFetalMovement"
		options={yesNoOptions}
		bind:value={s.reducedFetalMovement}
	/>
</SectionCard>
