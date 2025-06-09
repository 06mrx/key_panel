<!-- src/routes/admin/users/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import { invalidateAll } from '$app/navigation';
    import NotificationModal from '$lib/components/NotificationModal.svelte';
    import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
    
    interface User {
        id: number;
        username: string;
        created_at: string;
        updated_at: string;
    }

    export let data: PageData & { users: User[] };

    let users = data.users;
    let isModalOpen = false;
    let editingUser: Partial<User> = {};
    let isNewUser = false;
    let password = '';

    // Modal states
    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' | 'info' = 'info';
    let showConfirmation = false;
    let userToDelete: number | null = null;

    function openAddModal() {
        isNewUser = true;
        editingUser = {};
        password = '';
        isModalOpen = true;
    }

    function openEditModal(user: User) {
        isNewUser = false;
        editingUser = { ...user };
        password = '';
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        editingUser = {};
        password = '';
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

    async function handleSubmit() {
        const userData = {
            ...editingUser,
            password: password || undefined
        };

        const url = isNewUser ? '/api/users' : `/api/users/${editingUser.id}`;
        const method = isNewUser ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                await invalidateAll();
                closeModal();
                showSuccess(isNewUser ? 'User berhasil ditambahkan' : 'User berhasil diperbarui');
            } else {
                const error = await response.json();
                showError(error.message || error.error);
            }
        } catch (error) {
            showError('Terjadi kesalahan saat menyimpan data');
        }
    }

    function confirmDelete(id: number) {
        userToDelete = id;
        showConfirmation = true;
    }

    async function handleDelete() {
        if (!userToDelete) return;

        try {
            const response = await fetch(`/api/users/${userToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await invalidateAll();
                showSuccess('User berhasil dihapus');
            } else {
                const error = await response.json();
                showError(error.message || error.error);
            }
        } catch (error) {
            showError('Terjadi kesalahan saat menghapus user');
        } finally {
            userToDelete = null;
            showConfirmation = false;
        }
    }

    $: users = data.users;
</script>

<div class="p-2 sm:p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Users</h1>
        <button
            class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            on:click={openAddModal}
        >
            Tambah User
        </button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each users as user}
                    <tr>
                        <td class="px-3 sm:px-6 py-4 text-sm text-gray-900">{user.username}</td>
                        <td class="px-3 sm:px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleString()}</td>
                        <td class="px-3 sm:px-6 py-4 text-sm text-gray-500">{new Date(user.updated_at).toLocaleString()}</td>
                        <td class="px-3 sm:px-6 py-4 text-sm text-gray-500 space-x-2">
                            <button
                                class="text-indigo-600 hover:text-indigo-900"
                                on:click={() => openEditModal(user)}
                            >
                                Edit
                            </button>
                            <button
                                class="text-red-600 hover:text-red-900"
                                on:click={() => confirmDelete(user.id)}
                            >
                                Hapus
                            </button>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="4" class="px-3 sm:px-6 py-4 text-sm text-center text-gray-500">
                            Tidak ada data user
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Edit/Add Modal -->
    {#if isModalOpen}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30">
            <div class="bg-white/90 backdrop-blur-md rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
                <h2 class="text-lg font-medium text-gray-900 mb-4">
                    {isNewUser ? 'Tambah User' : 'Edit User'}
                </h2>
                <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            bind:value={editingUser.username}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">
                            Password {isNewUser ? '(Required)' : '(Optional)'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            bind:value={password}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required={isNewUser}
                        />
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button
                            type="button"
                            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                            on:click={closeModal}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                        >
                            {isNewUser ? 'Tambah' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
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
    message="Apakah Anda yakin ingin menghapus user ini?"
    type="danger"
    onConfirm={handleDelete}
    onCancel={() => showConfirmation = false}
/> 