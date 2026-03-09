import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../lib/supabase";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);

  // Funkcja sprawdzająca stan sesji
  async function initialize() {
    const { data } = await supabase.auth.getSession();
    user.value = data.session?.user || null;

    // Słuchacz zmian (logowanie/wylogowanie)
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null;
    });
  }

  return { user, initialize };
});
