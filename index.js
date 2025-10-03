const { select, input, checkbox, number, confirm } = require('@inquirer/prompts');
const fs = require('fs').promises;

let desafios = [];
let sair = false


async function criarDesafio() {
    const nome = await input({ message: "Nome do desafio: " });
    const descricao = await input({ message: "Descrição: " });
    definirDuracao();
    
    if(nome == 0 ){
        
    }


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
            criarDesafio();
            break;
        case "sair":
            console.log("👋Até a proxima")
            sair = true
            return;
    }
}


async function menuIniciar() {
    while (sair === false){
    await opcoes();
    }

}

menuIniciar();
