<script lang="ts">
    import { page } from '$app/state';
</script>

<div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="py-4">
                <h1 class="text-lg font-semibold text-gray-900">Companies</h1>
            </div>
        </div>
    </header>

    <main>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="py-6">
                <slot />
            </div>
        </div>
    </main>
</div> 