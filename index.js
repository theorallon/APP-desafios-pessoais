const { select, input, checkbox, number, confirm } = require('@inquirer/prompts');
const fs = require('fs').promises;
const chalk = require('chalk').default;
const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

let desafios = [];
let sair = false
let mensagem = chalk.bold.blue("Bem-vindo ao APP de Desafios Pessoais!");

async function salvarDesafios() {
    await fs.writeFile("desafios.json", JSON.stringify(desafios, null, 2));
}

async function calcularStreak(diasConcluidos) {
    let sequenciaAtual = 0;
    let maiorSequencia = 0;
    let atual = 0;

    if (diasConcluidos.length === 0) {
        return {sequenciaAtual: 0, maiorSequencia: 0};
    }

    for(let i = 0; i < diasConcluidos.length; i++) {
        if (i === 0 || diasConcluidos[i] === diasConcluidos[i - 1] + 1) {
            atual++;
        } else {
            // A sequência quebrou
            atual = 1;
        }
        maiorSequencia = Math.max(maiorSequencia, atual);
    }

    const ultimoDia = diasConcluidos[diasConcluidos.length - 1];

    sequenciaAtual = 0;

    for (let i = diasConcluidos.length - 1; i >= 0; i--) {
        if (diasConcluidos[i] === ultimoDia - (diasConcluidos.length - 1 - i)) {
            sequenciaAtual++;
        } else {
            break; 
        }
    }

    return { sequenciaAtual, maiorSequencia };
}

async function carregarDesafios() {
    try {
        const dados = await fs.readFile("desafios.json", "utf-8");
        desafios = JSON.parse(dados);

        desafios = desafios.map(d => ({
            ...d,
            progresso: Array.isArray(d.progresso) ? d.progresso : []
        }));

        console.log(chalk.green(`✅ ${desafios.length} desafios carregados do arquivo.`));
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("Arquivo 'desafios.json' não encontrado. Iniciando um novo.");
        } else {
            console.error(chalk.red("❌ Erro ao carregar desafios:", error));
        }
    }
}


async function criarDesafio() {
    const nome = await input({ message: "Nome do desafio: " });
    if (nome.trim() === "") {
        mensagem = "❌ Nenhum desafio para ser criado";
        return;
    }
    const descricao = await input({ message: "Descrição: " });

    const duracao = await definirDuracao();

    const dataInicio = dayjs().format("DD/MM/YYYY");
    const dataFim = dayjs().add(duracao, "day").format("DD/MM/YYYY");

    desafios.push({
        nome,
        descricao,
        duracao,
        dataInicio,
        dataFim,
        progresso: [],
        status: "ativo",
        sequenciaAtual: 0,
        maiorSequencia: 0
    })

    await salvarDesafios();
    mensagem = (`✅ Desafio "${nome}" criado e salvo com sucesso!`);

}

async function definirDuracao() {
    const duracao = await select({

        message: "Duração:",
        choices: [
            {
                name: "30 dias",
                value: 30
            },

            {
                name: "60 dias",
                value: 60
            },

            {
                name: "90 dias",
                value: 90
            }
        ]

    });

    return duracao;


}

async function verDetalhesDesafio(desafio) {
    console.clear();
    console.log(chalk.bold.yellow("Detalhes do desafio\n"));
    console.log(`🎯 Nome: ${chalk.blue(desafio.nome)}`);
    console.log(`📝 Descrição: ${chalk.blue(desafio.descricao)}`);
    console.log(`📅 Duração: ${chalk.blue(desafio.duracao)} dias`);
    console.log(`⏳ Data de início: ${chalk.blue(desafio.dataInicio)}`);
    console.log(`⌛ Data de término: ${chalk.blue(desafio.dataFim)}`);
    console.log(`📆 Progresso: ${chalk.green(desafio.progresso.length)} / ${desafio.duracao} dias concluídos`);
    const porcentagem = ((desafio.progresso.length / desafio.duracao) * 100).toFixed(1);
    console.log(`📆 Progresso: ${chalk.green(desafio.progresso.length)} / ${desafio.duracao} dias (${porcentagem}%)`);



    await input({ message: chalk.bold("Pressione ENTER para voltar.") });
}

async function excluirDesafio(index) {
    const confirmacao = await confirm({
        message: chalk.red("Tem certeza que deseja escluir esse item?")
    });

    if (!confirmacao) return;

    desafios.splice(index, 1);
    await salvarDesafios();

    mensagem = chalk.green("✅ Desafio excluído com sucesso!")
}

async function marcarDia(desafio, index) {
const choices = Array.from({ length: desafio.duracao }).map((_, i) => {
    const dia = i + 1;
    const data = dayjs(desafio.dataInicio, "DD/MM/YYYY").add(i, "day").format("DD/MM/YYYY");
    return {
      name: `Dia ${dia} — ${data}`,
      value: dia,
      checked: Array.isArray(desafio.progresso) && desafio.progresso.includes(dia)
    };
  });

  // Abre o checkbox
  const selecionados = await checkbox({
    message: `Marque os dias concluídos para: ${desafio.nome}`,
    choices
  });

  // Defesa: transformar em array e garantir números
  const selecionadosArray = Array.isArray(selecionados) ? selecionados.map(n => Number(n)) : [];

  // Ordena e salva no desafio
  selecionadosArray.sort((a, b) => a - b);
  desafio.progresso = selecionadosArray;

  await salvarDesafios();

  // Feedback
  console.clear();
  console.log(chalk.green(`✅ Progresso atualizado para "${desafio.nome}"`));
  console.log(chalk.cyan(`${desafio.progresso.length} / ${desafio.duracao} dias concluídos`));
  // pausa para o usuário ver
  await input({ message: chalk.bold("Pressione ENTER para voltar.") });
}

async function menuDesafioSelecionado(desafio, index) {
    while (true) {

        console.clear();

        const opcaoDesafios = await select({
            message: `${chalk.bold.yellow(`Gerenciando: 🎯 ${desafio.nome}"`)}`,
            choices: [
                {
                    name: "👁️ Ver detalhes",
                    value: "ver"
                },
                {
                    name: "📝 Marcar dia como concluído",
                    value: "marcarDia"
                },
                {
                    name: "🗑️ Excluir desafio",
                    value: "excluir"
                },
                {
                    name: "🔙 Voltar",
                    value: "voltar"
                }
            ]
        });

        switch (opcaoDesafios) {
            case "ver":
                await verDetalhesDesafio(desafio);
                break;
            case "marcarDia":
                await marcarDia(desafio, index);
                break;
            case "excluir":
                await excluirDesafio(index);
                return;
            case "voltar":
                return;
        }
    }

}



async function gerenciarDesafios() {
    if (desafios.length == 0) {
        console.clear();
        mensagem = (chalk.red("❌ Não existem desafios ainda."));
        return;
    }

    const opcoesDesafios = desafios.map((desafio, index) => ({
        name: `${index + 1}. ${desafio.nome}`,
        value: index
    }));

    opcoesDesafios.push({ name: "🔙 Voltar", value: "voltar" });

    const escolherDesafios = await select({
        message: "Selecione um desafio para gerenciar:",
        choices: opcoesDesafios
    });

    if (escolherDesafios === "voltar") return;

    await menuDesafioSelecionado(desafios[escolherDesafios], escolherDesafios)

}

async function verEstatisticas() {
    
}



async function mostrarMensagem() {

    if (mensagem != "") {
        console.log(mensagem);
        console.log();
        mensagem = "";
    }
}


async function opcoes() {


    const opcao = await select({
        message: "Menu >",
        choices: [
            {
                name: "🎯 Criar Desafio",
                value: "criar"
            },

            {
                name: "📂 Gerenciar Desafios",
                value: "gerenciar"
            },

            {
                name: "📊 Ver estatísticas",
                value: "verEstatisticas"
            },

            {
                name: "🚪 Sair",
                value: "sair"
            }
        ]
    })

    switch (opcao) {
        case "criar":
            console.clear();
            await criarDesafio();
            break;
        case "gerenciar":
            await gerenciarDesafios();
            break;
        case "VerEstatisticas":
            await verEstatisticas();
            break;
        case "sair":
            console.log("👋 Até a proxima")
            sair = true;
            return;
    }
}


async function menuIniciar() {
    await carregarDesafios();
    console.clear();

    while (sair === false) {
        console.clear();
        mostrarMensagem();
        await opcoes();
    }

}

menuIniciar();
