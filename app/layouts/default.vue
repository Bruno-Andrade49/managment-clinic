<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">🩺</div>
        <div class="sidebar-logo-text">
          <span class="sidebar-logo-name">CliniqAI</span>
          <span class="sidebar-logo-sub">Gestão Clínica</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <span class="sidebar-section-label">Principal</span>

        <NuxtLink to="/" class="sidebar-nav-item" :class="{ active: route.path === '/' }">
          <svg class="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NuxtLink>

        <NuxtLink to="/patients" class="sidebar-nav-item" :class="{ active: route.path.startsWith('/patients') && !route.path.includes('/chat') }">
          <svg class="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Pacientes
        </NuxtLink>

        <span class="sidebar-section-label" style="margin-top: 8px;">IA Médica</span>

        <NuxtLink to="/ai-assistant" class="sidebar-nav-item" :class="{ active: route.path === '/ai-assistant' }">
          <svg class="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Assistente IA
        </NuxtLink>
      </nav>

      <!-- Footer / User -->
      <div class="sidebar-footer">
        <div class="sidebar-user" @click="handleSignOut">
          <div class="sidebar-user-avatar">
            {{ userInitials }}
          </div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ userName }}</div>
            <div class="sidebar-user-role">Sair da conta</div>
          </div>
          <svg width="16" height="16" fill="none" stroke="#475569" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="app-main">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-breadcrumb">
          <span>CliniqAI</span>
          <span class="topbar-breadcrumb-sep">/</span>
          <span class="topbar-breadcrumb-current">{{ pageTitle }}</span>
        </div>
        <div class="topbar-actions">
          <NuxtLink to="/patients/new" class="btn btn-primary btn-sm">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Novo Paciente
          </NuxtLink>
        </div>
      </header>

      <!-- Slot for page content -->
      <main class="app-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const userName = computed(() => {
  return user.value?.user_metadata?.full_name || user.value?.email || 'Médico'
})

const userInitials = computed(() => {
  const name = userName.value
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/') return 'Dashboard'
  if (path.startsWith('/patients/new')) return 'Novo Paciente'
  if (path.includes('/chat')) return 'Chat com IA'
  if (path.includes('/cases/new')) return 'Novo Caso Clínico'
  if (path.includes('/cases/')) return 'Caso Clínico'
  if (path.startsWith('/patients/')) return 'Detalhes do Paciente'
  if (path === '/patients') return 'Pacientes'
  if (path === '/ai-assistant') return 'Assistente IA'
  return 'CliniqAI'
})

async function handleSignOut() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>
