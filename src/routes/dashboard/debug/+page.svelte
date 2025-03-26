<script lang="ts">
    import { db } from '$lib/db';
    import schema from '../../../instant.schema';
    import { id, tx } from 'svelte-instantdb';

    // Debug query to check all available entities
    const query = db.useQuery({
        globalRoles: {},
        calls: {},
        technicians: {}
    });

    // Debug function to add a global role
    async function addTestRole() {
        try {
            const roleId = id();
            console.log("Generated role ID:", roleId);
            
            await db.transact(
                tx.globalRoles[roleId].update({
                    name: "Test Role " + new Date().toISOString().slice(11, 19),
                    type: "Debug"
                })
            );
            
            console.log("Test role added successfully");
        } catch (err) {
            console.error("Error adding test role:", err);
        }
    }
    
    // Debug state
    const schemaInfo = {
        hasGlobalRoles: 'globalRoles' in schema.entities,
        globalRolesEntity: schema.entities.globalRoles,
        entities: Object.keys(schema.entities),
        links: Object.keys(schema.links)
    };
    
    // Current data
    const globalRoles = $derived(query.current.data?.globalRoles || []);
    const calls = $derived(query.current.data?.calls || []);
    const technicians = $derived(query.current.data?.technicians || []);
</script>

<div class="min-h-screen bg-gray-50">
    <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div class="px-4 sm:px-0">
            <div class="bg-white shadow rounded-lg p-6">
                <h2 class="text-xl font-bold mb-4">Schema Debug Info</h2>
                
                <div class="mb-6">
                    <h3 class="font-semibold">Schema Structure:</h3>
                    <pre class="mt-2 bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(schemaInfo, null, 2)}</pre>
                </div>
                
                <div class="mb-6">
                    <h3 class="font-semibold">Global Roles ({globalRoles.length}):</h3>
                    <button onclick={addTestRole} class="mt-2 mb-4 bg-blue-500 text-white px-3 py-1 rounded">
                        Add Test Role
                    </button>
                    <pre class="mt-2 bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(globalRoles, null, 2)}</pre>
                </div>
                
                <div class="mb-6">
                    <h3 class="font-semibold">Calls ({calls.length}):</h3>
                    <pre class="mt-2 bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(calls, null, 2)}</pre>
                </div>
                
                <div class="mb-6">
                    <h3 class="font-semibold">Technicians ({technicians.length}):</h3>
                    <pre class="mt-2 bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(technicians, null, 2)}</pre>
                </div>
                
                <a href="/dashboard" class="text-indigo-600 hover:text-indigo-800">
                    ← Back to Dashboard
                </a>
            </div>
        </div>
    </main>
</div> 