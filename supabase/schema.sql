-- ============================================================
-- CliniqAI — Script de criação de tabelas no Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- ============================================================

-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- ─── Tabela: profiles (dados do médico) ──────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  crm text,
  specialty text,
  created_at timestamptz default now()
);

-- Trigger: cria perfil automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Tabela: patients ─────────────────────────────────────────────
create table if not exists public.patients (
  id uuid default uuid_generate_v4() primary key,
  doctor_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  date_of_birth date,
  gender text check (gender in ('M', 'F', 'O')),
  cpf text,
  phone text,
  email text,
  address text,
  allergies text,
  chronic_conditions text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Tabela: clinical_cases ───────────────────────────────────────
create table if not exists public.clinical_cases (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  doctor_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  chief_complaint text,
  symptoms text,
  diagnosis text,
  prescription text,
  status text default 'active' check (status in ('active', 'follow_up', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Tabela: case_evolutions ──────────────────────────────────────
create table if not exists public.case_evolutions (
  id uuid default uuid_generate_v4() primary key,
  case_id uuid references public.clinical_cases(id) on delete cascade not null,
  note text not null,
  created_at timestamptz default now()
);

-- ─── Tabela: ai_chat_messages ─────────────────────────────────────
create table if not exists public.ai_chat_messages (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  doctor_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- ─── Row Level Security (RLS) ─────────────────────────────────────
-- Cada médico só vê seus próprios dados

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.clinical_cases enable row level security;
alter table public.case_evolutions enable row level security;
alter table public.ai_chat_messages enable row level security;

-- Profiles: usuário vê/edita apenas o próprio perfil
create policy "profiles: own" on public.profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

-- Patients: médico gerencia apenas seus pacientes
create policy "patients: own doctor" on public.patients
  for all using (auth.uid() = doctor_id)
  with check (auth.uid() = doctor_id);

-- Clinical Cases: médico acessa apenas casos de seus pacientes
create policy "cases: own doctor" on public.clinical_cases
  for all using (auth.uid() = doctor_id)
  with check (auth.uid() = doctor_id);

-- Case Evolutions: acesso via caso clínico do médico
create policy "evolutions: via case" on public.case_evolutions
  for all using (
    exists (
      select 1 from public.clinical_cases c
      where c.id = case_evolutions.case_id
        and c.doctor_id = auth.uid()
    )
  );

-- AI Chat Messages: médico acessa apenas suas mensagens
create policy "chat: own doctor" on public.ai_chat_messages
  for all using (auth.uid() = doctor_id)
  with check (auth.uid() = doctor_id);

-- ─── Updated_at trigger ───────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger patients_updated_at
  before update on public.patients
  for each row execute procedure update_updated_at();

create trigger cases_updated_at
  before update on public.clinical_cases
  for each row execute procedure update_updated_at();
