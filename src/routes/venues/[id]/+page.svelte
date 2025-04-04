<script lang="ts">
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import VenueDetails from '$lib/components/venue/VenueDetails.svelte';

    let { data } = $props<{
        data: PageData;
    }>();

    let venue = $derived(() => {
        if (data.query.loading) return null;
        if (data.query.error) return null;
        return data.query.data[0];
    });
</script>

{#if data.query.loading}
    <div class="flex items-center justify-center h-full">
        <p class="text-gray-500">Loading venue details...</p>
    </div>
{:else if data.query.error}
    <div class="flex items-center justify-center h-full">
        <p class="text-red-500">Error loading venue details: {data.query.error.message}</p>
    </div>
{:else if !venue}
    <div class="flex items-center justify-center h-full">
        <p class="text-gray-500">Venue not found</p>
    </div>
{:else}
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">Venue Details</h1>
        <VenueDetails {venue} />
    </div>
{/if} 