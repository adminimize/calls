<script lang="ts">
    import { companyAuth } from '$lib/companyAuth';
    import { db } from '$lib/db';
    import { id } from '@instantdb/core';
    import { tx } from 'svelte-instantdb';
    import { onMount } from 'svelte';
    import type { AppSchema } from '../../instant.schema';

    // Type for globalRole
    interface GlobalRole {
        id: string;
        name: string;
        type: string;
    }

    // Get auth and data
    const auth = companyAuth.useAuth();
    
    // Query for globalRoles from the database
    const query = db.useQuery({
        globalRoles: {}
    });

    // Check if we need to initialize default global roles
    $effect(() => {
        if (query.current.data?.globalRoles && query.current.data.globalRoles.length === 0) {
            initializeDefaultRoles();
        }
    });

    // Function to initialize default global roles if none exist
    async function initializeDefaultRoles() {
        const defaultRoles = [
            { name: "Camera Operator", type: "Technical" },
            { name: "Director", type: "Creative" },
            { name: "Audio Engineer", type: "Technical" },
            { name: "Production Assistant", type: "Support" },
            { name: "Lighting Technician", type: "Technical" }
        ];
        
        try {
            const transactions = defaultRoles.map(role => {
                const roleId = id();
                return tx.globalRoles[roleId].update(role);
            });
            
            await db.transact(transactions);
            console.log("Default global roles initialized successfully");
        } catch (err) {
            console.error("Error initializing default global roles:", err);
        }
    }

    // Call creation modal state
    let isModalOpen = $state(false);
    let formStatus = $state({ submitting: false, message: '', type: '' });

    // SMS widget state
    let isSmsModalOpen = $state(false);
    let phoneNumber = $state('');
    let smsMessage = $state('');
    let smsStatus = $state({ submitting: false, message: '', type: '' });

    // Form state
    let title = $state('');
    let startTime = $state('');
    let endTime = $state('');
    let selectedRoles = $state<Array<{ roleId: string; quantity: number; notes: string }>>([]);
    
    // Mock data until we properly query it
    const companies = $state([
        { id: "company-1", companyName: "Company Name" }
    ]);
    
    // Get roles from database query
    const globalRoles = $derived(query.current.data?.globalRoles || []);
    
    // Get company ID (assuming single company for now)
    let companyId = companies[0]?.id;
    
    // Derived state - using an empty array since calls aren't properly defined in the schema yet
    const calls = $derived([]);
    
    // Set default times for tomorrow 9am - 10pm
    function setDefaultTimes() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const startDefault = new Date(tomorrow);
        startDefault.setHours(9, 0, 0, 0);
        
        const endDefault = new Date(tomorrow);
        endDefault.setHours(22, 0, 0, 0);
        
        // Format dates for the input fields (YYYY-MM-DDThh:mm)
        startTime = startDefault.toISOString().slice(0, 16);
        endTime = endDefault.toISOString().slice(0, 16);
    }

    function openModal() {
        // Reset form
        title = '';
        selectedRoles = [];
        formStatus.message = '';
        formStatus.type = '';
        
        // Set default times
        setDefaultTimes();
        
        // Open modal
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
    }

    function addRole() {
        selectedRoles = [...selectedRoles, { roleId: '', quantity: 1, notes: '' }];
    }

    function removeRole(index: number) {
        selectedRoles = selectedRoles.filter((_, i) => i !== index);
    }

    async function handleCreateCall(e: Event) {
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
            
            // Close modal after a delay
            setTimeout(() => {
                closeModal();
            }, 1500);
        } catch (err: any) {
            // Error handling
            console.error('Error creating call:', err);
            formStatus.message = err.message || 'Failed to create call';
            formStatus.type = 'error';
        } finally {
            formStatus.submitting = false;
        }
    }

    function handleSignOut() {
        companyAuth.signOut();
    }
    
    function openSmsModal() {
        // Reset form
        phoneNumber = '';
        smsMessage = '';
        smsStatus.message = '';
        smsStatus.type = '';
        
        // Open modal
        isSmsModalOpen = true;
    }
    
    function closeSmsModal() {
        isSmsModalOpen = false;
    }
    
    async function handleSendSms(e: Event) {
        e.preventDefault();
        
        // Set submitting state
        smsStatus.submitting = true;
        smsStatus.message = '';
        smsStatus.type = '';
        
        try {
            const response = await fetch('/api/sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient: phoneNumber,
                    message: smsMessage
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                smsStatus.message = 'SMS sent successfully!';
                smsStatus.type = 'success';
                
                // Close modal after a delay
                setTimeout(() => {
                    closeSmsModal();
                }, 1500);
            } else {
                smsStatus.message = result.error || 'Failed to send SMS';
                smsStatus.type = 'error';
            }
        } catch (err: any) {
            // Error handling
            console.error('Error sending SMS:', err);
            smsStatus.message = err.message || 'Failed to send SMS';
            smsStatus.type = 'error';
        } finally {
            smsStatus.submitting = false;
        }
    }
</script>

{#if auth.current.isLoading}
    <div class="flex min-h-screen items-center justify-center">
        <div class="text-gray-600">Loading...</div>
    </div>
{:else if auth.current.error}
    <div class="flex min-h-screen items-center justify-center">
        <div class="text-red-600">Error: {auth.current.error.message}</div>
    </div>
{:else if auth.current.user}
    {@render dashboard()}
{:else}
    <div class="flex min-h-screen items-center justify-center">
        <div class="text-gray-600">Redirecting to login...</div>
    </div>
{/if}

{#snippet dashboard()}
    <div class="min-h-screen bg-gray-50">
        <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div class="px-4 sm:px-0">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold text-gray-900">Your Calls</h2>
                    <button
                        onclick={openModal}
                        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        Create Call
                    </button>
                </div>

                <!-- Grid of feature buttons -->
                <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <a href="/dashboard/technicians" class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="absolute inset-0" aria-hidden="true"></span>
                            <p class="text-sm font-medium text-gray-900">Technicians</p>
                            <p class="text-sm text-gray-500 truncate">Manage your technician roster</p>
                        </div>
                    </a>

                    <a href="/calls/new" class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="absolute inset-0" aria-hidden="true"></span>
                            <p class="text-sm font-medium text-gray-900">New Call</p>
                            <p class="text-sm text-gray-500 truncate">Create a new call sheet</p>
                        </div>
                    </a>

                    <a href="#" class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="absolute inset-0" aria-hidden="true"></span>
                            <p class="text-sm font-medium text-gray-900">Company Settings</p>
                            <p class="text-sm text-gray-500 truncate">Manage your company profile</p>
                        </div>
                    </a>
                    
                    <button
                        onclick={openSmsModal}
                        class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                        <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">Send SMS</p>
                            <p class="text-sm text-gray-500 truncate">Notify crew via text message</p>
                        </div>
                    </button>
                </div>

                <div class="bg-white shadow rounded-lg divide-y divide-gray-200">
                    <div class="p-6">
                        <p class="text-gray-500">No calls scheduled yet</p>
                        <div class="mt-4">
                            <a href="/dashboard/debug" class="text-xs text-indigo-600 hover:text-indigo-800">
                                Debug Schema
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Create Call Modal -->
    {#if isModalOpen}
        <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <!-- Background overlay - removed bg-opacity-75 -->
                <div class="fixed inset-0 bg-gray-500 transition-opacity" onclick={closeModal}></div>
                
                <!-- Modal panel -->
                <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 class="text-lg leading-6 font-medium text-gray-900">Create New Call</h3>
                                
                                {#if formStatus.message}
                                    <div class={`mt-4 p-4 rounded-md ${formStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                        {formStatus.message}
                                    </div>
                                {/if}
                                
                                <div class="mt-4">
                                    <form onsubmit={handleCreateCall} class="space-y-6">
                                        <div>
                                            <label for="title" class="block text-sm font-medium text-gray-700">Call Title</label>
                                            <div class="mt-1">
                                                <input 
                                                    type="text" 
                                                    id="title" 
                                                    name="title" 
                                                    required 
                                                    bind:value={title}
                                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label for="startTime" class="block text-sm font-medium text-gray-700">Start Time</label>
                                                <div class="mt-1">
                                                    <input 
                                                        type="datetime-local" 
                                                        id="startTime" 
                                                        name="startTime" 
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
                                                        id="endTime" 
                                                        name="endTime" 
                                                        required 
                                                        bind:value={endTime}
                                                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div class="flex justify-between items-center mb-2">
                                                <h4 class="text-sm font-medium text-gray-700">Required Roles</h4>
                                                <button
                                                    type="button"
                                                    onclick={addRole}
                                                    class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Add Role
                                                </button>
                                            </div>
                                            
                                            {#if selectedRoles.length === 0}
                                                <div class="text-sm text-gray-500 italic">No roles added yet</div>
                                            {:else}
                                                <div class="space-y-3">
                                                    {#each selectedRoles as role, index}
                                                        <div class="flex items-center gap-3">
                                                            <div class="flex-grow">
                                                                <select
                                                                    bind:value={role.roleId}
                                                                    required
                                                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                >
                                                                    <option value="">Select a role</option>
                                                                    {#each globalRoles as availableRole}
                                                                        <option value={availableRole.id}>{availableRole.name} ({availableRole.type})</option>
                                                                    {/each}
                                                                </select>
                                                            </div>
                                                            <div class="w-20">
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
                                                                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    {/each}
                                                </div>
                                            {/if}
                                        </div>
                                        
                                        <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                            <button
                                                type="button"
                                                onclick={closeModal}
                                                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={formStatus.submitting}
                                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                            >
                                                {formStatus.submitting ? 'Creating...' : 'Create Call'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
    
    <!-- SMS Modal -->
    {#if isSmsModalOpen}
        <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <!-- Background overlay - removed bg-opacity-75 -->
                <div class="fixed inset-0 bg-gray-500 transition-opacity" onclick={closeSmsModal}></div>
                
                <!-- Modal panel -->
                <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 class="text-lg leading-6 font-medium text-gray-900">Send SMS Notification</h3>
                                
                                {#if smsStatus.message}
                                    <div class={`mt-4 p-4 rounded-md ${smsStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                        {smsStatus.message}
                                    </div>
                                {/if}
                                
                                <div class="mt-4">
                                    <form onsubmit={handleSendSms} class="space-y-6">
                                        <div>
                                            <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number</label>
                                            <div class="mt-1">
                                                <input 
                                                    type="tel" 
                                                    id="phoneNumber" 
                                                    name="phoneNumber" 
                                                    required 
                                                    bind:value={phoneNumber}
                                                    placeholder="+1XXXXXXXXXX"
                                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                                <p class="mt-1 text-xs text-gray-500">Include country code (e.g. +1 for US)</p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label for="smsMessage" class="block text-sm font-medium text-gray-700">Message</label>
                                            <div class="mt-1">
                                                <textarea 
                                                    id="smsMessage" 
                                                    name="smsMessage" 
                                                    required 
                                                    bind:value={smsMessage}
                                                    rows="4"
                                                    maxlength="160"
                                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                ></textarea>
                                                <p class="mt-1 text-xs text-gray-500">{smsMessage.length}/160 characters</p>
                                            </div>
                                        </div>
                                        
                                        <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                            <button
                                                type="button"
                                                onclick={closeSmsModal}
                                                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={smsStatus.submitting}
                                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                            >
                                                {smsStatus.submitting ? 'Sending...' : 'Send SMS'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
{/snippet} 