import { init, i } from 'svelte-instantdb';
import { id } from '@instantdb/core';

// App ID for the InstantDB application
export const APP_ID = "e3396391-6dad-4872-aa77-f74ff792dd7f";

// Define schema - just basic functionality
export const schema = i.schema({
    entities: {
        $users: i.entity({
            email: i.string().unique().indexed()
        }),
        companyProfiles: i.entity({
            companyName: i.string(),
            isCompanyAdmin: i.boolean(),
            userId: i.string().unique()
        }),
        technicians: i.entity({
            firstName: i.string(),
            lastName: i.string(),
            phone: i.string(),
            email: i.string(),
            verified: i.boolean(),
            createdAt: i.any()
        })
    },
    links: {
        userProfile: {
            forward: { on: 'companyProfiles', has: 'one', label: '$user' },
            reverse: { on: '$users', has: 'one', label: 'profile' }
        }
    }
});

console.log("Initializing InstantDB with APP_ID:", APP_ID);
// console.log("Schema structure:", JSON.stringify(schema, null, 2));

// Initialize InstantDB client
export const db = init({
    appId: APP_ID,
    schema,
});

console.log("Database initialized:", !!db);
console.log("Database functions:", {
    hasTransact: !!db?.transact,
    hasTx: !!db?.tx,
    hasUseQuery: !!db?.useQuery
});

// LogDbStatus utility function
export function logDbStatus() {
  console.log("InstantDB Status:", {
    appId: APP_ID,
    isInitialized: !!db,
    hasTransact: !!db?.transact,
    hasTx: !!db?.tx,
    hasUseQuery: !!db?.useQuery,
    schema: !!schema
  });
}

// Import tx and id for use in our functions
import { tx } from 'svelte-instantdb';

/**
 * Add a technician to the database
 * This function should only be called from client components, not server code
 */
export async function addTechnician(data: any) {
  console.log("addTechnician called with data:", JSON.stringify(data, null, 2));
  
  try {
    // Generate an ID
    const techId = id();
    console.log("Generated ID:", techId);
    
    // Use the proper transaction format with tx helper
    const result = await db.transact(tx.technicians[techId].update(data));
    console.log("Transaction successful:", result);
    return { success: true, id: techId, result };
  } catch (err) {
    console.error("Error in addTechnician:", err);
    console.error("Error name:", err instanceof Error ? err.name : 'Unknown');
    console.error("Error message:", err instanceof Error ? err.message : String(err));
    console.error("Error stack:", err instanceof Error ? err.stack : 'Unknown');
    throw err;
  }
}

// Export commonly used utilities
export { tx, id } from 'svelte-instantdb'; 