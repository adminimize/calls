import { db } from '$lib/db';
import type { PageLoad } from './$types';

export const load = (({ params }) => {
    const { id } = params;
    
    return {
        // Return the query function that will run in the browser
        company: () => {
            const query = db.useQuery({
                simpleCompanies: {
                    $: {
                        where: { id }
                    },
                    icon: {}
                }
            });
            return query;
        }
    };
}) satisfies PageLoad; 