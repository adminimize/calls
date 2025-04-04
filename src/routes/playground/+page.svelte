<script lang="ts">
    import { db } from '$lib/db';
    import { id, tx } from 'svelte-instantdb';
    import { z } from 'zod';
    import { CalendarDate, today, getLocalTimeZone, parseDate } from "@internationalized/date";
    import type { DateValue } from "@internationalized/date";
    import DatePicker from "$lib/components/DatePicker.svelte";
    import EventList from "$lib/components/EventList.svelte";
    import CompanyChip from "$lib/components/chips/CompanyChip.svelte";
    import DetailZone from "$lib/components/DetailZone.svelte";
    import { preloadData, pushState, goto } from '$app/navigation';

    // Define schemas for validation
    const callSchema = z.object({
        name: z.string().min(1, "Name is required"),
        date: z.string().min(1, "Date is required")
    });

    const companySchema = z.object({
        name: z.string().min(1, "Company name is required"),
        description: z.string().optional(),
        website: z.string().optional()
    });

    const venueSchema = z.object({
        name: z.string().min(1, "Venue name is required")
    });

    // Form states
    let callForm = $state({
        name: '',
        date: ''
    });

    let companyForm = $state({
        name: '',
        description: '',
        website: ''
    });

    let venueForm = $state({
        name: ''
    });

    // Selected company for drawer
    let selectedCompany = $state<any | null>(null);
    let isDrawerOpen = $state(false);

    // File upload state
    let selectedFile = $state<File | null>(null);
    let isUploading = $state(false);

    // Date picker state
    let selectedDate = $state<DateValue | undefined>(undefined);
    let isOpen = $state(false);

    // File input ref
    let fileInputRef: HTMLInputElement;

    // Error states
    let callErrors = $state<Record<string, string[]>>({});
    let companyErrors = $state<Record<string, string[]>>({});
    let venueErrors = $state<Record<string, string[]>>({});

    // Queries for existing data
    const query = db.useQuery({
        simpleCalls: {},
        simpleCompanies: {
            icon: {}
        },
        venues: {}
    });

    // Helper function to sort calls by date
    function sortCallsByDate(calls: any[]) {
        return [...calls].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    // Get calls from query and sort by date
    const calls = $derived(
        sortCallsByDate(query.current.data?.simpleCalls || [])
    );

    const companies = $derived(query.current.data?.simpleCompanies || []);
    const venues = $derived(query.current.data?.venues || []);

    // Handle date selection
    function handleDateSelect(date: DateValue | undefined) {
        selectedDate = date;
        if (date) {
            callForm.date = date.toString();
        }
        isOpen = false;
    }

    // Handle file selection
    function handleFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files?.length) {
            selectedFile = input.files[0];
        }
    }

    // Handle company selection
    async function handleCompanyClick(e: MouseEvent, company: any) {
        console.log('handleCompanyClick - Starting with company:', company);
        const href = `/companies/${company.id}`;

        // Bail if screen is too small or modifier keys are pressed
        if (window.innerWidth < 640 || e.shiftKey || e.metaKey || e.ctrlKey) {
            console.log('handleCompanyClick - Bailing to regular navigation');
            goto(href);
            return;
        }

        // Prevent default navigation
        e.preventDefault();

        // Try to preload the data
        console.log('handleCompanyClick - Attempting to preload data');
        const result = await preloadData(href);
        console.log('handleCompanyClick - Preload result:', result);

        if (result.type === 'loaded' && result.status === 200) {
            // Only include serializable data
            const stateData = {
                selected: {
                    id: company.id,
                    name: company.name,
                    description: company.description,
                    website: company.website,
                    icon: company.icon ? {
                        url: company.icon.url
                    } : undefined
                }
            };
            console.log('handleCompanyClick - Pushing state:', stateData);
            pushState(href, stateData);
        } else {
            console.log('handleCompanyClick - Falling back to regular navigation');
            goto(href);
        }
    }

    // Handle call form submission
    async function handleCallSubmit(e: Event) {
        e.preventDefault();
        callErrors = {};
        
        const result = callSchema.safeParse(callForm);
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

        try {
            const callId = id();
            await db.transact(
                tx.simpleCalls[callId].update({
                    name: callForm.name,
                    date: callForm.date,
                    createdAt: new Date().toISOString()
                })
            );

            callForm = {
                name: '',
                date: ''
            };
            selectedDate = undefined;
        } catch (err) {
            console.error('Error creating call:', err);
            callErrors.general = ['Failed to create call'];
        }
    }

    // Handle company form submission
    async function handleCompanySubmit(e: Event) {
        e.preventDefault();
        companyErrors = {};
        
        const result = companySchema.safeParse(companyForm);
        if (!result.success) {
            result.error.errors.forEach(error => {
                const path = error.path[0] as string;
                if (!companyErrors[path]) {
                    companyErrors[path] = [];
                }
                companyErrors[path].push(error.message);
            });
            return;
        }

        try {
            const companyId = id();
            let iconId: string | undefined;

            // Upload icon if selected
            if (selectedFile) {
                isUploading = true;
                try {
                    const path = `companies/${companyId}/icon.png`;
                    const { data: fileData } = await db.storage.uploadFile(path, selectedFile, {
                        contentType: 'image/png'
                    });
                    iconId = fileData.id;
                } catch (err) {
                    console.error('Error uploading icon:', err);
                    companyErrors.icon = ['Failed to upload icon'];
                    return;
                } finally {
                    isUploading = false;
                }
            }

            // Create company
            await db.transact([
                tx.simpleCompanies[companyId].update({
                    name: companyForm.name,
                    description: companyForm.description || '',
                    website: companyForm.website || '',
                    createdAt: new Date().toISOString()
                }),
                ...(iconId ? [tx.simpleCompanies[companyId].link({ icon: iconId })] : [])
            ]);

            companyForm = { name: '', description: '', website: '' };
            selectedFile = null;
            if (fileInputRef) {
                fileInputRef.value = '';
            }
        } catch (err) {
            console.error('Error creating company:', err);
            companyErrors.general = ['Failed to create company'];
        }
    }

    // Handle venue form submission
    async function handleVenueSubmit(e: Event) {
        e.preventDefault();
        venueErrors = {};
        
        const result = venueSchema.safeParse(venueForm);
        if (!result.success) {
            result.error.errors.forEach(error => {
                const path = error.path[0] as string;
                if (!venueErrors[path]) {
                    venueErrors[path] = [];
                }
                venueErrors[path].push(error.message);
            });
            return;
        }

        try {
            const venueId = id();
            await db.transact(
                tx.venues[venueId].update({
                    name: venueForm.name,
                    createdAt: new Date().toISOString()
                })
            );

            venueForm = { name: '' };
        } catch (err) {
            console.error('Error creating venue:', err);
            venueErrors.general = ['Failed to create venue'];
        }
    }
</script>

<div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Call Creation Playground</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- List Zone -->
            <div class="lg:col-span-1 space-y-6">
                <!-- Company Creation Form -->
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Create Company</h2>
                    
                    {#if companyErrors.general}
                        <div class="mb-4 p-3 bg-red-50 text-red-700 rounded">
                            {companyErrors.general[0]}
                        </div>
                    {/if}
                    
                    <form onsubmit={handleCompanySubmit} class="space-y-4">
                        <div>
                            <label for="companyName" class="block text-sm font-medium text-gray-700">Company Name</label>
                            <input
                                type="text"
                                id="companyName"
                                bind:value={companyForm.name}
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter company name"
                            />
                            {#if companyErrors.name}
                                <p class="mt-1 text-sm text-red-600">{companyErrors.name[0]}</p>
                            {/if}
                        </div>

                        <div>
                            <label for="companyDescription" class="block text-sm font-medium text-gray-700">Description (optional)</label>
                            <textarea
                                id="companyDescription"
                                bind:value={companyForm.description}
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                rows="3"
                                placeholder="Enter company description"
                            />
                        </div>

                        <div>
                            <label for="companyWebsite" class="block text-sm font-medium text-gray-700">Website (optional)</label>
                            <input
                                type="text"
                                id="companyWebsite"
                                bind:value={companyForm.website}
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter company website"
                            />
                        </div>

                        <div>
                            <label for="companyIcon" class="block text-sm font-medium text-gray-700">Icon (optional)</label>
                            <input
                                type="file"
                                id="companyIcon"
                                accept="image/png"
                                bind:this={fileInputRef}
                                onchange={handleFileSelect}
                                class="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-medium
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                            />
                            {#if companyErrors.icon}
                                <p class="mt-1 text-sm text-red-600">{companyErrors.icon[0]}</p>
                            {/if}
                        </div>
                        
                        <button
                            type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isUploading}
                        >
                            {#if isUploading}
                                <span class="inline-block animate-spin mr-2">⌛</span>
                            {/if}
                            Create Company
                        </button>
                    </form>

                    {#if companies.length > 0}
                        <div class="mt-4">
                            <h3 class="text-sm font-medium text-gray-700 mb-2">Existing Companies</h3>
                            <div class="flex flex-wrap gap-2">
                                {#each companies as company}
                                    <CompanyChip {company} onClick={(e) => handleCompanyClick(e, company)} />
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Venue Creation Form -->
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Create Venue</h2>
                    
                    {#if venueErrors.general}
                        <div class="mb-4 p-3 bg-red-50 text-red-700 rounded">
                            {venueErrors.general[0]}
                        </div>
                    {/if}
                    
                    <form onsubmit={handleVenueSubmit} class="space-y-4">
                        <div>
                            <label for="venueName" class="block text-sm font-medium text-gray-700">Venue Name</label>
                            <input
                                type="text"
                                id="venueName"
                                bind:value={venueForm.name}
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter venue name"
                            />
                            {#if venueErrors.name}
                                <p class="mt-1 text-sm text-red-600">{venueErrors.name[0]}</p>
                            {/if}
                        </div>
                        
                        <button
                            type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Create Venue
                        </button>
                    </form>

                    {#if venues.length > 0}
                        <div class="mt-4">
                            <h3 class="text-sm font-medium text-gray-700 mb-2">Existing Venues</h3>
                            <div class="space-y-1">
                                {#each venues as venue}
                                    <div class="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                                        {venue.name}
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Create Call Form -->
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Create New Call</h2>
                    
                    {#if callErrors.general}
                        <div class="mb-4 p-3 bg-red-50 text-red-700 rounded">
                            {callErrors.general[0]}
                        </div>
                    {/if}
                    
                    <form onsubmit={handleCallSubmit} class="space-y-4">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700">Call Name</label>
                            <input
                                type="text"
                                id="name"
                                bind:value={callForm.name}
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter call name"
                            />
                            {#if callErrors.name}
                                <p class="mt-1 text-sm text-red-600">{callErrors.name[0]}</p>
                            {/if}
                        </div>
                        
                        <div>
                            <DatePicker
                                label="Call Date"
                                value={selectedDate}
                                onValueChange={handleDateSelect}
                                open={isOpen}
                            />
                            {#if callErrors.date}
                                <p class="mt-1 text-sm text-red-600">{callErrors.date[0]}</p>
                            {/if}
                        </div>
                        
                        <button
                            type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Create Call
                        </button>
                    </form>
                </div>
                
                <!-- List of Calls -->
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Existing Calls</h2>
                    <EventList events={calls} />
                </div>
            </div>

            <!-- Detail Zone -->
            <div class="lg:col-span-2 h-[calc(100vh-8rem)] sticky top-6">
                <DetailZone>
                    <!-- Content will be rendered based on page state -->
                </DetailZone>
            </div>
        </div>
    </div>
</div>

<!-- Company Details Drawer -->
{#if isDrawerOpen}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onclick={() => isDrawerOpen = false}></div>
    <div class="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-xl transform transition-transform">
        <div class="h-full flex flex-col">
            <div class="px-6 py-4 border-b">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-gray-900">Company Details</h2>
                    <button
                        onclick={() => isDrawerOpen = false}
                        class="text-gray-400 hover:text-gray-500"
                    >
                        <span class="sr-only">Close</span>
                        ×
                    </button>
                </div>
            </div>
            
            <div class="flex-1 px-6 py-4 overflow-y-auto">
                {#if selectedCompany}
                    <div class="space-y-6">
                        <div class="flex items-center gap-4">
                            {#if selectedCompany.icon?.url}
                                <img
                                    src={selectedCompany.icon.url}
                                    alt=""
                                    class="w-16 h-16 rounded-full object-cover bg-gray-100"
                                />
                            {/if}
                            <h3 class="text-xl font-medium text-gray-900">{selectedCompany.name}</h3>
                        </div>
                        
                        {#if selectedCompany.description}
                            <div>
                                <h4 class="text-sm font-medium text-gray-700">Description</h4>
                                <p class="mt-1 text-sm text-gray-600">{selectedCompany.description}</p>
                            </div>
                        {/if}
                        
                        {#if selectedCompany.website}
                            <div>
                                <h4 class="text-sm font-medium text-gray-700">Website</h4>
                                <a
                                    href={selectedCompany.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="mt-1 text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                    {selectedCompany.website}
                                </a>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if} 