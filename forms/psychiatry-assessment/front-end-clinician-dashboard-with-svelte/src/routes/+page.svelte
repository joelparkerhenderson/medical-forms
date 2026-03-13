<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let gafFilter = $state('');
	let riskFilter = $state('');
	let legalFilter = $state('');
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

	const gafOptions = [
		{ value: '', label: 'All GAF scores' },
		{ value: '91-100', label: 'GAF 91-100 (Superior)' },
		{ value: '81-90', label: 'GAF 81-90 (Minimal)' },
		{ value: '71-80', label: 'GAF 71-80 (Transient)' },
		{ value: '61-70', label: 'GAF 61-70 (Mild)' },
		{ value: '51-60', label: 'GAF 51-60 (Moderate)' },
		{ value: '41-50', label: 'GAF 41-50 (Serious)' },
		{ value: '31-40', label: 'GAF 31-40 (Major)' },
		{ value: '1-30', label: 'GAF 1-30 (Severe)' },
	];

	const riskOptions = [
		{ value: '', label: 'All risk levels' },
		{ value: 'none', label: 'None' },
		{ value: 'low', label: 'Low' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'high', label: 'High' },
		{ value: 'imminent', label: 'Imminent' },
	];

	const legalOptions = [
		{ value: '', label: 'All legal statuses' },
		{ value: 'voluntary', label: 'Voluntary' },
		{ value: 'involuntary', label: 'Involuntary' },
	];

	function gafInRange(score: number, range: string): boolean {
		const [min, max] = range.split('-').map(Number);
		return score >= min && score <= max;
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
			id: 'gafScore',
			header: 'GAF Score',
			width: 110,
			sort: true,
		},
		{
			id: 'riskLevel',
			header: 'Risk Level',
			width: 120,
			sort: true,
			template: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
		},
		{
			id: 'legalStatus',
			header: 'Legal Status',
			width: 130,
			sort: true,
			template: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
		},
		{
			id: 'primaryDiagnosis',
			header: 'Primary Diagnosis',
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
					row.primaryDiagnosis.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// GAF score filter
			if (gafFilter && !gafInRange(row.gafScore, gafFilter)) {
				return false;
			}

			// Risk level filter
			if (riskFilter && row.riskLevel !== riskFilter) {
				return false;
			}

			// Legal status filter
			if (legalFilter && row.legalStatus !== legalFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		gafFilter = '';
		riskFilter = '';
		legalFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || gafFilter !== '' || riskFilter !== '' || legalFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Psychiatry Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with psychiatric assessment status</p>
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
						placeholder="NHS number, name, or diagnosis..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- GAF Score -->
				<div>
					<label for="gaf-filter" class="mb-1 block text-sm font-medium text-gray-700">
						GAF Score
					</label>
					<select
						id="gaf-filter"
						bind:value={gafFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each gafOptions as opt (opt.value)}
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

				<!-- Legal Status -->
				<div>
					<label for="legal-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Legal Status
					</label>
					<select
						id="legal-filter"
						bind:value={legalFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each legalOptions as opt (opt.value)}
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
