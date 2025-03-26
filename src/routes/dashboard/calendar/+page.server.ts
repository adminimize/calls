import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Protect the route - redirect if no session
export const load: PageServerLoad = async ({ locals }) => {
    // This page has client-side authentication in the auth.useAuth() hook
    // We'll return an empty object as data
    return {};
}; 