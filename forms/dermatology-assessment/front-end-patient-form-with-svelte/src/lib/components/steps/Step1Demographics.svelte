<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { fitzpatrickLabel } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.demographics;
</script>

<SectionCard title="Demographics" description="Basic patient information and skin type">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="First Name" name="firstName" bind:value={d.firstName} required />
		<TextInput label="Last Name" name="lastName" bind:value={d.lastName} required />
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

	<SelectInput
		label="Fitzpatrick Skin Type"
		name="skinType"
		options={[
			{ value: 'I', label: 'Type I - Very fair, always burns, never tans' },
			{ value: 'II', label: 'Type II - Fair, usually burns, tans minimally' },
			{ value: 'III', label: 'Type III - Medium, sometimes burns, tans uniformly' },
			{ value: 'IV', label: 'Type IV - Olive, rarely burns, always tans well' },
			{ value: 'V', label: 'Type V - Brown, very rarely burns, tans very easily' },
			{ value: 'VI', label: 'Type VI - Dark brown/black, never burns, always tans' }
		]}
		bind:value={d.skinType}
		required
	/>
</SectionCard>
