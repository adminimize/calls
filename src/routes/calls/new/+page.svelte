<script lang="ts">
    import { companyAuth } from '$lib/companyAuth';
    import { db } from '$lib/db';
    import { id } from '@instantdb/core';
    import { tx } from 'svelte-instantdb';

    // Get auth and data
    const auth = companyAuth.useAuth();
    // Use separate queries to avoid type issues
    const companyQuery = db.useQuery({});
    const roleQuery = db.useQuery({});

    // Set default times for tomorrow 9am - 10pm
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDefault = new Date(tomorrow);
    startDefault.setHours(9, 0, 0, 0);
    
    const endDefault = new Date(tomorrow);
    endDefault.setHours(22, 0, 0, 0);
    
    // Format dates for the input fields (YYYY-MM-DDThh:mm)
    const formatDateForInput = (date: Date): string => {
        return date.toISOString().slice(0, 16);
    };

    // Form state
    let title = $state('');
    let startTime = $state(formatDateForInput(startDefault));
    let endTime = $state(formatDateForInput(endDefault));
    let companyId = $state('');
    let selectedRoles = $state<Array<{ roleId: string; quantity: number; notes: string }>>([]);
    let formStatus = $state({ submitting: false, message: '', type: '' });

    // Mock data until we resolve type issues - replace with proper queries
    const companies = $state([
        { id: "company-1", companyName: "Company Name" }
    ]);
    const roles = $state([
        { id: "role-1", name: "Camera Operator", type: "Technical" },
        { id: "role-2", name: "Director", type: "Creative" },
        { id: "role-3", name: "Audio Engineer", type: "Technical" }
    ]);
    const hasMultipleCompanies = $derived(companies.length > 1);
    
    // If user has only one company, select it automatically
    $effect(() => {
        if (companies.length === 1 && !companyId) {
            companyId = companies[0].id;
        }
    });

    function addRole() {
        selectedRoles = [...selectedRoles, { roleId: '', quantity: 1, notes: '' }];
    }

    function removeRole(index: number) {
        selectedRoles = selectedRoles.filter((_, i) => i !== index);
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!auth.current.user || !companyId) return;
        
        // Set submitting state
        formStatus.submitting = true;
        formStatus.message = '';
        formStatus.type = '';

        try {
            const callId = id();
            // Create transactions for the call and its roles
            const transactions = [
                tx.calls[callId].update({
                    title,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date(endTime).toISOString(),
                    status: 'scheduled',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }).link({ 
                    creator: auth.current.user.id,
                    company: companyId
                }),
                ...selectedRoles.map(role => {
                    const callRoleId = id();
                    return tx.callRoles[callRoleId].update({
                        quantity: role.quantity,
                        notes: role.notes,
                        isGlobalRole: true
                    }).link({
                        call: callId,
                        globalRole: role.roleId
                    });
                })
            ];
            
            // Execute the transactions
            await db.transact(transactions);
            
            // Success handling
            formStatus.message = 'Call created successfully!';
            formStatus.type = 'success';
            
            // Set a short timeout before redirecting to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } catch (err: any) {
            // Error handling
            console.error('Error creating call:', err);
            formStatus.message = err.message || 'Failed to create call';
            formStatus.type = 'error';
        } finally {
            formStatus.submitting = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-3xl">
        <div class="md:flex md:items-center md:justify-between md:space-x-4 xl:border-b xl:pb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">New Call</h1>
            </div>
            <div class="mt-4 flex space-x-3 md:mt-0">
                <a
                    href="/dashboard"
                    class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </a>
            </div>
        </div>

        {#if formStatus.message}
            <div class={`mt-4 p-4 rounded-md ${formStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {formStatus.message}
            </div>
        {/if}

        <form onsubmit={handleSubmit} class="mt-8 space-y-8 divide-y divide-gray-200">
            <div class="space-y-6">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <div class="mt-1">
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            bind:value={title}
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                {#if hasMultipleCompanies}
                <div>
                    <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
                    <div class="mt-1">
                        <select
                            id="company"
                            required
                            bind:value={companyId}
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Select a company</option>
                            {#each companies as company}
                                <option value={company.id}>{company.companyName}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                {/if}

                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label for="startTime" class="block text-sm font-medium text-gray-700">Start Time</label>
                        <div class="mt-1">
                            <input
                                type="datetime-local"
                                name="startTime"
                                id="startTime"
                                required
                                bind:value={startTime}
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label for="endTime" class="block text-sm font-medium text-gray-700">End Time</label>
                        <div class="mt-1">
                            <input
                                type="datetime-local"
                                name="endTime"
                                id="endTime"
                                required
                                bind:value={endTime}
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="pt-8">
                <div>
                    <h3 class="text-lg font-medium leading-6 text-gray-900">Roles</h3>
                    <p class="mt-1 text-sm text-gray-500">Add the roles needed for this call.</p>
                </div>

                <div class="mt-6 space-y-6">
                    {#each selectedRoles as role, index}
                        <div class="flex items-center gap-4">
                            <div class="flex-grow">
                                <select
                                    bind:value={role.roleId}
                                    required
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select a role</option>
                                    {#each roles as availableRole}
                                        <option value={availableRole.id}>{availableRole.name} ({availableRole.type})</option>
                                    {/each}
                                </select>
                            </div>
                            <div class="w-24">
                                <input
                                    type="number"
                                    bind:value={role.quantity}
                                    min="1"
                                    required
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Qty"
                                />
                            </div>
                            <div class="flex-grow">
                                <input
                                    type="text"
                                    bind:value={role.notes}
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Notes"
                                />
                            </div>
                            <button
                                type="button"
                                onclick={() => removeRole(index)}
                                class="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    {/each}

                    <button
                        type="button"
                        onclick={addRole}
                        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Add Role
                    </button>
                </div>
            </div>

            <div class="pt-5">
                <div class="flex justify-end">
                    <button
                        type="submit"
                        disabled={formStatus.submitting}
                        class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {formStatus.submitting ? 'Creating...' : 'Create Call'}
                    </button>
                </div>
            </div>
        </form>
    </div>
</div> 