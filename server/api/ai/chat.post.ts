import { GoogleGenerativeAI } from '@google/generative-ai'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { patientId, message, history = [] } = body

  if (!message) {
    throw createError({ statusCode: 400, message: 'Message is required' })
  }

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(config.geminiApiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  // Fetch patient data from Supabase to build context
  const supabase = await serverSupabaseClient(event)
  let patientContext = ''

  if (patientId) {
    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      const { data: cases } = await supabase
        .from('clinical_cases')
        .select('*, case_evolutions(*)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (patient) {
        const age = patient.date_of_birth
          ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
          : null

        patientContext = `
=== DADOS DO PACIENTE ===
Nome: ${patient.full_name}
${age ? `Idade: ${age} anos` : ''}
${patient.gender ? `Gênero: ${{ M: 'Masculino', F: 'Feminino', O: 'Outro' }[patient.gender] || patient.gender}` : ''}
${patient.allergies ? `ALERGIAS: ${patient.allergies}` : ''}
${patient.chronic_conditions ? `Condições crônicas: ${patient.chronic_conditions}` : ''}
${patient.notes ? `Observações: ${patient.notes}` : ''}

=== HISTÓRICO CLÍNICO (últimos casos) ===
${(cases || []).map(c => `
Caso: ${c.title} [${c.status}]
Queixa: ${c.chief_complaint || '—'}
Sintomas: ${c.symptoms || '—'}
Diagnóstico: ${c.diagnosis || '—'}
Conduta: ${c.prescription || '—'}
${c.case_evolutions?.length ? `Evoluções: ${c.case_evolutions.map((e: any) => e.note).join(' | ')}` : ''}
`).join('\n---\n')}
`
      }
    } catch (err) {
      console.error('Error fetching patient context:', err)
    }
  }

  // System prompt
  const systemPrompt = `Você é um assistente médico especializado, auxiliando médicos em suas decisões clínicas. 
Você fornece orientações baseadas em evidências científicas atuais e guidelines médicos.

INSTRUÇÕES IMPORTANTES:
- Responda sempre em português do Brasil
- Seja preciso, claro e objetivo
- Cite guidelines ou evidências quando relevante
- Sempre enfatize que o médico deve usar seu julgamento clínico
- NÃO faça diagnósticos definitivos — forneça hipóteses e orientações
- Em casos de emergência, sempre recomende avaliação presencial imediata
- Mencione contraindicações e alertas de segurança quando relevante

${patientContext ? `Você tem acesso ao seguinte contexto do paciente:\n${patientContext}` : 'Nenhum paciente específico selecionado. Responda de forma geral.'}`

  try {
    // Build chat history for multi-turn
    const chatHistory = history.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Entendido. Estou pronto para auxiliar com orientações clínicas. Como posso ajudar?' }] },
        ...chatHistory,
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.4,
      },
    })

    const result = await chat.sendMessage(message)
    const reply = result.response.text()

    return { reply }
  } catch (err: any) {
    console.error('Gemini API error:', err?.message || err)
    console.error('Gemini API error details:', JSON.stringify(err, null, 2))
    throw createError({
      statusCode: 500,
      message: 'Erro ao consultar a IA: ' + (err?.message || err?.errorDetails || JSON.stringify(err) || 'Erro desconhecido'),
    })
  }
})
