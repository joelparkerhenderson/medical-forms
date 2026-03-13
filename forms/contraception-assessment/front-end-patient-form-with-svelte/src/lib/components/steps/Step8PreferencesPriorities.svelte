<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const p = assessment.data.preferencesPriorities;

	const priorityOptions = [
		{ value: 'low', label: 'Low priority' },
		{ value: 'moderate', label: 'Moderate priority' },
		{ value: 'high', label: 'High priority' },
		{ value: 'very-high', label: 'Very high priority' }
	];
</script>

<SectionCard title="Preferences & Priorities" description="Your preferences for contraceptive method selection">
	<SelectInput
		label="Preferred contraceptive method"
		name="preferredMethod"
		options={[
			{ value: 'combined-oral', label: 'Combined oral contraceptive (COC)' },
			{ value: 'progestogen-only-pill', label: 'Progestogen-only pill (POP)' },
			{ value: 'injectable', label: 'Injectable (e.g., Depo-Provera)' },
			{ value: 'implant', label: 'Subdermal implant (e.g., Nexplanon)' },
			{ value: 'copper-iud', label: 'Copper IUD (non-hormonal coil)' },
			{ value: 'lng-ius', label: 'LNG-IUS (hormonal coil, e.g., Mirena)' },
			{ value: 'patch', label: 'Contraceptive patch' },
			{ value: 'vaginal-ring', label: 'Vaginal ring (e.g., NuvaRing)' },
			{ value: 'barrier', label: 'Barrier method (condoms, diaphragm)' },
			{ value: 'natural-methods', label: 'Natural family planning' },
			{ value: 'sterilisation', label: 'Sterilisation' }
		]}
		bind:value={p.preferredMethod}
	/>

	<SelectInput
		label="How important is contraceptive efficacy?"
		name="efficacyPriority"
		options={priorityOptions}
		bind:value={p.efficacyPriority}
	/>

	<SelectInput
		label="How important is convenience (e.g., not needing daily action)?"
		name="conveniencePriority"
		options={priorityOptions}
		bind:value={p.conveniencePriority}
	/>

	<SelectInput
		label="How important is period control (lighter/no periods)?"
		name="periodControlPriority"
		options={priorityOptions}
		bind:value={p.periodControlPriority}
	/>

	<SelectInput
		label="How important is rapid return of fertility after stopping?"
		name="fertilityReturnPriority"
		options={priorityOptions}
		bind:value={p.fertilityReturnPriority}
	/>

	<RadioGroup
		label="Hormone-free preference"
		name="hormoneFreePreference"
		options={[
			{ value: 'no-preference', label: 'No preference' },
			{ value: 'prefer-hormone-free', label: 'Prefer hormone-free' },
			{ value: 'prefer-hormonal', label: 'Prefer hormonal' }
		]}
		bind:value={p.hormoneFreePreference}
	/>
</SectionCard>
