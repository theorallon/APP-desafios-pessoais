const { select, input, checkbox, confirm } = require('@inquirer/prompts');
const fsp = require('fs').promises; // Renomeado para fsp
const fs = require('fs'); // Adicionado para streams (necessário para PDF)
const chalk = require('chalk').default;
const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// Novo import
const PDFDocument = require('pdfkit');

let desafios = [];
let sair = false
let mensagem = chalk.bold.blue("Bem-vindo ao APP de Desafios Pessoais!");

async function salvarDesafios() {
    await fsp.writeFile("desafios.json", JSON.stringify(desafios, null, 2));
}

async function calcularStreak(diasConcluidos) {
    let sequenciaAtual = 0;
    let maiorSequencia = 0;
    let atual = 0;

    if (diasConcluidos.length === 0) {
        return { sequenciaAtual: 0, maiorSequencia: 0 };
    }

    for (let i = 0; i < diasConcluidos.length; i++) {
        if (i === 0 || diasConcluidos[i] === diasConcluidos[i - 1] + 1) {
            atual++;
        } else {
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
        const dados = await fsp.readFile("desafios.json", "utf-8");
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


async function exportarParaPDF() {
    if (desafios.length === 0) {
        mensagem = chalk.yellow("⚠️ Não há desafios para exportar.");
        return;
    }

    const doc = new PDFDocument();
    const nomeArquivo = 'desafios_exportados.pdf';
    
    // Configura o stream de saída para o arquivo
    doc.pipe(fs.createWriteStream(nomeArquivo));

    doc.fontSize(20).text('Relatório de Desafios Pessoais', { align: 'center' });
    doc.fontSize(12).text(`Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`).moveDown(2);
    
    desafios.forEach((desafio, index) => {
        const progresso = desafio.progresso.length;
        const porcentagem = ((progresso / desafio.duracao) * 100).toFixed(1);

        doc.fontSize(16).fillColor('blue').text(`🎯 Desafio ${index + 1}: ${desafio.nome}`);
        doc.fillColor('black').fontSize(10);
        
        doc.text(`Status: ${desafio.status.toUpperCase()}`);
        doc.text(`Descrição: ${desafio.descricao}`);
        doc.text(`Duração: ${desafio.duracao} dias (Início: ${desafio.dataInicio} | Fim: ${desafio.dataFim})`);
        doc.text(`Progresso: ${progresso} / ${desafio.duracao} dias (${porcentagem}%)`);
        doc.text(`🔥 Sequência Atual: ${desafio.sequenciaAtual} dias | 🏆 Maior Sequência: ${desafio.maiorSequencia} dias`);
        
        // Adiciona uma linha para separação
        doc.moveDown(0.5).rect(doc.x, doc.y, 500, 0.5).fill('gray').moveDown(1.5);
    });

    doc.end();

    mensagem = chalk.green(`✅ Desafios exportados com sucesso para o arquivo: ${nomeArquivo}`);
}

// ----------------------------------------------------
// FIM DO NOVO CÓDIGO
// ----------------------------------------------------


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
    const statusColor = desafio.status === "ativo" ? chalk.green : chalk.yellow;
    const statusDisplay = desafio.status.toUpperCase();
    console.log(`✨ Status: ${statusColor(statusDisplay)}`);
    console.log(`📅 Duração: ${chalk.blue(desafio.duracao)} dias`);
    console.log(`⏳ Data de início: ${chalk.blue(desafio.dataInicio)}`);
    console.log(`⌛ Data de término: ${chalk.blue(desafio.dataFim)}`);
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

async function concluirDesafio(desafio) {

    const confirmacao = await confirm({
        message: chalk.green(`Marcar o desafio "${desafio.nome}" como concluído?`)
    });

    if (!confirmacao) {
        mensagem = `Ação cancelada: Desafio "${desafio.nome}" não foi concluído.`;
        return;
    }


    desafio.status = "concluido";
    await salvarDesafios();

    mensagem = chalk.green(`✅ Desafio "${desafio.nome}" concluído com sucesso!`);

}

async function reabrirDesafio(desafio) {
    const confirmacao = await confirm({
        message: chalk.yellow(`Tem certeza que deseja reabrir o desafio "${desafio.nome}" e colocá-lo como ATIVO novamente?`)
    });

    if (!confirmacao) {
        mensagem = `Ação cancelada: Desafio "${desafio.nome}" não foi reaberto.`;
        return;
    }

    // Altera o status de volta para 'ativo'
    desafio.status = "ativo";
    await salvarDesafios();

    mensagem = chalk.green(`♻️ Desafio "${desafio.nome}" reaberto com sucesso!`);
}


async function verificarStatusAutomatico() {

    const hoje = dayjs().startOf('day');
    let statusAlterado = false;
    let desafiosEncerrados = [];

    for (const desafio of desafios) {
        
        if (desafio.status === "ativo") {
            
            const dataFim = dayjs(desafio.dataFim, "DD/MM/YYYY").startOf('day');

          
            if (hoje.isSame(dataFim) || hoje.isAfter(dataFim)) {
                desafio.status = "concluido";
                statusAlterado = true;
                desafiosEncerrados.push(desafio.nome);
            }
        }
    }

    if (statusAlterado) {
        await salvarDesafios();
        mensagem = chalk.yellow(`⚠️ ${desafiosEncerrados.length} desafios encerrados automaticamente: ${desafiosEncerrados.join(', ')}.`);
    }
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

    
    const selecionados = await checkbox({
        message: `Marque os dias concluídos para: ${desafio.nome}`,
        choices
    });


    const selecionadosArray = Array.isArray(selecionados) ? selecionados.map(n => Number(n)) : [];

    // Ordena e salva no desafio
    selecionadosArray.sort((a, b) => a - b);
    desafio.progresso = selecionadosArray;

    const { sequenciaAtual, maiorSequencia } = await calcularStreak(desafio.progresso);
    desafio.sequenciaAtual = sequenciaAtual;
    desafio.maiorSequencia = maiorSequencia;

    await salvarDesafios();

    
    console.clear();
    console.log(chalk.green(`✅ Progresso atualizado para "${desafio.nome}"`));
    console.log(chalk.cyan(`${desafio.progresso.length} / ${desafio.duracao} dias concluídos`));
    
    await input({ message: chalk.bold("Pressione ENTER para voltar.") });
}

async function menuDesafioSelecionado(desafio, index) {
    while (true) {

        console.clear();

        const opcaoDesafios = await select({
            message: `${chalk.bold.yellow(`Gerenciando: 🎯 ${desafio.nome}"`)}`,
            choices: [
                {
                    name: "👁️  Ver detalhes",
                    value: "ver"
                },
                {
                    name: "📝 Marcar dia como concluído",
                    value: "marcarDia"
                },
                {
                    name: "🗑️  Excluir desafio",
                    value: "excluir"
                },

                {
                    name: "✔️ Marcar como concluído",
                    value: "concluirDesafio"
                },

                {
                    name: "❌ Marcar como ativo",
                    value: "reabrirDesafio"
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
            case "concluirDesafio":
                await concluirDesafio(desafio);
                break;
            case "reabrirDesafio":
                await reabrirDesafio(desafio);
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
    console.clear();
    console.log(chalk.bold.yellow("📊 Suas Estatísticas"))

    if (desafios.length === 0) {
        mensagem = chalk.red("❌ Não há nenhum desafio ainda.");
        return;
    }

    const totalConcluidos = desafios.reduce((acumulador, desafioAtual) => {
        return acumulador + desafioAtual.progresso.length;
    }, 0);

    const totalDiasPossiveis = desafios.reduce((acc, desafio) => {
        return acc + desafio.duracao;
    }, 0);

    const taxaSucesoGeral = totalDiasPossiveis > 0
        ? ((totalConcluidos / totalDiasPossiveis) * 100).toFixed(1)
        : 0;



    console.log(`🎯 Total de desafios cadastrados: ${chalk.blue(desafios.length)}`);
    console.log(`✅ Dias concluídos (Total): ${chalk.green(totalConcluidos)}`);
    console.log(`📈 Taxa de Sucesso Geral: ${chalk.green(taxaSucesoGeral)}%\n`);

    desafios.forEach((desafio, index) => {
        const progresso = desafio.progresso.length;
        const duracao = desafio.duracao;
        const porcentagem = ((progresso / duracao) * 100).toFixed(1);

        console.log(`\n${chalk.cyan(`${index + 1}. ${desafio.nome}`)}`);
        console.log(` Progresso: ${chalk.green(progresso)} / ${duracao} dias (${porcentagem}%)`);

        const statusColor = desafio.status === "ativo" ? chalk.green : chalk.yellow;
        const statusDisplay = desafio.status.toUpperCase();
        console.log(`✨ Status: ${statusColor(statusDisplay)}`);

        console.log(`🔥 Sequencia Atual: ${chalk.green(desafio.sequenciaAtual)}`)
        console.log(`🏆 Maior sequancia: ${chalk.yellow(desafio.maiorSequencia)}`)

    })


    await input({ message: chalk.bold("\nPressione ENTER para voltar ao menu.") });
}

async function pesquisarDesafios() {
    console.clear();

    if (desafios.length === 0) {
        mensagem = chalk.red("❌ Não há desafios para pesquisar.");
        return;
    }

    const termo = await input({ 
        message: "Digite o nome ou parte do nome do desafio para pesquisar: " 
    });

    const termoLowerCase = termo.toLowerCase().trim();

    if (termoLowerCase === "") {
        mensagem = chalk.yellow("Nenhum termo de pesquisa fornecido. Voltando ao menu de filtros.");
        return;
    }

    // Filtra desafios que contêm o termo de pesquisa no nome
    const resultados = desafios.filter(d => 
        d.nome.toLowerCase().includes(termoLowerCase)
    );

    console.clear();
    console.log(chalk.bold.yellow(`--- 🔍 Resultados da Pesquisa por: "${termo}" (${resultados.length} encontrados) ---`));

    if (resultados.length === 0) {
        mensagem = chalk.yellow(`⚠️ Nenhum desafio encontrado com o nome "${termo}".`);
        return;
    } 
    
    const opcoesPesquisa = resultados.map(d => ({
        name: `${d.status === 'ativo' ? '✨' : '🏆'} ${d.nome} - Progresso: ${d.progresso.length}/${d.duracao}`,
        value: d 
    }));

    opcoesPesquisa.push({ name: "🔙 Voltar", value: "voltar" });

    const escolherDesafio = await select({
        message: `Selecione um desafio para gerenciar:`,
        choices: opcoesPesquisa
    });

    if (escolherDesafio === "voltar") return;

    // Encontra o índice original do desafio para gerenciar
    const indexDesafioOriginal = desafios.indexOf(escolherDesafio);

    await menuDesafioSelecionado(escolherDesafio, indexDesafioOriginal);
}

async function filtrarDesafios() {
    while (true) { // Loop principal para manter o usuário no menu de filtros
        console.clear();
        
        // Exibe a mensagem de feedback (e.g., após a função pesquisarDesafios)
        mostrarMensagem(); 

        const filtroOpcao = await select({
            message: "Qual status de desafio deseja visualizar?",
            choices: [
                { 
                    name: "✨ Ativos",
                    value: "ativo" 
                },
                { 
                    name: "🏆 Concluídos",
                    value: "concluido" 
                },
                { 
                    name: "👀 Todos",
                    value: "todos" 
                },
                { 
                    name: "🔍 Pesquisar por Nome",
                    value: "pesquisar"
                },
                {
                    name: "🔙 Voltar ao Menu Principal", // Botão de retorno
                    value: "voltar"
                }
            ]
        });

        if (filtroOpcao === "voltar") {
            return; // Sai da função e volta ao menu principal
        }

        // 1. CHAMA A FUNÇÃO DE PESQUISA POR NOME
        if (filtroOpcao === "pesquisar") {
            await pesquisarDesafios(); 
            continue; // Recomeça o loop, mostrando o menu de filtros novamente
        }

        // 2. LÓGICA DE FILTRAGEM POR STATUS (Para 'ativo', 'concluido' ou 'todos')

        let desafiosFiltrados = [];

        if (filtroOpcao === "todos") {
            desafiosFiltrados = desafios;
        } else {
            // Usa o valor do select (ativo ou concluido) como status
            desafiosFiltrados = desafios.filter(desafio =>
                desafio.status === filtroOpcao
            );
        }
        
        // Determina o texto do status para exibição
        const statusDisplay = (filtroOpcao === "todos" ? "TODOS" : filtroOpcao.toUpperCase());

        // Se a lista filtrada estiver vazia
        if (desafiosFiltrados.length === 0) {
            mensagem = chalk.yellow(`⚠️ Não há desafios com o status "${statusDisplay}" para gerenciar.`);
            continue; // Recomeça o loop
        }

        const opcoesDesafios = desafiosFiltrados.map((desafio) => ({
            name: `${desafio.status === 'ativo' ? '✨' : '🏆'} ${desafio.nome}`,
            value: desafio // Passamos o objeto completo como valor
        }));

        opcoesDesafios.push({ name: "🔙 Voltar ao Menu de Filtros", value: "voltar" });

        const escolherDesafio = await select({
            message: `Selecione um desafio ${statusDisplay} para gerenciar:`,
            choices: opcoesDesafios
        });

        if (escolherDesafio === "voltar") continue; // Recomeça o loop

        // Gerenciar o Desafio Selecionado
        const indexDesafioOriginal = desafios.indexOf(escolherDesafio);

        await menuDesafioSelecionado(escolherDesafio, indexDesafioOriginal);
        // Quando menuDesafioSelecionado retorna, o loop continua e o menu de filtros é exibido novamente.
    }
}

async function info(params) {
    console.clear();
    console.log(chalk.bold.yellow("ℹ️ Sobre o App de Desafios Pessoais\n"));
    console.log("Bem-vindo(a)! Este app é o seu sistema pessoal para criar e acompanhar desafios de longo prazo, como os modelos de 30, 60 ou 90 dias.");
    console.log("\n**Funcionalidades Principais:**");
    console.log(`* 🎯 Gerenciamento completo de desafios (criação, edição e exclusão).`);
    console.log(`* 📝 Registro de progresso diário e visualização de sequência (Streak).`);
    console.log(`* 📊 Estatísticas avançadas de sucesso e progresso.`);
    console.log(`\nTecnologias: Desenvolvido com **Node.js** e utilizando **@inquirer/prompts** para interação e **JSON** para persistência de dados.`);
    await input({ message: chalk.bold("\nPressione ENTER para voltar ao menu.") });
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
                name: "📊 Ver Estatísticas",
                value: "verEstatisticas"
            },

            {
                name: "🔍 Filtar Desafios",
                value: "filtrar"
            },
            
            { // NOVO BOTÃO DE EXPORTAÇÃO
                name: "📄 Exportar para PDF",
                value: "exportar"
            },

            {
                name: "ℹ️ Sobre o App",
                value: "info"
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
        case "verEstatisticas":
            await verEstatisticas();
            break;
        case "filtrar":
            await filtrarDesafios();
            break;
        case "exportar": // NOVO CASE
            await exportarParaPDF();
            break;
        case "info":
            await info();
            break;
        case "sair":
            console.log("👋 Até a proxima")
            sair = true;
            return;
    }
}


async function menuIniciar() {
    await carregarDesafios();
    await verificarStatusAutomatico();
    console.clear();

    while (sair === false) {
        console.clear();
        mostrarMensagem();
        await opcoes();
    }

}

menuIniciar();