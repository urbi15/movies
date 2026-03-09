import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import HomeView from "../views/HomeView.vue";
import AuthView from "../views/AuthView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView, meta: { requiresAuth: true } },
    { path: "/auth", component: AuthView },
  ],
});

// "Strażnik" – nie wpuści Cię do Home bez logowania
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.user) return "/auth";
  if (to.path === "/auth" && auth.user) return "/";
});

export default router;
