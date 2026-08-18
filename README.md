# 🌸 Chá de Bebê da Maitê | Leonardo & Isabella 🍼

Documentação técnica, arquitetura de software, modelagem de banco de dados e regras de negócio do aplicativo **Chá da Maitê**.

---

## 1. 🌟 Visão Geral e Stack

### 1.1 Objetivo do Projeto
O **Chá da Maitê** é uma *Single Page Application* (SPA) interativa, elegante e moderna desenvolvida para centralizar a experiência do chá de bebê da **Maitê** (filha de Leonardo & Isabella). A aplicação oferece convite digital interativo, confirmação de presença (RSVP) com controle de acompanhantes, lista colaborativa de presentes com cotas/metas inteligentes, mural de recados afetivos moderado e um painel de controle administrativo completo para os pais.

### 1.2 Stack Tecnológico
- **Frontend Core:** React 19, JavaScript moderno (ESNext), Vite 8
- **Estilização & Design System:** Tailwind CSS 3, Efeitos Glassmorphism (`backdrop-filter`), Design Tokens personalizados (*Blush Rosé*, *Creme*, *Dourado*)
- **Ícones & Efeitos Visuais:** Lucide React, Canvas-Confetti (animações de celebração)
- **Tipografia:** Great Vibes (handwriting/caligrafia), Playfair Display (serif clássico), Plus Jakarta Sans (sans-serif moderno)
- **Backend & Realtime:** Supabase (PostgreSQL 15+, Supabase Realtime Channels, Row Level Security)
- **Persistência Local & Offline Fallback:** Web Storage API (`localStorage` e `sessionStorage`) com sincronização orientada a eventos (`CustomEvent`)
- **Build & CI/CD:** Vite Pipeline, Vercel Edge Hosting

---

## 2. 🗄️ Banco de Dados e Schemas (Supabase)

A persistência em nuvem utiliza o **Supabase PostgreSQL** estruturado em tabelas relacionais com chaves primárias textuais/UUIDs compatíveis com geração descentralizada (`crypto.randomUUID`).

### 2.1 Estrutura das Tabelas

#### 📌 `event_config` (Configurações Gerais do Evento)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `text` (PK) | Identificador fixo (`default_config`) |
| `baby_name` | `text` | Nome do bebê ("Maitê") |
| `parents` | `text` | Nomes dos pais ("Leonardo & Isabella") |
| `event_date` | `text` / `date` | Data no formato ISO (`2026-10-17`) |
| `event_time` | `text` | Horário do evento (`18:00`) |
| `display_date` | `text` | Data formatada para exibição pública |
| `display_time` | `text` | Horário formatado para exibição |
| `location_name` | `text` | Nome do local do evento |
| `address` | `text` | Endereço com número e bairro |
| `city` | `text` | Cidade e estado |
| `map_url` | `text` | Link de navegação no Google Maps |
| `pix_key` | `text` | Chave Pix para presentes em dinheiro |
| `pix_name` | `text` | Nome do titular da conta Pix |
| `admin_pin` | `text` | PIN/Senha de acesso ao painel |
| `welcome_message` | `text` | Mensagem de boas-vindas na tela inicial |

#### 📌 `gifts` (Catálogo de Presentes)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `text` (PK) | Identificador único do item |
| `title` | `text` | Nome/Título do presente |
| `category` | `text` | Categoria (Fraldas, Higiene, Passeio, etc.) |
| `description` | `text` | Descrição do item (suporta tags de metadados `[meta:X]` `[order:Y]`) |
| `icon` | `text` | Emoji representativo |
| `status` | `text` | Status de disponibilidade legado (`available`, `reserved`) |
| `reserved_by` | `text` | Nome do convidado responsável (legado) |
| `reserved_at` | `timestamptz` | Data e hora da reserva (legado) |
| `priority` | `text` | Nível de prioridade (`high`, `medium`, `low`) |
| `target_quantity` | `integer` | Meta desejada de unidades do item (padrão: `5`) |
| `display_order` | `integer` | Ordem de exibição na listagem |
| `created_at` | `timestamptz` | Data de cadastro |

#### 📌 `gift_pledges` (Cotas / Contribuições de Presentes)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `text` (PK) | Identificador único da contribuição |
| `gift_id` | `text` (FK -> `gifts.id`) | Chave estrangeira referenciando o presente |
| `giver_name` | `text` | Nome do convidado que reservou |
| `quantity` | `integer` | Quantidade de unidades escolhidas pelo convidado |
| `created_at` | `timestamptz` | Data e hora da contribuição |

#### 📌 `rsvps` (Confirmações de Presença)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `text` (PK) | Identificador único da resposta |
| `name` | `text` | Nome completo do convidado principal |
| `attending` | `boolean` | `true` (Confirmado) ou `false` (Não comparecerá) |
| `adults_count` | `integer` | Quantidade total de adultos |
| `children_count` | `integer` | Quantidade total de crianças |
| `companion_names` | `text[]` / `jsonb` | Array com os nomes individuais dos acompanhantes |
| `phone` | `text` | WhatsApp / Telefone com máscara `(00) 00000-0000` |
| `message` | `text` | Recado afetivo opcional |
| `created_at` | `timestamptz` | Data e hora da confirmação |

#### 📌 `messages` (Mural de Carinho e Recados)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `text` (PK) | Identificador único do recado |
| `author` | `text` | Nome do autor |
| `text` | `text` | Conteúdo da mensagem |
| `date` | `text` | Rótulo temporal amigável |
| `likes` | `integer` | Contador de corações/curtidas recebidas |
| `status` | `text` | Moderação: `'pending'` (aguardando) ou `'approved'` (visível) |
| `created_at` | `timestamptz` | Data de criação |

### 2.2 Políticas de Segurança (Row Level Security - RLS)
- **Leitura Pública (`SELECT`):** Permitida para o papel anônimo (`anon`) em todas as tabelas públicas, permitindo renderização instantânea do catálogo de presentes, dados do evento, confirmações e recados moderados.
- **Inserção Pública (`INSERT`):** Convidados podem submeter confirmações de presença (`rsvps`), escolher cotas de presentes (`gift_pledges`) e enviar recados (`messages` criadas inicialmente com status `pending`).
- **Resiliência em Atualizações (`UPDATE` / `DELETE`):** A camada de serviço (`storageService`) implementa validações defensivas, tratamento de esquemas legados e estratégia de recriação atômica (`delete` + `insert`) com sincronização garantida quando o RLS restringe comandos diretos de mutação pelo cliente anônimo.

---

## 3. 🎯 Funcionalidades e Regras de Negócio

### 3.1 Fluxo Público (Experiência do Convidado)
- **Hero & Contagem Regressiva Viva:** Cronômetro dinâmico calculando dias, horas, minutos e segundos até o evento, além de botões com navegação suave para as seções principais.
- **Detalhes do Evento & Integração com Calendários:**
  - Botão de abertura de rotas no Google Maps.
  - Botão "Google Agenda" com parâmetros de data/local pré-preenchidos.
  - Download imediato de convite `.ics` compatível com Apple Calendar e Microsoft Outlook.
- **Lista de Presentes Inteligente (Cotas & Metas Privativas):**
  - Filtro por categorias temáticas e campo de busca textual em tempo real.
  - **Regra de Privacidade Afetiva:** Barras de progresso e porcentagens numéricas são **ocultas** para convidados, mantendo a atmosfera acolhedora e sem conotação mercantil.
  - **Trava de Cota:** Se o total arrecadado atingir a meta (`totalPledged >= targetQuantity`), o card exibe o selo `"Completo ✨"` e o botão de presentear é bloqueado.
  - **Modal de Escolha:** Seleção de quantidade limitada ao saldo restante (`targetQuantity - totalPledged`), validação de nome obrigatório e animação de confetes ao concluir.
  - **Aviso no WhatsApp:** Botão de comprovante afetivo que abre o WhatsApp diretamente com texto formatado sem número fixo injetado, permitindo ao convidado escolher livremente o contato dos pais.
- **Confirmação de Presença (RSVP):**
  - Opções claras: "Sim, com certeza vou!" ou "Infelizmente não poderei".
  - Contadores ergonômicos para contagem de Adultos e Crianças.
  - Geração automática e dinâmica de campos para preenchimento obrigatório dos nomes de todos os acompanhantes.
  - Máscara de telefone com formatação automática e inserção opcional de recado direto no Mural.
- **Mural de Amor & Moderação:**
  - Publicação de mensagens que entram em fila de moderação (`pending`).
  - Sistema de curtidas com incremento em tempo real.

### 3.2 Painel Administrativo dos Pais (Área Restrita)
- **Autenticação & Proteção:** Acesso por PIN/Senha com sessão segura mantida via `sessionStorage` e botão de bloqueio instantâneo.
- **Aba 1 - Relatório de Cotas de Presentes (`Quem vai dar o que`):**
  - Visão detalhada com barras de progresso, porcentagens e selos de "Meta Atingida! 🎉".
  - Accordion expansível exibindo lista nominal dos convidados que presentearam cada item, com opção de exclusão e confirmação in-app (`ConfirmModal`).
- **Aba 2 - Relatório de Confirmações (`Confirmações`):**
  - Métricas agregadas: Total de Confirmados, Total de Adultos, Total de Crianças e Ausências.
  - Tabela com busca, paginação, exclusão e **Modal de Edição de RSVP** (alteração de nomes, quantidades e acompanhantes).
- **Aba 3 - Gestão do Catálogo de Presentes (`Cadastrar/Editar Itens`):**
  - Formulário para adicionar novos itens com emojis, prioridades e meta numérica.
  - Campo de busca em tempo real na lista de itens cadastrados.
  - Modal de edição completo de presentes e opção de restauração da lista padrão.
- **Aba 4 - Moderação de Recados (`Mural de Amor`):**
  - Gerenciamento de recados pendentes e aprovados com aprovação ou recusa com 1 clique.
- **Aba 5 - Configurações Gerais (`Configurações`):**
  - Edição de datas, endereços, links, chaves Pix e troca do PIN de segurança.
- **Exportação de Dados:** Exportação de relatórios para **CSV/Excel** formatados com cabeçalho BOM UTF-8 (`\uFEFF`), garantindo acentuação perfeita.

---

## 4. 🎨 Gerenciamento de Estado, Tema e Cache

### 4.1 Implementação do Tema Light / Dark
- **Regra de Inicialização:** O padrão obrigatório no primeiro acesso ou em abas anônimas é o **Tema Claro (Light)**.
- **Hook `useDarkMode`:**
  - Lê a preferência salva na chave `cha_maite_dark_mode` no `localStorage`.
  - Manipula a classe `.dark` no elemento raiz `<html>`.
  - Alternância imediata com feedback tátil e persistência automática.

### 4.2 Arquitetura de Sincronização e Cache
```
┌────────────────────────────────────────────────────────┐
│                   Supabase Database                    │
│            (event_config, gifts, rsvps...)             │
└───────────────────────────┬────────────────────────────┘
                            │ Realtime Postgres Changes
                            ▼
┌────────────────────────────────────────────────────────┐
│              storageService (Data Layer)               │
│   - Debounce de 300ms para requisições em lote         │
│   - Mapeamento bidirecional DB <-> CamelCase UI        │
│   - Fallback e espelhamento em localStorage            │
└───────────────────────────┬────────────────────────────┘
                            │ CustomEvents / Callbacks
                            ▼
┌────────────────────────────────────────────────────────┐
│             React UI State (Components)                │
│    (App.jsx, GiftList, RSVPSection, MessagesWall...)   │
└────────────────────────────────────────────────────────┘
```
- **Sincronização em Tempo Real com Debounce:** O listener no canal `postgres_changes` agrupa eventos com debounce de 300ms, prevenindo requisições redundantes e garantindo fluidez mesmo sob múltiplos acessos simultâneos.
- **Eventos Globais na Janela:** Disparo de `CustomEvent` (`gifts_updated`, `rsvps_updated`, `messages_updated`, `config_updated`) para atualização reativa instantânea entre abas e componentes.
- **Modo Offline & Cache First:** Todos os dados são cacheados no `localStorage`, garantindo carregamento instantâneo (zero delay percebido pelo usuário) antes mesmo da resposta do Supabase.

---

## 5. 🚀 Variáveis de Ambiente e Deploy

### 5.1 Variáveis de Ambiente Necessárias
Crie um arquivo `.env` ou `.env.local` na raiz do projeto (ou configure no painel da Vercel):

```env
# URL do projeto no Supabase
VITE_SUPABASE_URL=https://sua-instancia.supabase.co

# Chave anônima pública do Supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

> **Nota:** Caso as variáveis de ambiente não estejam configuradas, o sistema opera de forma autônoma utilizando o `localStorage` do navegador para testes locais.

### 5.2 Fluxo de Deploy Contínuo (Vercel + GitHub)
1. **Repositório:** Envie o código para o GitHub (`main` branch).
2. **Importação na Vercel:**
   - Acesse [vercel.com](https://vercel.com) e selecione **"Add New..." ➔ "Project"**.
   - Selecione o repositório do projeto.
   - O Framework Preset **Vite** será reconhecido automaticamente.
3. **Configuração de Build:**
   - **Build Command:** `npm run build` ou `vite build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. **Environment Variables:**
   - Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações do projeto na Vercel.
5. **Publicação:**
   - Clique em **"Deploy"**. Novos commits na branch principal dispararão deploys automáticos em segundos.

---

## 🛠️ Comandos de Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (HMR ativo)
npm run dev

# Gerar build de produção otimizado
npm run build

# Executar linter rápido
npm run lint

# Pré-visualizar build local
npm run preview
```
