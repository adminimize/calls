<script lang="ts">
    import { companyAuth } from '$lib/companyAuth';
    import { db, addTechnician } from '$lib/db';
    import { tx } from 'svelte-instantdb';

    // Get page data from props
    const { data, form } = $props();
    
    const auth = companyAuth.useAuth();
    // Use a simpler query approach to avoid type issues
    const query = db.useQuery({
        technicians: {}
    });

    // Quick add form state
    let quickFirstName = $state('');
    let quickLastName = $state('');
    let quickPhone = $state('');
    let formStatus = $state({ submitting: false, message: '', type: '' });
    let selectedTechnician = $state<any>(null);
    let isDrawerOpen = $state(false);
    let drawerFormStatus = $state({ submitting: false, message: '', type: '' });
    
    // Form values for the drawer
    let techEmail = $state('');
    let techVerified = $state(false);

    // Derived state
    const technicians = $derived(query.current.data?.technicians || []);
    
    // Update form values if form data came back with errors
    $effect(() => {
        if (form?.values) {
            if (form.values.firstName) quickFirstName = form.values.firstName;
            if (form.values.lastName) quickLastName = form.values.lastName;
            if (form.values.phone) quickPhone = form.values.phone;
        }
        
        // Show form status message
        if (form?.error) {
            formStatus.message = form.error;
            formStatus.type = 'error';
            setTimeout(() => {
                formStatus.message = '';
                formStatus.type = '';
            }, 5000);
        }
        
        // Show success message
        if (form?.success) {
            formStatus.message = form.message;
            formStatus.type = 'success';
            setTimeout(() => {
                formStatus.message = '';
                formStatus.type = '';
            }, 3000);
        }
    });

    function resetQuickForm() {
        quickFirstName = '';
        quickLastName = '';
        quickPhone = '';
    }

    function formatPhone(input: string): string {
        // Strip non-numeric characters
        const cleaned = input.replace(/\D/g, '');
        
        // Format as (XXX) XXX-XXXX or return as is if not enough digits
        if (cleaned.length >= 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
        }
        return cleaned;
    }

    // Handle form submission directly
    async function handleAddTechnician(event: Event) {
        event.preventDefault();
        
        // Set submitting state
        formStatus.submitting = true;
        formStatus.message = '';
        formStatus.type = '';
        
        // Validate form
        if (!quickFirstName || !quickLastName || !quickPhone) {
            formStatus.message = 'Please fill in all required fields';
            formStatus.type = 'error';
            formStatus.submitting = false;
            return;
        }
        
        try {
            // Prepare technician data
            const techData = {
                firstName: quickFirstName,
                lastName: quickLastName,
                phone: quickPhone,
                verified: false,
                createdAt: new Date()
            };
            
            // Add technician to the database
            const result = await addTechnician(techData);
            
            // Success handling
            formStatus.message = 'Technician added successfully!';
            formStatus.type = 'success';
            resetQuickForm();
            
            // Set a timeout to clear the message
            setTimeout(() => {
                formStatus.message = '';
                formStatus.type = '';
            }, 3000);
        } catch (error) {
            // Error handling
            console.error('Failed to add technician:', error);
            formStatus.message = error instanceof Error ? error.message : 'Failed to add technician';
            formStatus.type = 'error';
            
            // Set a timeout to clear the message
            setTimeout(() => {
                formStatus.message = '';
                formStatus.type = '';
            }, 5000);
        } finally {
            formStatus.submitting = false;
        }
    }

    function openTechnicianDrawer(technician: any) {
        selectedTechnician = technician;
        techEmail = technician.email || '';
        techVerified = technician.verified || false;
        isDrawerOpen = true;
        drawerFormStatus.message = '';
        drawerFormStatus.type = '';
    }

    function closeDrawer() {
        isDrawerOpen = false;
        setTimeout(() => {
            selectedTechnician = null;
        }, 300); // Wait for drawer animation before clearing data
    }
    
    // Save technician details
    async function saveTechnicianDetails() {
        if (!selectedTechnician) return;
        
        drawerFormStatus.submitting = true;
        drawerFormStatus.message = '';
        drawerFormStatus.type = '';
        
        try {
            // Create transaction to update the technician
            await db.transact(
                tx.technicians[selectedTechnician.id].update({
                    email: techEmail || null,
                    verified: techVerified
                })
            );
            
            // Update the selected technician object to reflect changes
            selectedTechnician.email = techEmail;
            selectedTechnician.verified = techVerified;
            
            // Success handling
            drawerFormStatus.message = 'Technician updated successfully!';
            drawerFormStatus.type = 'success';
            
            // Set a timeout to clear the message
            setTimeout(() => {
                drawerFormStatus.message = '';
                drawerFormStatus.type = '';
            }, 3000);
        } catch (error) {
            // Error handling
            console.error('Failed to update technician:', error);
            drawerFormStatus.message = error instanceof Error ? error.message : 'Failed to update technician';
            drawerFormStatus.type = 'error';
        } finally {
            drawerFormStatus.submitting = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex h-16 justify-between">
                <div class="flex">
                    <div class="flex flex-shrink-0 items-center">
                        <h1 class="text-xl font-bold text-gray-900">Callboard</h1>
                    </div>
                    <div class="ml-6 flex items-center space-x-4">
                        <a href="/dashboard" class="text-gray-500 hover:text-gray-700">Dashboard</a>
                        <a href="/dashboard/technicians" class="text-indigo-600 font-medium">Technicians</a>
                    </div>
                </div>
                <div class="flex items-center">
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-gray-700">{auth.current.user?.email}</span>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 relative">
        <div class="px-4 sm:px-0">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-semibold text-gray-900">Your Technicians</h2>
            </div>
            
            {#if formStatus.message}
                <div class={`mb-4 p-4 rounded-md ${formStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {formStatus.message}
                </div>
            {/if}

            <!-- Quick Add Form -->
            <div class="bg-white shadow rounded-lg p-4 mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Add Technician</h3>
                
                <form 
                    onsubmit={handleAddTechnician}
                    class="flex flex-wrap items-end gap-3"
                >
                    <div class="sm:w-1/4 w-full">
                        <label for="quickFirstName" class="block text-sm font-medium text-gray-700">First Name*</label>
                        <input
                            type="text"
                            id="quickFirstName"
                            name="firstName"
                            required
                            bind:value={quickFirstName}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    
                    <div class="sm:w-1/4 w-full">
                        <label for="quickLastName" class="block text-sm font-medium text-gray-700">Last Name*</label>
                        <input
                            type="text"
                            id="quickLastName"
                            name="lastName"
                            required
                            bind:value={quickLastName}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    
                    <div class="sm:w-1/4 w-full">
                        <label for="quickPhone" class="block text-sm font-medium text-gray-700">Phone*</label>
                        <input
                            type="tel"
                            id="quickPhone"
                            name="phone"
                            required
                            bind:value={quickPhone}
                            placeholder="(123) 456-7890"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    
                    <div class="sm:w-auto w-full">
                        <button
                            type="submit"
                            disabled={formStatus.submitting}
                            class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {formStatus.submitting ? 'Adding...' : 'Add Technician'}
                        </button>
                    </div>
                </form>
            </div>

            <!-- Technicians List -->
            <div class="bg-white shadow rounded-lg">
                {#if technicians.length === 0}
                    <div class="p-6 text-center">
                        <p class="text-gray-500">No technicians added yet</p>
                    </div>
                {:else}
                    <div class="overflow-hidden">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                {#each technicians as tech}
                                    <tr class="hover:bg-gray-50 cursor-pointer" onclick={() => openTechnicianDrawer(tech)}>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm font-medium text-gray-900">{tech.firstName} {tech.lastName}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">{tech.phone}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tech.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {tech.verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        </div>
    </main>

    <!-- Side drawer for technician details - with semi-transparent background -->
    <div class={`fixed inset-0 overflow-hidden z-50 ${isDrawerOpen ? 'block' : 'hidden'}`}>
        <div class="absolute inset-0 overflow-hidden">
            <!-- Semi-transparent background overlay -->
            <div class="absolute inset-0 bg-gray-500 bg-opacity-30 transition-opacity" onclick={closeDrawer}></div>
            
            <section class="absolute inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
                <div class={`transform transition ease-in-out duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div class="h-full bg-white shadow-xl overflow-y-auto w-screen max-w-md">
                        {#if selectedTechnician}
                            <div class="px-6 py-6 h-full flex flex-col">
                                <div class="flex items-start justify-between">
                                    <h2 class="text-lg font-medium text-gray-900">Technician Details</h2>
                                    <button 
                                        type="button"
                                        class="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                        onclick={closeDrawer}
                                    >
                                        <span class="sr-only">Close panel</span>
                                        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {#if drawerFormStatus.message}
                                    <div class={`mt-4 p-4 rounded-md ${drawerFormStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                        {drawerFormStatus.message}
                                    </div>
                                {/if}
                                
                                <div class="mt-6 flex-1">
                                    <div class="border-t border-gray-200 py-6">
                                        <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                                        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                            <div class="sm:col-span-1">
                                                <dt class="text-sm font-medium text-gray-500">First Name</dt>
                                                <dd class="mt-1 text-sm text-gray-900">{selectedTechnician.firstName}</dd>
                                            </div>
                                            <div class="sm:col-span-1">
                                                <dt class="text-sm font-medium text-gray-500">Last Name</dt>
                                                <dd class="mt-1 text-sm text-gray-900">{selectedTechnician.lastName}</dd>
                                            </div>
                                            <div class="sm:col-span-1">
                                                <dt class="text-sm font-medium text-gray-500">Phone</dt>
                                                <dd class="mt-1 text-sm text-gray-900">{selectedTechnician.phone}</dd>
                                            </div>
                                            <div class="sm:col-span-1">
                                                <dt class="text-sm font-medium text-gray-500">Email</dt>
                                                <dd class="mt-1 text-sm text-gray-900">{selectedTechnician.email || 'Not set'}</dd>
                                            </div>
                                            <div class="sm:col-span-2">
                                                <dt class="text-sm font-medium text-gray-500">Status</dt>
                                                <dd class="mt-1 text-sm text-gray-900">
                                                    <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedTechnician.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {selectedTechnician.verified ? 'Verified' : 'Pending Verification'}
                                                    </span>
                                                </dd>
                                            </div>
                                            <div class="sm:col-span-2">
                                                <dt class="text-sm font-medium text-gray-500">Account Created</dt>
                                                <dd class="mt-1 text-sm text-gray-900">
                                                    {selectedTechnician.createdAt ? new Date(selectedTechnician.createdAt).toLocaleDateString() : 'Unknown'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                    
                                    <div class="border-t border-gray-200 py-6">
                                        <h3 class="text-lg font-medium text-gray-900 mb-4">Company-Specific Settings</h3>
                                        <div class="space-y-4">
                                            <div>
                                                <label class="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                        bind:checked={techVerified}
                                                    />
                                                    <span class="ml-2 text-sm text-gray-600">Verified for assignments</span>
                                                </label>
                                            </div>
                                            
                                            <div>
                                                <label for="techEmail" class="block text-sm font-medium text-gray-700">Email Address</label>
                                                <input
                                                    type="email"
                                                    id="techEmail"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    bind:value={techEmail}
                                                    placeholder="Enter email address"
                                                />
                                            </div>

                                            <div class="pt-5">
                                                <div class="flex justify-end">
                                                    <button
                                                        type="button"
                                                        disabled={drawerFormStatus.submitting}
                                                        onclick={saveTechnicianDetails}
                                                        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                                    >
                                                        {drawerFormStatus.submitting ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </section>
        </div>
    </div>
</div> 