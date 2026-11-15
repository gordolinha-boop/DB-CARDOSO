# Supabase e identidade — DB CARDOSO

## Estado desta etapa

Esta etapa prepara o cliente Supabase, serviços/contexto de autenticação e uma migration SQL de identidade e autorização. Ela **não cria um projeto Supabase**, não executa a migration e não configura login na interface existente. Sem as variáveis públicas, o dashboard atual continua renderizando e o contexto informa `configuration-error`.

Nenhuma organização, filial, conta de usuário ou dado comercial fictício foi inserido. A migration cria somente estrutura e a trigger que cria um perfil vazio quando o Supabase Auth cria um usuário.

## Modelo de dados

- `organizations`: empresas/tenants.
- `branches`: filiais pertencentes a uma organização.
- `profiles`: dados de apresentação ligados 1:1 a `auth.users`.
- `roles`: funções definidas dentro de uma organização.
- `permissions`: catálogo global de códigos de permissão.
- `role_permissions`: permissões concedidas a cada função.
- `memberships`: associação usuário-organização e função/status.
- `branch_memberships`: concessão explícita de acesso a filiais. É adicional às entidades solicitadas para que pertencer à organização não libere automaticamente todas as filiais.

As relações usam UUID, FKs compostas para impedir misturar filial/função de uma empresa com associação de outra, chaves únicas e índices para consultas usuais.

## Configuração local

1. No Supabase, crie o projeto e copie Project URL e a chave **publishable** (prefixo `sb_publishable_`; ou anon legacy, se o painel ainda fornecer essa opção).
2. Copie `.env.example` para `.env.local` na raiz e substitua somente os dois valores públicos pelos do seu projeto.
3. `.env.local`, `.env` e demais variantes locais estão ignorados pelo Git. Não coloque `service_role`, secret key, senha ou chave privada em variável `VITE_*`.
4. Instale dependências com `npm install`.

Variáveis esperadas:

- `VITE_SUPABASE_URL`: URL pública do projeto Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: chave publicável para uso no navegador. Ela não substitui RLS.

## Aplicar a migration manualmente

1. Abra Supabase Dashboard → SQL Editor.
2. Revise e execute o conteúdo de `supabase/migrations/20261115000100_identity_access_control.sql`.
3. Confira as tabelas em Database → Table Editor e confirme RLS habilitado em todas as oito tabelas.
4. Faça testes com dois usuários de teste e organizações isoladas antes de usar dados reais. Não considere autorização validada apenas pelo sucesso da migration.

A migration deliberadamente não oferece INSERT/DELETE/UPDATE de associações, funções ou permissões ao cliente autenticado. Portanto, ainda é necessária uma estratégia de provisionamento confiável (backend/Edge Function com validação e segredo mantido exclusivamente no servidor) para criar organizações, filiais e convites. Nunca use a chave service role na aplicação React.

## Auth frontend preparado

- `src/lib/supabase/client.ts`: cliente Supabase tipado e opcionalmente configurado.
- `src/services/authService.ts`: login, logout, recuperação e atualização de senha; lança erro se a configuração estiver ausente.
- `src/contexts/AuthContext.tsx`: sessão, usuário, perfil, organização/filial escolhida, permissões e tratamento de erro.
- `src/contexts/RequireAuth.tsx`: guard reutilizável para telas futuras.
- `src/main.tsx`: adiciona `AuthProvider` sem substituir o dashboard.

Não existe tela de login nesta etapa. O estado atual do dashboard não foi protegido para evitar fingir autenticação ou interromper a base visual. O fluxo de recuperação envia para `/auth/reset-password`, cuja tela/rota ainda precisa ser criada.

## Segurança e limitações

- Todas as tabelas da migration têm RLS. As políticas leem dados no escopo da organização e, para filiais, exigem uma concessão explícita ou permissão `branches.read_all`.
- Funções de autorização são `SECURITY DEFINER`, `STABLE`, usam `search_path` vazio e verificam `auth.uid()`; não há política que permita promover o próprio usuário. Escritas administrativas ficam bloqueadas no cliente nesta fase.
- O contexto React melhora a UX, mas não é fronteira de segurança: as políticas PostgreSQL são a autoridade.
- O perfil fica restrito ao próprio usuário; privilégios de escrita estão limitados às colunas de apresentação.
- A sessão Supabase persiste no armazenamento padrão do SDK do navegador. Para Electron e modo offline, será necessário desenhar armazenamento seguro/bridge apropriado; não compartilhar tokens secretos nem assumir que localStorage é armazenamento seguro no desktop.
- O dashboard atual ainda contém rótulos visuais como “Administrador” que são placeholders estáticos existentes, não identidade autenticada. Não os use para autorização.
- Permissões não são semeadas nem atribuídas automaticamente; catálogo e provisionamento devem ser configurados por processo confiável.

## Validação

A alteração foi feita por commit remoto, sem terminal de execução nesta sessão. Assim, `npm install`, `npx tsc --noEmit`, build e execução da migration **não foram executados nem comprovados**. Execute localmente/Codespaces:

```bash
npm install
npm ls --depth=0
npx tsc --noEmit
npm run build
```

Depois de instalar dependências, execute a migration no Supabase e teste o isolamento com usuários e organizações separados. Não considerar as políticas validadas até esses testes serem feitos.
