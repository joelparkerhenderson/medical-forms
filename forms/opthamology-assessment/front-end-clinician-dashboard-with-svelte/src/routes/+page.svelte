<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let vaGradeFilter = $state('');
	let affectedEyeFilter = $state('');
	let iopFilter = $state('');
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

	const vaGradeOptions = [
		{ value: '', label: 'All VA grades' },
		{ value: 'normal', label: 'Normal' },
		{ value: 'mild', label: 'Mild Impairment' },
		{ value: 'moderate', label: 'Moderate Impairment' },
		{ value: 'severe', label: 'Severe Impairment' },
		{ value: 'blindness', label: 'Blindness' },
	];

	const affectedEyeOptions = [
		{ value: '', label: 'All eyes' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'both', label: 'Both' },
	];

	const iopOptions = [
		{ value: '', label: 'All IOP' },
		{ value: 'Normal', label: 'Normal' },
		{ value: 'Raised', label: 'Raised' },
		{ value: 'Significantly raised', label: 'Significantly raised' },
	];

	const vaGradeDisplayMap: Record<string, string> = {
		normal: 'Normal',
		mild: 'Mild',
		moderate: 'Moderate',
		severe: 'Severe',
		blindness: 'Blindness',
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
			id: 'vaGrade',
			header: 'VA Grade',
			width: 130,
			sort: true,
			template: (value: string) => vaGradeDisplayMap[value] || value,
		},
		{
			id: 'affectedEye',
			header: 'Affected Eye',
			width: 120,
			sort: true,
			template: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
		},
		{
			id: 'primaryCondition',
			header: 'Primary Condition',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'iopStatus',
			header: 'IOP Status',
			width: 150,
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

			// VA grade filter
			if (vaGradeFilter && row.vaGrade !== vaGradeFilter) {
				return false;
			}

			// Affected eye filter
			if (affectedEyeFilter && row.affectedEye !== affectedEyeFilter) {
				return false;
			}

			// IOP status filter
			if (iopFilter && row.iopStatus !== iopFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		vaGradeFilter = '';
		affectedEyeFilter = '';
		iopFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || vaGradeFilter !== '' || affectedEyeFilter !== '' || iopFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Ophthalmology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with ophthalmology assessment status</p>
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

				<!-- VA Grade -->
				<div>
					<label for="va-filter" class="mb-1 block text-sm font-medium text-gray-700">
						VA Grade
					</label>
					<select
						id="va-filter"
						bind:value={vaGradeFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each vaGradeOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Affected Eye -->
				<div>
					<label for="eye-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Affected Eye
					</label>
					<select
						id="eye-filter"
						bind:value={affectedEyeFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each affectedEyeOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- IOP Status -->
				<div>
					<label for="iop-filter" class="mb-1 block text-sm font-medium text-gray-700">
						IOP Status
					</label>
					<select
						id="iop-filter"
						bind:value={iopFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each iopOptions as opt (opt.value)}
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
