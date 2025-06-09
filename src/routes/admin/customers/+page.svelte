<!-- src/routes/admin/customers/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import { invalidateAll } from '$app/navigation';
    import NotificationModal from '$lib/components/NotificationModal.svelte';
    import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
    
    interface Customer {
        id: number;
        code: string;
        expire_at: string | null;
        maximum_device: number;
        devices: string | null;
        device_name: string | null;
        os_version: string | null;
        fingerprint: string | null;
        created_at: string;
        updated_at: string;
    }

    export let data: PageData & { customers: Customer[] };

    let customers = data.customers;
    let isModalOpen = false;
    let editingCustomer: Partial<Customer> = {};
    let isNewCustomer = false;
    let isResetting = false;

    // Modal states
    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' | 'info' = 'info';
    
    let showConfirmation = false;
    let confirmationMessage = '';
    let confirmationCallback: () => void;
    let confirmationType: 'danger' | 'warning' | 'info' = 'danger';

    // Search and pagination
    let searchQuery = '';
    let currentPage = 1;
    const itemsPerPage = 10;

    // Filter customers based on search query
    $: filteredCustomers = customers.filter((customer: Customer) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            customer.code.toLowerCase().includes(searchLower) ||
            (customer.device_name?.toLowerCase() || '').includes(searchLower) ||
            (customer.os_version?.toLowerCase() || '').includes(searchLower) ||
            (customer.fingerprint?.toLowerCase() || '').includes(searchLower)
        );
    });

    // Calculate pagination
    $: totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    $: paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to first page when search query changes
    $: if (searchQuery) currentPage = 1;

    function formatDeviceInfo(customer: Customer): string {
        const info = [];
        
        if (customer.devices) {
            try {
                const deviceList = JSON.parse(customer.devices);
                if (Array.isArray(deviceList) && deviceList.length > 0) {
                    info.push(`Devices: ${deviceList.join(', ')}`);
                }
            } catch {
                // Invalid JSON, skip
            }
        }
        
        if (customer.device_name) info.push(`Device: ${customer.device_name}`);
        if (customer.os_version) info.push(`OS: ${customer.os_version}`);
        if (customer.fingerprint) info.push(`FP: ${customer.fingerprint}`);
        
        return info.length > 0 ? info.join(' | ') : 'No device info';
    }

    function openAddModal() {
        isNewCustomer = true;
        editingCustomer = {
            maximum_device: 1
        };
        isModalOpen = true;
    }

    function openEditModal(customer: Customer) {
        isNewCustomer = false;
        editingCustomer = { ...customer };
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        editingCustomer = {};
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

    async function handleReset(customer: Customer) {
        confirmationMessage = `Apakah Anda yakin ingin mereset informasi device untuk customer dengan kode ${customer.code}?`;
        confirmationType = 'warning';
        showConfirmation = true;
        confirmationCallback = async () => {
            isResetting = true;
            try {
                const response = await fetch(`/admin/customers/reset/${customer.id}`, {
                    method: 'POST'
                });

                const result = await response.json();

                if (response.ok) {
                    await invalidateAll();
                    showSuccess(result.message);
                } else {
                    showError(result.message || 'Terjadi kesalahan saat mereset device');
                }
            } catch (error) {
                console.error('Error resetting device:', error);
                showError('Terjadi kesalahan saat mereset device');
            } finally {
                isResetting = false;
            }
        };
    }

    async function handleDelete(customer: Customer) {
        confirmationMessage = `Apakah Anda yakin ingin menghapus customer dengan kode ${customer.code}?`;
        confirmationType = 'danger';
        showConfirmation = true;
        confirmationCallback = async () => {
            try {
                const response = await fetch(`/api/customers/${customer.id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await invalidateAll();
                    showSuccess('Customer berhasil dihapus');
                } else {
                    const error = await response.json();
                    showError(error.message || error.error);
                }
            } catch (error) {
                console.error('Error deleting customer:', error);
                showError('Terjadi kesalahan saat menghapus customer');
            }
        };
    }

    async function handleSubmit() {
        const url = isNewCustomer ? '/api/customers' : `/api/customers/${editingCustomer.id}`;
        const method = isNewCustomer ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editingCustomer)
            });

            if (response.ok) {
                await invalidateAll();
                closeModal();
                showSuccess(isNewCustomer ? 'Customer berhasil ditambahkan' : 'Customer berhasil diupdate');
            } else {
                const error = await response.json();
                showError(error.message || error.error);
            }
        } catch (error) {
            console.error('Error submitting customer:', error);
            showError('Terjadi kesalahan saat menyimpan data');
        }
    }

    $: customers = data.customers;
</script>

<div class="p-2 sm:p-4">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Manajemen Customer</h1>
        <button
            class="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            on:click={openAddModal}
        >
            Tambah Customer
        </button>
    </div>

    <!-- Search -->
    <div class="mb-4">
        <div class="relative">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Cari customer..."
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

    <!-- Tabel Customer -->
    <div class="bg-white rounded-lg shadow overflow-x-auto mb-4">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expire At</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Device</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Info</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each paginatedCustomers as customer}
                    <tr>
                        <td class="px-3 sm:px-6 py-4 text-sm">{customer.code}</td>
                        <td class="px-3 sm:px-6 py-4 text-sm">
                            {customer.expire_at ? new Date(customer.expire_at).toLocaleDateString() : '-'}
                        </td>
                        <td class="px-3 sm:px-6 py-4 text-sm">{customer.maximum_device}</td>
                        <td class="px-3 sm:px-6 py-4">
                            <div class="text-xs text-gray-600">
                                {formatDeviceInfo(customer)}
                            </div>
                        </td>
                        <td class="px-3 sm:px-6 py-4 space-x-2 whitespace-nowrap text-sm">
                            <button
                                class="text-indigo-600 hover:text-indigo-900"
                                on:click={() => openEditModal(customer)}
                            >
                                Edit
                            </button>
                            <button
                                class="text-yellow-600 hover:text-yellow-900"
                                on:click={() => handleReset(customer)}
                                disabled={isResetting}
                            >
                                Reset Device
                            </button>
                            <button
                                class="text-red-600 hover:text-red-900"
                                on:click={() => handleDelete(customer)}
                            >
                                Hapus
                            </button>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="5" class="px-3 sm:px-6 py-4 text-sm text-center text-gray-500">
                            {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada data customer'}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
        <div class="flex justify-between items-center text-sm">
            <div class="text-gray-600">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} dari {filteredCustomers.length} data
            </div>
            <div class="flex space-x-2">
                <button
                    class="px-3 py-1 rounded border {currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}"
                    on:click={() => currentPage = Math.max(1, currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                {#each Array(totalPages) as _, i}
                    <button
                        class="px-3 py-1 rounded border {currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}"
                        on:click={() => currentPage = i + 1}
                    >
                        {i + 1}
                    </button>
                {/each}
                <button
                    class="px-3 py-1 rounded border {currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}"
                    on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    {/if}

    <!-- Modal Form -->
    {#if isModalOpen}
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-2 sm:p-4">
            <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                <h2 class="text-xl font-bold mb-4">
                    {isNewCustomer ? 'Tambah Customer Baru' : 'Edit Customer'}
                </h2>
                <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="code">
                            Code
                        </label>
                        <input
                            type="text"
                            id="code"
                            bind:value={editingCustomer.code}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="expire_at">
                            Expire At
                        </label>
                        <input
                            type="datetime-local"
                            id="expire_at"
                            bind:value={editingCustomer.expire_at}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="maximum_device">
                            Maximum Device
                        </label>
                        <input
                            type="number"
                            id="maximum_device"
                            bind:value={editingCustomer.maximum_device}
                            min="1"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    {#if !isNewCustomer}
                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="device_name">
                                Device Name
                            </label>
                            <input
                                type="text"
                                id="device_name"
                                bind:value={editingCustomer.device_name}
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="os_version">
                                OS Version
                            </label>
                            <input
                                type="text"
                                id="os_version"
                                bind:value={editingCustomer.os_version}
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="fingerprint">
                                Fingerprint
                            </label>
                            <input
                                type="text"
                                id="fingerprint"
                                bind:value={editingCustomer.fingerprint}
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    {/if}
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
                            {isNewCustomer ? 'Tambah' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}
</div>

<!-- Add modals at the end of the template -->
<NotificationModal
    bind:show={showNotification}
    message={notificationMessage}
    type={notificationType}
    onClose={() => showNotification = false}
/>

<ConfirmationModal
    bind:show={showConfirmation}
    message={confirmationMessage}
    type={confirmationType}
    onConfirm={() => {
        showConfirmation = false;
        confirmationCallback();
    }}
    onCancel={() => showConfirmation = false}
/> 