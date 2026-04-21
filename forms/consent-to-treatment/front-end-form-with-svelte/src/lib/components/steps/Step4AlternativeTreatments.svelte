<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const a = assessment.data.alternativeTreatments;
</script>

<SectionCard title="Alternative Treatments" description="Document alternative options and consequences of no treatment">
	<TextArea
		label="Alternative Treatment Options"
		name="alternativeOptions"
		bind:value={a.alternativeOptions}
		placeholder="Describe alternative treatments available (e.g., conservative management, different surgical approach)..."
		rows={4}
	/>

	<TextArea
		label="Consequences of No Treatment"
		name="noTreatmentConsequences"
		bind:value={a.noTreatmentConsequences}
		placeholder="Describe what may happen if the patient chooses not to proceed with treatment..."
		rows={4}
	/>

	<TextArea
		label="Patient Preference"
		name="patientPreference"
		bind:value={a.patientPreference}
		placeholder="Record the patient's stated preference regarding treatment options..."
		rows={3}
	/>
</SectionCard>
