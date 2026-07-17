<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Assistente IA <span class="gradient-text">Clínico</span></h1>
        <p class="page-subtitle">Consulte a IA sobre um paciente ou faça perguntas médicas gerais.</p>
      </div>
    </div>

    <!-- Patient Selector -->
    <div class="card" style="margin-bottom: 24px;">
      <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">
        🔎 Selecione um paciente para consulta contextual
      </h3>
      <div class="search-wrapper" style="max-width: 480px;">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="ai-patient-search"
          v-model="patientSearch"
          class="search-input"
          placeholder="Buscar paciente pelo nome..."
        />
      </div>

      <div v-if="patientSearch && filteredPatients.length > 0" style="margin-top: 12px; display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto;">
        <NuxtLink
          v-for="p in filteredPatients"
          :key="p.id"
          :to="`/patients/${p.id}/chat`"
          style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--bg-border); text-decoration: none; transition: all 0.15s ease;"
          @mouseenter="$event.currentTarget.style.background = 'var(--bg-hover)'"
          @mouseleave="$event.currentTarget.style.background = 'transparent'"
        >
          <div class="avatar avatar-sm">{{ getInitials(p.full_name) }}</div>
          <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">{{ p.full_name }}</div>
            <div style="font-size: 11px; color: var(--text-muted);">{{ p.chronic_conditions || 'Sem condições registradas' }}</div>
          </div>
          <div style="margin-left: auto; font-size: 12px; color: var(--color-primary-light);">Abrir chat →</div>
        </NuxtLink>
      </div>

      <div v-else-if="patientSearch && filteredPatients.length === 0" style="margin-top: 12px; font-size: 13px; color: var(--text-muted);">
        Nenhum paciente encontrado.
      </div>
    </div>

    <!-- Info cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">
      <div class="card" style="background: linear-gradient(135deg, rgba(14,165,233,0.08), rgba(16,185,129,0.04)); border-color: rgba(14,165,233,0.2);">
        <div style="font-size: 32px; margin-bottom: 10px;">🧠</div>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Consulta Contextual</h3>
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">
          Selecione um paciente para que a IA leia o histórico completo e forneça orientações personalizadas.
        </p>
      </div>
      <div class="card">
        <div style="font-size: 32px; margin-bottom: 10px;">💊</div>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Interações Medicamentosas</h3>
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">
          Pergunte sobre possíveis interações entre medicamentos do paciente.
        </p>
      </div>
      <div class="card">
        <div style="font-size: 32px; margin-bottom: 10px;">🔍</div>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Diagnóstico Diferencial</h3>
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">
          Obtenha hipóteses diagnósticas com base nos sintomas registrados.
        </p>
      </div>
      <div class="card">
        <div style="font-size: 32px; margin-bottom: 10px;">📋</div>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Protocolos Clínicos</h3>
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">
          Consulte protocolos e guidelines para condutas clínicas baseadas em evidências.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const patientSearch = ref('')
const allPatients = ref<any[]>([])

const filteredPatients = computed(() => {
  if (!patientSearch.value) return []
  const q = patientSearch.value.toLowerCase()
  return allPatients.value.filter(p => p.full_name?.toLowerCase().includes(q)).slice(0, 8)
})

function getInitials(name: string) {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

onMounted(async () => {
  const { data } = await supabase.from('patients').select('id, full_name, chronic_conditions').order('full_name')
  allPatients.value = data || []
})
</script>
