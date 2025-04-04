<script lang="ts">
    import { DatePicker } from "bits-ui";
    import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
    import CaretLeft from "phosphor-svelte/lib/CaretLeft";
    import CaretRight from "phosphor-svelte/lib/CaretRight";
    import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
    import type { DateValue } from "@internationalized/date";
    import { getRelativeTimeMessage } from "$lib/utils/dateUtils";

    const { value, onValueChange, open = false, label = "Date" } = $props<{
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

    // Reactive relative message
    const relativeMessage = $derived.by(() => getRelativeTimeMessage(value));

    // Function to handle date selection, including Today button
    function handleDateSelect(date: DateValue | undefined) {
        onValueChange(date);
    }

    // Format date as YYYY/MM/DD
    function formatDateSegment(part: string, value: string): string {
        if (part === 'year') return value;
        return value.padStart(2, '0');
    }
</script>

<div class="w-full">
    <label class="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div class="relative">
        <DatePicker.Root 
            value={value}
            onValueChange={onValueChange}
            open={open}
        >
            <div class="flex w-full flex-col">
                <div class="relative">
                    <div class="group relative rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
                        <div class="flex items-center">
                            <DatePicker.Input
                                class="flex-1 rounded-lg bg-transparent pl-3 pr-12 py-2 text-sm text-gray-900 focus:outline-none"
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
                                                    class="rounded-sm hover:bg-white/50 focus:bg-white/50 focus:text-gray-900 aria-[valuetext=Empty]:text-gray-400 focus-visible:ring-0! focus-visible:ring-offset-0! px-0.5"
                                                >
                                                    {formatDateSegment(part, value)}
                                                </DatePicker.Segment>
                                            {/if}
                                        </div>
                                    {/each}
                                {/snippet}
                            </DatePicker.Input>
                            {#if value}
                                <div class="relative flex items-center h-[34px]">
                                    <div class="absolute inset-0 bg-indigo-50/80"></div>
                                    <div class="absolute inset-y-0 left-0 w-px bg-indigo-200"></div>
                                    <DatePicker.Trigger class="relative px-3 cursor-pointer">
                                        <span class="text-xs italic text-indigo-600 group-hover:text-indigo-700 whitespace-nowrap">{relativeMessage}</span>
                                    </DatePicker.Trigger>
                                    <DatePicker.Trigger
                                        class="relative text-gray-400 hover:text-indigo-500 inline-flex items-center justify-center px-2 transition-colors group-hover:text-indigo-600"
                                    >
                                        <CalendarBlank class="h-5 w-5" />
                                    </DatePicker.Trigger>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
                <DatePicker.Content sideOffset={6} class="z-50">
                    <DatePicker.Calendar
                        class="rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
                    >
                        {#snippet children({ months, weekdays })}
                            <DatePicker.Header class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <DatePicker.PrevButton
                                        class="rounded-md bg-white p-2 hover:bg-gray-100 hover:text-indigo-600"
                                    >
                                        <CaretLeft class="h-5 w-5" />
                                    </DatePicker.PrevButton>
                                    <DatePicker.Heading class="text-sm font-medium" />
                                    <DatePicker.NextButton
                                        class="rounded-md bg-white p-2 hover:bg-gray-100 hover:text-indigo-600"
                                    >
                                        <CaretRight class="h-5 w-5" />
                                    </DatePicker.NextButton>
                                </div>
                                <button
                                    type="button"
                                    class="text-sm text-gray-500 hover:text-indigo-600 font-medium cursor-pointer transition-all hover:scale-105 active:scale-95 hover:underline decoration-2 underline-offset-4 decoration-indigo-200"
                                    onclick={() => handleDateSelect(today(getLocalTimeZone()))}
                                >
                                    Today
                                </button>
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
                                                                class="flex h-10 w-10 items-center justify-center rounded-md text-gray-900 hover:bg-indigo-50 hover:text-indigo-600 data-[selected]:bg-indigo-600 data-[selected]:text-white data-[disabled]:text-gray-400 data-[unavailable]:text-gray-400 data-[disabled]:pointer-events-none data-[outside-month]:pointer-events-none data-[selected]:font-medium data-[unavailable]:line-through"
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
    </div>
</div> 