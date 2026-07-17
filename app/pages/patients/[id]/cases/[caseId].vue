<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isNew ? 'Novo Caso Clínico' : 'Editar Caso Clínico' }}</h1>
        <p class="page-subtitle" v-if="patientName">Paciente: <strong style="color: var(--text-primary);">{{ patientName }}</strong></p>
      </div>
      <button @click="$router.back()" class="btn btn-ghost">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>
    </div>

    <form @submit.prevent="saveCase" style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Main Info -->
      <div class="card">
        <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span>📋</span> Informações do Caso
        </h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label">Título do Caso *</label>
            <input
              id="case-title"
              v-model="form.title"
              class="form-input"
              type="text"
              placeholder="Ex: Consulta inicial - Dor abdominal aguda"
              required
            />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="case-status" v-model="form.status" class="form-select">
                <option value="active">Ativo</option>
                <option value="follow_up">Em Acompanhamento</option>
                <option value="closed">Encerrado</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Queixa Principal</label>
            <textarea
              id="case-complaint"
              v-model="form.chief_complaint"
              class="form-textarea"
              rows="2"
              placeholder="Descreva a queixa principal do paciente..."
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Sintomas</label>
            <textarea
              id="case-symptoms"
              v-model="form.symptoms"
              class="form-textarea"
              rows="3"
              placeholder="Liste os sintomas apresentados (febre, dor, etc.)..."
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Diagnóstico</label>
            <textarea
              id="case-diagnosis"
              v-model="form.diagnosis"
              class="form-textarea"
              rows="2"
              placeholder="Diagnóstico ou hipótese diagnóstica..."
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Conduta / Prescrição</label>
            <textarea
              id="case-prescription"
              v-model="form.prescription"
              class="form-textarea"
              rows="3"
              placeholder="Tratamento prescrito, medicamentos, doses, orientações..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Evolutions (edit mode only) -->
      <div v-if="!isNew" class="card">
        <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span>📈</span> Evoluções Clínicas
        </h2>

        <div v-if="evolutions.length > 0" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          <div
            v-for="evo in evolutions"
            :key="evo.id"
            style="background: var(--bg-elevated); border: 1px solid var(--bg-border); border-radius: 10px; padding: 14px; position: relative;"
          >
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">
              {{ formatDatetime(evo.created_at) }}
            </div>
            <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap;">{{ evo.note }}</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Adicionar Nova Evolução</label>
          <textarea
            id="case-evolution"
            v-model="newEvolution"
            class="form-textarea"
            rows="3"
            placeholder="Registre a evolução do caso (exame físico, resultados de exames, resposta ao tratamento)..."
          ></textarea>
        </div>
        <button
          type="button"
          @click="addEvolution"
          class="btn btn-ghost btn-sm"
          style="margin-top: 8px;"
          :disabled="!newEvolution.trim()"
        >
          + Registrar Evolução
        </button>
      </div>

      <!-- Actions -->
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button type="button" @click="$router.back()" class="btn btn-ghost">Cancelar</button>
        <button id="btn-save-case" type="submit" class="btn btn-primary" :disabled="saving">
          <svg v-if="saving" class="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="30 70" />
          </svg>
          {{ saving ? 'Salvando...' : isNew ? 'Criar Caso' : 'Salvar Alterações' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Caso Clínico' })

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const patientId = route.params.id as string
const caseId = route.params.caseId as string
const isNew = computed(() => caseId === 'new')

const saving = ref(false)
const patientName = ref('')
const newEvolution = ref('')
const evolutions = ref<any[]>([])

const form = reactive({
  title: '',
  chief_complaint: '',
  symptoms: '',
  diagnosis: '',
  prescription: '',
  status: 'active',
})

function formatDatetime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(async () => {
  const { data: pat } = await supabase.from('patients').select('full_name').eq('id', patientId).single()
  patientName.value = pat?.full_name || ''

  if (!isNew.value) {
    const { data: c } = await supabase.from('clinical_cases').select('*').eq('id', caseId).single()
    if (c) Object.assign(form, c)

    const { data: evos } = await supabase
      .from('case_evolutions')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })
    evolutions.value = evos || []
  }
})

async function addEvolution() {
  if (!newEvolution.value.trim()) return
  const { data } = await supabase
    .from('case_evolutions')
    .insert({ case_id: caseId, note: newEvolution.value.trim() })
    .select()
    .single()
  if (data) {
    evolutions.value.push(data)
    newEvolution.value = ''
  }
}

async function saveCase() {
  saving.value = true
  try {
    const payload = {
      ...form,
      patient_id: patientId,
      doctor_id: user.value?.sub,
    }
    if (isNew.value) {
      const { data, error } = await supabase
        .from('clinical_cases')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      navigateTo(`/patients/${patientId}/cases/${data.id}`)
    } else {
      const { error } = await supabase
        .from('clinical_cases')
        .update(payload)
        .eq('id', caseId)
      if (error) throw error
      navigateTo(`/patients/${patientId}`)
    }
  } catch (err) {
    console.error(err)
    alert('Erro ao salvar caso clínico.')
  } finally {
    saving.value = false
  }
}
</script>
