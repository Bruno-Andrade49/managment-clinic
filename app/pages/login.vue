<template>
  <div style="width: 100%; max-width: 440px;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="/logo.svg" alt="CliniqAI" style="width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 16px; display: block; box-shadow: 0 0 32px rgba(14,165,233,0.4);" />
      <h1 style="font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px;">
        Bem-vindo ao <span class="gradient-text">CliniqAI</span>
      </h1>
      <p style="color: var(--text-muted); margin-top: 8px; font-size: 14px;">
        Gestão clínica inteligente para médicos modernos
      </p>
    </div>

    <!-- Card de Login -->
    <div class="card" style="padding: 32px;">
      <!-- Features list -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px;">
        <div v-for="feature in features" :key="feature.text"
          style="display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: var(--text-secondary);">
          <span style="font-size: 16px;">{{ feature.icon }}</span>
          {{ feature.text }}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Google Login Button -->
      <button
        id="btn-google-login"
        class="btn btn-ghost"
        style="width: 100%; padding: 14px; font-size: 15px; gap: 12px; margin-top: 20px; border-color: rgba(255,255,255,0.1);"
        :disabled="loading"
        @click="signInWithGoogle"
      >
        <svg v-if="!loading" width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <svg v-else class="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="30 70" />
        </svg>
        {{ loading ? 'Entrando...' : 'Continuar com Google' }}
      </button>

      <p style="text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 16px; line-height: 1.5;">
        Ao entrar, você concorda com os termos de uso e política de privacidade.<br>
        Dados de pacientes são protegidos e criptografados.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})
useHead({ title: 'Entrar' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const loading = ref(false)

// Redirect if already logged in
watch(user, (newUser) => {
  if (newUser) navigateTo('/')
}, { immediate: true })

const features = [
  { icon: '👥', text: 'Gerencie seus pacientes em um só lugar' },
  { icon: '📋', text: 'Registre casos clínicos com detalhes completos' },
  { icon: '🤖', text: 'Consulte a IA com contexto do paciente' },
  { icon: '🔒', text: 'Seus dados são privados e seguros' },
]

async function signInWithGoogle() {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    })
    if (error) throw error
  } catch (err) {
    console.error('Login error:', err)
    loading.value = false
  }
}
</script>
