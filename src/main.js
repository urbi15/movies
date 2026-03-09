import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import { useAuthStore } from "./stores/auth";
import App from "./App.vue";
import "./style.css";

const app = createApp(App);
app.use(createPinia());

const auth = useAuthStore();
auth.initialize().then(() => {
  app.use(router);
  app.mount("#app");
});
