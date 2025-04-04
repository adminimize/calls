<script lang="ts">
    import { DatePicker } from "bits-ui";
    import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
    import CaretLeft from "phosphor-svelte/lib/CaretLeft";
    import CaretRight from "phosphor-svelte/lib/CaretRight";
    import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
    import type { DateValue } from "@internationalized/date";

    let { value, onValueChange, open = false, label = "Date" } = $props<{
        value: DateValue | undefined;
        onValueChange: (value: DateValue | undefined) => void;
        open?: boolean;
        label?: string;
    }>();

    // Set default value to tomorrow
    $effect(() => {
        if (!value) {
            const tomorrow = today(getLocalTimeZone()).add({ days: 1 });
            onValueChange(tomorrow);
        }
    });

    // Function to calculate days between dates
    function getDaysBetween(date1: CalendarDate, date2: CalendarDate): number {
        const d1 = new Date(date1.toString());
        const d2 = new Date(date2.toString());
        const diffTime = d1.getTime() - d2.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Reactive relative message using $derived.by
    const relativeMessage = $derived.by(() => {
        if (!value) return '';
        
        const now = today(getLocalTimeZone());
        const selectedDate = value instanceof CalendarDate ? value : new CalendarDate(value.era, value.year, value.month, value.day);
        const days = getDaysBetween(selectedDate, now);
        
        if (days === 0) return 'today';
        if (days === 1) return 'tomorrow';
        if (days === 2) return 'in 2 days';
        if (days <= 6) return `in ${days} days`;
        if (days <= 13) return 'next week';
        if (days <= 30) return `in ${Math.ceil(days / 7)} weeks`;
        if (days <= 60) return 'next month';
        if (days <= 365) return `in ${Math.ceil(days / 30)} months`;
        return `in ${Math.ceil(days / 365)} years`;
    });

    // Format date as YYYY/MM/DD
    function formatDateSegment(part: string, value: string): string {
        if (part === 'year') return value;
        return value.padStart(2, '0');
    }
</script>

<div class="w-full">
    <label class="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <DatePicker.Root 
        value={value}
        onValueChange={onValueChange}
        open={open}
    >
        <div class="flex w-full flex-col gap-1.5">
            <div class="relative">
                <DatePicker.Input
                    class="w-full rounded-md border border-gray-300 bg-white pl-3 pr-12 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    {#snippet children({ segments })}
                        {#each segments as { part, value }}
                            <div class="inline-block select-none">
                                {#if part === "literal"}
                                    <DatePicker.Segment {part} class="text-gray-500 px-0.5">
                                        /
                                    </DatePicker.Segment>
                                {:else}
                                    <DatePicker.Segment
                                        {part}
                                        class="rounded-sm hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 aria-[valuetext=Empty]:text-gray-400 focus-visible:ring-0! focus-visible:ring-offset-0! px-0.5"
                                    >
                                        {formatDateSegment(part, value)}
                                    </DatePicker.Segment>
                                {/if}
                            </div>
                        {/each}
                    {/snippet}
                </DatePicker.Input>
                <DatePicker.Trigger
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                >
                    <CalendarBlank class="h-5 w-5" />
                </DatePicker.Trigger>
            </div>
            <DatePicker.Content sideOffset={6} class="z-50">
                <DatePicker.Calendar
                    class="rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
                >
                    {#snippet children({ months, weekdays })}
                        <DatePicker.Header class="flex items-center justify-between mb-2">
                            <DatePicker.PrevButton
                                class="rounded-md bg-white p-2 hover:bg-gray-100"
                            >
                                <CaretLeft class="h-5 w-5" />
                            </DatePicker.PrevButton>
                            <DatePicker.Heading class="text-sm font-medium" />
                            <DatePicker.NextButton
                                class="rounded-md bg-white p-2 hover:bg-gray-100"
                            >
                                <CaretRight class="h-5 w-5" />
                            </DatePicker.NextButton>
                        </DatePicker.Header>
                        <div class="flex flex-col space-y-4 pt-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                            {#each months as month}
                                <DatePicker.Grid class="w-full border-collapse select-none space-y-1">
                                    <DatePicker.GridHead>
                                        <DatePicker.GridRow class="mb-1 flex w-full justify-between">
                                            {#each weekdays as day}
                                                <DatePicker.HeadCell
                                                    class="w-10 rounded-md text-xs font-medium text-gray-500"
                                                >
                                                    <div class="text-center">{day.slice(0, 2)}</div>
                                                </DatePicker.HeadCell>
                                            {/each}
                                        </DatePicker.GridRow>
                                    </DatePicker.GridHead>
                                    <DatePicker.GridBody>
                                        {#each month.weeks as weekDates}
                                            <DatePicker.GridRow class="flex w-full">
                                                {#each weekDates as date}
                                                    <DatePicker.Cell
                                                        {date}
                                                        month={month.value}
                                                        class="p-0 relative h-10 w-10 text-center text-sm"
                                                    >
                                                        <DatePicker.Day
                                                            class="flex h-10 w-10 items-center justify-center rounded-md text-gray-900 hover:bg-gray-100 data-[selected]:bg-indigo-600 data-[selected]:text-white data-[disabled]:text-gray-400 data-[unavailable]:text-gray-400 data-[disabled]:pointer-events-none data-[outside-month]:pointer-events-none data-[selected]:font-medium data-[unavailable]:line-through"
                                                        >
                                                            <div
                                                                class="absolute top-1 hidden h-1 w-1 rounded-full bg-indigo-600 group-data-[selected]:bg-white group-data-[today]:block"
                                                            ></div>
                                                            {date.day}
                                                        </DatePicker.Day>
                                                    </DatePicker.Cell>
                                                {/each}
                                            </DatePicker.GridRow>
                                        {/each}
                                    </DatePicker.GridBody>
                                </DatePicker.Grid>
                            {/each}
                        </div>
                    {/snippet}
                </DatePicker.Calendar>
            </DatePicker.Content>
        </div>
    </DatePicker.Root>
    {#if value}
        <p class="mt-1 text-sm italic text-indigo-600">
            {relativeMessage}
        </p>
    {/if}
</div> 