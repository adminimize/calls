<script lang="ts">
    import { page } from '$app/state';
    import CompanyDetails from '$lib/components/company/CompanyDetails.svelte';
    
    const { data } = $props();
    const query = data.company();

    // Use shallow routed data if available, otherwise use query data
    const company = $derived(
        page.state.selected || 
        query.current.data?.simpleCompanies?.[0]
    );

    // Log state changes
    $effect(() => {
        console.log('[id]/+page.svelte - Page state:', page.state);
        console.log('[id]/+page.svelte - Query data:', query.current);
        console.log('[id]/+page.svelte - Derived company:', company);
    });
</script>

<div class="max-w-4xl mx-auto py-6">
    {#if !company && query.current.isLoading}
        <div class="flex items-center justify-center h-32">
            <div class="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
    {:else if !company && query.current.error}
        <div class="text-red-500">
            Error loading company: {query.current.error.message}
        </div>
    {:else if company}
        <CompanyDetails {company} />
    {:else}
        <div class="text-gray-500">Company not found</div>
    {/if}
</div> 