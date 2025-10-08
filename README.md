# APP de Desafios Pessoais
## Por: Théo Rallon

Este é o projeto final da matéria de **Lógica de Programação**. O aplicativo, desenvolvido em nível de terminal (CLI), é um gerenciador de desafios pessoais, ideal para quem deseja acompanhar metas de longo prazo (como desafios de 30, 60 ou 90 dias).

Com ele, você pode criar, acompanhar e visualizar seu progresso, mantendo a motivação com o cálculo automático de sequências (streaks).

---

## 🚀 Funcionalidades Principais

O App de Desafios Pessoais oferece um gerenciamento completo para suas metas:

- **🎯 Criação de desafios:** Cadastre novos desafios com nome, descrição e escolha de duração (30, 60 ou 90 dias).
- **📂 Gerenciamento completo:** Edite, visualize detalhes, marque como concluído, reabra ou exclua qualquer desafio.
- **📝 Registro de Progresso:** Marque facilmente os dias concluídos e visualize a porcentagem de progresso de cada desafio.
- **🔥 Cálculo de Sequência (Streak):** Acompanhamento automático da sua sequência atual de dias concluídos e do seu recorde (maior sequência).
- **📊 Estatísticas:** Visualize uma visão geral do seu desempenho, incluindo total de dias concluídos e sua taxa de sucesso geral.
- **🔍 Filtros e Pesquisa:** Filtre desafios por status (**Ativo** ou **Concluído**) ou pesquise rapidamente pelo nome.
- **⚠️ Encerramento Automático:** Desafios vencidos são marcados como **Concluídos** automaticamente na inicialização.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando:

- **Node.js:** Ambiente de execução principal.
- **@inquirer/prompts:** Para criar uma interface de linha de comando interativa e amigável.
- **fs (File System):** Para persistência de dados em um arquivo `desafios.json`.
- **chalk:** Para estilizar e colorir o texto no terminal, melhorando a experiência do usuário.
- **dayjs:** Para manipulação e formatação de datas.

---

## ⚙️ Como Instalar e Rodar

Siga os passos abaixo para rodar o projeto em seu terminal:

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** instalado em sua máquina.

### 2. Instalação das Dependências
Navegue até o diretório do projeto no seu terminal e instale as dependências necessárias:

```bash
npm install @inquirer/prompts chalk dayjs