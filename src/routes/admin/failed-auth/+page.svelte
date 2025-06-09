<!-- src/routes/admin/failed-auth/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import { invalidateAll } from '$app/navigation';
    import NotificationModal from '$lib/components/NotificationModal.svelte';
    import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
    
    interface FailedAuth {
        id: number;
        code: string;
        device_name: string | null;
        os_version: string | null;
        fingerprint: string | null;
        created_at: string;
    }

    export let data: PageData & { failedAuths: FailedAuth[] };

    let failedAuths = data.failedAuths;

    // Search and pagination
    let searchQuery = '';
    let currentPage = 1;
    const itemsPerPage = 10;

    // Modal states
    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' | 'info' = 'info';
    let showConfirmation = false;
    let logToDelete: number | null = null;

    // Filter failed auths based on search query
    $: filteredFailedAuths = failedAuths.filter((auth: FailedAuth) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            auth.code.toLowerCase().includes(searchLower) ||
            (auth.device_name?.toLowerCase() || '').includes(searchLower) ||
            (auth.os_version?.toLowerCase() || '').includes(searchLower) ||
            (auth.fingerprint?.toLowerCase() || '').includes(searchLower)
        );
    });

    // Calculate pagination
    $: totalPages = Math.ceil(filteredFailedAuths.length / itemsPerPage);
    $: paginatedFailedAuths = filteredFailedAuths.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to first page when search query changes
    $: if (searchQuery) currentPage = 1;

    function formatDeviceInfo(auth: FailedAuth): string {
        const info = [];
        
        if (auth.device_name) info.push(`Device: ${auth.device_name}`);
        if (auth.os_version) info.push(`OS: ${auth.os_version}`);
        if (auth.fingerprint) info.push(`FP: ${auth.fingerprint}`);
        
        return info.length > 0 ? info.join(' | ') : 'No device info';
    }

    function showError(message: string) {
        notificationMessage = message;
        notificationType = 'error';
        showNotification = true;
    }

    function showSuccess(message: string) {
        notificationMessage = message;
        notificationType = 'success';
        showNotification = true;
    }

    function confirmDelete(id: number) {
        logToDelete = id;
        showConfirmation = true;
    }

    async function handleDelete() {
        if (!logToDelete) return;

        try {
            const response = await fetch(`/api/failed-auth/${logToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await invalidateAll();
                showSuccess('Log berhasil dihapus');
            } else {
                const error = await response.json();
                showError(error.message || error.error);
            }
        } catch (error) {
            showError('Terjadi kesalahan saat menghapus log');
        } finally {
            logToDelete = null;
            showConfirmation = false;
        }
    }

    $: failedAuths = data.failedAuths;
</script>

<div class="p-2 sm:p-4">
    <div class="mb-4">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Failed Auth Log</h1>
    </div>

    <!-- Search -->
    <div class="mb-4">
        <div class="relative">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Cari log..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            {#if searchQuery}
                <button
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    on:click={() => searchQuery = ''}
                >
                    ✕
                </button>
            {/if}
        </div>
    </div>

    <!-- Tabel Failed Auth -->
    <div class="bg-white rounded-lg shadow overflow-x-auto mb-4">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Info</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each paginatedFailedAuths as auth}
                    <tr>
                        <td class="px-3 sm:px-6 py-4 text-sm text-gray-900">{auth.code}</td>
                        <td class="px-3 sm:px-6 py-4">
                            <div class="text-xs text-gray-600">
                                {formatDeviceInfo(auth)}
                            </div>
                        </td>
                        <td class="px-3 sm:px-6 py-4 text-sm text-gray-500">
                            {new Date(auth.created_at).toLocaleString()}
                        </td>
                        <td class="px-3 sm:px-6 py-4 text-sm">
                            <button
                                class="text-red-600 hover:text-red-900"
                                on:click={() => confirmDelete(auth.id)}
                            >
                                Hapus
                            </button>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="4" class="px-3 sm:px-6 py-4 text-sm text-center text-gray-500">
                            {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada data log'}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
        <div class="flex justify-center space-x-2">
            <button
                class="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                disabled={currentPage === 1}
                on:click={() => currentPage--}
            >
                Previous
            </button>
            <span class="px-3 py-1">
                Page {currentPage} of {totalPages}
            </span>
            <button
                class="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                disabled={currentPage === totalPages}
                on:click={() => currentPage++}
            >
                Next
            </button>
        </div>
    {/if}
</div>

<!-- Notification Modal -->
<NotificationModal
    bind:show={showNotification}
    message={notificationMessage}
    type={notificationType}
    onClose={() => showNotification = false}
/>

<!-- Confirmation Modal -->
<ConfirmationModal
    bind:show={showConfirmation}
    title="Konfirmasi Hapus"
    message="Apakah Anda yakin ingin menghapus log ini?"
    type="danger"
    onConfirm={handleDelete}
    onCancel={() => showConfirmation = false}
/> 