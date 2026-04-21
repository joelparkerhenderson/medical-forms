<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.demographics;
</script>

<SectionCard title="Demographics" description="Child and parent/guardian information">
	<h3 class="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Child Information</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Child's First Name" name="childFirstName" bind:value={d.childFirstName} required />
		<TextInput label="Child's Last Name" name="childLastName" bind:value={d.childLastName} required />
	</div>

	<TextInput label="Date of Birth" name="dob" type="date" bind:value={d.dateOfBirth} required />

	<RadioGroup
		label="Sex"
		name="sex"
		options={[
			{ value: 'male', label: 'Male' },
			{ value: 'female', label: 'Female' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={d.sex}
		required
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
		<NumberInput label="Weight" name="weight" bind:value={d.weight} unit="kg" min={0.5} max={150} step={0.1} required />
		<NumberInput label="Height" name="height" bind:value={d.height} unit="cm" min={30} max={200} step={0.1} required />
		<NumberInput label="Head Circumference" name="headCirc" bind:value={d.headCircumference} unit="cm" min={20} max={65} step={0.1} />
	</div>

	<hr class="my-4 border-gray-200" />

	<h3 class="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Parent/Guardian Information</h3>
	<TextInput label="Parent/Guardian Name" name="parentName" bind:value={d.parentGuardianName} required />
	<TextInput label="Relationship to Child" name="parentRelationship" bind:value={d.parentGuardianRelationship} required />
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Phone Number" name="parentPhone" bind:value={d.parentGuardianPhone} />
		<TextInput label="Email" name="parentEmail" type="email" bind:value={d.parentGuardianEmail} />
	</div>
</SectionCard>
