<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const a = assessment.data.authorizationPeriod;
</script>

<SectionCard title="Authorization Period" description="Specify the time period for which this authorization is valid">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput
			label="Start Date"
			name="startDate"
			type="date"
			bind:value={a.startDate}
			required
		/>
		<TextInput
			label="End Date"
			name="endDate"
			type="date"
			bind:value={a.endDate}
			required
		/>
	</div>

	<RadioGroup
		label="Is this a single-use authorization?"
		name="singleUse"
		options={[
			{ value: 'yes', label: 'Yes - One-time release only' },
			{ value: 'no', label: 'No - Ongoing within the authorization period' }
		]}
		bind:value={a.singleUse}
	/>

	<div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
		<p class="font-medium">Important</p>
		<p class="mt-1">
			This authorization will automatically expire on the end date specified above.
			You may revoke this authorization at any time by contacting your healthcare provider in writing.
		</p>
	</div>
</SectionCard>
