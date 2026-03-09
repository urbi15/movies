<script setup>
import { ref } from "vue";
import { supabase } from "../lib/supabase";
import { useRouter } from "vue-router";

const router = useRouter(); // 2. Zainicjalizuj router
const email = ref("");
const password = ref("");
const isRegister = ref(false);

const handleAuth = async () => {
    const { data, error } = isRegister.value ? await supabase.auth.signUp({ email: email.value, password: password.value }) : await supabase.auth.signInWithPassword({ email: email.value, password: password.value });

    if (error) {
        alert("Błąd: " + error.message);
    } else {
        // Jeśli to był login (nie rejestracja), to od razu leć do Home
        if (!isRegister.value) {
            router.push("/");
        } else {
            // Jeśli rejestracja, to sprawdź czy użytkownik od razu dostał sesję
            if (data.session) {
                router.push("/");
            } else {
                alert("Rejestracja udana! Sprawdź maila, jeśli nie wyłączyłeś potwierdzenia.");
            }
        }
    }
};
</script>

<template>
    <div class="min-h-screen bg-black flex items-center justify-center p-6">
        <div class="bg-gray-900 p-8 rounded-3xl border border-gray-800 w-full max-w-md shadow-2xl">
            <h1 class="text-3xl font-black text-yellow-500 mb-6 italic">
                {{ isRegister ? "DOŁĄCZ DO VAULTA" : "ZALOGUJ SIĘ" }}
            </h1>

            <form @submit.prevent="handleAuth" class="space-y-4">
                <input v-model="email" type="email" placeholder="Email" class="w-full bg-black p-4 rounded-xl border border-gray-800 outline-none focus:border-yellow-500 text-white" required />
                <input v-model="password" type="password" placeholder="Hasło" class="w-full bg-black p-4 rounded-xl border border-gray-800 outline-none focus:border-yellow-500 text-white" required />

                <button type="submit" class="w-full bg-yellow-500 text-black font-black py-4 rounded-xl hover:bg-yellow-400 transition cursor-pointer active:scale-95">
                    {{ isRegister ? "ZAREJESTRUJ SIĘ" : "WEJDŹ" }}
                </button>

                <p @click="isRegister = !isRegister" class="text-center text-gray-500 text-sm cursor-pointer hover:text-white transition">
                    {{ isRegister ? "Masz już konto? Zaloguj się" : "Nie masz konta? Załóż je" }}
                </p>
            </form>
        </div>
    </div>
</template>
