<script lang="ts">
  const title = 'United Kingdom Driver And Vehicle Licensing Agency M1 Form';
  const role = 'clinician dashboard';
</script>

<svelte:head>
  <title>{title} — {role}</title>
</svelte:head>

<main class="mx-auto max-w-3xl p-6">
  <h1 class="text-2xl font-semibold mb-4">{title}</h1>
  <p class="text-muted mb-2">This SvelteKit project is the <strong>{role}</strong> for the {title} form.</p>
  <p class="mb-2">Scoring system, steps, and conventions: see the parent
    <a class="text-primary underline" href="../../index.md">form specification</a>.</p>
  <p class="mb-2">Implementation is pending. See <code>../plan.md</code> and <code>../tasks.md</code> at the form root.</p>
</main>
