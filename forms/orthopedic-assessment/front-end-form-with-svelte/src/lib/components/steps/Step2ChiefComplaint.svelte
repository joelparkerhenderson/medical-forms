<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';

	const c = assessment.data.chiefComplaint;
</script>

<SectionCard title="Chief Complaint" description="Describe your primary orthopedic concern">
	<TextArea
		label="What is your primary concern?"
		name="primaryConcern"
		bind:value={c.primaryConcern}
		placeholder="Describe your main orthopedic problem..."
	/>

	<SelectInput
		label="Affected Joint / Region"
		name="affectedJoint"
		options={[
			{ value: 'Shoulder', label: 'Shoulder' },
			{ value: 'Elbow', label: 'Elbow' },
			{ value: 'Wrist', label: 'Wrist' },
			{ value: 'Hand', label: 'Hand' },
			{ value: 'Hip', label: 'Hip' },
			{ value: 'Knee', label: 'Knee' },
			{ value: 'Ankle', label: 'Ankle' },
			{ value: 'Foot', label: 'Foot' },
			{ value: 'Spine - Cervical', label: 'Spine - Cervical' },
			{ value: 'Spine - Thoracic', label: 'Spine - Thoracic' },
			{ value: 'Spine - Lumbar', label: 'Spine - Lumbar' },
			{ value: 'Other', label: 'Other' }
		]}
		bind:value={c.affectedJoint}
		required
	/>

	<RadioGroup
		label="Side"
		name="side"
		options={[
			{ value: 'left', label: 'Left' },
			{ value: 'right', label: 'Right' },
			{ value: 'bilateral', label: 'Bilateral' }
		]}
		bind:value={c.side}
		required
	/>

	<TextInput
		label="Duration"
		name="duration"
		bind:value={c.duration}
		placeholder="e.g., 2 weeks, 3 months, 5 years"
		required
	/>

	<RadioGroup
		label="Onset Type"
		name="onsetType"
		options={[
			{ value: 'acute', label: 'Acute' },
			{ value: 'gradual', label: 'Gradual' },
			{ value: 'traumatic', label: 'Traumatic' },
			{ value: 'overuse', label: 'Overuse' }
		]}
		bind:value={c.onsetType}
		required
	/>

	<CheckboxGroup
		label="Aggravating Factors"
		options={[
			{ value: 'movement', label: 'Movement' },
			{ value: 'weight-bearing', label: 'Weight bearing' },
			{ value: 'lifting', label: 'Lifting' },
			{ value: 'gripping', label: 'Gripping' },
			{ value: 'overhead-activity', label: 'Overhead activity' },
			{ value: 'prolonged-sitting', label: 'Prolonged sitting' },
			{ value: 'prolonged-standing', label: 'Prolonged standing' },
			{ value: 'swelling', label: 'Swelling' },
			{ value: 'redness', label: 'Redness' },
			{ value: 'cold-weather', label: 'Cold weather' }
		]}
		bind:values={c.aggravatingFactors}
	/>
</SectionCard>
