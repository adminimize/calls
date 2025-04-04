<script lang="ts">
    import type { DateValue } from "@internationalized/date";
    import { getRelativeTimeMessage } from "$lib/utils/dateUtils";

    const { date } = $props<{
        date: DateValue;
    }>();

    const relativeMessage = $derived.by(() => getRelativeTimeMessage(date));

    // Format date based on whether it's in the current year
    function formatDate(date: DateValue): string {
        const jsDate = new Date(date.toString());
        const now = new Date();
        const isCurrentYear = jsDate.getFullYear() === now.getFullYear();
        
        if (isCurrentYear) {
            // Format as "Mon, April 7"
            return jsDate.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'long',
                day: 'numeric'
            });
        } else {
            // Format as "2025-04-07"
            return jsDate.toISOString().split('T')[0];
        }
    }

    // Get day name for non-current year dates
    function getDayName(date: DateValue): string {
        const jsDate = new Date(date.toString());
        return jsDate.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // Determine if date is in current year
    const isCurrentYear = $derived(() => {
        const jsDate = new Date(date.toString());
        const now = new Date();
        return jsDate.getFullYear() === now.getFullYear();
    });
</script>

<div class="inline-flex flex-col overflow-hidden rounded-lg border border-indigo-100">
    <div class="px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div class="text-sm font-medium text-indigo-900">
            {formatDate(date)}
        </div>
    </div>
    <div class="px-3 py-1.5 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
        <div class="text-xs text-indigo-600">
            {#if !isCurrentYear}
                <span class="font-medium">{getDayName(date)}</span>
                <span class="mx-1">|</span>
            {/if}
            <span class="italic">{relativeMessage}</span>
        </div>
    </div>
</div> 