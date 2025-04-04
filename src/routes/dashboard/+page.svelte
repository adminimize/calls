<script lang="ts">
    import { companyAuth } from '$lib/companyAuth';
    import { db } from '$lib/db';
    import { page } from '$app/state';
    import { id, tx } from 'svelte-instantdb';
    import EventList from "$lib/components/EventList.svelte";
    import DetailZone from "$lib/components/DetailZone.svelte";
    import { z } from 'zod';
    import DatePicker from "$lib/components/DatePicker.svelte";
    import type { DateValue } from "@internationalized/date";
    import { toast } from 'svelte-5-french-toast';

    // Get auth and data
    const auth = companyAuth.useAuth();

    // Access the selected company ID from the layout
    const selectedCompanyId = $derived(page.data?.selectedCompanyId);
    
    // Query for calls from the database
    const query = db.useQuery({
        calls: {
            company: true,
        },
        companyProfiles: {},
    });

    // State for new call creation
    let isNewCallMode = $state(false);
    let selectedDate = $state<DateValue | undefined>(undefined);
    let isDatePickerOpen = $state(false);
    
    // New call form state
    let newCallForm = $state({
        title: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        notes: '',
        status: 'scheduled'
    });
    
    // Error states
    let callErrors = $state<Record<string, string[]>>({});

    // Define form validation schema
    const callSchema = z.object({
        title: z.string().min(1, "Title is required"),
        startDate: z.string().min(1, "Start date is required"),
        startTime: z.string().min(1, "Start time is required")
    });

    // Define type for calls matching EventList requirements
    type EventListItem = {
        id: string;
        name: string;
        date: string;
        notes?: string;
    };

    // Manually track calls array
    let callsList = $state<EventListItem[]>([]);

    // Get the currently selected company profile
    const selectedCompany = $derived(() => {
        if (!selectedCompanyId || !query.current.data?.companyProfiles) return null;
        return query.current.data.companyProfiles.find(cp => cp.id === selectedCompanyId);
    });

    // Update calls list when query data changes or selected company changes
    $effect(() => {
        const allCalls = query.current.data?.calls || [];
        
        // Filter calls by the selected company
        const filteredCalls = selectedCompanyId 
            ? allCalls.filter(call => call.company?.id === selectedCompanyId)
            : allCalls;
        
        // Map calls to EventListItem format
        callsList = filteredCalls.map(call => ({
            id: call.id,
            name: call.title || '',
            date: call.startDate || '',
            notes: call.notes
        }));
    });

    // Set default values for the form fields when opening the form
    function setDefaultFormValues() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const startDate = tomorrow.toISOString().split('T')[0];
        const startTime = '09:00';
        
        const endDate = startDate;
        const endTime = '17:00';
        
        newCallForm = {
            title: '',
            startDate,
            startTime,
            endDate,
            endTime,
            notes: '',
            status: 'scheduled'
        };
    }

    // Toggle new call mode
    function toggleNewCallMode() {
        // Reset form state when toggling
        if (!isNewCallMode) {
            setDefaultFormValues();
            selectedDate = undefined;
            callErrors = {};
        }
        isNewCallMode = !isNewCallMode;
    }

    // Handle date selection
    function handleDateSelect(date: DateValue | undefined) {
        selectedDate = date;
        if (date) {
            const dateStr = date.toString();
            newCallForm.startDate = dateStr;
            newCallForm.endDate = dateStr;
        }
        isDatePickerOpen = false;
    }

    // Handle call form submission
    async function handleCallSubmit(e: Event) {
        e.preventDefault();
        callErrors = {};
        
        const result = callSchema.safeParse(newCallForm);
        if (!result.success) {
            result.error.errors.forEach(error => {
                const path = error.path[0] as string;
                if (!callErrors[path]) {
                    callErrors[path] = [];
                }
                callErrors[path].push(error.message);
            });
            return;
        }

        if (!selectedCompanyId) {
            callErrors.general = ['Please select a company first'];
            return;
        }

        try {
            const callId = id();
            const currentTime = new Date().toISOString();
            
            await db.transact(
                tx.calls[callId].update({
                    title: newCallForm.title,
                    startDate: newCallForm.startDate,
                    endDate: newCallForm.endDate || newCallForm.startDate,
                    startTime: newCallForm.startTime,
                    endTime: newCallForm.endTime || '',
                    notes: newCallForm.notes || '',
                    status: newCallForm.status,
                    createdAt: currentTime,
                    updatedAt: currentTime
                }).link({
                    creator: auth.current.user?.id,
                    company: selectedCompanyId
                })
            );

            // Display success message
            toast.success('Call created successfully!');

            // Reset form and exit new call mode
            setDefaultFormValues();
            selectedDate = undefined;
            isNewCallMode = false;
        } catch (err) {
            console.error('Error creating call:', err);
            callErrors.general = ['Failed to create call'];
            toast.error('Failed to create call');
        }
    }
</script>

<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 sm:px-0">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">
                {selectedCompany ? `${selectedCompany.companyName} Calls` : 'All Calls'}
            </h2>
            <button
                onclick={toggleNewCallMode}
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                {isNewCallMode ? 'Cancel' : 'Create Call'}
            </button>
        </div>

        <!-- Two-column layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- List of Calls -->
            <div class="lg:col-span-1">
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Calls</h2>
                    <EventList events={callsList} />
                </div>
            </div>

            <!-- Detail Zone -->
            <div class="lg:col-span-2 h-[calc(100vh-8rem)] sticky top-6">
                {#if isNewCallMode}
                    <div class="bg-white shadow-lg rounded-lg overflow-hidden h-full">
                        <div class="p-6">
                            <h2 class="text-lg font-semibold mb-4">Create New Call</h2>
                            
                            {#if callErrors.general}
                                <div class="mb-4 p-3 bg-red-50 text-red-700 rounded">
                                    {callErrors.general[0]}
                                </div>
                            {/if}
                            
                            <form onsubmit={handleCallSubmit} class="space-y-4">
                                <div>
                                    <label for="title" class="block text-sm font-medium text-gray-700">Call Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        bind:value={newCallForm.title}
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Enter call title"
                                    />
                                    {#if callErrors.title}
                                        <p class="mt-1 text-sm text-red-600">{callErrors.title[0]}</p>
                                    {/if}
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <DatePicker
                                            label="Call Date"
                                            value={selectedDate}
                                            onValueChange={handleDateSelect}
                                            open={isDatePickerOpen}
                                        />
                                        {#if callErrors.startDate}
                                            <p class="mt-1 text-sm text-red-600">{callErrors.startDate[0]}</p>
                                        {/if}
                                    </div>
                                    <div>
                                        <label for="startTime" class="block text-sm font-medium text-gray-700">Start Time</label>
                                        <input
                                            type="time"
                                            id="startTime"
                                            bind:value={newCallForm.startTime}
                                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        {#if callErrors.startTime}
                                            <p class="mt-1 text-sm text-red-600">{callErrors.startTime[0]}</p>
                                        {/if}
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label for="endDate" class="block text-sm font-medium text-gray-700">End Date (optional)</label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            bind:value={newCallForm.endDate}
                                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label for="endTime" class="block text-sm font-medium text-gray-700">End Time (optional)</label>
                                        <input
                                            type="time"
                                            id="endTime"
                                            bind:value={newCallForm.endTime}
                                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label for="notes" class="block text-sm font-medium text-gray-700">Notes (optional)</label>
                                    <textarea
                                        id="notes"
                                        bind:value={newCallForm.notes}
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        rows="4"
                                        placeholder="Enter any additional notes"
                                    ></textarea>
                                </div>
                                
                                <button
                                    type="submit"
                                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Create Call
                                </button>
                            </form>
                        </div>
                    </div>
                {:else}
                    <DetailZone>
                        <!-- Content will be rendered based on page state -->
                    </DetailZone>
                {/if}
            </div>
        </div>
    </div>
</main> 