<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const t = assessment.data.currentTreatment;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Treatment" description="Indicate which treatments you are currently receiving for MCAS">
	<RadioGroup
		label="Are you taking antihistamines (H1 and/or H2 blockers)?"
		name="antihistamines"
		options={yesNo}
		bind:value={t.antihistamines}
	/>

	<RadioGroup
		label="Are you taking mast cell stabilizers (e.g., cromolyn sodium, ketotifen)?"
		name="mastCellStabilizers"
		options={yesNo}
		bind:value={t.mastCellStabilizers}
	/>

	<RadioGroup
		label="Are you taking leukotriene inhibitors (e.g., montelukast, zafirlukast)?"
		name="leukotrienInhibitors"
		options={yesNo}
		bind:value={t.leukotrienInhibitors}
	/>

	<RadioGroup
		label="Do you have an epinephrine auto-injector (e.g., EpiPen) prescribed?"
		name="epinephrine"
		options={yesNo}
		bind:value={t.epinephrine}
	/>
</SectionCard>
