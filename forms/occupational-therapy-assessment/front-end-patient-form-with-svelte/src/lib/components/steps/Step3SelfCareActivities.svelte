<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const s = assessment.data.selfCareActivities;

	const difficultyOptions = [
		{ value: 'none', label: 'No difficulty' },
		{ value: 'some', label: 'Some difficulty' },
		{ value: 'significant', label: 'Significant difficulty' },
		{ value: 'unable', label: 'Unable to perform' }
	];
</script>

<SectionCard title="Self-Care Activities" description="Assess your ability to perform daily self-care tasks">
	<div class="space-y-6">
		<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
			<h3 class="mb-3 text-sm font-semibold text-gray-800">Personal Care</h3>
			<p class="mb-3 text-xs text-gray-500">Bathing, dressing, grooming, hygiene, feeding</p>
			<RadioGroup
				label="Level of difficulty"
				name="personalCareDifficulty"
				options={difficultyOptions}
				bind:value={s.personalCare.difficulty}
				required
			/>
			<TextArea
				label="Details"
				name="personalCareDetails"
				bind:value={s.personalCare.details}
				placeholder="Describe any specific difficulties..."
			/>
		</div>

		<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
			<h3 class="mb-3 text-sm font-semibold text-gray-800">Functional Mobility</h3>
			<p class="mb-3 text-xs text-gray-500">Transfers, indoor/outdoor mobility, stairs, transportation</p>
			<RadioGroup
				label="Level of difficulty"
				name="functionalMobilityDifficulty"
				options={difficultyOptions}
				bind:value={s.functionalMobility.difficulty}
				required
			/>
			<TextArea
				label="Details"
				name="functionalMobilityDetails"
				bind:value={s.functionalMobility.details}
				placeholder="Describe any specific difficulties..."
			/>
		</div>

		<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
			<h3 class="mb-3 text-sm font-semibold text-gray-800">Community Management</h3>
			<p class="mb-3 text-xs text-gray-500">Shopping, finances, transportation, appointments</p>
			<RadioGroup
				label="Level of difficulty"
				name="communityManagementDifficulty"
				options={difficultyOptions}
				bind:value={s.communityManagement.difficulty}
				required
			/>
			<TextArea
				label="Details"
				name="communityManagementDetails"
				bind:value={s.communityManagement.details}
				placeholder="Describe any specific difficulties..."
			/>
		</div>
	</div>
</SectionCard>
