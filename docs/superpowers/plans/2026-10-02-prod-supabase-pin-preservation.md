# Publicação do backend sem alterar o PIN de produção

> **Plano de execução:** execução nativa nesta sessão, conforme solicitação direta do usuário.

**Goal:** Publicar as correções do Chá da Maitê na main e preparar o Supabase de produção sem redefinir o PIN existente nem substituir dados do evento.

**Architecture:** Primeiro, uma migração aditiva cria apenas estruturas ausentes e uma Edge Function que aceita o PIN legado somente na primeira autenticação válida, armazena o mesmo valor como hash PBKDF2 e apaga a cópia em texto puro na mesma transação. O frontend vai para produção com esse backend já pronto. Depois que o novo frontend estiver ativo, uma segunda migração revoga o acesso direto antigo às tabelas e ao RPC administrativo, sem interromper a versão antiga durante a troca.

**Tech Stack:** PostgreSQL/Supabase, Supabase Edge Functions (Deno/TypeScript), React/Vite, Git.

**Spec:** Solicitação do usuário nesta conversa: o PIN atual de produção deve permanecer exatamente o mesmo.

## Restrições

- Nunca consultar, imprimir, inserir ou redefinir o valor do PIN.
- Não executar scripts de bootstrap que inserem dados de demonstração em produção.
- Não apagar nem substituir registros de evento, presentes, reservas, confirmações ou recados.
- Validar a migração aditiva e a função em homologação antes de produção.
- Enviar para main sem force-push.
- Aplicar o endurecimento de permissões somente depois que a versão nova estiver ativa.

## Revisão focada

- PIN legado correto: migra para hash sem mudar a sequência digitada; a cópia em texto puro é apagada na mesma transação.
- PIN incorreto: não cria credencial nem altera o valor legado.
- Leitura pública: após o corte, anon não consegue ler admin_pin; campos públicos do evento seguem disponíveis.
- Totais de presentes: são derivados das reservas existentes; nenhuma reserva é removida.
- Operações administrativas: seguem protegidas pela sessão customizada validada no handler da função.
- Migração parcial/conflito de primeira autenticação: a transação SQL não deixa credencial e PIN legado em estado inconsistente.

## Tarefas

### 1. Compatibilidade do login legado

**Arquivos:** supabase/functions/app-api/index.ts, supabase/functions/app-api/auth-utils.mjs e teste Node nativo.

- Tornar a ausência da linha de credenciais um caminho de migração do login.
- Comparar o PIN informado ao legado somente dentro da função; limitar tentativas antes da verificação.
- Criar hash PBKDF2 apenas após correspondência e chamar uma função SQL transacional que insere a credencial e limpa admin_pin.
- Preservar o fluxo atual quando já existe credencial com hash.
- Testar igualdade do PIN legado e derivação do hash com node --test.

### 2. Migração SQL aditiva

**Arquivos:** supabase/production/001_add_compatible_backend.sql e supabase_schema.sql.

- Adicionar target_quantity e display_order ausentes; preservar linhas existentes e usar limite alto para presentes já cadastrados.
- Criar tabelas de credenciais, tentativas e totais; preencher os totais a partir das reservas existentes.
- Criar funções/triggers para inicialização, limite concorrente e sincronização das quantidades.
- Criar o view público de presentes e permitir leitura pública apenas dos totais necessários.
- Não revogar ainda os acessos que a versão atual em produção usa.

### 3. Homologação

- Aplicar a migração aditiva no Supabase de homologação e atualizar app-api.
- Conferir tabelas, triggers, permissões e consistência entre pledges e totais.
- Executar o teste Node do helper e npm run build.
- Não inserir dados artificiais no site/banco sem removê-los imediatamente.

### 4. Preparar backend de produção

- Registrar contagens e a presença booleana do PIN legado, sem ler seu valor.
- Aplicar somente a migração aditiva e publicar app-api com verify_jwt=false, pois o handler valida sessão customizada.
- Confirmar estruturas, contagens e função ativa; ainda não revogar o acesso legado.

### 5. Publicar frontend e endurecer acesso

- Criar commit local no ramo de homologação e enviar por fast-forward para main.
- Aguardar confirmação da nova versão no deploy de produção.
- Aplicar supabase/production/002_harden_public_access.sql para remover políticas e permissões diretas antigas e o acesso público ao RPC legado.
- Confirmar o estado final de permissões e as contagens dos dados.

## Verificação de conclusão

- node --test no helper: todos os casos passam.
- npm run build: exit code 0.
- Migração aditiva e função ativos primeiro em homologação, depois em produção.
- Contagens de registros existentes preservadas, descontadas novas atividades legítimas durante o deploy.
- PIN legado continua presente até o primeiro login válido; após migração, só a hash do mesmo PIN permanece.
- Migração de hardening impede anon de ler admin_pin e executar get_admin_rsvps.
- main remoto contém o commit esperado, sem force-push.
