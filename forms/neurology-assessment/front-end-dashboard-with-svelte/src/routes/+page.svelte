<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let nihssFilter = $state('');
	let strokeRiskFilter = $state('');
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

	const nihssOptions = [
		{ value: '', label: 'All NIHSS scores' },
		{ value: 'none', label: '0 - No symptoms' },
		{ value: 'minor', label: '1-4 - Minor' },
		{ value: 'moderate', label: '5-15 - Moderate' },
		{ value: 'moderate-severe', label: '16-20 - Moderate to severe' },
		{ value: 'severe', label: '21-42 - Severe' },
	];

	const strokeRiskOptions = [
		{ value: '', label: 'All risk levels' },
		{ value: 'Low', label: 'Low' },
		{ value: 'Medium', label: 'Medium' },
		{ value: 'High', label: 'High' },
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
			id: 'nihssScore',
			header: 'NIHSS Score',
			width: 120,
			sort: true,
			template: (value: number) => {
				if (value === 0) return '0 (None)';
				if (value <= 4) return `${value} (Minor)`;
				if (value <= 15) return `${value} (Moderate)`;
				if (value <= 20) return `${value} (Mod-Severe)`;
				return `${value} (Severe)`;
			},
		},
		{
			id: 'primaryCondition',
			header: 'Primary Condition',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'strokeRisk',
			header: 'Stroke Risk',
			width: 120,
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
					row.primaryCondition.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// NIHSS score range filter
			if (nihssFilter) {
				switch (nihssFilter) {
					case 'none':
						if (row.nihssScore !== 0) return false;
						break;
					case 'minor':
						if (row.nihssScore < 1 || row.nihssScore > 4) return false;
						break;
					case 'moderate':
						if (row.nihssScore < 5 || row.nihssScore > 15) return false;
						break;
					case 'moderate-severe':
						if (row.nihssScore < 16 || row.nihssScore > 20) return false;
						break;
					case 'severe':
						if (row.nihssScore < 21) return false;
						break;
				}
			}

			// Stroke risk filter
			if (strokeRiskFilter && row.strokeRisk !== strokeRiskFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		nihssFilter = '';
		strokeRiskFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || nihssFilter !== '' || strokeRiskFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Neurology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with neurological assessment status</p>
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
						placeholder="NHS number, name, or condition..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- NIHSS Score -->
				<div>
					<label for="nihss-filter" class="mb-1 block text-sm font-medium text-gray-700">
						NIHSS Score
					</label>
					<select
						id="nihss-filter"
						bind:value={nihssFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each nihssOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Stroke Risk -->
				<div>
					<label for="stroke-risk-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Stroke Risk
					</label>
					<select
						id="stroke-risk-filter"
						bind:value={strokeRiskFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each strokeRiskOptions as opt (opt.value)}
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
