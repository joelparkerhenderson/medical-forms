<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api';
	import { patients as samplePatients } from '$lib/data';
	import type { PatientRow } from '$lib/types';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let riskFilter = $state('');
	let diabetesFilter = $state('');
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

	const riskOptions = [
		{ value: '', label: 'All Risk Categories' },
		{ value: 'low', label: 'Low' },
		{ value: 'borderline', label: 'Borderline' },
		{ value: 'intermediate', label: 'Intermediate' },
		{ value: 'high', label: 'High' },
	];

	const diabetesOptions = [
		{ value: '', label: 'Diabetes Status' },
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
	];

	function capitalize(s: string) {
		return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
	}

	// Format data for display in the grid
	let gridData = $derived(
		patients.map((p) => ({
			...p,
			riskCategory: capitalize(p.riskCategory),
			tenYearRisk: `${p.tenYearRisk}%`,
			diabetes: p.diabetes ? 'Yes' : 'No',
		}))
	);

	const columns: any[] = [
		{ id: 'nhsNumber', header: 'NHS Number', width: 140, sort: true },
		{ id: 'patientName', header: 'Patient Name', flexgrow: 1, sort: true },
		{ id: 'riskCategory', header: 'Risk Category', width: 140, sort: true },
		{ id: 'tenYearRisk', header: '10-Year Risk', width: 120, sort: true },
		{ id: 'diabetes', header: 'Diabetes', width: 100, sort: true },
		{ id: 'egfr', header: 'eGFR', width: 90, sort: true },
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function applyFilters() {
		if (!gridApi) return;

		const term = searchTerm.toLowerCase();
		const riskVal = riskFilter ? capitalize(riskFilter) : '';

		const filter = (row: any) => {
			if (term) {
				const matches =
					row.nhsNumber.toLowerCase().includes(term) ||
					row.patientName.toLowerCase().includes(term);
				if (!matches) return false;
			}
			if (riskVal && row.riskCategory !== riskVal) return false;
			if (diabetesFilter === 'yes' && row.diabetes !== 'Yes') return false;
			if (diabetesFilter === 'no' && row.diabetes !== 'No') return false;
			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		riskFilter = '';
		diabetesFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || riskFilter !== '' || diabetesFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">PREVENT CVD Risk — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">
				10- and 30-year cardiovascular disease risk assessment overview
			</p>
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

				<!-- Risk Category -->
				<div>
					<label for="risk-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Risk Category
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

				<!-- Diabetes Status -->
				<div>
					<label for="diabetes-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Diabetes
					</label>
					<select
						id="diabetes-filter"
						bind:value={diabetesFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each diabetesOptions as opt (opt.value)}
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
					<Grid data={gridData} {columns} {init} />
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
