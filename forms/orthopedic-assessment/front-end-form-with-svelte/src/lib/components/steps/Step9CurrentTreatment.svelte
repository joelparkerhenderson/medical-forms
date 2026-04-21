<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const tx = assessment.data.currentTreatment;

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Treatment" description="Current medications, therapies, and allergy information">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Current Medications</h3>
	<MedicationEntry bind:medications={tx.medications} />
	{#if tx.medications.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No medications added.</p>
	{/if}

	<div class="mt-6">
		<RadioGroup
			label="Are you currently having physical therapy?"
			name="physicalTherapy"
			options={yesNo}
			bind:value={tx.physicalTherapy}
		/>
		{#if tx.physicalTherapy === 'yes'}
			<TextArea
				label="Physical Therapy Details"
				name="physicalTherapyDetails"
				bind:value={tx.physicalTherapyDetails}
				placeholder="Describe your physical therapy regimen..."
			/>
		{/if}
	</div>

	<div class="mt-4">
		<RadioGroup
			label="Have you had any joint injections?"
			name="injections"
			options={yesNo}
			bind:value={tx.injections}
		/>
		{#if tx.injections === 'yes'}
			<TextArea
				label="Injection Details"
				name="injectionDetails"
				bind:value={tx.injectionDetails}
				placeholder="Describe injections received (type, location, date)..."
			/>
		{/if}
	</div>

	<div class="mt-4">
		<RadioGroup
			label="Are you using a brace or splint?"
			name="braceOrSplint"
			options={yesNo}
			bind:value={tx.braceOrSplint}
		/>
		{#if tx.braceOrSplint === 'yes'}
			<TextArea
				label="Brace/Splint Details"
				name="braceDetails"
				bind:value={tx.braceDetails}
				placeholder="Describe the brace or splint and usage..."
			/>
		{/if}
	</div>

	<div class="mt-4">
		<TextArea
			label="Other Treatments"
			name="otherTreatments"
			bind:value={tx.otherTreatments}
			placeholder="e.g., acupuncture, TENS, ice/heat therapy..."
		/>
	</div>

	<div class="mt-6">
		<h3 class="mb-2 text-sm font-semibold text-gray-700">Drug Allergies</h3>
		<AllergyEntry bind:allergies={tx.allergies} />
		{#if tx.allergies.length === 0}
			<p class="mt-2 text-sm text-gray-500">No drug allergies added. Click the button above to add one, or proceed if you have none.</p>
		{/if}
	</div>
</SectionCard>
