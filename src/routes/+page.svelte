<script lang="ts">
    import { companyAuth } from '$lib/companyAuth';
    import { goto } from '$app/navigation';
    import Login from '$lib/components/Login.svelte';

    const auth = companyAuth.useAuth();
    
    // Redirect to dashboard if user is logged in
    if (auth.current.user) {
        goto('/dashboard');
    }
</script>

<Login />
