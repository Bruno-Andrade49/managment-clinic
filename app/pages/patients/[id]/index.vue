<template>
  <div class="animate-fade-in" v-if="patient">
    <!-- Header -->
    <div class="page-header">
      <div style="display: flex; align-items: center; gap: 16px;">
        <button @click="$router.push('/patients')" class="btn btn-ghost btn-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div class="avatar avatar-xl">{{ getInitials(patient.full_name) }}</div>
        <div>
          <h1 class="page-title">{{ patient.full_name }}</h1>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
            <span v-if="patient.date_of_birth" class="badge badge-primary">{{ getAge(patient.date_of_birth) }} anos</span>
            <span v-if="patient.gender" class="badge badge-muted">{{ genderLabel(patient.gender) }}</span>
            <span v-if="patient.chronic_conditions" class="badge badge-warning">⚕️ {{ patient.chronic_conditions }}</span>
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <NuxtLink :to="`/patients/${patient.id}/chat`" class="btn btn-accent">
          🤖 Consultar IA
        </NuxtLink>
        <NuxtLink :to="`/patients/${patient.id}/edit`" class="btn btn-ghost">
          ✏️ Editar
        </NuxtLink>
        <button @click="confirmDelete" class="btn btn-danger">
          🗑️ Excluir
        </button>
      </div>
    </div>

    <!-- Info Grid -->
    <div style="display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start;">

      <!-- Left column: Patient info -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Contact -->
        <div class="card card-sm">
          <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 14px;">
            Contato
          </h3>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div v-if="patient.phone" style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
              📱 {{ patient.phone }}
            </div>
            <div v-if="patient.email" style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
              📧 {{ patient.email }}
            </div>
            <div v-if="patient.address" style="display: flex; align-items: flex-start; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
              📍 {{ patient.address }}
            </div>
            <div v-if="patient.cpf" style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
              🪪 {{ patient.cpf }}
            </div>
            <div v-if="!patient.phone && !patient.email && !patient.address && !patient.cpf"
              style="font-size: 13px; color: var(--text-muted);">
              Sem informações de contato
            </div>
          </div>
        </div>

        <!-- Medical History -->
        <div class="card card-sm">
          <h3 style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 14px;">
            Histórico Médico
          </h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div v-if="patient.allergies">
              <div style="font-size: 11.5px; font-weight: 600; color: var(--color-danger); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                ⚠️ Alergias
              </div>
              <div style="font-size: 13px; color: var(--text-secondary);">{{ patient.allergies }}</div>
            </div>
            <div v-if="patient.chronic_conditions">
              <div style="font-size: 11.5px; font-weight: 600; color: var(--color-warning); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                ⚕️ Condições Crônicas
              </div>
              <div style="font-size: 13px; color: var(--text-secondary);">{{ patient.chronic_conditions }}</div>
            </div>
            <div v-if="patient.notes">
              <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                📝 Observações
              </div>
              <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">{{ patient.notes }}</div>
            </div>
            <div v-if="!patient.allergies && !patient.chronic_conditions && !patient.notes"
              style="font-size: 13px; color: var(--text-muted);">
              Sem histórico registrado
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Clinical Cases -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="font-size: 17px; font-weight: 700; color: var(--text-primary);">Casos Clínicos</h2>
          <NuxtLink :to="`/patients/${patient.id}/cases/new`" class="btn btn-primary btn-sm">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Novo Caso
          </NuxtLink>
        </div>

        <div v-if="loadingCases" style="display: flex; flex-direction: column; gap: 12px;">
          <div v-for="i in 3" :key="i" class="skeleton" style="height: 100px; border-radius: 12px;"></div>
        </div>

        <div v-else-if="cases.length === 0" class="card">
          <div class="empty-state" style="padding: 40px;">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-title">Nenhum caso clínico</div>
            <div class="empty-state-desc">Registre o primeiro caso clínico deste paciente.</div>
            <NuxtLink :to="`/patients/${patient.id}/cases/new`" class="btn btn-primary" style="margin-top: 16px;">
              Registrar Caso
            </NuxtLink>
          </div>
        </div>

        <div v-else style="display: flex; flex-direction: column; gap: 12px;">
          <NuxtLink
            v-for="c in cases"
            :key="c.id"
            :to="`/patients/${patient.id}/cases/${c.id}`"
            class="card"
            style="text-decoration: none; display: block;"
          >
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
                  {{ c.title }}
                </div>
                <div style="font-size: 13px; color: var(--text-muted); line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                  {{ c.chief_complaint || c.symptoms || 'Sem descrição' }}
                </div>
              </div>
              <span class="badge" :class="statusBadge(c.status)">
                {{ statusLabel(c.status) }}
              </span>
            </div>
            <div style="margin-top: 12px; font-size: 11.5px; color: var(--text-muted);">
              {{ formatDate(c.created_at) }}
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="animate-fade-in">
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="skeleton" style="height: 80px; border-radius: 16px;"></div>
      <div style="display: grid; grid-template-columns: 300px 1fr; gap: 24px;">
        <div class="skeleton" style="height: 300px; border-radius: 16px;"></div>
        <div class="skeleton" style="height: 300px; border-radius: 16px;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Detalhes do Paciente' })

const route = useRoute()
const supabase = useSupabaseClient()

const patientId = route.params.id as string

const loading = ref(true)
const loadingCases = ref(true)
const patient = ref<any>(null)
const cases = ref<any[]>([])

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

function genderLabel(g: string) {
  return { M: 'Masculino', F: 'Feminino', O: 'Outro' }[g] || g
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function statusLabel(s: string) {
  return { active: 'Ativo', follow_up: 'Acompanhamento', closed: 'Encerrado' }[s] || s
}

function statusBadge(s: string) {
  return { active: 'badge-success', follow_up: 'badge-warning', closed: 'badge-muted' }[s] || 'badge-muted'
}

async function confirmDelete() {
  if (confirm(`Tem certeza que deseja excluir o paciente "${patient.value?.full_name}"? Todos os casos clínicos serão removidos.`)) {
    await supabase.from('patients').delete().eq('id', patientId)
    navigateTo('/patients')
  }
}

onMounted(async () => {
  loading.value = true
  const { data } = await supabase.from('patients').select('*').eq('id', patientId).single()
  patient.value = data
  loading.value = false

  loadingCases.value = true
  const { data: casesData } = await supabase
    .from('clinical_cases')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  cases.value = casesData || []
  loadingCases.value = false
})
</script>
