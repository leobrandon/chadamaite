# Site após o chá da Maitê

Design aprovado na conversa e na prévia em 25/10/2026; publicação autorizada pelo usuário.

Preservar design, fontes, temas, animações, componentes e mural existentes. Retirar contagem regressiva, presentes/combos, confirmação de presença, agenda/mapa/Pix da página pública. Trocar abertura pelo agradecimento aprovado. Data e local existentes continuam como memória. Preservar todos os registros e ferramentas administrativas atuais.

Álbum público único: grade, visualização ampliada com navegação, carregamento gradual, sem botão de download. Apenas administradores pelo PIN atual enviam várias fotos, com compressão, progresso, falhas explícitas e rascunhos persistentes. Publicar selecionadas após revisão. Seleção individual/múltipla/todas para lixeira, restauração ao estado anterior e exclusão definitiva com confirmação. Ordenação configurável: publicação recente, antiga ou aleatória estável durante a visita.

Abordagens: reutilizar Supabase e autenticação existentes ou introduzir serviço externo de fotos. Escolha de implementação: reutilizar Supabase Storage privado e Edge Function separada album-api; estados em pastas, sem migrações nas tabelas existentes. Evita modificar os dados do evento e mantém o PIN. Upload autorizado servidor, sem chaves administrativas no navegador. Álbum começa vazio; sem fotos de demonstração em produção.

Limites: imagens públicas podem ser capturadas/salvas pelo navegador. Sem edição/recorte, categorias, upload de convidados ou vídeos. Originais não serão guardados; fotos otimizadas para visualização. HEIC não suportado pelo navegador mostra instrução para conversão em JPEG. Tema e mural originais devem permanecer iguais.
