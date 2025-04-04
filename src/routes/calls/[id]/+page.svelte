<script lang="ts">
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import CallDetails from '$lib/components/call/CallDetails.svelte';

    let { data } = $props<{
        data: PageData;
    }>();

    let call = $derived(() => {
        if (data.query.loading) return null;
        if (data.query.error) return null;
        return data.query.data[0];
    });
</script>

{#if data.query.loading}
    <div class="flex items-center justify-center h-full">
        <p class="text-gray-500">Loading call details...</p>
    </div>
{:else if data.query.error}
    <div class="flex items-center justify-center h-full">
        <p class="text-red-500">Error loading call details: {data.query.error.message}</p>
    </div>
{:else if !call}
    <div class="flex items-center justify-center h-full">
        <p class="text-gray-500">Call not found</p>
    </div>
{:else}
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">Call Details</h1>
        <CallDetails {call} />
    </div>
{/if} 