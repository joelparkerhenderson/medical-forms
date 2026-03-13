<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const pc = casualtyCard.data.presentingComplaint;
</script>

<SectionCard title="Presenting Complaint" description="Chief complaint and history of presenting illness">
	<TextInput label="Chief Complaint" name="chiefComplaint" bind:value={pc.chiefComplaint} required />
	<TextArea label="History of Presenting Complaint" name="historyOfPresentingComplaint" bind:value={pc.historyOfPresentingComplaint} rows={4} />

	<h3 class="mb-3 mt-4 text-lg font-semibold text-gray-800">Symptom Details</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Onset" name="onset" bind:value={pc.onset} placeholder="When did it start?" />
		<TextInput label="Duration" name="duration" bind:value={pc.duration} />
	</div>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Character" name="character" bind:value={pc.character} placeholder="e.g. sharp, dull, burning" />
		<TextInput label="Severity" name="severity" bind:value={pc.severity} />
	</div>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Location" name="location" bind:value={pc.location} />
		<TextInput label="Radiation" name="radiation" bind:value={pc.radiation} />
	</div>
	<TextArea label="Aggravating Factors" name="aggravatingFactors" bind:value={pc.aggravatingFactors} rows={2} />
	<TextArea label="Relieving Factors" name="relievingFactors" bind:value={pc.relievingFactors} rows={2} />
	<TextArea label="Associated Symptoms" name="associatedSymptoms" bind:value={pc.associatedSymptoms} rows={2} />
	<TextArea label="Previous Episodes" name="previousEpisodes" bind:value={pc.previousEpisodes} rows={2} />
	<TextArea label="Treatment Prior to Arrival" name="treatmentPriorToArrival" bind:value={pc.treatmentPriorToArrival} rows={2} />
</SectionCard>
