<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let devScreenFilter = $state('');
	let growthFilter = $state('');
	let immunizationFilter = $state('');
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

	const devScreenOptions = [
		{ value: '', label: 'All Results' },
		{ value: 'normal', label: 'Normal' },
		{ value: 'developmental-concern', label: 'Developmental Concern' },
		{ value: 'developmental-delay', label: 'Developmental Delay' },
	];

	const growthOptions = [
		{ value: '', label: 'All' },
		{ value: 'normal', label: 'Normal' },
		{ value: 'concern', label: 'Concern' },
	];

	const immunizationOptions = [
		{ value: '', label: 'All' },
		{ value: 'up-to-date', label: 'Up to date' },
		{ value: 'missing', label: 'Missing' },
	];

	function devScreenLabel(result: string): string {
		switch (result) {
			case 'normal':
				return 'Normal';
			case 'developmental-concern':
				return 'Concern';
			case 'developmental-delay':
				return 'Delay';
			default:
				return result;
		}
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
			id: 'devScreenResult',
			header: 'Dev Screen Result',
			width: 150,
			sort: true,
			template: (value: string) => devScreenLabel(value),
		},
		{
			id: 'age',
			header: 'Age',
			width: 110,
			sort: true,
		},
		{
			id: 'growthStatus',
			header: 'Growth Status',
			width: 160,
			sort: true,
		},
		{
			id: 'immunizationStatus',
			header: 'Immunization Status',
			width: 160,
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
					row.age.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Dev screen result filter
			if (devScreenFilter && row.devScreenResult !== devScreenFilter) {
				return false;
			}

			// Growth filter
			if (growthFilter === 'normal' && row.growthStatus !== 'Normal') return false;
			if (growthFilter === 'concern' && row.growthStatus === 'Normal') return false;

			// Immunization filter
			if (immunizationFilter === 'up-to-date' && row.immunizationStatus !== 'Up to date') return false;
			if (immunizationFilter === 'missing' && row.immunizationStatus === 'Up to date') return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		devScreenFilter = '';
		growthFilter = '';
		immunizationFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || devScreenFilter !== '' || growthFilter !== '' || immunizationFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Pediatric Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with developmental screening results</p>
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
						placeholder="NHS number, name, or age..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Dev Screen Result -->
				<div>
					<label for="dev-screen-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Dev Screen Result
					</label>
					<select
						id="dev-screen-filter"
						bind:value={devScreenFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each devScreenOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Growth Status -->
				<div>
					<label for="growth-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Growth Status
					</label>
					<select
						id="growth-filter"
						bind:value={growthFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each growthOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Immunization Status -->
				<div>
					<label for="immunization-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Immunization
					</label>
					<select
						id="immunization-filter"
						bind:value={immunizationFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each immunizationOptions as opt (opt.value)}
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
