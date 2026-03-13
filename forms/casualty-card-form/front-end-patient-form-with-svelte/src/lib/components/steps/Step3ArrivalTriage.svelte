<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const t = casualtyCard.data.arrivalTriage;
</script>

<SectionCard title="Arrival & Triage" description="Attendance details and Manchester Triage System assessment">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Attendance Date" name="attendanceDate" bind:value={t.attendanceDate} type="date" />
		<TextInput label="Arrival Time" name="arrivalTime" bind:value={t.arrivalTime} type="time" />
	</div>
	<RadioGroup
		label="Attendance Category"
		name="attendanceCategory"
		bind:value={t.attendanceCategory}
		options={[
			{ value: 'first', label: 'First' },
			{ value: 'follow-up', label: 'Follow-up' },
			{ value: 'planned', label: 'Planned' },
			{ value: 'unplanned', label: 'Unplanned' }
		]}
	/>
	<SelectInput
		label="Arrival Mode"
		name="arrivalMode"
		bind:value={t.arrivalMode}
		options={[
			{ value: 'ambulance', label: 'Ambulance' },
			{ value: 'walk-in', label: 'Walk-in' },
			{ value: 'helicopter', label: 'Helicopter' },
			{ value: 'police', label: 'Police' },
			{ value: 'other', label: 'Other' }
		]}
	/>
	<SelectInput
		label="Referral Source"
		name="referralSource"
		bind:value={t.referralSource}
		options={[
			{ value: 'self', label: 'Self-referral' },
			{ value: 'gp', label: 'GP' },
			{ value: '999', label: '999' },
			{ value: 'nhs111', label: 'NHS 111' },
			{ value: 'other-hospital', label: 'Other Hospital' },
			{ value: 'police', label: 'Police' },
			{ value: 'other', label: 'Other' }
		]}
	/>
	{#if t.arrivalMode === 'ambulance'}
		<TextInput label="Ambulance Incident Number" name="ambulanceIncidentNumber" bind:value={t.ambulanceIncidentNumber} />
	{/if}

	<hr class="my-6 border-gray-200" />

	<h3 class="mb-3 text-lg font-semibold text-gray-800">Triage</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Triage Time" name="triageTime" bind:value={t.triageTime} type="time" />
		<TextInput label="Triage Nurse" name="triageNurse" bind:value={t.triageNurse} />
	</div>
	<SelectInput
		label="MTS Flowchart"
		name="mtsFlowchart"
		bind:value={t.mtsFlowchart}
		options={[
			{ value: 'abdominal-pain', label: 'Abdominal Pain' },
			{ value: 'allergy', label: 'Allergy' },
			{ value: 'asthma', label: 'Asthma' },
			{ value: 'back-pain', label: 'Back Pain' },
			{ value: 'breathing-difficulty', label: 'Breathing Difficulty' },
			{ value: 'burns-scalds', label: 'Burns & Scalds' },
			{ value: 'chest-pain', label: 'Chest Pain' },
			{ value: 'collapse', label: 'Collapse' },
			{ value: 'dental-problems', label: 'Dental Problems' },
			{ value: 'diarrhoea-vomiting', label: 'Diarrhoea & Vomiting' },
			{ value: 'ear-problems', label: 'Ear Problems' },
			{ value: 'eye-problems', label: 'Eye Problems' },
			{ value: 'falls', label: 'Falls' },
			{ value: 'head-injury', label: 'Head Injury' },
			{ value: 'headache', label: 'Headache' },
			{ value: 'limb-problems', label: 'Limb Problems' },
			{ value: 'major-trauma', label: 'Major Trauma' },
			{ value: 'mental-health', label: 'Mental Health' },
			{ value: 'neck-pain', label: 'Neck Pain' },
			{ value: 'overdose-poisoning', label: 'Overdose & Poisoning' },
			{ value: 'palpitations', label: 'Palpitations' },
			{ value: 'rashes', label: 'Rashes' },
			{ value: 'self-harm', label: 'Self-Harm' },
			{ value: 'shortness-of-breath', label: 'Shortness of Breath' },
			{ value: 'sore-throat', label: 'Sore Throat' },
			{ value: 'unwell-adult', label: 'Unwell Adult' },
			{ value: 'unwell-child', label: 'Unwell Child' },
			{ value: 'urinary-problems', label: 'Urinary Problems' },
			{ value: 'wound', label: 'Wound' },
			{ value: 'other', label: 'Other' }
		]}
	/>
	<SelectInput
		label="MTS Category"
		name="mtsCategory"
		bind:value={t.mtsCategory}
		options={[
			{ value: '1-immediate', label: '1 - Immediate (Red)' },
			{ value: '2-very-urgent', label: '2 - Very Urgent (Orange)' },
			{ value: '3-urgent', label: '3 - Urgent (Yellow)' },
			{ value: '4-standard', label: '4 - Standard (Green)' },
			{ value: '5-non-urgent', label: '5 - Non-Urgent (Blue)' }
		]}
	/>
	<TextInput label="MTS Discriminator" name="mtsDiscriminator" bind:value={t.mtsDiscriminator} />
</SectionCard>
