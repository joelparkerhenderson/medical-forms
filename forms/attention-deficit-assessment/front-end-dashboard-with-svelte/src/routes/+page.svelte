<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let classificationFilter = $state('');
	let subtypeFilter = $state('');
	let comorbidityFilter = $state('');
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

	const classificationOptions = [
		{ value: '', label: 'All classifications' },
		{ value: 'unlikely', label: 'Unlikely' },
		{ value: 'possible', label: 'Possible' },
		{ value: 'likely', label: 'Likely' },
		{ value: 'highly-likely', label: 'Highly Likely' },
	];

	const subtypeOptions = [
		{ value: '', label: 'All subtypes' },
		{ value: 'inattentive', label: 'Inattentive' },
		{ value: 'hyperactive-impulsive', label: 'Hyperactive-Impulsive' },
		{ value: 'combined', label: 'Combined' },
		{ value: 'unspecified', label: 'Unspecified' },
	];

	const comorbidityOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Has comorbidities' },
		{ value: 'no', label: 'No comorbidities' },
	];

	const classificationLabel: Record<string, string> = {
		'unlikely': 'Unlikely',
		'possible': 'Possible',
		'likely': 'Likely',
		'highly-likely': 'Highly Likely',
	};

	const subtypeLabel: Record<string, string> = {
		'inattentive': 'Inattentive',
		'hyperactive-impulsive': 'Hyperactive-Impulsive',
		'combined': 'Combined',
		'unspecified': 'Unspecified',
	};

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
			id: 'asrsScore',
			header: 'ASRS Score',
			width: 110,
			sort: true,
			template: (value: number) => `${value}/72`,
		},
		{
			id: 'classification',
			header: 'Classification',
			width: 130,
			sort: true,
			template: (value: string) => classificationLabel[value] || value,
		},
		{
			id: 'subtype',
			header: 'Subtype',
			width: 160,
			sort: true,
			template: (value: string) => subtypeLabel[value] || value,
		},
		{
			id: 'comorbidities',
			header: 'Comorbidities',
			flexgrow: 1,
			sort: true,
			template: (value: string) => value || 'None',
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
					row.comorbidities.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Classification filter
			if (classificationFilter && row.classification !== classificationFilter) {
				return false;
			}

			// Subtype filter
			if (subtypeFilter && row.subtype !== subtypeFilter) {
				return false;
			}

			// Comorbidity filter
			if (comorbidityFilter === 'yes' && (!row.comorbidities || row.comorbidities === 'None')) return false;
			if (comorbidityFilter === 'no' && row.comorbidities && row.comorbidities !== 'None') return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		classificationFilter = '';
		subtypeFilter = '';
		comorbidityFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || classificationFilter !== '' || subtypeFilter !== '' || comorbidityFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">ADHD Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with ASRS scores and ADHD assessment status</p>
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
						placeholder="NHS number, name, or comorbidity..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Classification -->
				<div>
					<label for="classification-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Classification
					</label>
					<select
						id="classification-filter"
						bind:value={classificationFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each classificationOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Subtype -->
				<div>
					<label for="subtype-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Subtype
					</label>
					<select
						id="subtype-filter"
						bind:value={subtypeFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each subtypeOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Comorbidities -->
				<div>
					<label for="comorbidity-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Comorbidities
					</label>
					<select
						id="comorbidity-filter"
						bind:value={comorbidityFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each comorbidityOptions as opt (opt.value)}
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
