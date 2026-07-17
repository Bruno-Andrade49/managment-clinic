<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isEdit ? 'Editar Paciente' : 'Novo Paciente' }}</h1>
        <p class="page-subtitle">{{ isEdit ? 'Atualize as informações do paciente.' : 'Preencha os dados para cadastrar um novo paciente.' }}</p>
      </div>
      <button @click="$router.back()" class="btn btn-ghost">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>
    </div>

    <form @submit.prevent="savePatient" style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Personal Data -->
      <div class="card">
        <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span>👤</span> Dados Pessoais
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Nome Completo *</label>
            <input
              id="patient-name"
              v-model="form.full_name"
              class="form-input"
              type="text"
              placeholder="Ex: João da Silva"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Data de Nascimento</label>
            <input
              id="patient-dob"
              v-model="form.date_of_birth"
              class="form-input"
              type="date"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Gênero</label>
            <select id="patient-gender" v-model="form.gender" class="form-select">
              <option value="">Selecionar...</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">CPF</label>
            <input
              id="patient-cpf"
              v-model="form.cpf"
              class="form-input"
              type="text"
              placeholder="000.000.000-00"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input
              id="patient-phone"
              v-model="form.phone"
              class="form-input"
              type="tel"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">E-mail</label>
            <input
              id="patient-email"
              v-model="form.email"
              class="form-input"
              type="email"
              placeholder="paciente@email.com"
            />
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Endereço</label>
            <input
              id="patient-address"
              v-model="form.address"
              class="form-input"
              type="text"
              placeholder="Rua, número, bairro, cidade - UF"
            />
          </div>
        </div>
      </div>

      <!-- Medical History -->
      <div class="card">
        <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span>⚕️</span> Histórico Médico
        </h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label">Alergias Conhecidas</label>
            <input
              id="patient-allergies"
              v-model="form.allergies"
              class="form-input"
              type="text"
              placeholder="Ex: Penicilina, látex, dipirona..."
            />
          </div>
          <div class="form-group">
            <label class="form-label">Condições Crônicas</label>
            <input
              id="patient-conditions"
              v-model="form.chronic_conditions"
              class="form-input"
              type="text"
              placeholder="Ex: Diabetes tipo 2, hipertensão..."
            />
          </div>
          <div class="form-group">
            <label class="form-label">Observações Gerais</label>
            <textarea
              id="patient-notes"
              v-model="form.notes"
              class="form-textarea"
              rows="3"
              placeholder="Anotações adicionais sobre o paciente..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button type="button" @click="$router.back()" class="btn btn-ghost">Cancelar</button>
        <button
          id="btn-save-patient"
          type="submit"
          class="btn btn-primary"
          :disabled="saving"
        >
          <svg v-if="saving" class="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="30 70" />
          </svg>
          {{ saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Paciente' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Novo Paciente' })

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const patientId = computed(() => route.params.id as string)
const isEdit = computed(() => !!patientId.value && patientId.value !== 'new')
const saving = ref(false)

const form = reactive({
  full_name: '',
  date_of_birth: '',
  gender: '',
  cpf: '',
  phone: '',
  email: '',
  address: '',
  allergies: '',
  chronic_conditions: '',
  notes: '',
})

onMounted(async () => {
  if (isEdit.value) {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId.value)
      .single()
    if (data) Object.assign(form, data)
  }
})

async function savePatient() {
  saving.value = true
  try {
    // Convert empty strings to null to avoid DB constraint violations
    // (e.g. gender check constraint, date type casting)
    const sanitize = (val: string) => val.trim() === '' ? null : val.trim()

    const payload = {
      doctor_id: user.value?.sub,
      full_name: form.full_name.trim(),
      date_of_birth: sanitize(form.date_of_birth),
      gender: sanitize(form.gender),
      cpf: sanitize(form.cpf),
      phone: sanitize(form.phone),
      email: sanitize(form.email),
      address: sanitize(form.address),
      allergies: sanitize(form.allergies),
      chronic_conditions: sanitize(form.chronic_conditions),
      notes: sanitize(form.notes),
    }

    if (isEdit.value) {
      const { error } = await supabase
        .from('patients')
        .update(payload)
        .eq('id', patientId.value)
      if (error) throw error
      navigateTo(`/patients/${patientId.value}`)
    } else {
      const { data, error } = await supabase
        .from('patients')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      navigateTo(`/patients/${data.id}`)
    }
  } catch (err: any) {
    console.error(err)
    alert('Erro ao salvar paciente. Verifique os dados e tente novamente.')
  } finally {
    saving.value = false
  }
}
</script>
