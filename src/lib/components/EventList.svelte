<script lang="ts">
    import { parseDate } from "@internationalized/date";
    import DateChip from "./chips/DateChip.svelte";
    import LocationChip from "./chips/LocationChip.svelte";
    import CompanyChip from "./chips/CompanyChip.svelte";
    import { preloadData, pushState, goto } from '$app/navigation';

    const { events } = $props<{
        events: Array<{
            id: string;
            name: string;
            date: string;
            notes?: string;
        }>;
    }>();

    async function handleCallClick(e: MouseEvent, call: any) {
        console.log('handleCallClick - Starting with call:', call);
        const href = `/calls/${call.id}`;

        // Bail if screen is too small or modifier keys are pressed
        if (window.innerWidth < 640 || e.shiftKey || e.metaKey || e.ctrlKey) {
            console.log('handleCallClick - Bailing to regular navigation');
            goto(href);
            return;
        }

        // Prevent default navigation
        e.preventDefault();

        // Try to preload the data
        console.log('handleCallClick - Attempting to preload data');
        const result = await preloadData(href);
        console.log('handleCallClick - Preload result:', result);

        if (result.type === 'loaded' && result.status === 200) {
            // Only include serializable data
            const stateData = {
                selected: {
                    id: call.id,
                    name: call.name,
                    date: call.date,
                    notes: call.notes || ''
                }
            };
            console.log('handleCallClick - Pushing state:', stateData);
            pushState(href, stateData);
        } else {
            console.log('handleCallClick - Falling back to regular navigation');
            goto(href);
        }
    }
</script>

{#if events.length === 0}
    <p class="text-gray-500">No calls created yet</p>
{:else}
    <div class="space-y-2">
        {#each events as event}
            <div 
                class="flex items-stretch gap-3 p-1.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors cursor-pointer"
                onclick={(e) => handleCallClick(e, event)}
            >
                <DateChip date={parseDate(event.date)} />
                <div class="w-px self-stretch bg-gray-100/70"></div>
                <div class="flex-1 min-w-0 py-1">
                    <div class="flex items-center gap-x-4">
                        <h3 class="text-base font-semibold text-gray-900 truncate leading-6">{event.name}</h3>
                    </div>
                    <div class="mt-0.5 flex items-center gap-2 flex-wrap">
                        <LocationChip location="Registry Theatre" />
                        <CompanyChip company={{ name: "Sherwood" }} />
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if} 