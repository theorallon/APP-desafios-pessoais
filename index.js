const { select, input, checkbox, number, confirm } = require('@inquirer/prompts');
const fs = require('fs').promises;

let desafios = [];
let sair = false

async function salvarDesafios() {
    await fs.writeFile("desafios.json", JSON.stringify(desafios, null, 2));
}

async function carregarDesafios() {
    try {
        const dados = await fs.readFile("desafios.json", "utf-8");
        desafios = JSON.parse(dados);
        console.log(`✅ ${desafios.length} desafios carregados do arquivo.`)
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("Arquivo 'desafios.json' não encontrado. Iniciando um novo.");
        } else {
            console.error("Erro ao carregar desafios:", error)
        }
    }
}


async function criarDesafio() {
    const nome = await input({ message: "Nome do desafio: " });
    if (nome.trim() === "") {
        console.log("❌Nenhum desafio para ser criado")
        return;
    }
    const descricao = await input({ message: "Descrição: " });

    const duracao = definirDuracao();

    desafios.push({
        nome,
        descricao,
        duracao
    })

    await salvarDesafios();
    console.log(`✅ Desafio "${nome}" criado e salvo com sucesso!`)

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


async function opcoes() {

    const opcao = await select({
        message: "Menu >",
        choices: [
            {
                name: "🎯Criar Desafio",
                value: "criar"
            },

            {
                name: "👋Sair",
                value: "sair"
            }
        ]
    })

    switch (opcao) {
        case "criar":
            await criarDesafio();
            break;
        case "sair":
            console.log("👋Até a proxima")
            sair = true
            return;
    }
}


async function menuIniciar() {
    await carregarDesafios();

    while (sair === false) {
        await opcoes();
    }

}

menuIniciar();
