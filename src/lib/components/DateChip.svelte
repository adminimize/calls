<script lang="ts">
    import type { DateValue } from "@internationalized/date";
    import { getRelativeTimeMessage } from "$lib/utils/dateUtils";

    const { date } = $props<{
        date: DateValue;
    }>();

    const relativeMessage = $derived.by(() => getRelativeTimeMessage(date));

    // Format date as YYYY/MM/DD
    function formatDate(date: DateValue): string {
        return date.toString();
    }
</script>

<div class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-full">
    <span class="text-sm font-medium text-indigo-900">{formatDate(date)}</span>
    <span class="text-xs italic text-indigo-600">{relativeMessage}</span>
</div> 