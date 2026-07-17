import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  modules: ['@nuxtjs/supabase'],
  supabase: {
    redirect: false,
  },
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});