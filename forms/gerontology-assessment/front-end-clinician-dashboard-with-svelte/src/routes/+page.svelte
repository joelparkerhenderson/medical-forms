<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let cfsFilter = $state('');
	let fallsRiskFilter = $state('');
	let cognitiveFilter = $state('');
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

	const cfsOptions = [
		{ value: '', label: 'All CFS scores' },
		{ value: '1', label: 'CFS 1 - Very Fit' },
		{ value: '2', label: 'CFS 2 - Well' },
		{ value: '3', label: 'CFS 3 - Managing Well' },
		{ value: '4', label: 'CFS 4 - Vulnerable' },
		{ value: '5', label: 'CFS 5 - Mildly Frail' },
		{ value: '6', label: 'CFS 6 - Moderately Frail' },
		{ value: '7', label: 'CFS 7 - Severely Frail' },
		{ value: '8', label: 'CFS 8 - Very Severely Frail' },
		{ value: '9', label: 'CFS 9 - Terminally Ill' },
	];

	const fallsRiskOptions = [
		{ value: '', label: 'All' },
		{ value: 'Low', label: 'Low' },
		{ value: 'Medium', label: 'Medium' },
		{ value: 'High', label: 'High' },
	];

	const cognitiveOptions = [
		{ value: '', label: 'All' },
		{ value: 'Normal', label: 'Normal' },
		{ value: 'Mild Impairment', label: 'Mild Impairment' },
		{ value: 'Moderate Impairment', label: 'Moderate Impairment' },
		{ value: 'Severe Impairment', label: 'Severe Impairment' },
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
			id: 'cfsScore',
			header: 'CFS Score',
			width: 110,
			sort: true,
			template: (value: number) => `CFS ${value}`,
		},
		{
			id: 'fallsRisk',
			header: 'Falls Risk',
			width: 120,
			sort: true,
		},
		{
			id: 'cognitiveStatus',
			header: 'Cognitive Status',
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
					row.patientName.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// CFS score filter
			if (cfsFilter && row.cfsScore !== Number(cfsFilter)) {
				return false;
			}

			// Falls risk filter
			if (fallsRiskFilter && row.fallsRisk !== fallsRiskFilter) {
				return false;
			}

			// Cognitive status filter
			if (cognitiveFilter && row.cognitiveStatus !== cognitiveFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		cfsFilter = '';
		fallsRiskFilter = '';
		cognitiveFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || cfsFilter !== '' || fallsRiskFilter !== '' || cognitiveFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Gerontology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with comprehensive geriatric assessment status</p>
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
						placeholder="NHS number or name..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- CFS Score -->
				<div>
					<label for="cfs-filter" class="mb-1 block text-sm font-medium text-gray-700">
						CFS Score
					</label>
					<select
						id="cfs-filter"
						bind:value={cfsFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each cfsOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Falls Risk -->
				<div>
					<label for="falls-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Falls Risk
					</label>
					<select
						id="falls-filter"
						bind:value={fallsRiskFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each fallsRiskOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Cognitive Status -->
				<div>
					<label for="cognitive-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Cognitive Status
					</label>
					<select
						id="cognitive-filter"
						bind:value={cognitiveFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each cognitiveOptions as opt (opt.value)}
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
