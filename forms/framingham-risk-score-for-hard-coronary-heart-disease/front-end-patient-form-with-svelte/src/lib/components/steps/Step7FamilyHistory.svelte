<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const f = assessment.data.familyHistory;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Family History" description="Family history of premature CHD is an important risk modifier not captured in the core Framingham equation.">
	<RadioGroup label="Family History of Coronary Heart Disease?" name="familyChdHistory" options={yesNoOptions} bind:value={f.familyChdHistory} />

	<div class="mb-4">
		<label for="familyChdAgeOnset" class="mb-1 block text-sm font-medium text-gray-700">Age of Onset in Family Member</label>
		<select id="familyChdAgeOnset" name="familyChdAgeOnset" bind:value={f.familyChdAgeOnset} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			<option value="under55">Under 55</option>
			<option value="55to65">55 - 65</option>
			<option value="over65">Over 65</option>
		</select>
	</div>

	<TextInput label="Relationship to Patient" name="familyChdRelationship" bind:value={f.familyChdRelationship} placeholder="e.g. Father, Mother, Sibling" />

	<RadioGroup label="Family History of Stroke?" name="familyStrokeHistory" options={yesNoOptions} bind:value={f.familyStrokeHistory} />
	<RadioGroup label="Family History of Diabetes?" name="familyDiabetesHistory" options={yesNoOptions} bind:value={f.familyDiabetesHistory} />
</SectionCard>
