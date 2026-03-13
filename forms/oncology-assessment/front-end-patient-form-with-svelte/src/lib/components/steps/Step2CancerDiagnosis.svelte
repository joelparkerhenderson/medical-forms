<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const c = assessment.data.cancerDiagnosis;
</script>

<SectionCard title="Cancer Diagnosis" description="Cancer type, staging, and diagnosis details">
	<SelectInput
		label="Cancer Type"
		name="cancerType"
		options={[
			{ value: 'breast', label: 'Breast' },
			{ value: 'lung', label: 'Lung' },
			{ value: 'colorectal', label: 'Colorectal' },
			{ value: 'prostate', label: 'Prostate' },
			{ value: 'melanoma', label: 'Melanoma' },
			{ value: 'lymphoma', label: 'Lymphoma' },
			{ value: 'leukaemia', label: 'Leukaemia' },
			{ value: 'pancreatic', label: 'Pancreatic' },
			{ value: 'ovarian', label: 'Ovarian' },
			{ value: 'bladder', label: 'Bladder' },
			{ value: 'renal', label: 'Renal' },
			{ value: 'hepatocellular', label: 'Hepatocellular' },
			{ value: 'gastric', label: 'Gastric' },
			{ value: 'oesophageal', label: 'Oesophageal' },
			{ value: 'head-and-neck', label: 'Head and Neck' },
			{ value: 'brain', label: 'Brain' },
			{ value: 'sarcoma', label: 'Sarcoma' },
			{ value: 'thyroid', label: 'Thyroid' },
			{ value: 'cervical', label: 'Cervical' },
			{ value: 'endometrial', label: 'Endometrial' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={c.cancerType}
		required
	/>

	{#if c.cancerType === 'other'}
		<TextInput label="Specify Cancer Type" name="cancerTypeOther" bind:value={c.cancerTypeOther} required />
	{/if}

	<TextInput label="Primary Site" name="primarySite" bind:value={c.primarySite} placeholder="e.g., Left breast, Right upper lobe" />
	<TextInput label="Histology" name="histology" bind:value={c.histology} placeholder="e.g., Invasive ductal carcinoma, Adenocarcinoma" />

	<h3 class="mt-4 mb-2 text-sm font-semibold text-gray-700">TNM Staging</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
		<SelectInput
			label="T Stage (Tumour)"
			name="stageT"
			options={[
				{ value: '0', label: 'T0' },
				{ value: '1', label: 'T1' },
				{ value: '2', label: 'T2' },
				{ value: '3', label: 'T3' },
				{ value: '4', label: 'T4' },
				{ value: 'X', label: 'TX' }
			]}
			bind:value={c.stageT}
		/>
		<SelectInput
			label="N Stage (Nodes)"
			name="stageN"
			options={[
				{ value: '0', label: 'N0' },
				{ value: '1', label: 'N1' },
				{ value: '2', label: 'N2' },
				{ value: '3', label: 'N3' },
				{ value: 'X', label: 'NX' }
			]}
			bind:value={c.stageN}
		/>
		<SelectInput
			label="M Stage (Metastasis)"
			name="stageM"
			options={[
				{ value: '0', label: 'M0' },
				{ value: '1', label: 'M1' },
				{ value: 'X', label: 'MX' }
			]}
			bind:value={c.stageM}
		/>
	</div>

	<SelectInput
		label="Overall Stage"
		name="overallStage"
		options={[
			{ value: 'I', label: 'Stage I' },
			{ value: 'II', label: 'Stage II' },
			{ value: 'III', label: 'Stage III' },
			{ value: 'IV', label: 'Stage IV' }
		]}
		bind:value={c.overallStage}
		required
	/>

	<SelectInput
		label="Tumour Grade"
		name="grade"
		options={[
			{ value: '1', label: 'Grade 1 - Well differentiated' },
			{ value: '2', label: 'Grade 2 - Moderately differentiated' },
			{ value: '3', label: 'Grade 3 - Poorly differentiated' },
			{ value: '4', label: 'Grade 4 - Undifferentiated' },
			{ value: 'X', label: 'GX - Grade cannot be assessed' }
		]}
		bind:value={c.grade}
	/>

	<TextInput label="Date of Diagnosis" name="diagnosisDate" type="date" bind:value={c.dateOfDiagnosis} required />
</SectionCard>
