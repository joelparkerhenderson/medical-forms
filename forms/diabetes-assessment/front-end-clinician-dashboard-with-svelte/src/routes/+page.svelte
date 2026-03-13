<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let controlFilter = $state('');
	let typeFilter = $state('');
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

	const controlOptions = [
		{ value: '', label: 'All Control Levels' },
		{ value: 'wellControlled', label: 'Well Controlled' },
		{ value: 'suboptimal', label: 'Suboptimal' },
		{ value: 'poor', label: 'Poor' },
		{ value: 'veryPoor', label: 'Very Poor' },
	];

	const typeOptions = [
		{ value: '', label: 'All Diabetes Types' },
		{ value: 'type1', label: 'Type 1' },
		{ value: 'type2', label: 'Type 2' },
		{ value: 'gestational', label: 'Gestational' },
		{ value: 'other', label: 'Other' },
	];

	const controlBadgeColors: Record<string, string> = {
		wellControlled: 'background:#dcfce7;color:#166534;',
		suboptimal: 'background:#fef9c3;color:#854d0e;',
		poor: 'background:#fed7aa;color:#9a3412;',
		veryPoor: 'background:#fecaca;color:#991b1b;',
		draft: 'background:#f3f4f6;color:#374151;',
	};

	const controlLabels: Record<string, string> = {
		wellControlled: 'Well Controlled',
		suboptimal: 'Suboptimal',
		poor: 'Poor',
		veryPoor: 'Very Poor',
		draft: 'Draft',
	};

	const typeLabels: Record<string, string> = {
		type1: 'Type 1',
		type2: 'Type 2',
		gestational: 'Gestational',
		other: 'Other',
	};

	const columns = [
		{
			id: 'patientName',
			header: 'Patient Name',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'diabetesType',
			header: 'Diabetes Type',
			width: 130,
			sort: true,
			cell: (value: string) => {
				const label = typeLabels[value] || value || 'Unknown';
				return `<span style="background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:500;">${label}</span>`;
			},
		},
		{
			id: 'hba1c',
			header: 'HbA1c (mmol/mol)',
			width: 150,
			sort: true,
			cell: (value: number) => `${value}`,
		},
		{
			id: 'controlLevel',
			header: 'Control Level',
			width: 150,
			sort: true,
			cell: (value: string) => {
				const style = controlBadgeColors[value] || '';
				const label = controlLabels[value] || value;
				return `<span style="${style}padding:2px 8px;border-radius:9999px;font-size:0.75rem;font-weight:600;">${label}</span>`;
			},
		},
		{
			id: 'complications',
			header: 'Complications',
			width: 120,
			sort: true,
			cell: (value: number) => `${value}`,
		},
		{
			id: 'lastReview',
			header: 'Last Review',
			width: 130,
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
			// Text search across NHS number and patient name
			if (term) {
				const matches =
					row.nhsNumber.toLowerCase().includes(term) ||
					row.patientName.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Control level filter
			if (controlFilter && row.controlLevel !== controlFilter) {
				return false;
			}

			// Diabetes type filter
			if (typeFilter && row.diabetesType !== typeFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		controlFilter = '';
		typeFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || controlFilter !== '' || typeFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Diabetes Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">
				Comprehensive diabetes management assessment overview
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

				<!-- Control Level -->
				<div>
					<label for="control-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Control Level
					</label>
					<select
						id="control-filter"
						bind:value={controlFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each controlOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Diabetes Type -->
				<div>
					<label for="type-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Diabetes Type
					</label>
					<select
						id="type-filter"
						bind:value={typeFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each typeOptions as opt (opt.value)}
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
