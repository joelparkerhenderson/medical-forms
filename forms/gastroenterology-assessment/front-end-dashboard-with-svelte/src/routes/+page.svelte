<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let severityFilter = $state('');
	let redFlagFilter = $state('');
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
				// Backend unavailable -- use sample data
				loading = false;
			});
	});

	const severityOptions = [
		{ value: '', label: 'All severities' },
		{ value: 'minimal', label: 'Minimal (0-10)' },
		{ value: 'mild', label: 'Mild (11-20)' },
		{ value: 'moderate', label: 'Moderate (21-30)' },
		{ value: 'severe', label: 'Severe (31-40)' },
		{ value: 'very-severe', label: 'Very Severe (41+)' },
	];

	const redFlagOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Has Red Flags' },
		{ value: 'no', label: 'No Red Flags' },
	];

	function getSeverityLevel(score: number): string {
		if (score <= 10) return 'minimal';
		if (score <= 20) return 'mild';
		if (score <= 30) return 'moderate';
		if (score <= 40) return 'severe';
		return 'very-severe';
	}

	function getSeverityLabel(score: number): string {
		if (score <= 10) return 'Minimal';
		if (score <= 20) return 'Mild';
		if (score <= 30) return 'Moderate';
		if (score <= 40) return 'Severe';
		return 'Very Severe';
	}

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
			id: 'severityScore',
			header: 'Severity Score',
			width: 130,
			sort: true,
			template: (value: number) => `${value} (${getSeverityLabel(value)})`,
		},
		{
			id: 'primarySymptom',
			header: 'Primary Symptom',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'redFlagCount',
			header: 'Red Flags',
			width: 110,
			sort: true,
			template: (value: number) => (value > 0 ? `${value} flag${value > 1 ? 's' : ''}` : 'None'),
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
					row.primarySymptom.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Severity filter
			if (severityFilter && getSeverityLevel(row.severityScore) !== severityFilter) {
				return false;
			}

			// Red flag filter
			if (redFlagFilter === 'yes' && row.redFlagCount === 0) return false;
			if (redFlagFilter === 'no' && row.redFlagCount > 0) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		severityFilter = '';
		redFlagFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || severityFilter !== '' || redFlagFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Gastroenterology Assessment -- Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with GI assessment severity status</p>
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
						placeholder="NHS number, name, or symptom..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Severity -->
				<div>
					<label for="severity-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Severity
					</label>
					<select
						id="severity-filter"
						bind:value={severityFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each severityOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Red Flags -->
				<div>
					<label for="redflag-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Red Flags
					</label>
					<select
						id="redflag-filter"
						bind:value={redFlagFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each redFlagOptions as opt (opt.value)}
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
