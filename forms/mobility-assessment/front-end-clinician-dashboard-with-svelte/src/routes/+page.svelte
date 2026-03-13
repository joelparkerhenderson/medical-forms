<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let tinettiFilter = $state('');
	let fallRiskFilter = $state('');
	let deviceFilter = $state('');
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

	const tinettiOptions = [
		{ value: '', label: 'All Tinetti scores' },
		{ value: '25-28', label: 'Low risk (25-28)' },
		{ value: '19-24', label: 'Moderate risk (19-24)' },
		{ value: '0-18', label: 'High risk (0-18)' },
	];

	const fallRiskOptions = [
		{ value: '', label: 'All fall risks' },
		{ value: 'Low fall risk', label: 'Low fall risk' },
		{ value: 'Moderate fall risk', label: 'Moderate fall risk' },
		{ value: 'High fall risk', label: 'High fall risk' },
	];

	const deviceOptions = [
		{ value: '', label: 'All devices' },
		{ value: 'None', label: 'None' },
		{ value: 'Cane', label: 'Cane' },
		{ value: 'Walker', label: 'Walker' },
		{ value: 'Rollator', label: 'Rollator' },
		{ value: 'Wheelchair', label: 'Wheelchair' },
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
			id: 'tinettiScore',
			header: 'Tinetti Score',
			width: 120,
			sort: true,
			template: (value: number) => `${value}/28`,
		},
		{
			id: 'tugTime',
			header: 'TUG (s)',
			width: 100,
			sort: true,
			template: (value: number) => `${value}s`,
		},
		{
			id: 'fallRisk',
			header: 'Fall Risk',
			width: 160,
			sort: true,
		},
		{
			id: 'assistiveDevice',
			header: 'Assistive Device',
			width: 150,
			sort: true,
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function tinettiInRange(score: number, range: string): boolean {
		switch (range) {
			case '25-28': return score >= 25 && score <= 28;
			case '19-24': return score >= 19 && score <= 24;
			case '0-18': return score >= 0 && score <= 18;
			default: return true;
		}
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
					row.fallRisk.toLowerCase().includes(term) ||
					row.assistiveDevice.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Tinetti score range filter
			if (tinettiFilter && !tinettiInRange(row.tinettiScore, tinettiFilter)) {
				return false;
			}

			// Fall risk filter
			if (fallRiskFilter && row.fallRisk !== fallRiskFilter) {
				return false;
			}

			// Device filter
			if (deviceFilter && row.assistiveDevice !== deviceFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		tinettiFilter = '';
		fallRiskFilter = '';
		deviceFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || tinettiFilter !== '' || fallRiskFilter !== '' || deviceFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Mobility Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with mobility assessment status</p>
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
						placeholder="NHS number, name, or device..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Tinetti Score -->
				<div>
					<label for="tinetti-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Tinetti Score
					</label>
					<select
						id="tinetti-filter"
						bind:value={tinettiFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each tinettiOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Fall Risk -->
				<div>
					<label for="fallrisk-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Fall Risk
					</label>
					<select
						id="fallrisk-filter"
						bind:value={fallRiskFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each fallRiskOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Assistive Device -->
				<div>
					<label for="device-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Device
					</label>
					<select
						id="device-filter"
						bind:value={deviceFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each deviceOptions as opt (opt.value)}
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
