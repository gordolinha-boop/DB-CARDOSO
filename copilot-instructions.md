# Instruções do projeto DB CARDOSO

Leia o README.md antes de alterar qualquer coisa.

## Regras
- Aplicação de gestão comercial para loja de roupas.
- Versão web completa, com PDV e vendas; não limitar a web a painel administrativo.
- Futuro aplicativo Windows com Electron.
- API central + PostgreSQL remoto.
- Offline web com IndexedDB; offline desktop com SQLite.
- Sincronização idempotente e resiliente, evitando duplicidade ou perda de vendas.
- Não colocar segredos no frontend.
- Não acessar PostgreSQL diretamente pelo navegador.
- Não inventar dados reais nem apresentar placeholders como operações concluídas.
- Não implementar emissão fiscal simulada.
- Manter TypeScript estrito, acessibilidade, responsividade e componentes reutilizáveis.
- Não apagar funcionalidades ou conteúdo existente sem explicar e obter autorização.

## Fluxo de trabalho
1. Inspecione o repositório.
2. Apresente plano e riscos antes de mudanças grandes.
3. Faça uma etapa por vez.
4. Execute typecheck e build após cada etapa.
5. Corrija erros antes de prosseguir.
6. Liste arquivos alterados, testes executados e pendências.
