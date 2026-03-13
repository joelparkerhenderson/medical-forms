<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let ecogFilter = $state('');
	let cancerTypeFilter = $state('');
	let treatmentStatusFilter = $state('');
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

	const ecogOptions = [
		{ value: '', label: 'All ECOG grades' },
		{ value: '0', label: 'ECOG 0' },
		{ value: '1', label: 'ECOG 1' },
		{ value: '2', label: 'ECOG 2' },
		{ value: '3', label: 'ECOG 3' },
		{ value: '4', label: 'ECOG 4' },
	];

	const cancerTypeOptions = [
		{ value: '', label: 'All cancer types' },
		{ value: 'Breast', label: 'Breast' },
		{ value: 'Lung', label: 'Lung' },
		{ value: 'Colorectal', label: 'Colorectal' },
		{ value: 'Prostate', label: 'Prostate' },
		{ value: 'Melanoma', label: 'Melanoma' },
		{ value: 'Lymphoma', label: 'Lymphoma' },
		{ value: 'Pancreatic', label: 'Pancreatic' },
		{ value: 'Ovarian', label: 'Ovarian' },
		{ value: 'Brain', label: 'Brain' },
		{ value: 'Renal', label: 'Renal' },
		{ value: 'Gastric', label: 'Gastric' },
		{ value: 'Thyroid', label: 'Thyroid' },
		{ value: 'Cervical', label: 'Cervical' },
	];

	const treatmentStatusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'On Treatment', label: 'On Treatment' },
		{ value: 'Complete Response', label: 'Complete Response' },
		{ value: 'Partial Response', label: 'Partial Response' },
		{ value: 'Stable Disease', label: 'Stable Disease' },
		{ value: 'Progressive Disease', label: 'Progressive Disease' },
		{ value: 'Palliative Care', label: 'Palliative Care' },
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
			id: 'ecogStatus',
			header: 'ECOG Status',
			width: 120,
			sort: true,
			template: (value: number) => `ECOG ${value}`,
		},
		{
			id: 'cancerType',
			header: 'Cancer Type',
			width: 140,
			sort: true,
		},
		{
			id: 'stage',
			header: 'Stage',
			width: 110,
			sort: true,
		},
		{
			id: 'treatmentStatus',
			header: 'Treatment Status',
			flexgrow: 1,
			sort: true,
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
					row.cancerType.toLowerCase().includes(term) ||
					row.treatmentStatus.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// ECOG filter
			if (ecogFilter && row.ecogStatus !== Number(ecogFilter)) {
				return false;
			}

			// Cancer type filter
			if (cancerTypeFilter && row.cancerType !== cancerTypeFilter) {
				return false;
			}

			// Treatment status filter
			if (treatmentStatusFilter && row.treatmentStatus !== treatmentStatusFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		ecogFilter = '';
		cancerTypeFilter = '';
		treatmentStatusFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || ecogFilter !== '' || cancerTypeFilter !== '' || treatmentStatusFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Oncology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with oncology assessment status</p>
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
						placeholder="NHS number, name, or cancer type..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- ECOG Status -->
				<div>
					<label for="ecog-filter" class="mb-1 block text-sm font-medium text-gray-700">
						ECOG Status
					</label>
					<select
						id="ecog-filter"
						bind:value={ecogFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each ecogOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Cancer Type -->
				<div>
					<label for="cancer-type-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Cancer Type
					</label>
					<select
						id="cancer-type-filter"
						bind:value={cancerTypeFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each cancerTypeOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Treatment Status -->
				<div>
					<label for="treatment-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Treatment Status
					</label>
					<select
						id="treatment-filter"
						bind:value={treatmentStatusFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each treatmentStatusOptions as opt (opt.value)}
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
