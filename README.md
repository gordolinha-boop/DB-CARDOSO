# DB CARDOSO — estrutura inicial

Projeto inicial de uma plataforma de gestão comercial para loja de roupas.

## Estado atual

Este pacote contém a estrutura visual inicial em React + TypeScript + Vite. Os módulos exibidos são navegação e telas de preparação; **não existe ainda persistência comercial, autenticação integrada à interface, emissão fiscal, venda real, integração de pagamento ou sincronização**.

## Requisitos de desenvolvimento

- Node.js 20 ou superior
- npm
- Git

## Executar localmente

```bash
npm install
npm run dev
```

## Validar

```bash
npm run typecheck
npm run build
```

## Arquitetura-alvo aprovada

- Web/PWA: aplicação completa, incluindo PDV e vendas.
- Desktop Windows: Electron, reutilizando a interface e as regras de negócio.
- API central: autenticação, autorização, regras de negócio e sincronização.
- PostgreSQL remoto via API/Supabase: dados compartilhados entre usuários e filiais.
- Armazenamento offline web: IndexedDB, com fila de sincronização.
- Armazenamento offline desktop: SQLite, com fila de sincronização.
- Sincronização idempotente, com identificadores únicos por operação, controle de conflitos e trilha de auditoria.

A aplicação web **não deve** acessar PostgreSQL diretamente nem conter credenciais secretas. A chave publishable do Supabase pode ser usada no navegador somente com RLS corretamente habilitado e validado.

## Requisitos de negócio já definidos

- Loja de roupas.
- Produtos com variações de tamanho e cor.
- Estoque controlado por variação.
- Vendas e PDV completos também na versão web.
- Clientes, fornecedores, financeiro e relatórios.
- Equipe, permissões e múltiplas filiais.
- Operação offline para funções essenciais, inclusive vendas, com sincronização segura.
- Ambiente-alvo desktop: Windows 11.

## Fiscal

Foi informado anteriormente o cenário de São Paulo-SP, regime Lucro Real e intenção de NFC-e modelo 65. Ainda faltam certificado digital e validações/credenciamentos fiscais. Não implementar emissão fiscal fictícia. Antes de produção, validar regras tributárias com contador e documentação oficial aplicável.

## Instruções obrigatórias para o GitHub Copilot

1. Antes de editar, inspecione todos os arquivos e apresente um plano curto por etapas.
2. Preserve este README e as decisões arquiteturais.
3. Implemente em etapas pequenas; não gere o sistema inteiro em um único arquivo.
4. Não invente dados, vendas, clientes, preços, CNPJ, credenciais ou configurações fiscais.
5. Não simule operações como se fossem reais. Recursos ainda não conectados devem ser identificados claramente.
6. Use TypeScript estrito, componentes reutilizáveis, validação de formulários e tratamento explícito de erros.
7. Nunca exponha chaves privadas, senhas ou segredos no frontend ou no repositório.
8. Não acesse PostgreSQL diretamente pelo navegador. Use API segura com RLS para operações client-side autorizadas.
9. Planeje testes para regras de negócio, estoque, caixa, vendas offline e sincronização idempotente.
10. Ao terminar cada etapa, execute `npm run typecheck` e `npm run build`, corrija todos os erros e informe arquivos alterados e limitações.
11. Não implemente emissão fiscal real até que credenciais, certificado, credenciamento e requisitos fiscais tenham sido confirmados.
12. Priorize interface responsiva para celular e computador, acessibilidade, segurança e desempenho.

## Próxima etapa sugerida

Validar o cliente Supabase e as migrations de identidade/RLS em ambiente de teste. Depois, configurar provisionamento seguro de usuários, organizações, funções e filiais. Só então definir domínio e modelo de dados para cadastros e PDV.
