// Seleções dos elementos
const inputTarefa = document.getElementById('novaTarefaInput');
const botaoAdicionar = document.getElementById('adicionarTarefaBtn');
const listaContainer = document.getElementById('listaDeTarefas');
const botaoTema = document.getElementById('temaBtn'); // botão do tema

// Função para adicionar tarefa
function adicionarTarefa() {
    const textoTarefa = inputTarefa.value;

    if (textoTarefa.trim() === '') {
        alert("Por favor, digite uma tarefa!");
        return;
    }

    const novaLi = document.createElement('li');

    // cria um span com o texto da tarefa (para não afetar o clique do botão excluir)
    const spanTexto = document.createElement('span');
    spanTexto.textContent = textoTarefa;
    novaLi.appendChild(spanTexto);

    // marcar concluída ao clicar no li (exceto no botão excluir)
    novaLi.addEventListener('click', marcarConcluida);

    // botão de excluir
    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = 'X';
    botaoExcluir.classList.add('excluir-btn');

    // remove tarefa ao clicar no botão excluir (evita propagar para o li)
    botaoExcluir.addEventListener('click', removerTarefa);

    novaLi.appendChild(botaoExcluir);

    listaContainer.appendChild(novaLi);

    inputTarefa.value = '';
    inputTarefa.focus();
}

// alterna classe que risca a tarefa
function marcarConcluida() {
    this.classList.toggle('concluida');
}

// remove o elemento li da lista
function removerTarefa(evento) {
    evento.stopPropagation(); // evita acionar o marcarConcluida
    const tarefaInteira = this.parentNode;
    tarefaInteira.remove();
}

// eventos para adicionar tarefa
botaoAdicionar.addEventListener('click', adicionarTarefa);

inputTarefa.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        adicionarTarefa();
    }
});

/* ---------- Código do tema escuro ---------- */

// 1) Ao carregar a página, aplicamos o tema salvo (se houver)
if (localStorage.getItem('tema') === 'dark') {
    document.body.classList.add('dark');
    if (botaoTema) botaoTema.textContent = '☀️';
} else {
    if (botaoTema) botaoTema.textContent = '🌙';
}

// 2) Alterna tema quando o botão é clicado
if (botaoTema) {
    botaoTema.addEventListener('click', () => {
        document.body.classList.toggle('dark');

        if (document.body.classList.contains('dark')) {
            localStorage.setItem('tema', 'dark');
            botaoTema.textContent = '☀️'; // ícone para tema claro
        } else {
            localStorage.setItem('tema', 'light');
            botaoTema.textContent = '🌙'; // ícone para tema escuro
        }
    });
}
