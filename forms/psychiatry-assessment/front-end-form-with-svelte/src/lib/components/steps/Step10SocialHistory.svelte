<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const s = assessment.data.socialHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Social History" description="Social circumstances affecting mental health and recovery">
	<SelectInput
		label="Housing Status"
		name="housing"
		options={[
			{ value: 'stable', label: 'Stable housing' },
			{ value: 'temporary', label: 'Temporary accommodation' },
			{ value: 'homeless', label: 'Homeless / rough sleeping' },
			{ value: 'supported', label: 'Supported housing' },
			{ value: 'institution', label: 'Residential institution' }
		]}
		bind:value={s.housing}
	/>
	<TextInput label="Housing Details" name="housingDetails" bind:value={s.housingDetails} placeholder="Living arrangements, who they live with" />

	<SelectInput
		label="Employment Status"
		name="employment"
		options={[
			{ value: 'employed', label: 'Employed' },
			{ value: 'unemployed', label: 'Unemployed' },
			{ value: 'retired', label: 'Retired' },
			{ value: 'student', label: 'Student' },
			{ value: 'disability', label: 'On disability' }
		]}
		bind:value={s.employment}
	/>
	<TextInput label="Employment Details" name="employmentDetails" bind:value={s.employmentDetails} placeholder="Occupation, work-related stressors" />

	<TextArea label="Relationships" name="relationships" bind:value={s.relationships} placeholder="Marital status, children, key relationships, social isolation" />

	<RadioGroup label="Current legal issues?" name="legal" options={yesNo} bind:value={s.legalIssues} />
	{#if s.legalIssues === 'yes'}
		<TextArea label="Legal Details" name="legalDetails" bind:value={s.legalDetails} placeholder="Pending charges, probation, forensic history" />
	{/if}

	<RadioGroup label="Financial difficulties?" name="financial" options={yesNo} bind:value={s.financialDifficulties} />

	<TextArea label="Support Network" name="supportNetwork" bind:value={s.supportNetwork} placeholder="Family, friends, community groups, professional support" />
</SectionCard>
