<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const f = assessment.data.familyPedigree;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	const familyMembers = [
		{ key: 'mother', label: 'Mother', data: f.mother },
		{ key: 'father', label: 'Father', data: f.father },
		{ key: 'maternalGrandmother', label: 'Maternal Grandmother', data: f.maternalGrandmother },
		{ key: 'maternalGrandfather', label: 'Maternal Grandfather', data: f.maternalGrandfather },
		{ key: 'paternalGrandmother', label: 'Paternal Grandmother', data: f.paternalGrandmother },
		{ key: 'paternalGrandfather', label: 'Paternal Grandfather', data: f.paternalGrandfather }
	] as const;
</script>

<SectionCard title="Family Pedigree" description="Three-generation family history of medical conditions and cancers">
	{#each familyMembers as member}
		<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
			<h3 class="mb-3 text-sm font-bold text-gray-800">{member.label}</h3>

			<TextArea
				label="Medical conditions"
				name="{member.key}Conditions"
				bind:value={member.data.conditions}
				placeholder="List any known medical or genetic conditions..."
				rows={2}
			/>

			<TextInput
				label="Cancer history"
				name="{member.key}Cancers"
				bind:value={member.data.cancers}
				placeholder="Type of cancer(s), if any"
			/>

			<TextInput
				label="Age at diagnosis (if applicable)"
				name="{member.key}AgeAtDiagnosis"
				bind:value={member.data.ageAtDiagnosis}
				placeholder="e.g., 45"
			/>

			<RadioGroup
				label="Deceased?"
				name="{member.key}Deceased"
				options={yesNo}
				bind:value={member.data.deceased}
			/>

			{#if member.data.deceased === 'yes'}
				<TextInput
					label="Age at death"
					name="{member.key}AgeAtDeath"
					bind:value={member.data.ageAtDeath}
					placeholder="e.g., 72"
				/>
			{/if}
		</div>
	{/each}

	<TextArea
		label="Siblings (conditions, cancers, age at diagnosis)"
		name="siblings"
		bind:value={f.siblings}
		placeholder="List siblings and any relevant medical history..."
		rows={3}
	/>

	<TextArea
		label="Children (conditions, cancers, age at diagnosis)"
		name="children"
		bind:value={f.children}
		placeholder="List children and any relevant medical history..."
		rows={3}
	/>
</SectionCard>
