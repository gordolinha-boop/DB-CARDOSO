# Supabase e identidade — DB CARDOSO

## Estado desta etapa

Esta etapa prepara o cliente Supabase, serviços/contexto de autenticação e uma migration SQL de identidade e autorização. Ela **não cria um projeto Supabase**, não executa a migration e não configura login na interface existente. Sem as variáveis públicas, o dashboard atual continua renderizando e o contexto informa `configuration-error`.

Nenhuma organização, filial, conta de usuário ou dado comercial fictício foi inserido. A migration cria somente estrutura e perfis vazios para usuários já existentes e para novos usuários criados pelo Supabase Auth.

## Modelo de dados

- `organizations`: empresas/tenants.
- `branches`: filiais pertencentes a uma organização.
- `profiles`: dados de apresentação ligados 1:1 a `auth.users`.
- `roles`: funções definidas dentro de uma organização.
- `permissions`: catálogo global de códigos de permissão.
- `role_permissions`: permissões concedidas a cada função.
- `memberships`: associação usuário-organização e função/status.
- `branch_memberships`: concessão explícita de acesso a filiais, para que o vínculo com a organização não libere todas as filiais.

As relações usam UUID, FKs compostas para impedir misturar filial/função de uma empresa com associação de outra, chaves únicas e índices.

## Configuração local

1. No Supabase, crie o projeto e copie Project URL e a chave **publishable** (prefixo `sb_publishable_`; ou anon legacy, se o painel ainda fornecer essa opção).
2. Copie `.env.example` para `.env.local` na raiz e substitua somente os dois valores públicos pelos do seu projeto.
3. `.env.local`, `.env` e demais variantes locais estão ignorados pelo Git. Não coloque `service_role`, secret key, senha ou chave privada em variável `VITE_*`.
4. Instale dependências com `npm install`.

## Revisão e aplicação manual da migration

A migration está em `supabase/migrations/20261115000100_identity_access_control.sql`. **Ela ainda não foi aplicada.** Antes de aplicar:

1. Confirme Supabase Dashboard → API → Exposed schemas: mantenha `private` fora da lista exposta ao PostgREST (por padrão, exponha somente os schemas necessários, normalmente `public`).
2. No Supabase Dashboard → SQL Editor, revise e execute o SQL somente após aprovação.
3. Confira RLS habilitado nas oito tabelas e as permissões no Table Editor.
4. Teste com dois usuários e organizações separados antes de dados reais.

A migration deliberadamente não permite INSERT/DELETE de associações, nem UPDATE de memberships, roles ou permissões pelo cliente autenticado. O provisionamento e alterações administrativas precisam de processo confiável no servidor. Nunca use a chave service role na aplicação React.

## Segurança e limitações

- Todas as tabelas da migration têm RLS. A leitura é autorizada conforme associação ativa e permissões; filiais exigem concessão explícita ou permissão `branches.read_all`.
- Funções de autorização ficam no schema `private` não exposto, são `SECURITY DEFINER`, usam `search_path` vazio e consultam `auth.uid()`. Elas precisam ser chamadas pelas policies, mas não devem ser publicadas como RPC via PostgREST.
- O cliente React é UX, não fronteira de segurança: as policies PostgreSQL são a autoridade.
- Perfil só pode ser lido pelo próprio usuário; update limitado às colunas de apresentação.
- A trigger cria perfil vazio para novos usuários, e migration backfill para usuários Auth preexistentes. Não cria associação a organização nem filial.
- Permissões não são semeadas nem atribuídas automaticamente; o provisionamento confiável ainda precisa ser projetado.
- O contexto React carrega permissões por consultas à tabela `role_permissions`, cuja leitura exige `roles.read`; ainda será necessário alinhar esse carregamento ao modelo final de permissão antes de conectar a interface de autorização.
- A sessão usa persistência padrão do SDK no navegador. Electron/offline exige desenho separado de armazenamento seguro e sincronização.
- O dashboard atual ainda contém rótulos visuais estáticos como “Administrador”; não são identidade autenticada nem autorização.

## Validação

A revisão é estática e o arquivo foi preparado para aprovação. Não houve conexão ao projeto Supabase, execução SQL, instalação npm ou execução dos comandos TypeScript/build nesta sessão. Execute localmente/Codespaces:

```bash
npm install
npm ls --depth=0
npx tsc --noEmit
npm run build
```

Não considerar RLS validado até aplicar em ambiente de teste e executar testes negativos/positivos com duas contas e duas organizações.
