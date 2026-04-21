<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const cm = assessment.data.currentMedications;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="Current cardiovascular and metabolic medications">
	<RadioGroup
		label="On antihypertensive medication?"
		name="onAntihypertensiveDetail"
		options={yesNoOptions}
		bind:value={cm.onAntihypertensiveDetail}
	/>

	<RadioGroup
		label="On statin therapy?"
		name="onStatinDetail"
		options={yesNoOptions}
		bind:value={cm.onStatinDetail}
	/>

	<RadioGroup
		label="On aspirin?"
		name="onAspirin"
		options={yesNoOptions}
		bind:value={cm.onAspirin}
	/>

	<RadioGroup
		label="On anticoagulant?"
		name="onAnticoagulant"
		options={yesNoOptions}
		bind:value={cm.onAnticoagulant}
	/>

	<RadioGroup
		label="On diabetes medication?"
		name="onDiabetesMedication"
		options={yesNoOptions}
		bind:value={cm.onDiabetesMedication}
	/>

	<TextArea
		label="Other Medications"
		name="otherMedications"
		bind:value={cm.otherMedications}
		placeholder="List any other current medications"
		rows={3}
	/>
</SectionCard>
