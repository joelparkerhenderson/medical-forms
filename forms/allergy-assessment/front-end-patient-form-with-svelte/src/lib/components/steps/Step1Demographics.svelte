<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateBMI, bmiCategory } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.demographics;

	$effect(() => {
		const bmi = calculateBMI(d.weight, d.height);
		assessment.data.demographics.bmi = bmi;
	});
</script>

<SectionCard title="Demographics" description="Basic patient information">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="First Name" name="firstName" bind:value={d.firstName} required />
		<TextInput label="Last Name" name="lastName" bind:value={d.lastName} required />
	</div>

	<TextInput label="Date of Birth" name="dob" type="date" bind:value={d.dateOfBirth} required />
	<TextInput label="NHS Number" name="nhsNumber" bind:value={d.nhsNumber} placeholder="000 000 0000" />

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
		<NumberInput label="Weight" name="weight" bind:value={d.weight} unit="kg" min={1} max={400} required />
		<NumberInput label="Height" name="height" bind:value={d.height} unit="cm" min={50} max={250} required />
		<div class="mb-4">
			<span class="mb-1 block text-sm font-medium text-gray-700">BMI</span>
			<div class="flex h-[38px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm">
				{#if d.bmi}
					<span class="font-medium">{d.bmi}</span>
					<span class="ml-2 text-gray-500">({bmiCategory(d.bmi)})</span>
				{:else}
					<span class="text-gray-400">Auto-calculated</span>
				{/if}
			</div>
		</div>
	</div>
</SectionCard>
