<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const ob = assessment.data.obstetricHistory;
</script>

<SectionCard title="Obstetric History" description="Pregnancy and birth history">
	<NumberInput
		label="Gravida (total pregnancies)"
		name="gravida"
		bind:value={ob.gravida}
		min={0}
		max={20}
		step={1}
	/>

	<NumberInput
		label="Para (live births)"
		name="para"
		bind:value={ob.para}
		min={0}
		max={20}
		step={1}
	/>

	<TextArea
		label="Pregnancy/delivery complications"
		name="complications"
		bind:value={ob.complications}
		placeholder="e.g., pre-eclampsia, gestational diabetes, caesarean sections, miscarriages, ectopic pregnancies..."
	/>
</SectionCard>
