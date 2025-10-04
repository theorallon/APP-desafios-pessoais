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



async function listarDesafios() {
    if(desafios.length == 0) {
        console.clear();
        mensagem = (chalk.red("❌ Não existem desafios ainda."));
        return;
    }




    desafios.forEach((desafio, index) => {
        // Exibição formatada
        console.log(chalk.yellow(`\n${index + 1}. 🎯 ${desafio.nome}`));
        console.log(chalk.white(`   - Descrição: ${desafio.descricao}`));
        console.log(`   - Duração: ${chalk.cyan(desafio.duracao + ' dias')}`);
        console.log(`   - Data de início: ${chalk.blue(desafio.dataInicio)}`);
        console.log(`   - Data de término: ${chalk.red(desafio.dataFim)}`);
        
        // Linha divisória para separar os desafios
        console.log(chalk.gray("   ================================="));
    });

    // 4. Adiciona uma pausa interativa para que o usuário possa ler
    await input({ message: chalk.bold.yellow("\nPressione ENTER para voltar ao menu.") });
    
    // 5. Define a mensagem de feedback para o próximo ciclo do menu
    mensagem = chalk.green(`✅ Lista exibida com sucesso. Total de ${desafios.length} desafios.`);

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
                name: "📝 Listar Desafios",
                value: "listar"
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
        case "listar":
            await listarDesafios();
            break;
        case "sair":
            console.log("👋 Até a proxima")
            sair = true
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
