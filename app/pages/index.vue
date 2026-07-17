<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Olá, {{ doctorFirstName }} 👋
        </h1>
        <p class="page-subtitle">Aqui está o resumo dos seus casos clínicos de hoje.</p>
      </div>
      <NuxtLink to="/patients/new" class="btn btn-primary">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Novo Paciente
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.bg }">{{ stat.icon }}</div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Content Grid -->
    <div style="display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start;">

      <!-- Recent Patients -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--bg-border);">
          <h2 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">Pacientes Recentes</h2>
          <NuxtLink to="/patients" class="btn btn-ghost btn-sm">Ver todos</NuxtLink>
        </div>

        <div v-if="loadingData" style="padding: 24px;">
          <div v-for="i in 4" :key="i" style="display: flex; gap: 12px; align-items: center; padding: 12px 0;">
            <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%;"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
              <div class="skeleton" style="height: 14px; width: 60%;"></div>
              <div class="skeleton" style="height: 12px; width: 40%;"></div>
            </div>
          </div>
        </div>

        <div v-else-if="recentPatients.length === 0" class="empty-state" style="padding: 48px;">
          <div class="empty-state-icon">👥</div>
          <div class="empty-state-title">Nenhum paciente ainda</div>
          <div class="empty-state-desc">Cadastre seu primeiro paciente para começar</div>
          <NuxtLink to="/patients/new" class="btn btn-primary" style="margin-top: 16px;">Cadastrar Paciente</NuxtLink>
        </div>

        <div v-else>
          <NuxtLink
            v-for="patient in recentPatients"
            :key="patient.id"
            :to="`/patients/${patient.id}`"
            style="display: flex; align-items: center; gap: 14px; padding: 14px 24px; text-decoration: none; border-bottom: 1px solid rgba(36,48,70,0.5); transition: background 0.15s ease;"
            @mouseenter="$event.currentTarget.style.background = 'var(--bg-hover)'"
            @mouseleave="$event.currentTarget.style.background = 'transparent'"
          >
            <div class="avatar avatar-md">{{ getInitials(patient.full_name) }}</div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; font-size: 14px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ patient.full_name }}
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                {{ patient.chronic_conditions || 'Sem condições registradas' }}
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <span class="badge" :class="getAgeBadgeClass(patient.date_of_birth)">
                {{ getAge(patient.date_of_birth) }} anos
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">
                {{ formatDate(patient.created_at) }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- AI Assistant Quick Access -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="card" style="background: linear-gradient(135deg, rgba(14,165,233,0.1), rgba(16,185,129,0.06)); border-color: rgba(14,165,233,0.2);">
          <div style="font-size: 28px; margin-bottom: 12px;">🤖</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
            Assistente IA
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">
            Consulte a IA com orientações clínicas personalizadas para qualquer paciente.
          </p>
          <NuxtLink to="/ai-assistant" class="btn btn-primary" style="width: 100%; justify-content: center;">
            Abrir Assistente
          </NuxtLink>
        </div>

        <!-- Active Cases -->
        <div class="card">
          <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">
            Casos Ativos
          </h3>
          <div v-if="activeCases.length === 0" style="text-align: center; padding: 16px 0; color: var(--text-muted); font-size: 13px;">
            Nenhum caso ativo
          </div>
          <div v-else style="display: flex; flex-direction: column; gap: 10px;">
            <NuxtLink
              v-for="c in activeCases"
              :key="c.id"
              :to="`/patients/${c.patient_id}/cases/${c.id}`"
              style="display: flex; align-items: center; gap: 10px; text-decoration: none; padding: 10px; border-radius: 8px; border: 1px solid var(--bg-border); transition: all 0.15s ease;"
              @mouseenter="$event.currentTarget.style.background = 'var(--bg-hover)'"
              @mouseleave="$event.currentTarget.style.background = 'transparent'"
            >
              <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); flex-shrink: 0; box-shadow: 0 0 8px rgba(16,185,129,0.5);"></div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  {{ c.title }}
                </div>
                <div style="font-size: 11px; color: var(--text-muted);">{{ c.patient_name }}</div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loadingData = ref(true)
const recentPatients = ref<any[]>([])
const activeCases = ref<any[]>([])
const totalCases = ref(0)

const doctorFirstName = computed(() => {
  const name = user.value?.user_metadata?.full_name || user.value?.email || 'Doutor'
  return name.split(' ')[0]
})

const stats = computed(() => [
  {
    icon: '👥', label: 'Total de Pacientes', value: recentPatients.value.length,
    bg: 'rgba(14,165,233,0.15)'
  },
  {
    icon: '📋', label: 'Casos Ativos', value: activeCases.value.length,
    bg: 'rgba(16,185,129,0.15)'
  },
  {
    icon: '📁', label: 'Total de Casos', value: totalCases.value,
    bg: 'rgba(245,158,11,0.15)'
  },
  {
    icon: '🤖', label: 'Consultas com IA', value: '—',
    bg: 'rgba(139,92,246,0.15)'
  },
])

function getInitials(name: string) {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

function getAge(dob: string) {
  if (!dob) return '?'
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function getAgeBadgeClass(dob: string) {
  const age = getAge(dob) as number
  if (age >= 60) return 'badge badge-warning'
  if (age >= 18) return 'badge badge-primary'
  return 'badge badge-success'
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

onMounted(async () => {
  loadingData.value = true
  try {
    const [patientsRes, casesRes, totalRes] = await Promise.all([
      supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('clinical_cases')
        .select('id, title, status, patient_id, patients(full_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('clinical_cases')
        .select('id', { count: 'exact' }),
    ])

    recentPatients.value = patientsRes.data || []
    activeCases.value = (casesRes.data || []).map((c: any) => ({
      ...c,
      patient_name: c.patients?.full_name || 'Desconhecido',
    }))
    totalCases.value = totalRes.count || 0
  } catch (err) {
    console.error(err)
  } finally {
    loadingData.value = false
  }
})
</script>
