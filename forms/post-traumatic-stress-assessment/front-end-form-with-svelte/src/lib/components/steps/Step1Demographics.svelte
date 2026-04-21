<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const d = assessment.data.demographics;
</script>

<SectionCard title="Demographics" description="Your details. Used to contextualise the PCL-5 score for clinical records.">
	<TextInput label="First Name" name="firstName" bind:value={d.firstName} required />
	<TextInput label="Last Name" name="lastName" bind:value={d.lastName} required />
	<TextInput label="Date of Birth" name="dateOfBirth" bind:value={d.dateOfBirth} type="date" required />
	<fieldset class="mb-4">
		<legend class="mb-1 block text-sm font-medium text-gray-700">Sex</legend>
		<div class="flex gap-4 text-sm">
			{#each ['male', 'female', 'other'] as opt}
				<label class="flex items-center gap-2">
					<input type="radio" name="sex" bind:group={d.sex} value={opt} class="accent-primary" />
					<span class="capitalize">{opt}</span>
				</label>
			{/each}
		</div>
	</fieldset>
</SectionCard>
