<script lang="ts">
    const { company, onClick } = $props<{
        company: {
            name: string;
            icon?: { url: string };
        };
        onClick?: (e: MouseEvent) => void;
    }>();
</script>

<button
    onclick={onClick}
    class="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-full hover:bg-gray-50 transition-colors"
>
    {#if company.icon?.url}
        <img src={company.icon.url} alt="" class="w-5 h-5 rounded-full object-cover" />
    {/if}
    <span class="text-sm font-medium text-gray-900">{company.name}</span>
</button> 