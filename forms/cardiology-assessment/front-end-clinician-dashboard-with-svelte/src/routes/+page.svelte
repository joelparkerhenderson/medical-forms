<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let ccsFilter = $state('');
	let nyhaFilter = $state('');
	let riskFilter = $state('');
	let allergyFilter = $state('');
	let anticoagFilter = $state('');
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

	const ccsOptions = [
		{ value: '', label: 'All CCS Classes' },
		{ value: '1', label: 'CCS I' },
		{ value: '2', label: 'CCS II' },
		{ value: '3', label: 'CCS III' },
		{ value: '4', label: 'CCS IV' },
	];

	const nyhaOptions = [
		{ value: '', label: 'All NYHA Classes' },
		{ value: '1', label: 'NYHA I' },
		{ value: '2', label: 'NYHA II' },
		{ value: '3', label: 'NYHA III' },
		{ value: '4', label: 'NYHA IV' },
	];

	const riskOptions = [
		{ value: '', label: 'All Risk Levels' },
		{ value: 'low', label: 'Low' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'high', label: 'High' },
		{ value: 'critical', label: 'Critical' },
	];

	const yesNoOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
	];

	const romanNumerals = ['I', 'II', 'III', 'IV'];

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
			id: 'ccsClass',
			header: 'CCS Class',
			width: 100,
			sort: true,
			template: (value: number | null) => value ? `CCS ${romanNumerals[value - 1]}` : 'N/A',
		},
		{
			id: 'nyhaClass',
			header: 'NYHA Class',
			width: 110,
			sort: true,
			template: (value: number | null) => value ? `NYHA ${romanNumerals[value - 1]}` : 'N/A',
		},
		{
			id: 'riskLevel',
			header: 'Risk Level',
			width: 110,
			sort: true,
			template: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
		},
		{
			id: 'allergyFlag',
			header: 'Allergy',
			width: 90,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
		{
			id: 'anticoagulantFlag',
			header: 'Anticoag.',
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
					row.patientName.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// CCS class filter
			if (ccsFilter && (row.ccsClass === null || row.ccsClass !== Number(ccsFilter))) {
				return false;
			}

			// NYHA class filter
			if (nyhaFilter && (row.nyhaClass === null || row.nyhaClass !== Number(nyhaFilter))) {
				return false;
			}

			// Risk level filter
			if (riskFilter && row.riskLevel !== riskFilter) {
				return false;
			}

			// Allergy filter
			if (allergyFilter === 'yes' && !row.allergyFlag) return false;
			if (allergyFilter === 'no' && row.allergyFlag) return false;

			// Anticoagulant filter
			if (anticoagFilter === 'yes' && !row.anticoagulantFlag) return false;
			if (anticoagFilter === 'no' && row.anticoagulantFlag) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		ccsFilter = '';
		nyhaFilter = '';
		riskFilter = '';
		allergyFilter = '';
		anticoagFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || ccsFilter !== '' || nyhaFilter !== '' || riskFilter !== '' || allergyFilter !== '' || anticoagFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Cardiology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with cardiovascular assessment status</p>
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

				<!-- CCS Class -->
				<div>
					<label for="ccs-filter" class="mb-1 block text-sm font-medium text-gray-700">
						CCS Class
					</label>
					<select
						id="ccs-filter"
						bind:value={ccsFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each ccsOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- NYHA Class -->
				<div>
					<label for="nyha-filter" class="mb-1 block text-sm font-medium text-gray-700">
						NYHA Class
					</label>
					<select
						id="nyha-filter"
						bind:value={nyhaFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each nyhaOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Risk Level -->
				<div>
					<label for="risk-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Risk Level
					</label>
					<select
						id="risk-filter"
						bind:value={riskFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each riskOptions as opt (opt.value)}
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

				<!-- Anticoagulant flag -->
				<div>
					<label for="anticoag-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Anticoag.
					</label>
					<select
						id="anticoag-filter"
						bind:value={anticoagFilter}
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
