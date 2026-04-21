<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.currentContraception;
</script>

<SectionCard title="Current Contraception" description="Your current or most recent method of contraception">
	<SelectInput
		label="Current contraceptive method"
		name="currentMethod"
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
			{ value: 'natural-methods', label: 'Natural family planning / fertility awareness' },
			{ value: 'sterilisation', label: 'Sterilisation' },
			{ value: 'none', label: 'None / not currently using' }
		]}
		bind:value={c.currentMethod}
		required
	/>

	<TextInput
		label="How long have you been using this method?"
		name="durationOfUse"
		bind:value={c.durationOfUse}
		placeholder="e.g., 6 months, 2 years, 5 years"
	/>

	<TextArea
		label="Reason for change or review"
		name="reasonForChange"
		bind:value={c.reasonForChange}
		placeholder="Why are you considering changing or reviewing your contraception?"
	/>

	<TextArea
		label="Side effects experienced"
		name="sideEffects"
		bind:value={c.sideEffects}
		placeholder="List any side effects you have experienced with your current or previous methods..."
	/>
</SectionCard>
