<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const m = assessment.data.medicalHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical History" description="Conditions relevant to contraceptive eligibility (UKMEC criteria)">
	<RadioGroup label="Do you have hypertension (high blood pressure)?" name="hypertension" options={yesNo} bind:value={m.hypertension} />

	<RadioGroup label="Do you experience migraines with aura?" name="migraineWithAura" options={yesNo} bind:value={m.migraineWithAura} />

	<RadioGroup label="Do you have a history of DVT (deep vein thrombosis) or VTE?" name="dvtHistory" options={yesNo} bind:value={m.dvtHistory} />

	<RadioGroup label="Do you have current or recent breast cancer?" name="breastCancer" options={yesNo} bind:value={m.breastCancer} />

	<RadioGroup label="Do you have active liver disease?" name="liverDisease" options={yesNo} bind:value={m.liverDisease} />

	<RadioGroup label="Do you have diabetes?" name="diabetes" options={yesNo} bind:value={m.diabetes} />

	<RadioGroup label="Do you have epilepsy?" name="epilepsy" options={yesNo} bind:value={m.epilepsy} />

	<RadioGroup label="Are you HIV positive?" name="hiv" options={yesNo} bind:value={m.hiv} />

	<RadioGroup label="Do you have a history of sexually transmitted infections?" name="stiHistory" options={yesNo} bind:value={m.stiHistory} />
</SectionCard>
