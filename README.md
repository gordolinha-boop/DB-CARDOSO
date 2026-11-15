DB CARDOSO

Sistema profissional de ponto de venda para comércio de vestuário.

1. Visão geral

O DB CARDOSO será um sistema de gestão comercial desenvolvido para lojas de roupas, com foco em desempenho, segurança, confiabilidade e operação offline.

2. Objetivos

- Controle de vendas e operações de caixa.
- Cadastro de produtos, tamanhos e cores.
- Controle de estoque por variação.
- Cadastro de clientes e fornecedores.
- Gestão financeira.
- Relatórios gerenciais.
- Integração fiscal conforme as exigências legais.
- Sincronização de dados entre unidades.

3. Requisitos do projeto

Requisito| Definição
Nome| DB CARDOSO
Sistema final| Windows 11
Desenvolvimento| Assistido por IA
Dispositivo de desenvolvimento| Celular
Operação| Offline-first
Estado fiscal inicial| São Paulo
Regime tributário| Lucro Real
Banco local| SQLite
Banco central| PostgreSQL
Expansão| Suporte futuro a filiais

4. Módulos planejados

1. Dashboard administrativo.
2. PDV e caixa.
3. Produtos e variações.
4. Estoque.
5. Clientes.
6. Fornecedores.
7. Financeiro.
8. Relatórios.
9. Gestão de funcionários e permissões.
10. Módulo fiscal.
11. Configurações e sincronização.

5. Arquitetura planejada

- Aplicação desktop: Electron.
- Interface: React, TypeScript e Tailwind CSS.
- Persistência local: SQLite.
- Banco central: PostgreSQL.
- Sincronização: fila de operações com tratamento de conflitos.
- Distribuição: instalador para Windows.

6. Segurança e confiabilidade

- Autenticação segura.
- Controle de permissões.
- Registro de auditoria.
- Backups e restauração.
- Validação de dados.
- Proteção de credenciais.
- Prevenção de duplicidade na sincronização.

7. Requisitos fiscais

O módulo fiscal deverá contemplar os procedimentos aplicáveis à NFC-e em São Paulo, incluindo assinatura digital, transmissão, contingência e acompanhamento da autorização.

A emissão em produção dependerá de certificado digital, credenciamento e configuração fiscal adequados.

8. Desenvolvimento

O desenvolvimento será realizado em etapas, com revisão de código, testes funcionais e validação de segurança antes da liberação de cada módulo.

Status: Planejamento e estruturação inicial.
