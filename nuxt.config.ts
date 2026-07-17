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
  app: {
    head: {
      title: 'CliniqAI',
      titleTemplate: '%s | CliniqAI',
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'CliniqAI — Gestão clínica inteligente com IA para médicos. Gerencie pacientes, casos clínicos e consulte a inteligência artificial.' },
        { name: 'theme-color', content: '#0B0F1A' },
        { property: 'og:title', content: 'CliniqAI — Gestão Clínica Inteligente' },
        { property: 'og:description', content: 'Plataforma médica com IA para gestão de pacientes e casos clínicos.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/favicon.svg' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.svg' },
      ],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});