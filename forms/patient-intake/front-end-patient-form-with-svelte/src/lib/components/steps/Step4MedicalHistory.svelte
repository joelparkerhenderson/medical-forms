<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const h = assessment.data.medicalHistory;

	const chronicConditionOptions = [
		{ value: 'hypertension', label: 'Hypertension' },
		{ value: 'type-1-diabetes', label: 'Type 1 Diabetes' },
		{ value: 'type-2-diabetes', label: 'Type 2 Diabetes' },
		{ value: 'heart-disease', label: 'Heart Disease' },
		{ value: 'heart-failure', label: 'Heart Failure' },
		{ value: 'asthma', label: 'Asthma' },
		{ value: 'copd', label: 'COPD' },
		{ value: 'chronic-kidney-disease', label: 'Chronic Kidney Disease' },
		{ value: 'liver-disease', label: 'Liver Disease' },
		{ value: 'thyroid-disorder', label: 'Thyroid Disorder' },
		{ value: 'epilepsy', label: 'Epilepsy' },
		{ value: 'arthritis', label: 'Arthritis' },
		{ value: 'cancer', label: 'Cancer' },
		{ value: 'depression', label: 'Depression' },
		{ value: 'anxiety', label: 'Anxiety' },
		{ value: 'autoimmune-disorder', label: 'Autoimmune Disorder' },
		{ value: 'other', label: 'Other' }
	];
</script>

<SectionCard title="Medical History" description="Your past and current medical conditions">
	<CheckboxGroup
		label="Do you have any of the following chronic conditions?"
		options={chronicConditionOptions}
		bind:values={h.chronicConditions}
	/>

	<TextArea
		label="Previous Surgeries"
		name="surgeries"
		bind:value={h.previousSurgeries}
		placeholder="List any previous surgeries with approximate dates"
	/>

	<TextArea
		label="Previous Hospitalizations"
		name="hospitalizations"
		bind:value={h.previousHospitalizations}
		placeholder="List any previous hospital stays with approximate dates and reasons"
	/>

	<TextArea
		label="Ongoing Treatments"
		name="treatments"
		bind:value={h.ongoingTreatments}
		placeholder="Describe any ongoing treatments or therapies"
	/>
</SectionCard>
