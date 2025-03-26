<script lang="ts">
    import { db } from '$lib/db';
    import { goto } from '$app/navigation';

    let email = $state('');
    let sentEmail = $state('');
    let verificationCode = $state('');

    function handleEmailSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!email) return;

        sentEmail = email;
        db.auth.sendMagicCode({ email }).catch((err) => {
            alert('Error: ' + err.body?.message);
            sentEmail = '';
        });
    }

    function handleCodeSubmit(e: SubmitEvent) {
        e.preventDefault();
        db.auth.signInWithMagicCode({ 
            email: sentEmail, 
            code: verificationCode 
        }).catch((err) => {
            alert('Error: ' + err.body?.message);
            verificationCode = '';
        });
    }

    function handleBack() {
        sentEmail = '';
        verificationCode = '';
    }
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
    <div class="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div class="text-center">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900">Welcome to Adminimize Callboard</h2>
            <p class="mt-2 text-sm text-gray-600">
                {#if sentEmail}
                    Enter the verification code sent to {sentEmail}
                {:else}
                    Sign in with your email
                {/if}
            </p>
        </div>

        {#if !sentEmail}
            <form class="mt-8 space-y-6" onsubmit={handleEmailSubmit}>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                    <div class="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            bind:value={email}
                            class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Send Code
                </button>
            </form>
        {:else}
            <form class="mt-8 space-y-6" onsubmit={handleCodeSubmit}>
                <div>
                    <label for="code" class="block text-sm font-medium text-gray-700">Verification Code</label>
                    <div class="mt-1">
                        <input
                            id="code"
                            name="code"
                            type="text"
                            required
                            bind:value={verificationCode}
                            class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div class="flex gap-4">
                    <button
                        type="button"
                        onclick={handleBack}
                        class="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Verify
                    </button>
                </div>
            </form>
        {/if}
    </div>
</div> 