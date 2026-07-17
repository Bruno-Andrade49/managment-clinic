<template>
  <!-- Reuses the same form as new.vue but with patient data pre-filled -->
  <div class="animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Editar Paciente</h1>
        <p class="page-subtitle">Atualize as informações do paciente.</p>
      </div>
      <button @click="$router.back()" class="btn btn-ghost">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>
    </div>

    <form @submit.prevent="savePatient" style="display: flex; flex-direction: column; gap: 24px;">
      <div class="card">
        <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span>👤</span> Dados Pessoais
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Nome Completo *</label>
            <input id="edit-patient-name" v-model="form.full_name" class="form-input" type="text" required />
          </div>
          <div class="form-group">
            <label class="form-label">Data de Nascimento</label>
            <input id="edit-patient-dob" v-model="form.date_of_birth" class="form-input" type="date" />
          </div>
          <div class="form-group">
            <label class="form-label">Gênero</label>
            <select id="edit-patient-gender" v-model="form.gender" class="form-select">
              <option value="">Selecionar...</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">CPF</label>
            <input id="edit-patient-cpf" v-model="form.cpf" class="form-input" type="text" />
          </div>
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input id="edit-patient-phone" v-model="form.phone" class="form-input" type="tel" />
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">E-mail</label>
            <input id="edit-patient-email" v-model="form.email" class="form-input" type="email" />
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Endereço</label>
            <input id="edit-patient-address" v-model="form.address" class="form-input" type="text" />
          </div>
        </div>
      </div>

      <div class="card">
        <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span>⚕️</span> Histórico Médico
        </h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label">Alergias</label>
            <input id="edit-patient-allergies" v-model="form.allergies" class="form-input" type="text" />
          </div>
          <div class="form-group">
            <label class="form-label">Condições Crônicas</label>
            <input id="edit-patient-conditions" v-model="form.chronic_conditions" class="form-input" type="text" />
          </div>
          <div class="form-group">
            <label class="form-label">Observações</label>
            <textarea id="edit-patient-notes" v-model="form.notes" class="form-textarea" rows="3"></textarea>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button type="button" @click="$router.back()" class="btn btn-ghost">Cancelar</button>
        <button id="btn-save-edit-patient" type="submit" class="btn btn-primary" :disabled="saving">
          <svg v-if="saving" class="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="30 70" />
          </svg>
          {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Editar Paciente' })

const route = useRoute()
const supabase = useSupabaseClient()
const patientId = route.params.id as string
const saving = ref(false)

const form = reactive({
  full_name: '', date_of_birth: '', gender: '', cpf: '',
  phone: '', email: '', address: '', allergies: '', chronic_conditions: '', notes: '',
})

onMounted(async () => {
  const { data } = await supabase.from('patients').select('*').eq('id', patientId).single()
  if (data) Object.assign(form, data)
})

async function savePatient() {
  saving.value = true
  try {
    const { error } = await supabase.from('patients').update(form).eq('id', patientId)
    if (error) throw error
    navigateTo(`/patients/${patientId}`)
  } catch (err) {
    alert('Erro ao salvar.')
  } finally {
    saving.value = false
  }
}
</script>
