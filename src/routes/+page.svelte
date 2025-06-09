<script lang="ts">
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    
    const slides = [
        {
            image: '/tutorial/1.jpeg',
            title: 'Izinkan Overlay',
            description: 'Izinkan aplikasi untuk berjalan di atas aplikasi lain untuk membantu menyelesaikan soal'
        },
        {
            image: '/tutorial/2.jpeg',
            title: 'Klik Tombol Mulai',
            description: 'Klik tombol mulai untuk memulai penggunaan kuis helper'
        },
        {
            image: '/tutorial/3.jpeg',
            title: 'Atur Posisi',
            description: 'Sesuaikan posisi kotak merah dengan posisi soal yang ingin diselesaikan'
        },
        {
            image: '/tutorial/4.jpeg',
            title: 'Klik Tombol Helper',
            description: 'Klik tombol untuk mendapatkan jawaban dari soal yang ditampilkan'
        },
        {
            image: '/tutorial/5.jpeg',
            title: 'Stop Helper',
            description: 'Klik tombol stop untuk menghentikan penggunaan kuis helper'
        }
    ];

    let currentSlide = 0;
    let autoplayInterval: NodeJS.Timeout;
    let direction = 1;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    function handleDragStart(event: MouseEvent | TouchEvent) {
        isDragging = true;
        startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        currentX = startX;
        clearInterval(autoplayInterval);
        
        if ('touches' in event) {
            document.addEventListener('touchmove', handleDragMove);
            document.addEventListener('touchend', handleDragEnd);
        } else {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
        }
    }

    function handleDragMove(event: MouseEvent | TouchEvent) {
        if (!isDragging) return;
        currentX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    }

    function handleDragEnd(event: MouseEvent | TouchEvent) {
        if (!isDragging) return;
        isDragging = false;
        
        const deltaX = currentX - startX;
        const threshold = 50; // Threshold dalam pixel
        
        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0 && currentSlide > 0) {
                direction = -1;
                currentSlide--;
            } else if (deltaX < 0 && currentSlide < slides.length - 1) {
                direction = 1;
                currentSlide++;
            }
        }
        
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
        
        startAutoplay();
    }

    function nextSlide() {
        direction = 1;
        currentSlide = (currentSlide + 1) % slides.length;
    }

    function prevSlide() {
        direction = -1;
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    }

    function goToSlide(index: number) {
        direction = index > currentSlide ? 1 : -1;
        currentSlide = index;
    }

    function startAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(nextSlide, 5000);
    }

    onMount(() => {
        startAutoplay();
        return () => clearInterval(autoplayInterval);
    });
</script>

<div class="min-h-screen bg-gradient-to-b from-indigo-100 to-white">
    <!-- Hero Section -->
    <div class="w-full px-4 py-16 sm:py-24">
        <div class="text-center">
            <h1 class="text-4xl sm:text-6xl font-bold text-indigo-600 mb-6">
                JKuis Helper
            </h1>
            <p class="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Solusi cerdas untuk membantu Anda menyelesaikan soal-soal game kuis dengan mudah dan cepat.
            </p>
        </div>
    </div>

    <!-- Tutorial Slider -->
    <div class="w-full px-4 py-8 bg-white">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">
            Cara Penggunaan
        </h2>
        <div class="relative max-w-[500px] mx-auto mb-12">
            <div 
                class="relative w-full rounded-xl overflow-hidden shadow-lg cursor-grab active:cursor-grabbing"
            >
                <div 
                    class="relative w-full h-0 pb-[133.33%] bg-sky-200 overflow-hidden"
                    on:mousedown|preventDefault={handleDragStart}
                    on:touchstart|preventDefault={handleDragStart}
                >
                    <!-- Slides -->
                    {#each slides as slide, i}
                        {#if i === currentSlide}
                            <div 
                                class="absolute inset-0 select-none"
                                in:fly={{ x: 100 * direction, duration: 300 }}
                                out:fly={{ x: -100 * direction, duration: 300 }}
                            >
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    class="w-full h-full object-contain bg-sky-200"
                                    draggable="false"
                                />
                            </div>
                        {/if}
                    {/each}

                    <!-- Navigation Buttons -->
                    <button
                        class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
                        on:click={prevSlide}
                    >
                        ←
                    </button>
                    <button
                        class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
                        on:click={nextSlide}
                    >
                        →
                    </button>

                    <!-- Dots Navigation -->
                    <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                        {#each slides as _, i}
                            <button
                                class="w-2.5 h-2.5 rounded-full transition-colors {i === currentSlide ? 'bg-sky-500' : 'bg-sky-200 hover:bg-sky-300'}"
                                on:click={() => goToSlide(i)}
                            />
                        {/each}
                    </div>
                </div>

                <!-- Title and Description -->
                <div class="p-4 bg-white">
                    {#each slides as slide, i}
                        {#if i === currentSlide}
                            <div 
                                class="select-none"
                                in:fly={{ y: 20, duration: 300, delay: 200 }}
                                out:fly={{ y: -20, duration: 200 }}
                            >
                                <h3 class="text-xl font-semibold text-gray-900 mb-2">{slide.title}</h3>
                                <p class="text-gray-600">{slide.description}</p>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Features Section -->
    <div class="w-full px-4 py-16 bg-white">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">
                Fitur Utama
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Feature 1 -->
                <div class="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
                    <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Jawaban Akurat</h3>
                    <p class="text-gray-600">
                        Dapatkan jawaban yang tepat dan akurat untuk setiap soal kuis yang Anda hadapi.
                    </p>
                </div>

                <!-- Feature 2 -->
                <div class="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
                    <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Respon Cepat</h3>
                    <p class="text-gray-600">
                        Dapatkan jawaban dengan cepat sehingga Anda tidak kehilangan waktu berharga dalam permainan.
                    </p>
                </div>

                <!-- Feature 3 -->
                <div class="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
                    <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Aman & Terpercaya</h3>
                    <p class="text-gray-600">
                        Sistem keamanan yang kuat dengan autentikasi perangkat untuk melindungi akses Anda.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="w-full px-4 py-8 bg-gray-50">
        <div class="text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} JKuis Helper. All rights reserved.</p>
        </div>
    </footer>
</div>

<style>
    .transition-opacity {
        transition: opacity 0.5s ease-in-out;
    }
    .select-none {
        user-select: none;
        -webkit-user-select: none;
    }
</style>
