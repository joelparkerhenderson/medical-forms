<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const e = assessment.data.earExamination;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Ear Examination" description="Clinical findings from otoscopic examination">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Left Ear</h3>
	<TextInput
		label="External ear appearance"
		name="leftExternalEar"
		bind:value={e.leftExternalEar}
		placeholder="e.g., Normal, inflammation, discharge..."
	/>
	<TextInput
		label="Tympanic membrane"
		name="leftTympanicMembrane"
		bind:value={e.leftTympanicMembrane}
		placeholder="e.g., Normal, perforation, retraction..."
	/>
	<RadioGroup
		label="Cerumen (earwax) present in left ear?"
		name="cerumenLeft"
		options={yesNo}
		bind:value={e.cerumenLeft}
	/>

	<h3 class="mb-2 mt-6 text-sm font-semibold text-gray-700">Right Ear</h3>
	<TextInput
		label="External ear appearance"
		name="rightExternalEar"
		bind:value={e.rightExternalEar}
		placeholder="e.g., Normal, inflammation, discharge..."
	/>
	<TextInput
		label="Tympanic membrane"
		name="rightTympanicMembrane"
		bind:value={e.rightTympanicMembrane}
		placeholder="e.g., Normal, perforation, retraction..."
	/>
	<RadioGroup
		label="Cerumen (earwax) present in right ear?"
		name="cerumenRight"
		options={yesNo}
		bind:value={e.cerumenRight}
	/>

	<div class="mt-6">
		<TextArea
			label="Any other abnormalities noted"
			name="abnormalities"
			bind:value={e.abnormalities}
			placeholder="Describe any other findings..."
		/>
	</div>
</SectionCard>
