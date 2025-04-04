<script lang="ts">
    import { parseDate } from "@internationalized/date";
    import DateChip from "./chips/DateChip.svelte";
    import LocationChip from "./chips/LocationChip.svelte";
    import CompanyChip from "./chips/CompanyChip.svelte";

    const { events } = $props<{
        events: Array<{
            name: string;
            date: string;
        }>;
    }>();
</script>

{#if events.length === 0}
    <p class="text-gray-500">No calls created yet</p>
{:else}
    <div class="space-y-2">
        {#each events as event}
            <div class="flex items-stretch gap-3 p-1.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors">
                <DateChip date={parseDate(event.date)} />
                <div class="w-px self-stretch bg-gray-100/70"></div>
                <div class="flex-1 min-w-0 py-1">
                    <div class="flex items-center gap-x-4">
                        <h3 class="text-base font-semibold text-gray-900 truncate leading-6">{event.name}</h3>
                    </div>
                    <div class="mt-0.5 flex items-center gap-2 flex-wrap">
                        <LocationChip location="Registry Theatre" />
                        <CompanyChip company="Sherwood" />
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if} 