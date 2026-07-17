<template>
  <div class="animate-fade-in" style="display: flex; flex-direction: column; height: calc(100vh - var(--topbar-height) - 64px);">

    <!-- Patient Context Header -->
    <div class="card card-sm" style="margin-bottom: 16px; background: linear-gradient(135deg, rgba(14,165,233,0.08), rgba(16,185,129,0.05)); border-color: rgba(14,165,233,0.2);">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="avatar avatar-md">{{ getInitials(patient?.full_name || '') }}</div>
          <div>
            <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">
              🤖 Consulta IA — {{ patient?.full_name || 'Carregando...' }}
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              A IA tem acesso ao histórico médico deste paciente
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span v-if="patient?.allergies" class="badge badge-danger">⚠️ {{ patient.allergies }}</span>
          <span v-if="patient?.chronic_conditions" class="badge badge-warning">{{ patient.chronic_conditions }}</span>
          <NuxtLink :to="`/patients/${patientId}`" class="btn btn-ghost btn-sm">← Voltar ao Paciente</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Chat Messages -->
    <div class="card" style="flex: 1; display: flex; flex-direction: column; padding: 0; overflow: hidden;">
      <div ref="messagesContainer" style="flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px;">

        <!-- Welcome message -->
        <div v-if="messages.length === 0" style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; gap: 12px; padding: 40px;">
          <div style="font-size: 48px;">🤖</div>
          <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">Assistente Clínico IA</div>
          <div style="font-size: 14px; color: var(--text-muted); max-width: 400px; line-height: 1.6;">
            Faça perguntas clínicas sobre <strong style="color: var(--text-secondary);">{{ patient?.full_name }}</strong>.
            A IA tem acesso ao histórico do paciente e pode orientar sobre diagnósticos, medicamentos e condutas.
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px;">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              @click="sendSuggestion(suggestion)"
              class="btn btn-ghost btn-sm"
              style="font-size: 12px;"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="chat-message"
          :class="msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'"
        >
          <div class="avatar avatar-sm" :style="msg.role === 'user' ? '' : 'background: linear-gradient(135deg, #7C3AED, #2563EB); font-size: 14px;'">
            {{ msg.role === 'user' ? userInitials : '🤖' }}
          </div>
          <div class="chat-message-bubble" style="max-width: 640px; white-space: pre-wrap;">{{ msg.content }}</div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="chat-message chat-message-ai">
          <div class="avatar avatar-sm" style="background: linear-gradient(135deg, #7C3AED, #2563EB);">🤖</div>
          <div class="chat-message-bubble chat-message-ai">
            <div class="chat-typing-indicator">
              <div class="chat-typing-dot"></div>
              <div class="chat-typing-dot"></div>
              <div class="chat-typing-dot"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input-area">
        <div class="chat-input-wrapper">
          <textarea
            id="chat-input"
            ref="inputRef"
            v-model="inputText"
            class="chat-input"
            rows="1"
            placeholder="Faça uma pergunta clínica sobre este paciente..."
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
          ></textarea>
          <button
            id="btn-send-chat"
            @click="sendMessage"
            class="btn btn-primary btn-sm"
            style="flex-shrink: 0; height: 36px;"
            :disabled="!inputText.trim() || isTyping"
          >
            <svg v-if="!isTyping" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <svg v-else class="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="30 70" />
            </svg>
          </button>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px; text-align: center;">
          A IA pode cometer erros. Sempre valide as orientações com seu julgamento clínico.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const patientId = route.params.id as string

const patient = ref<any>(null)
const messages = ref<any[]>([])
const inputText = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)

const userInitials = computed(() => {
  const name = user.value?.user_metadata?.full_name || user.value?.email || 'Dr'
  const parts = name.split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.substring(0, 2).toUpperCase()
})

const suggestions = [
  '💊 Interações medicamentosas possíveis?',
  '🔍 Hipóteses diagnósticas para os sintomas?',
  '📋 Protocolo de tratamento recomendado?',
  '⚠️ Sinais de alerta para monitorar?',
]

function getInitials(name: string) {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function autoResize(e: Event) {
  const ta = e.target as HTMLTextAreaElement
  ta.style.height = 'auto'
  ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
}

async function sendSuggestion(text: string) {
  inputText.value = text.replace(/^[^\s]+\s/, '')
  await sendMessage()
}

async function sendMessage() {
  const content = inputText.value.trim()
  if (!content || isTyping.value) return

  // Add user message
  const userMsg = { id: Date.now(), role: 'user', content }
  messages.value.push(userMsg)
  inputText.value = ''
  if (inputRef.value) inputRef.value.style.height = 'auto'
  isTyping.value = true
  scrollToBottom()

  // Save to DB
  await supabase.from('ai_chat_messages').insert({
    patient_id: patientId,
    doctor_id: user.value?.sub,
    role: 'user',
    content,
  })

  try {
    const response = await $fetch('/api/ai/chat', {
      method: 'POST',
      body: {
        patientId,
        message: content,
        history: messages.value.slice(-10).map(m => ({ role: m.role, content: m.content })),
      },
    })

    const aiMsg = { id: Date.now() + 1, role: 'assistant', content: (response as any).reply }
    messages.value.push(aiMsg)

    await supabase.from('ai_chat_messages').insert({
      patient_id: patientId,
      doctor_id: user.value?.sub,
      role: 'assistant',
      content: (response as any).reply,
    })
  } catch (err) {
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: '⚠️ Erro ao conectar com a IA. Verifique sua chave da Gemini API e tente novamente.',
    })
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

onMounted(async () => {
  // Load patient data
  const { data: pat } = await supabase.from('patients').select('*').eq('id', patientId).single()
  patient.value = pat

  // Load chat history
  const { data: hist } = await supabase
    .from('ai_chat_messages')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true })
    .limit(50)

  messages.value = (hist || []).map((m: any) => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }))

  scrollToBottom()
})
</script>
