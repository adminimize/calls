<script lang="ts">
    import { db } from '$lib/db';
    import { id, tx } from 'svelte-instantdb';
    import { superForm } from 'sveltekit-superforms';
    import { z } from 'zod';
    import { CalendarDate, today, getLocalTimeZone, parseDate } from "@internationalized/date";
    import type { DateValue } from "@internationalized/date";
    import DatePicker from "$lib/components/DatePicker.svelte";
    import DateChip from "$lib/components/DateChip.svelte";

    // Define the schema for our simple call
    const schema = z.object({
        name: z.string().min(1, "Name is required"),
        date: z.string().min(1, "Date is required")
    });

    // Form state
    let form = $state({
        name: '',
        date: ''
    });

    // Date picker state
    let selectedDate = $state<DateValue | undefined>(undefined);
    let isOpen = $state(false);

    // Error state
    let errors = $state<Record<string, string[]>>({});

    // Query for existing calls
    const query = db.useQuery({
        simpleCalls: {}
    });

    // Helper function to sort calls by date
    function sortCallsByDate(calls: any[]) {
        return [...calls].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    // Get calls from query and sort by date
    const calls = $derived(
        sortCallsByDate(query.current.data?.simpleCalls || [])
    );

    // Handle form submission
    async function handleSubmit(e: Event) {
        e.preventDefault();
        
        // Reset errors
        errors = {};
        
        // Validate form
        const result = schema.safeParse(form);
        
        if (!result.success) {
            // Convert Zod errors to our error format
            result.error.errors.forEach(error => {
                const path = error.path[0] as string;
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(error.message);
            });
            return;
        }

        try {
            // Create the call
            const callId = id();
            await db.transact(
                tx.simpleCalls[callId].update({
                    name: form.name,
                    date: form.date,
                    createdAt: new Date().toISOString()
                })
            );

            // Reset form
            form = {
                name: '',
                date: ''
            };
            selectedDate = undefined;
        } catch (err) {
            console.error('Error creating call:', err);
            errors.general = ['Failed to create call'];
        }
    }

    // Handle date selection
    function handleDateSelect(date: DateValue | undefined) {
        selectedDate = date;
        if (date) {
            form.date = date.toString();
        }
        isOpen = false;
    }
</script>

<div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Call Creation Playground</h1>
        
        <!-- Create Call Form -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Create New Call</h2>
            
            {#if errors.general}
                <div class="mb-4 p-3 bg-red-50 text-red-700 rounded">
                    {errors.general[0]}
                </div>
            {/if}
            
            <form onsubmit={handleSubmit} class="space-y-4">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Call Name</label>
                    <input
                        type="text"
                        id="name"
                        bind:value={form.name}
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter call name"
                    />
                    {#if errors.name}
                        <p class="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                    {/if}
                </div>
                
                <div>
                    <DatePicker
                        label="Call Date"
                        value={selectedDate}
                        onValueChange={handleDateSelect}
                        open={isOpen}
                    />
                    {#if errors.date}
                        <p class="mt-1 text-sm text-red-600">{errors.date[0]}</p>
                    {/if}
                </div>
                
                <div>
                    <button
                        type="submit"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Create Call
                    </button>
                </div>
            </form>
        </div>
        
        <!-- List of Calls -->
        <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-semibold mb-4">Existing Calls</h2>
            
            {#if calls.length === 0}
                <p class="text-gray-500">No calls created yet</p>
            {:else}
                <div class="space-y-4">
                    {#each calls as call}
                        <div class="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200">
                            <div class="flex items-center gap-4">
                                <DateChip date={parseDate(call.date)} />
                                <span class="text-gray-900">{call.name}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div> 