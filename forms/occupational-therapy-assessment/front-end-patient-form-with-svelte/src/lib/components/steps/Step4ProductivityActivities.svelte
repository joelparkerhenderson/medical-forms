<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const p = assessment.data.productivityActivities;

	const difficultyOptions = [
		{ value: 'none', label: 'No difficulty' },
		{ value: 'some', label: 'Some difficulty' },
		{ value: 'significant', label: 'Significant difficulty' },
		{ value: 'unable', label: 'Unable to perform' }
	];
</script>

<SectionCard title="Productivity Activities" description="Assess your ability to perform work and productive tasks">
	<div class="space-y-6">
		<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
			<h3 class="mb-3 text-sm font-semibold text-gray-800">Paid/Unpaid Work</h3>
			<p class="mb-3 text-xs text-gray-500">Employment tasks, volunteer work, work responsibilities</p>
			<RadioGroup
				label="Level of difficulty"
				name="paidWorkDifficulty"
				options={difficultyOptions}
				bind:value={p.paidWork.difficulty}
				required
			/>
			<TextArea
				label="Details"
				name="paidWorkDetails"
				bind:value={p.paidWork.details}
				placeholder="Describe any specific difficulties..."
			/>
		</div>

		<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
			<h3 class="mb-3 text-sm font-semibold text-gray-800">Household Management</h3>
			<p class="mb-3 text-xs text-gray-500">Cleaning, laundry, cooking, home maintenance</p>
			<RadioGroup
				label="Level of difficulty"
				name="householdManagementDifficulty"
				options={difficultyOptions}
				bind:value={p.householdManagement.difficulty}
				required
			/>
			<TextArea
				label="Details"
				name="householdManagementDetails"
				bind:value={p.householdManagement.details}
				placeholder="Describe any specific difficulties..."
			/>
		</div>

		<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
			<h3 class="mb-3 text-sm font-semibold text-gray-800">Education/Training</h3>
			<p class="mb-3 text-xs text-gray-500">School, courses, professional development</p>
			<RadioGroup
				label="Level of difficulty"
				name="educationDifficulty"
				options={difficultyOptions}
				bind:value={p.education.difficulty}
				required
			/>
			<TextArea
				label="Details"
				name="educationDetails"
				bind:value={p.education.details}
				placeholder="Describe any specific difficulties..."
			/>
		</div>
	</div>
</SectionCard>
