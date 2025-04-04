<script lang="ts">
    let { 
        value = $bindable(''),
        label,
        id,
        placeholder = ''
    } = $props<{
        value: string;
        label: string;
        id: string;
        placeholder?: string;
    }>();
</script>

<div>
    <label for={id} class="block text-sm font-medium text-gray-700">{label}</label>
    <input
        type="text"
        {id}
        bind:value
        class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
        {placeholder}
    />
</div> 