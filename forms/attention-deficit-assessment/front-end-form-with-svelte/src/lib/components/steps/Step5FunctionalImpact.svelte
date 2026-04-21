<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const fi = assessment.data.functionalImpact;

	const impactOptions = [
		{ value: 'none', label: 'No impact' },
		{ value: 'mild', label: 'Mild - occasional difficulties' },
		{ value: 'moderate', label: 'Moderate - frequent difficulties' },
		{ value: 'severe', label: 'Severe - significant impairment' }
	];
</script>

<SectionCard title="Functional Impact" description="How do your symptoms affect different areas of your life? ADHD diagnosis requires symptoms to cause significant impairment (DSM-5 criterion D).">
	<SelectInput
		label="Work / Academic performance"
		name="workAcademicImpact"
		options={impactOptions}
		bind:value={fi.workAcademicImpact}
		required
	/>

	<SelectInput
		label="Relationships (family, friends, romantic)"
		name="relationshipImpact"
		options={impactOptions}
		bind:value={fi.relationshipImpact}
		required
	/>

	<SelectInput
		label="Daily living activities (housework, errands, self-care)"
		name="dailyLivingImpact"
		options={impactOptions}
		bind:value={fi.dailyLivingImpact}
		required
	/>

	<SelectInput
		label="Financial management (bills, budgeting, impulse spending)"
		name="financialManagementImpact"
		options={impactOptions}
		bind:value={fi.financialManagementImpact}
		required
	/>

	<SelectInput
		label="Time management (punctuality, deadlines, planning)"
		name="timeManagementImpact"
		options={impactOptions}
		bind:value={fi.timeManagementImpact}
		required
	/>
</SectionCard>
