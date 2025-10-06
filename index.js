const { select, input, checkbox, number, confirm } = require('@inquirer/prompts');
const fs = require('fs').promises;
const chalk = require('chalk').default; 
const dayjs = require("dayjs");

let desafios = [];
let sair = false
let mensagem = chalk.bold.blue("Bem-vindo ao APP de Desafios Pessoais!");

async function salvarDesafios() {
    await fs.writeFile("desafios.json", JSON.stringify(desafios, null, 2));
}

async function carregarDesafios() {
    try {
        const dados = await fs.readFile("desafios.json", "utf-8");
        desafios = JSON.parse(dados);
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
        dataFim
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

    await input({ message: chalk.bold("Pressione ENTER para voltar.") });
}

async function excluirDesafio() {
    const confirmacao = await confirm({
        message: chalk.red("Tem certeza que deseja escluir esse item?")
    });

    if (!confirmacao) return;

    desafios.splice(index, 1);
    await salvarDesafios();

    mensagem = chalk.green("✅ Desafio excluído com sucesso!")
}

async function menuDesafioSelecionado(desafio, index) {
    const opcaoDesafios = await select ({
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

    switch (opcaoDesafios){
        case "ver":
            await verDetalhesDesafio(desafio);
            break;
        case "marcarDia":
            break;
        case "excluir":
            await escolherDesafios(index);
            break;
        case "voltar":
            return;
    }

}



async function gerenciarDesafios() {
    if(desafios.length == 0) {
        console.clear();
        mensagem = (chalk.red("❌ Não existem desafios ainda."));
        return;
    }

    const opcoesDesafios = desafios.map((desafio, index) => ({
        name: `${index + 1}. ${desafio.nome}`,
        value: index
    }));

    opcoesDesafios.push({name: "🔙 Voltar", value: "voltar"});

    const escolherDesafios = await select({
        message: "Selecione um desafio para gerenciar:",
        choices: opcoesDesafios
    });
    
    if (escolherDesafios === "voltar") return;

    await menuDesafioSelecionado(desafios[escolherDesafios], escolherDesafios)

}



async function mostrarMensagem() {

    if(mensagem != ""){
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
