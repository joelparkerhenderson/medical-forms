<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let activityFilter = $state('');
	let diagnosisFilter = $state('');
	let allergyFilter = $state('');
	let gridApi = $state<any>(null);

	// Load patients from backend API, fall back to sample data
	$effect(() => {
		fetchPatients()
			.then((items) => {
				if (items.length > 0) {
					patients = items;
				}
				loading = false;
			})
			.catch(() => {
				// Backend unavailable — use sample data
				loading = false;
			});
	});

	const activityOptions = [
		{ value: '', label: 'All activity levels' },
		{ value: 'Remission', label: 'Remission' },
		{ value: 'Low', label: 'Low' },
		{ value: 'Moderate', label: 'Moderate' },
		{ value: 'High', label: 'High' },
	];

	const diagnosisOptions = [
		{ value: '', label: 'All diagnoses' },
		{ value: 'Rheumatoid Arthritis', label: 'Rheumatoid Arthritis' },
		{ value: 'Psoriatic Arthritis', label: 'Psoriatic Arthritis' },
		{ value: 'Ankylosing Spondylitis', label: 'Ankylosing Spondylitis' },
		{ value: 'Systemic Lupus', label: 'Systemic Lupus' },
		{ value: 'Gout', label: 'Gout' },
		{ value: 'Osteoarthritis', label: 'Osteoarthritis' },
	];

	const yesNoOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
	];

	const columns = [
		{
			id: 'nhsNumber',
			header: 'NHS Number',
			width: 140,
			sort: true,
		},
		{
			id: 'patientName',
			header: 'Patient Name',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'das28Score',
			header: 'DAS28 Score',
			width: 120,
			sort: true,
			template: (value: number | null) => value !== null ? value.toFixed(2) : 'N/A',
		},
		{
			id: 'diseaseActivity',
			header: 'Disease Activity',
			width: 140,
			sort: true,
		},
		{
			id: 'primaryDiagnosis',
			header: 'Primary Diagnosis',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'currentTreatment',
			header: 'Treatment',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'allergyFlag',
			header: 'Allergy',
			width: 100,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function applyFilters() {
		if (!gridApi) return;

		const term = searchTerm.toLowerCase();

		const filter = (row: PatientRow) => {
			// Text search across key fields
			if (term) {
				const matches =
					row.nhsNumber.toLowerCase().includes(term) ||
					row.patientName.toLowerCase().includes(term) ||
					row.primaryDiagnosis.toLowerCase().includes(term) ||
					row.currentTreatment.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Disease activity filter
			if (activityFilter && row.diseaseActivity !== activityFilter) {
				return false;
			}

			// Diagnosis filter
			if (diagnosisFilter && row.primaryDiagnosis !== diagnosisFilter) {
				return false;
			}

			// Allergy filter
			if (allergyFilter === 'yes' && !row.allergyFlag) return false;
			if (allergyFilter === 'no' && row.allergyFlag) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		activityFilter = '';
		diagnosisFilter = '';
		allergyFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || activityFilter !== '' || diagnosisFilter !== '' || allergyFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Rheumatology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with rheumatology assessment status and DAS28 scores</p>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
		<!-- Filters bar -->
		<div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
			<div class="flex flex-wrap items-end gap-4">
				<!-- Search -->
				<div class="min-w-[240px] flex-1">
					<label for="search" class="mb-1 block text-sm font-medium text-gray-700">
						Search
					</label>
					<input
						id="search"
						type="text"
						placeholder="NHS number, name, diagnosis, or treatment..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Disease Activity -->
				<div>
					<label for="activity-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Disease Activity
					</label>
					<select
						id="activity-filter"
						bind:value={activityFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each activityOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Primary Diagnosis -->
				<div>
					<label for="diagnosis-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Diagnosis
					</label>
					<select
						id="diagnosis-filter"
						bind:value={diagnosisFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each diagnosisOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Allergy flag -->
				<div>
					<label for="allergy-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Allergy
					</label>
					<select
						id="allergy-filter"
						bind:value={allergyFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each yesNoOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Clear filters -->
				{#if hasActiveFilters}
					<button
						onclick={clearFilters}
						class="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
					>
						Clear filters
					</button>
				{/if}
			</div>
		</div>

		<!-- Data grid -->
		<div class="rounded-lg bg-white shadow-sm" style="height: 600px;">
			{#if loading}
				<div class="flex h-full items-center justify-center text-muted">
					Loading patients...
				</div>
			{:else}
				<Willow>
					<Grid data={patients} {columns} {init} />
				</Willow>
			{/if}
		</div>

		<!-- Summary -->
		<div class="mt-4 flex items-center gap-4 text-sm text-muted">
			<span>{patients.length} patients total</span>
			{#if error}
				<span class="text-warning">{error}</span>
			{/if}
		</div>
	</main>
</div>
