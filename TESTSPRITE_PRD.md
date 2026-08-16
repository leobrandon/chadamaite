# 🌸 TestSprite PRD - Especificação Técnica e Requisitos de Teste E2E
# Projeto: Chá de Bebê da Maitê (Leonardo & Isabella)

---

## 🔑 CREDENCIAIS E CONFIGURAÇÕES DE TESTE (Para Robô / TestSprite AI)

| Parâmetro de Teste | Valor para Automação | Descrição / Instrução para IA |
| :--- | :--- | :--- |
| **URL Base da Aplicação** | `https://chadamaite.vercel.app` | URL de produção hospedada na Vercel |
| **PIN / Senha do Painel Admin** | `16101928` | **Senha oficial do Painel dos Pais** |
| **Gatilho de Abertura do Admin** | `header button:has-text("Papais")` | Botão no canto superior direito do Navbar |
| **Campo de Entrada da Senha** | `input[type="password"]` | Placeholder: *"Digite a senha do painel"* |
| **Botão de Submissão da Senha** | `button[type="submit"]:has-text("Acessar Painel")` | Pressionar ou submeter o formulário |
| **Validação de Sucesso do Login** | Visualizar abas `Quem vai dar o que`, `Confirmações`, `Cadastrar/Editar Itens` | Indica autenticação aprovada e sessão iniciada |

> ⚠️ **Instrução Especial para a IA do TestSprite:**  
> Quando o robô de testes for executar fluxos administrativos:
> 1. Clicar no botão **"Papais"** no Navbar (`header button:has-text("Papais")`).
> 2. No modal que abrir (*"Área Restrita aos Pais"*), preencher o campo `input[type="password"]` com **`16101928`**.
> 3. Clicar em **"Acessar Painel"** (`button:has-text("Acessar Painel")`).
> 4. O modal passará para a visualização completa do painel administrativo. A sessão permanecerá salva no `sessionStorage` durante todo o ciclo de testes da aba.

---

## 1. Visão Geral do Produto e Arquitetura

### 1.1 Identificação do Produto
- **Nome da Aplicação:** Chá da Maitê
- **Propósito:** Single Page Application (SPA) responsiva para convite digital, confirmação de presença (RSVP), lista de presentes colaborativa com cotas/metas inteligentes, mural de recados moderado e gestão administrativa para os pais (Leonardo & Isabella).
- **Ambiente de Produção (Frontend):** Vercel Edge Hosting (`https://chadamaite.vercel.app`)
- **Backend & Database:** Supabase (PostgreSQL 15+ com Supabase Realtime e Row Level Security)

### 1.2 Stack Tecnológico
- **Core:** React 19, JavaScript (ESNext), Vite 8
- **Estilização:** Tailwind CSS 3, CSS Glassmorphism (`backdrop-filter`)
- **Tipografia:** Great Vibes (handwriting), Playfair Display (serif), Plus Jakarta Sans (sans-serif)
- **Ícones & Efeitos:** Lucide React, Canvas-Confetti
- **Armazenamento & Sincronização:** Supabase Database API (`@supabase/supabase-js`) com fallback em `localStorage` (cache local e modo offline) e eventos de janela (`CustomEvent`).

### 1.3 Arquitetura de Componentes
```
src/
├── App.jsx                   # Orquestrador principal, estado global e lazy loading do Admin
├── components/
│   ├── Navbar.jsx            # Header sticky com links âncora, share WhatsApp e acesso Admin
│   ├── HeroSection.jsx       # Hero com contagem regressiva viva e 3 botões de ação padronizados
│   ├── EventDetails.jsx      # Detalhes de Data/Hora/Local, Google Maps e botões de Agenda (.ics)
│   ├── GiftList.jsx          # Lista de presentes com filtros, busca e trava de meta atingida
│   ├── GiftModal.jsx         # Modal de escolha de quantidade e comprovante afetivo com WhatsApp
│   ├── RSVPSection.jsx       # Formulário de confirmação de presença com contadores táteis
│   ├── MessagesWall.jsx      # Mural de recados com likes e fluxo de moderação
│   ├── PixModal.jsx          # Modal com chave Pix e botão Copia e Cola
│   ├── AdminPanel.jsx        # Painel protegido dos pais (relatórios, CRUD com busca, moderação e config)
│   ├── ConfirmModal.jsx      # Modal in-app de confirmação para ações destrutivas (substitui alert/confirm)
│   ├── ScrollButtons.jsx     # Botões flutuantes de rolagem rápida (topo/rodapé)
│   └── Footer.jsx            # Rodapé com créditos afetivos e botão de compartilhamento
└── services/
    ├── supabaseClient.js     # Cliente Supabase configurado via variáveis de ambiente VITE_*
    └── storageService.js     # Camada de persistência, mapeamentos bidirecionais e Realtime debounced
```

---

## 2. Matriz de Perfis de Usuário & Regras de Visibilidade de Metas

| Funcionalidade / Visão | Convidado (Público Geral) | Administrador (Pais: Leonardo & Isabella) |
| :--- | :--- | :--- |
| **Barra de Progresso de Metas** | ❌ **Oculta / Não visível** | ✅ **Visível com barra e % de conclusão** |
| **Contadores de Quantidade Restante/Total** | ❌ **Ocultos** (Apenas vê botão ativo ou bloqueado) | ✅ **Visíveis** (ex: `2 de 3 un. recebidas - 67%`) |
| **Item com Cota Disponível** | Botão `"Vou dar este presente 💖"` ativo | Indicador de unidades parciais no relatório |
| **Item com Cota Esgotada** | Botão desabilitado com badge `"Completo ✨"` e texto informativo | Selo destacado `"Meta Atingida! 🎉"` no relatório |
| **Lista de Pessoas que Vão Presentear** | ❌ **Privada** (Não exibida) | ✅ **Accordion detalhado** (Nome, Qtd, Data, Ação Excluir) |
| **Moderação do Mural de Amor** | Envia recado como `pending` | Aprova ou recusa recados antes da publicação |
| **Acesso a Relatórios e Exportação CSV** | ❌ **Bloqueado** | ✅ **Acesso completo com download UTF-8** |

---

## 3. Fluxos de Usuário Detalhados (User Journeys)

### 3.1 Fluxo 1: Navegação Pública & Hero Section
1. **Carregamento Inicial:** O convidado acessa o site. Os dados são carregados instantaneamente do cache local / Supabase com skeleton loaders suaves.
2. **Contagem Regressiva Viva:** Na seção Hero (`#inicio`), o cronômetro calcula em tempo real dias, horas, minutos e segundos até a data configurada (`2026-10-17T18:00:00`).
3. **Botões de Ação Uniformes do Hero:**
   - Botão 1: `"Ver Lista de Presentes"` (Role suave até `#presentes`).
   - Botão 2: `"Confirmar Presença"` (Role suave até `#rsvp`).
   - Botão 3: `"Compartilhar"` (Abre intent do WhatsApp com link e texto pré-formatado).
4. **Adicionar à Minha Agenda:** Na seção de detalhes (`#evento`):
   - Botão `"Google Agenda"`: Abre nova aba com URL pré-preenchida do Google Calendar.
   - Botão `"Apple / Outlook (.ics)"`: Dispara download imediato do arquivo `cha-da-maite.ics`.

---

### 3.2 Fluxo 2: Escolha de Presente pelo Convidado (`GiftList` & `GiftModal`)
1. **Navegação na Lista:** O convidado pode filtrar por categoria (chips roláveis com indicador de sombra nas pontas) ou pesquisar por texto (nome, marca, tamanho).
2. **Avaliação do Estado do Card:**
   - **Caso A (Cota Disponível - `totalPledged < targetQuantity`):**
     - O card exibe emoji, título, categoria, descrição e botão `"Vou dar este presente 💖"`.
     - Ao clicar, abre o `GiftModal`.
   - **Caso B (Cota Esgotada - `totalPledged >= targetQuantity`):**
     - O card exibe badge suave `"Completo ✨"`.
     - O card exibe texto: `"Presente já completo por outros convidados ✨"`.
     - O botão está **desabilitado** (`disabled`, `aria-disabled="true"`) com texto `"Limite deste presente já foi preenchido 💖"` e ícone de cadeado. Nenhuma ação de abertura é disparada.
3. **Interação no `GiftModal`:**
   - O convidado digita seu nome no campo obrigatório (`maxLength=80`).
   - O seletor de quantidade permite escolher entre `1` e o máximo disponível (`remainingAvailable = targetQty - totalPledged`).
   - Se o convidado tentar submeter sem preencher o nome, o campo exibe borda vermelha e mensagem de erro (`nameError`).
4. **Confirmação e Celebração:**
   - Ao submeter com sucesso, é disparada animação de confete (`canvas-confetti`).
   - O registro é inserido na tabela `gift_pledges` do Supabase via `storageService.addPledge`.
   - O modal transiciona para a **Tela de Sucesso / Comprovante Afetivo**.
5. **Avisar os Papais no WhatsApp:**
   - A tela de sucesso exibe o botão destacado `"Avisar os papais no WhatsApp 💌"`.
   - O link gerado é `https://api.whatsapp.com/send?text=...` **sem número de telefone fixo**, abrindo o WhatsApp do convidado para ele escolher o contato dos pais, garantindo privacidade e flexibilidade.

---

### 3.3 Fluxo 3: Confirmação de Presença (RSVP)
1. O convidado rola até a seção `#rsvp`.
2. **Seleção de Presença:**
   - Opção 1: `"Sim, com certeza vou! 🎉"` (`attending: true`).
   - Opção 2: `"Infelizmente não poderei 😢"` (`attending: false`).
3. **Preenchimento dos Dados:**
   - Nome completo (Obrigatório, `maxLength=80`).
   - Se `"Sim"`:
     - Contador de Adultos (Mínimo: 1, botões ergonômicos `w-10 h-10`).
     - Contador de Crianças (Mínimo: 0, botões ergonômicos `w-10 h-10`).
     - Campos dinâmicos de Acompanhantes: gerados automaticamente conforme o total de convidados adicionais (`adults + children - 1`).
     - Telefone / WhatsApp (Opcional, `maxLength=25`).
     - Recado com Carinho (Opcional, `maxLength=500`).
4. **Submissão:**
   - Salva o registro em `rsvps` no Supabase.
   - Se o campo de recado foi preenchido, insere automaticamente o recado no Mural de Amor com `status: 'pending'`.
   - Dispara efeito de confete e exibe o card de sucesso `"Presença Confirmada com Sucesso!"`.

---

### 3.4 Fluxo 4: Mural de Amor & Curtidas (`MessagesWall`)
1. O convidado acessa `#recados`.
2. **Envio de Novo Recado:**
   - Digita nome e mensagem nos campos correspondentes.
   - Ao submeter, o recado é gravado em `messages` no Supabase com `status: 'pending'`.
   - Exibe alerta verde: *"Obrigado pelo carinho! Seu recado foi enviado e será exibido no mural assim que os papais aprovarem. 💖"*.
3. **Visualização de Recados Aprovados:**
   - Apenas mensagens com `status === 'approved'` são renderizadas no grid público.
4. **Curtidas (Likes):**
   - O convidado clica no botão de coração de um recado.
   - O contador de curtidas é incrementado no Supabase via `storageService.likeMessage` com persistência em tempo real.

---

### 3.5 Fluxo 5: Painel Administrativo dos Pais (`AdminPanel`)
1. **Abertura & Autenticação:**
   - Clica no botão `"Papais"` no Navbar ou no rodapé.
   - O componente `AdminPanel` é carregado sob demanda via `React.lazy()` / `Suspense`.
   - Se já autenticado na sessão atual (`sessionStorage.getItem('cha_maite_admin_auth') === 'true'`), abre direto no painel.
   - Caso contrário, exibe barreira de PIN. Digitar **`16101928`** e clicar em `"Acessar Painel"`. Ao validar o PIN correto, grava a sessão no `sessionStorage` e libera o acesso.
2. **Navegação nas Abas Administrativas:**
   - **Aba 1 - Relatório de Presentes (`gifts-report`):**
     - Lista todos os presentes cadastrados com campo de busca.
     - Exibe barra de progresso, porcentagem de conclusão e selo `"Meta Atingida! 🎉"` quando a cota estiver preenchida.
     - Accordion interativo: ao clicar em um presente, expande a lista de todos os convidados que contribuíram (Nome, Quantidade, Data e botão de lixeira para excluir contribuição com modal de confirmação).
     - Botão `"Exportar Relatório (CSV / Excel)"`.
   - **Aba 2 - Confirmações de Presença (`rsvps`):**
     - Cards com métricas consolidadas: Total de Confirmados, Adultos, Crianças e Não Comparecimentos.
     - Tabela detalhada de convidados com busca em tempo real.
     - Botão de lixeira para excluir resposta com modal de confirmação.
     - Botão `"Exportar Lista (CSV / Excel)"`.
   - **Aba 3 - Cadastrar / Editar Itens (`gifts`):**
     - Formulário de cadastro de novo presente: Ícone (Emoji), Título, Categoria, Prioridade, **Meta Desejada (Quantidade)** e Descrição.
     - **Campo de Busca:** Filtro em tempo real no topo da lista de presentes para localizar itens por nome, categoria ou marca.
     - Lista de cards verticais clicáveis (mobile-friendly). Ao tocar em qualquer card, abre o modal de edição.
     - Modal de edição: Permite alterar todos os dados (incluindo a meta numérica desejada) e possui botão de exclusão direta com confirmação.
     - Botão `"Restaurar Lista Padrão"` para resetar os presentes para o modelo inicial.
   - **Aba 4 - Moderação do Mural (`messages`):**
     - Filtro entre `"Aguardando Aprovação"` e `"Aprovados no Mural"`.
     - Recados pendentes: Botão verde `"Aprovar para o Mural"` e botão vermelho `"Recusar e Excluir"`.
     - Recados aprovados: Botão `"Remover do Mural"`.
   - **Aba 5 - Configurações do Evento (`config`):**
     - Formulário para editar nomes dos pais, bebê, datas, horários, endereço, link do mapa, chave Pix e novo PIN.
3. **Bloqueio de Sessão:**
   - Botão `"Bloquear"` (ícone de cadeado) no cabeçalho do painel limpa o `sessionStorage` e tranca o acesso imediatamente.

---

## 4. Regras de Negócio e Casos de Borda para Validação E2E

| ID Caso | Cenário de Teste | Comportamento Esperado |
| :--- | :--- | :--- |
| **BR-001** | **Tentativa de presentear item esgotado** | O botão de presentear deve estar desabilitado (`disabled`). Clicar não deve abrir modal nem registrar contribuição. |
| **BR-002** | **Ocultação de Metas na Visão Pública** | O DOM do `GiftList` na visão do convidado NÃO deve conter barras de progresso, porcentagens (`%`) ou contadores numéricos de metas (`X de Y`). |
| **BR-003** | **Seleção de Quantidade no Modal** | A quantidade máxima selecionável no `GiftModal` deve ser estritamente igual a `Math.max(1, targetQuantity - totalPledged)`. |
| **BR-004** | **Validação de Nome Obrigatório no Presente** | Tentar clicar em "Confirmar Presente" com o campo nome vazio deve exibir mensagem de erro e bloquear o avanço. |
| **BR-005** | **Compartilhamento WhatsApp sem Telefone Fixo** | O botão de avisar no WhatsApp deve gerar URL iniciando com `https://api.whatsapp.com/send?text=` sem o parâmetro `phone=`. |
| **BR-006** | **Moderação Obrigatória de Recados** | Recados enviados por convidados entram com `status: 'pending'` e NÃO aparecem no mural público até que o admin clique em "Aprovar". |
| **BR-007** | **Persistência de Mensagens Excluídas** | Ao excluir recados padrão no painel, a tabela vazia do Supabase NÃO deve re-inserir recados mock ao recarregar a página. |
| **BR-008** | **Autenticação com Senha Admin (16101928)** | Inserir `16101928` no campo de senha desbloqueia o painel administrativo e persiste a sessão no `sessionStorage`. |
| **BR-009** | **Expiração de Sessão Admin** | Fechar a aba/navegador ou clicar no botão "Bloquear" deve limpar o `sessionStorage` e exigir o PIN no próximo acesso. |
| **BR-010** | **Formatação Dinâmica de Acompanhantes** | Se o convidado selecionar 3 adultos e 1 criança (total 4), devem ser exibidos exatamente 3 campos para nomes de acompanhantes adicionais. |
| **BR-011** | **Prevenção de Zoom no iOS** | Todos os inputs, textareas e selects devem possuir tamanho de fonte de pelo menos 16px no mobile (`text-base sm:text-sm`). |
| **BR-012** | **Prevenção de Colisão de IDs** | A criação de novos registros no banco deve utilizar `crypto.randomUUID()` em vez de timestamps simples. |
| **BR-013** | **Exportação CSV com Caracteres UTF-8** | Os arquivos CSV gerados para RSVP e Presentes devem conter o BOM UTF-8 (`\uFEFF`) para abrir corretamente no Microsoft Excel com acentuação. |

---

## 5. Mapeamento de Rotas, Elementos da UI e Seletores Chave

### 5.1 Rotas e Âncoras da Aplicação (SPA)
| Rota / Âncora | Descrição | Componente Responsável |
| :--- | :--- | :--- |
| `/` ou `/#inicio` | Hero Section com Contagem Regressiva e Botões | `src/components/HeroSection.jsx` |
| `/#evento` | Data, Horário, Localização e Agenda | `src/components/EventDetails.jsx` |
| `/#presentes` | Lista de Presentes e Filtros por Categoria | `src/components/GiftList.jsx` |
| `/#rsvp` | Formulário de Confirmação de Presença | `src/components/RSVPSection.jsx` |
| `/#recados` | Mural de Amor e Formulário de Recadinhos | `src/components/MessagesWall.jsx` |

---

### 5.2 Seletores e Elementos Chave para Automação de Testes

#### A. Cabeçalho / Navbar (`Navbar.jsx`)
- **Container do Header:** `header.sticky`
- **Botão Logo / Início:** `header button:has-text("Chá da Maitê")`
- **Link Presentes:** `header button:has-text("Lista de Presentes")`
- **Link RSVP:** `header button:has-text("Confirmar Presença")`
- **Link Mural:** `header button:has-text("Mural de Amor")`
- **Botão Compartilhar WhatsApp:** `header a[title="Compartilhar Convite no WhatsApp"]`
- **Botão Painel Admin (Papais):** `header button:has-text("Papais")`

#### B. Hero Section (`HeroSection.jsx`)
- **Seção Hero:** `section#inicio`
- **Blocos do Contador Regressivo:** `section#inicio .font-serif.font-bold` (Dias, Horas, Minutos, Segundos)
- **Botão CTA Presentes:** `section#inicio button:has-text("Ver Lista de Presentes")`
- **Botão CTA RSVP:** `section#inicio button:has-text("Confirmar Presença")`
- **Botão CTA Compartilhar:** `section#inicio a:has-text("Compartilhar")`

#### C. Lista de Presentes (`GiftList.jsx`)
- **Seção Presentes:** `section#presentes`
- **Campo de Busca de Presentes:** `input[placeholder*="Buscar presentes por nome"]`
- **Botões de Categoria:** `section#presentes button:has-text("Todas")`, `button:has-text("Fraldas")`, etc.
- **Card de Presente Disponível:** `div.glass-card:has(button:has-text("Vou dar este presente 💖"))`
- **Botão Presentear (Ativo):** `button:has-text("Vou dar este presente 💖")`
- **Card de Presente Esgotado:** `div.glass-card:has(button[disabled])`
- **Badge de Item Completo:** `span:has-text("Completo ✨")`
- **Botão Presentear (Desabilitado):** `button[disabled]:has-text("Limite deste presente já foi preenchido 💖")`

#### D. Modal de Escolha do Presente (`GiftModal.jsx`)
- **Container do Modal:** `div[role="dialog"]:has-text("Presentear a Maitê")`
- **Botão Fechar Modal:** `div[role="dialog"] button[aria-label="Fechar"]`
- **Input Nome do Convidado:** `div[role="dialog"] input[placeholder*="Ex: Titia Amanda"]`
- **Contador de Quantidade:** `div[role="dialog"] button:has-text("-")` e `button:has-text("+")`
- **Botões Rápidos de Quantidade:** `div[role="dialog"] button:has-text("1 un")`, `button:has-text("2 un")`
- **Botão Confirmar Presente:** `div[role="dialog"] button:has-text("Confirmar Presente com Amor")`
- **Tela de Sucesso:** `div[role="dialog"]:has-text("Presente Escolhido com Amor!")`
- **Botão Avisar no WhatsApp:** `div[role="dialog"] a:has-text("Avisar os papais no WhatsApp 💌")`

#### E. Confirmação de Presença (`RSVPSection.jsx`)
- **Seção RSVP:** `section#rsvp`
- **Botão Vou Comparecer:** `button:has-text("Sim, com certeza vou!")`
- **Botão Não Poderei:** `button:has-text("Infelizmente não poderei")`
- **Input Nome Principal:** `input[placeholder*="Seu nome completo"]`
- **Contador de Adultos (+/-):** `section#rsvp .flex.items-center button`
- **Contador de Crianças (+/-):** `section#rsvp .flex.items-center button`
- **Inputs de Acompanhantes:** `input[placeholder*="Nome do acompanhante"]`
- **Input Telefone:** `input[placeholder*="(00) 00000-0000"]`
- **Textarea Mensagem:** `textarea[placeholder*="Deixe um recadinho especial"]`
- **Botão Confirmar RSVP:** `button[type="submit"]:has-text("Confirmar Presença")`
- **Alerta de Sucesso:** `div:has-text("Presença Confirmada com Sucesso!")`

#### F. Mural de Amor (`MessagesWall.jsx`)
- **Seção Mural:** `section#recados`
- **Input Nome Autor:** `section#recados input[placeholder*="Seu nome"]`
- **Textarea Recado:** `section#recados textarea[placeholder*="Escreva seu recadinho"]`
- **Botão Publicar Recado:** `button[type="submit"]:has-text("Publicar Recado")`
- **Alerta de Moderação Pendente:** `div:has-text("Seu recado foi enviado e será exibido no mural assim que os papais aprovarem")`
- **Card de Mensagem Aprovada:** `section#recados .glass-card`
- **Botão Curtir (Like):** `section#recados button:has(svg.lucide-heart)`

#### G. Painel Administrativo (`AdminPanel.jsx`)
- **Container do Modal Admin:** `div.fixed:has-text("Área Restrita aos Pais")` ou `div.fixed:has-text("Painel Administrativo dos Pais")`
- **Input de Senha (PIN):** `input[type="password"]` (Placeholder: *"Digite a senha do painel"*) — **Valor: `16101928`**
- **Botão Entrar no Admin:** `button[type="submit"]:has-text("Acessar Painel")`
- **Botão Bloquear Sessão:** `button[title="Bloquear Painel com Senha"]`
- **Botão Fechar Admin:** `button[aria-label="Fechar"]`
- **Abas do Painel:**
  - `button:has-text("Quem vai dar o que")`
  - `button:has-text("Confirmações")`
  - `button:has-text("Cadastrar/Editar Itens")`
  - `button:has-text("Mural de Amor")`
  - `button:has-text("Configurações")`
- **Accordion de Presentes:** `div.divide-y button:has-text("un. recebidas")`
- **Botão Exportar CSV (RSVP / Presentes):** `button:has-text("Exportar")`
- **Formulário Novo Presente:**
  - Input Nome: `input[placeholder*="Ex: Banheira"]`
  - Input Meta: `input[type="number"]`
  - Botão Adicionar: `button[type="submit"]:has-text("Adicionar")`
- **Busca de Presentes na Gestão:** `input[placeholder*="Buscar item por nome, categoria ou marca"]`
- **Modal de Confirmação In-App:** `div[role="alertdialog"]:has-text("Tem certeza")`
  - Botão Confirmar Ação: `div[role="alertdialog"] button:has-text("Sim")`
  - Botão Cancelar: `div[role="alertdialog"] button:has-text("Cancelar")`

---

## 6. Critérios de Aceite para Aprovação nos Testes E2E (Definition of Done)

1. **Testes de Regressão Visual e Responsividade:**
   - [ ] Sem quebras de layout ou textos cortados em resoluções Desktop (1920x1080, 1366x768), Tablet (768x1024) e Mobile (375x667, 390x844, 412x915).
   - [ ] Nenhum elemento ultrapassa a largura máxima da janela horizontalmente (sem scrollbar horizontal indesejada).

2. **Testes de Funcionalidade Pública:**
   - [ ] RSVP submete com sucesso e atualiza o estado da aplicação.
   - [ ] Presente disponível pode ser escolhido com quantidade até o limite restante.
   - [ ] Presente esgotado fica desabilitado e não permite seleção.
   - [ ] Nenhuma barra de progresso ou meta numérica é visível para o convidado.
   - [ ] Botão do WhatsApp gera a mensagem correta sem telefone fixo.

3. **Testes de Moderação e Administração:**
   - [ ] PIN incorreto bloqueia o acesso e exibe mensagem de erro.
   - [ ] PIN correto (`16101928`) concede acesso e mantém a sessão ativa no `sessionStorage`.
   - [ ] Moderação de recados reflete instantaneamente no mural público após aprovação.
   - [ ] Relatórios de presentes exibem as metas e porcentagens com precisão matemática.
   - [ ] Exclusões disparam o modal `ConfirmModal` in-app antes de deletar registros.
