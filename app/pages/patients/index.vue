<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Pacientes</h1>
        <p class="page-subtitle">{{ patients.length }} paciente(s) cadastrado(s)</p>
      </div>
      <NuxtLink to="/patients/new" class="btn btn-primary">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Novo Paciente
      </NuxtLink>
    </div>

    <!-- Search & Filters -->
    <div style="display: flex; gap: 12px; margin-bottom: 24px;">
      <div class="search-wrapper" style="flex: 1;">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="search-patients"
          v-model="search"
          class="search-input"
          type="text"
          placeholder="Buscar por nome, CPF ou condição..."
        />
      </div>
      <select v-model="genderFilter" class="form-select" style="width: 160px;">
        <option value="">Todos os gêneros</option>
        <option value="M">Masculino</option>
        <option value="F">Feminino</option>
        <option value="O">Outro</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
      <div v-for="i in 6" :key="i" class="skeleton" style="height: 160px; border-radius: 16px;"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPatients.length === 0" class="card">
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <div class="empty-state-title">
          {{ search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado' }}
        </div>
        <div class="empty-state-desc">
          {{ search ? 'Tente um termo diferente.' : 'Cadastre seu primeiro paciente para começar.' }}
        </div>
        <NuxtLink v-if="!search" to="/patients/new" class="btn btn-primary" style="margin-top: 16px;">
          Cadastrar Paciente
        </NuxtLink>
      </div>
    </div>

    <!-- Patient Cards Grid -->
    <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
      <NuxtLink
        v-for="patient in filteredPatients"
        :key="patient.id"
        :to="`/patients/${patient.id}`"
        class="card"
        style="text-decoration: none; cursor: pointer; display: block;"
      >
        <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px;">
          <div class="avatar avatar-lg" style="flex-shrink: 0;">
            {{ getInitials(patient.full_name) }}
          </div>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{ patient.full_name }}
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
              {{ patient.date_of_birth ? getAge(patient.date_of_birth) + ' anos' : '—' }}
              <span v-if="patient.gender"> · {{ genderLabel(patient.gender) }}</span>
            </div>
            <div style="margin-top: 6px;">
              <span class="badge badge-primary" style="font-size: 10.5px;">
                {{ caseCounts[patient.id] || 0 }} caso(s)
              </span>
            </div>
          </div>
        </div>

        <div class="divider" style="margin: 12px 0;"></div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div v-if="patient.chronic_conditions" style="font-size: 12.5px; color: var(--text-muted); display: flex; gap: 6px; align-items: flex-start;">
            <span>⚕️</span>
            <span style="line-height: 1.4;">{{ patient.chronic_conditions }}</span>
          </div>
          <div v-if="patient.allergies" style="font-size: 12.5px; color: var(--text-muted); display: flex; gap: 6px;">
            <span>⚠️</span>
            <span>{{ patient.allergies }}</span>
          </div>
          <div v-if="!patient.chronic_conditions && !patient.allergies"
            style="font-size: 12.5px; color: var(--text-muted);">
            Sem condições registradas
          </div>
        </div>

        <div style="margin-top: 14px; font-size: 11px; color: var(--text-muted);">
          Cadastrado em {{ formatDate(patient.created_at) }}
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()

const loading = ref(true)
const patients = ref<any[]>([])
const caseCounts = ref<Record<string, number>>({})
const search = ref('')
const genderFilter = ref('')

const filteredPatients = computed(() => {
  let list = patients.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p =>
      p.full_name?.toLowerCase().includes(q) ||
      p.cpf?.includes(q) ||
      p.chronic_conditions?.toLowerCase().includes(q)
    )
  }
  if (genderFilter.value) {
    list = list.filter(p => p.gender === genderFilter.value)
  }
  return list
})

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

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .order('full_name', { ascending: true })

    patients.value = data || []

    // Load case counts
    if (patients.value.length > 0) {
      const { data: cases } = await supabase
        .from('clinical_cases')
        .select('patient_id')

      const counts: Record<string, number> = {}
      ;(cases || []).forEach((c: any) => {
        counts[c.patient_id] = (counts[c.patient_id] || 0) + 1
      })
      caseCounts.value = counts
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
