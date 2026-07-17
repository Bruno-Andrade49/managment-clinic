<template>
  <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; gap: 16px;">
    <div style="width: 48px; height: 48px; border: 3px solid #0EA5E9; border-top-color: transparent; border-radius: 50; animation: spin 0.8s linear infinite;"></div>
    <p style="color: var(--text-muted); font-size: 14px;">Autenticando...</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const supabase = useSupabaseClient()
const route = useRoute()

onMounted(async () => {
  const code = route.query.code as string

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth error:', error)
      return navigateTo('/login')
    }
  }

  return navigateTo('/')
})
</script>
