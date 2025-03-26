<script lang="ts">
    import MonthCalendar from '../../../components/MonthCalendar.svelte';
    import { companyAuth } from '$lib/companyAuth';
    
    const auth = companyAuth.useAuth();
</script>

<div class="min-h-screen bg-gray-50">
    <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div class="px-4 sm:px-0">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-semibold text-gray-900">Calendar</h2>
            </div>
            
            <div class="bg-white shadow rounded-lg h-[calc(100vh-12rem)]">
                <MonthCalendar />
            </div>
        </div>
    </main>
</div> 