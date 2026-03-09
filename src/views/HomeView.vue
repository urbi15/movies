<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import { useRouter } from "vue-router"; // 1. Import routera

const searchQuery = ref("");
const searchResults = ref([]);
const myMovies = ref([]);
const userOpinion = ref("");
const selectedMovie = ref(null);

const router = useRouter(); // 2. Inicjalizacja routera
const tmdbToken = import.meta.env.VITE_TMDB_TOKEN;

// Wyszukiwanie filmów w TMDB
const searchMovies = async () => {
    if (searchQuery.value.length < 3) {
        searchResults.value = [];
        return;
    }

    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${searchQuery.value}&language=pl-PL&include_adult=false`, {
        headers: {
            Authorization: `Bearer ${tmdbToken}`,
            accept: "application/json",
        },
    });
    const data = await response.json();

    // Filtrujemy tylko filmy z plakatem i sensowną liczbą głosów
    searchResults.value = data.results.filter((m) => m.poster_path && m.vote_count > 10).slice(0, 6);
};

const selectMovie = (movie) => {
    selectedMovie.value = movie;
    searchResults.value = [];
    searchQuery.value = movie.title;
};

// Zapisywanie filmu (user_id doda się samo dzięki Default Value: auth.uid() w bazie)
const saveToVault = async () => {
    if (!selectedMovie.value) return;

    const { error } = await supabase.from("movies").insert([
        {
            title: selectedMovie.value.title,
            year: parseInt(selectedMovie.value.release_date?.substring(0, 4)) || 0,
            description: selectedMovie.value.overview,
            opinion: userOpinion.value,
            poster_path: selectedMovie.value.poster_path,
        },
    ]);

    if (!error) {
        selectedMovie.value = null;
        userOpinion.value = "";
        searchQuery.value = "";
        fetchMyMovies();
    } else {
        alert("Błąd zapisu: " + error.message);
    }
};

const fetchMyMovies = async () => {
    const { data } = await supabase.from("movies").select("*").order("created_at", { ascending: false });
    myMovies.value = data;
};

const deleteMovie = async (id) => {
    await supabase.from("movies").delete().eq("id", id);
    fetchMyMovies();
};

// Funkcja wylogowania
const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        router.push("/auth");
    }
};

onMounted(fetchMyMovies);
</script>

<template>
    <div class="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
        <div class="max-w-4xl mx-auto">
            <header class="mb-12 flex justify-between items-start">
                <div>
                    <h1 class="text-4xl font-black text-yellow-500 italic tracking-tighter uppercase">Movie Vault</h1>
                    <p class="text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-1 font-bold">Twoja prywatna baza</p>
                </div>

                <button @click="handleLogout" class="bg-gray-900 hover:bg-red-950/30 text-gray-500 hover:text-red-500 border border-gray-800 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer uppercase tracking-widest">Wyloguj</button>
            </header>

            <section class="mb-12">
                <div class="relative">
                    <input v-model="searchQuery" @input="searchMovies" placeholder="Szukaj filmu..." class="w-full bg-gray-900 p-5 rounded-2xl border border-gray-800 focus:outline-none focus:border-yellow-500 transition-all text-lg shadow-2xl" />

                    <div v-if="searchResults.length" class="absolute w-full bg-gray-900 mt-2 z-20 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                        <div v-for="movie in searchResults" :key="movie.id" @click="selectMovie(movie)" class="p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 flex items-center gap-4 transition-colors text-sm">
                            <img :src="'https://image.tmdb.org/t/p/w92' + movie.poster_path" class="w-10 h-14 rounded object-cover shadow-md" />
                            <div>
                                <div class="font-bold text-base">{{ movie.title }}</div>
                                <div class="text-gray-500">{{ movie.release_date?.substring(0, 4) }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="selectedMovie" class="mt-6 bg-gray-900 p-6 rounded-3xl border border-yellow-500/20 shadow-2xl animate-in fade-in duration-300">
                    <div class="flex gap-6 items-start mb-6">
                        <img :src="'https://image.tmdb.org/t/p/w185' + selectedMovie.poster_path" class="w-24 rounded-xl shrink-0 shadow-2xl" />
                        <div>
                            <h2 class="text-xl font-black">{{ selectedMovie.title }} ({{ selectedMovie.release_date?.substring(0, 4) }})</h2>
                            <p class="text-gray-400 text-sm line-clamp-3">{{ selectedMovie.overview }}</p>
                        </div>
                    </div>

                    <textarea v-model="userOpinion" placeholder="Twoja opinia..." class="w-full bg-black p-4 rounded-xl border border-gray-800 h-24 mb-4 focus:border-yellow-500 outline-none transition-all"></textarea>

                    <div class="flex gap-3">
                        <button @click="saveToVault" class="flex-1 bg-yellow-500 text-black font-black py-4 rounded-xl hover:bg-yellow-400 transition cursor-pointer active:scale-95">DODAJ DO VAULTA</button>
                        <button @click="selectedMovie = null" class="px-8 bg-gray-800 rounded-xl hover:bg-gray-700 transition cursor-pointer font-bold">Anuluj</button>
                    </div>
                </div>
            </section>

            <h2 class="text-2xl font-black italic mb-6">MOJA LISTA</h2>

            <div class="grid grid-cols-1 gap-8">
                <div v-for="movie in myMovies" :key="movie.id" class="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 flex flex-col md:flex-row shadow-xl items-start group">
                    <img :src="'https://image.tmdb.org/t/p/w342' + movie.poster_path" class="w-full md:w-48 h-auto object-cover shrink-0 border-b md:border-b-0 md:border-r border-gray-800 shadow-xl" />

                    <div class="p-6 md:p-8 w-full flex flex-col">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-2xl font-black leading-tight">{{ movie.title }}</h3>
                                <span class="text-yellow-500 font-bold text-lg">{{ movie.year }}</span>
                            </div>
                            <button @click="deleteMovie(movie.id)" class="text-gray-700 hover:text-red-500 transition-colors p-2 cursor-pointer opacity-0 group-hover:opacity-100 font-bold text-xs">USUŃ</button>
                        </div>

                        <p class="text-gray-400 text-sm leading-relaxed mb-6">
                            {{ movie.description || "Brak opisu." }}
                        </p>

                        <div class="mt-auto bg-black/50 p-5 rounded-2xl border border-gray-800/50 relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-1 h-full bg-yellow-500/30"></div>
                            <p class="text-xs font-bold text-yellow-500/50 uppercase mb-2 tracking-tighter">Moja recenzja</p>
                            <p class="text-gray-200 italic font-medium leading-relaxed">"{{ movie.opinion || "Brak opinii." }}"</p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="myMovies.length === 0" class="text-center py-20 text-gray-700">
                <p class="text-xl font-black uppercase italic tracking-widest opacity-20">Twój vault jest pusty</p>
            </div>
        </div>
    </div>
</template>

<style>
/* Subtelna animacja pojawiania się formularza */
.animate-in {
    animation: slideIn 0.3s ease-out;
}
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
