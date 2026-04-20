<script lang="ts">
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
</script>

<SectionCard title="Research & Planning Privacy Notice" description="How your confidential patient information is used for research and service planning, and your choices about this use.">
	<div class="prose prose-sm max-w-none text-gray-800">
		<h3 class="mt-0 text-lg font-semibold">Who we are and what we do</h3>
		<p>
			The NHS and organisations providing NHS services use confidential patient information to run the health service, plan services, and conduct research that benefits current and future patients. This notice explains how your information is used and the choices you have.
		</p>

		<h3 class="mt-4 text-lg font-semibold">Legal bases</h3>
		<p>
			We process your information under <strong>UK GDPR Article 6(1)(e)</strong> (task in the public interest) and, for health data, <strong>Article 9(2)(h)</strong> (provision of health care) and, for research, <strong>Article 9(2)(j)</strong> (scientific research). The Common Law Duty of Confidentiality also applies.
		</p>

		<h3 class="mt-4 text-lg font-semibold">What we use your information for</h3>
		<ul class="list-disc pl-5">
			<li>Direct care (always, and unrelated to the opt-out below)</li>
			<li>Service planning — measuring demand, waiting times, and outcomes</li>
			<li>Research — approved studies following Health Research Authority rules</li>
			<li>Quality assurance and audit</li>
			<li>Public-health surveillance (where legally required)</li>
		</ul>

		<h3 class="mt-4 text-lg font-semibold">Your opt-out choices</h3>
		<p>You have two separate choices:</p>
		<ul class="list-disc space-y-2 pl-5">
			<li>
				<strong>Type 1 opt-out</strong> — asks your GP practice not to share your identifiable information from their records for purposes beyond direct care at that practice.
			</li>
			<li>
				<strong>NHS National Data Opt-Out</strong> — asks the NHS not to share your confidential patient information for research and planning across the wider NHS. You can set or change this at any time at
				<a class="text-primary underline" href="https://www.nhs.uk/your-nhs-data-matters/" target="_blank" rel="noopener">nhs.uk/your-nhs-data-matters</a>.
			</li>
		</ul>

		<h3 class="mt-4 text-lg font-semibold">Your rights</h3>
		<p>
			You have rights to access, correct, and (in some cases) object to or erase your personal data. You can complain to the Information Commissioner's Office at
			<a class="text-primary underline" href="https://ico.org.uk/" target="_blank" rel="noopener">ico.org.uk</a>.
		</p>

		<p class="mt-6 text-sm text-gray-600">
			Please read each section carefully before proceeding to record your preferences, acknowledge, and sign.
		</p>
	</div>
</SectionCard>
