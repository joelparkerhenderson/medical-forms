<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const ins = assessment.data.insuranceAndId;
</script>

<SectionCard title="Insurance & ID" description="Insurance and identification details">
	<TextInput label="Insurance Provider" name="insuranceProvider" bind:value={ins.insuranceProvider} />
	<TextInput label="Policy Number" name="policyNumber" bind:value={ins.policyNumber} />
	<TextInput label="NHS Number" name="nhsNumber" bind:value={ins.nhsNumber} placeholder="e.g. 943 476 5919" />

	<div class="mt-4 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">GP Details</h3>
		<TextInput label="GP Name" name="gpName" bind:value={ins.gpName} />
		<TextInput label="GP Practice Name" name="gpPractice" bind:value={ins.gpPracticeName} />
		<TextInput label="GP Phone" name="gpPhone" bind:value={ins.gpPhone} />
	</div>
</SectionCard>
