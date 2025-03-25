import type { PageServerLoad } from './$types';

// The auth state is handled client-side by InstantDB
// We don't need to check auth on the server
export const load: PageServerLoad = async () => {
    return {};
}; 