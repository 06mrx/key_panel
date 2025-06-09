<!-- src/routes/login/+page.svelte -->
<script lang="ts">
    let username = '';
    let password = '';
    let error = '';
    let isLoading = false;

    async function handleSubmit() {
        isLoading = true;
        error = '';
        
        try {
            const response = await fetch('/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                // Simpan data user ke sessionStorage
                sessionStorage.setItem('user', JSON.stringify({
                    username: username,
                    role: 'admin'  // Karena endpoint auth sudah memverifikasi bahwa ini admin
                }));
                
                // Redirect to admin page on success
                window.location.href = data.redirect;
                return;
            }

            error = data.message || 'Login gagal';
        } catch (err) {
            error = 'Terjadi kesalahan saat login';
            console.error('Login error:', err);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login Admin
        </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
                {#if error}
                    <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span class="block sm:inline">{error}</span>
                    </div>
                {/if}

                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <div class="mt-1">
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            bind:value={username}
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div class="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            bind:value={password}
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Loading...' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div> 