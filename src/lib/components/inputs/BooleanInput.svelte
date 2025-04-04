<script lang="ts">
    let { 
        value = $bindable(false),
        label,
        id
    } = $props<{
        value: boolean;
        label: string;
        id: string;
    }>();
</script>

<div class="flex items-center">
    <input
        type="checkbox"
        {id}
        bind:checked={value}
        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
    />
    <label for={id} class="ml-2 block text-sm font-medium text-gray-700">{label}</label>
</div> 