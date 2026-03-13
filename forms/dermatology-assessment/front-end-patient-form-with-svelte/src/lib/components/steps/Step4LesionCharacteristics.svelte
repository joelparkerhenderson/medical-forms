<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const l = assessment.data.lesionCharacteristics;
</script>

<SectionCard title="Lesion Characteristics" description="Describe the appearance of the skin lesion(s)">
	<SelectInput
		label="Lesion Type"
		name="lesionType"
		options={[
			{ value: 'macule', label: 'Macule (flat, discoloured spot)' },
			{ value: 'papule', label: 'Papule (small raised bump)' },
			{ value: 'patch', label: 'Patch (large flat area)' },
			{ value: 'plaque', label: 'Plaque (raised, flat-topped)' },
			{ value: 'nodule', label: 'Nodule (firm, deep bump)' },
			{ value: 'vesicle', label: 'Vesicle (small fluid-filled blister)' },
			{ value: 'bulla', label: 'Bulla (large fluid-filled blister)' },
			{ value: 'pustule', label: 'Pustule (pus-filled bump)' },
			{ value: 'wheal', label: 'Wheal (hive, raised itchy area)' },
			{ value: 'erosion', label: 'Erosion (superficial skin loss)' },
			{ value: 'ulcer', label: 'Ulcer (deep skin loss)' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={l.type}
		required
	/>

	<SelectInput
		label="Lesion Colour"
		name="lesionColor"
		options={[
			{ value: 'erythematous', label: 'Erythematous (red)' },
			{ value: 'hyperpigmented', label: 'Hyperpigmented (darker than surrounding skin)' },
			{ value: 'hypopigmented', label: 'Hypopigmented (lighter than surrounding skin)' },
			{ value: 'violaceous', label: 'Violaceous (purple/violet)' },
			{ value: 'flesh-colored', label: 'Flesh-coloured' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={l.color}
		required
	/>

	<SelectInput
		label="Border"
		name="lesionBorder"
		options={[
			{ value: 'well-defined', label: 'Well-defined' },
			{ value: 'poorly-defined', label: 'Poorly defined' },
			{ value: 'irregular', label: 'Irregular' },
			{ value: 'raised', label: 'Raised' }
		]}
		bind:value={l.border}
		required
	/>

	<NumberInput
		label="Size"
		name="lesionSize"
		bind:value={l.sizeMillimeters}
		unit="mm"
		min={0}
		max={500}
		step={0.5}
	/>

	<SelectInput
		label="Distribution"
		name="lesionDistribution"
		options={[
			{ value: 'localized', label: 'Localised' },
			{ value: 'generalized', label: 'Generalised' },
			{ value: 'symmetrical', label: 'Symmetrical' },
			{ value: 'asymmetrical', label: 'Asymmetrical' },
			{ value: 'dermatomal', label: 'Dermatomal' },
			{ value: 'sun-exposed', label: 'Sun-exposed areas' }
		]}
		bind:value={l.distribution}
	/>

	<RadioGroup
		label="Number of lesions"
		name="lesionNumber"
		options={[
			{ value: 'single', label: 'Single' },
			{ value: 'few', label: 'Few (2-5)' },
			{ value: 'multiple', label: 'Multiple (6-20)' },
			{ value: 'numerous', label: 'Numerous (>20)' }
		]}
		bind:value={l.number}
	/>

	<SelectInput
		label="Surface"
		name="lesionSurface"
		options={[
			{ value: 'smooth', label: 'Smooth' },
			{ value: 'rough', label: 'Rough' },
			{ value: 'scaly', label: 'Scaly' },
			{ value: 'crusted', label: 'Crusted' },
			{ value: 'verrucous', label: 'Verrucous (wart-like)' },
			{ value: 'ulcerated', label: 'Ulcerated' }
		]}
		bind:value={l.surface}
	/>
</SectionCard>
