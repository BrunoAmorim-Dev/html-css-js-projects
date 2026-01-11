// ====== ELEMENTOS ======
const tipoTransacao = document.getElementById("tipoTransacao");
const descricao = document.getElementById("descricao");
const categoria = document.getElementById("categoria");

const simplesCampos = document.getElementById("simplesCampos");
const valorSimples = document.getElementById("valorSimples");
const dataSimples = document.getElementById("dataSimples");
const statusSimples = document.getElementById("statusSimples");

const parceladaCampos = document.getElementById("parceladaCampos");
const valorTotal = document.getElementById("valorTotal");
const valorParcela = document.getElementById("valorParcela");
const numParcelas = document.getElementById("numParcelas");
const dataInicioParcelas = document.getElementById("dataInicioParcelas");

const lista = document.getElementById("lista");
const saldoAtual = document.getElementById("saldoAtual");
const pendente = document.getElementById("pendente");
const projecao = document.getElementById("projecao");

const addBtn = document.getElementById("addBtn");
const toggleTema = document.getElementById("toggleTema");

let transacoes = [];

// ====== TROCAR CAMPOS DEPENDENDO DO TIPO ======
tipoTransacao.addEventListener("change", () => {
    if(tipoTransacao.value === "simples"){
        simplesCampos.style.display = "block";
        parceladaCampos.style.display = "none";
    } else {
        simplesCampos.style.display = "none";
        parceladaCampos.style.display = "block";
    }
});

// ====== SINCRONIZAR VALOR TOTAL E VALOR PARCELA ======
valorTotal.addEventListener("input", () => {
    const total = Number(valorTotal.value);
    const parcelas = Number(numParcelas.value);
    if(total && parcelas) valorParcela.value = (total / parcelas).toFixed(2);
});
valorParcela.addEventListener("input", () => {
    const parcela = Number(valorParcela.value);
    const parcelas = Number(numParcelas.value);
    if(parcela && parcelas) valorTotal.value = (parcela * parcelas).toFixed(2);
});

// ====== ADICIONAR TRANSAÇÃO ======
addBtn.addEventListener("click", () => {
    if(tipoTransacao.value === "simples"){
        if(!descricao.value || !valorSimples.value || !dataSimples.value) return alert("Preencha todos os campos!");

        transacoes.push({
            id: Date.now(),
            tipo:"simples",
            descricao: descricao.value,
            categoria: categoria.value,
            valor: Number(valorSimples.value),
            data: dataSimples.value,
            status: statusSimples.value
        });
    } else {
        if(!descricao.value || !valorTotal.value || !numParcelas.value || !dataInicioParcelas.value) return alert("Preencha todos os campos!");

        const parcelas = Number(numParcelas.value);
        const valorParc = Number(valorParcela.value);
        const primeiraData = new Date(dataInicioParcelas.value);

        const parcelasPagas = Array(parcelas).fill(false);

        transacoes.push({
            id: Date.now(),
            tipo:"parcelado",
            descricao: descricao.value,
            categoria: categoria.value,
            valorTotal: Number(valorTotal.value),
            numParcelas: parcelas,
            valorParcela: valorParc,
            primeiraParcela: primeiraData.toISOString().slice(0,10),
            parcelasPagas,
            status:"ativo"
        });
    }
    limparCampos();
    atualizarTela();
});

// ====== LIMPAR CAMPOS ======
function limparCampos(){
    descricao.value="";
    valorSimples.value="";
    dataSimples.value="";
    statusSimples.value="efetivado";
    valorTotal.value="";
    valorParcela.value="";
    numParcelas.value="";
    dataInicioParcelas.value="";
}

// ====== ATUALIZAR TELA ======
function atualizarTela(){
    lista.innerHTML="";
    let saldo=0, pend=0;

    transacoes.forEach(t=>{
        if(t.tipo==="simples"){
            const li = document.createElement("li");
            li.innerHTML = `<div>
                                <strong>${t.descricao}</strong><br>
                                <small>${t.categoria} | ${t.data}</small>
                            </div>
                            <div>
                                <span class="${t.valor<0?'valor-negativo':'valor-positivo'}">R$ ${t.valor.toFixed(2)}</span>
                                <div class="acoes">
                                    ${t.status==="pendente"?`<button class="btn-efetivar" onclick="efetivar(${t.id})">✔</button>`:""}
                                    <button class="btn-editar" onclick="editar(${t.id})">✏</button>
                                    <button class="btn-excluir" onclick="excluir(${t.id})">🗑</button>
                                </div>
                            </div>`;
            lista.appendChild(li);
            if(t.status==="efetivado") saldo+=t.valor;
            else pend+=t.valor;
        } else {
            // parcelado
            const li = document.createElement("li");
            li.innerHTML = `<div>
                                <strong>${t.descricao} (Parcelado)</strong><br>
                                <small>${t.categoria}</small>
                             </div>
                             <div id="parcelas-${t.id}"></div>`;
            lista.appendChild(li);

            const parcelasDiv = document.getElementById(`parcelas-${t.id}`);

            t.parcelasPagas.forEach((p, i)=>{
                const dataParcela = new Date(t.primeiraParcela);
                dataParcela.setMonth(dataParcela.getMonth()+i);
                const btn = document.createElement("button");
                btn.textContent = p ? `✔ Pago (${dataParcela.toISOString().slice(0,10)})` : `Efetivar (${dataParcela.toISOString().slice(0,10)})`;
                btn.className = p ? "btn-efetivar" : "btn-efetivar";
                btn.disabled = p;

                btn.addEventListener("click", ()=>{
                    t.parcelasPagas[i] = true;
                    atualizarTela();
                });

                parcelasDiv.appendChild(btn);
            });

            // botão de editar e excluir dívida inteira
            const divAcoes = document.createElement("div");
            divAcoes.className = "acoes";
            const btnEditar = document.createElement("button");
            btnEditar.className="btn-editar";
            btnEditar.textContent="✏";
            btnEditar.addEventListener("click", ()=>editarParcelado(t.id));
            const btnExcluir = document.createElement("button");
            btnExcluir.className="btn-excluir";
            btnExcluir.textContent="🗑";
            btnExcluir.addEventListener("click", ()=>excluir(t.id));
            divAcoes.appendChild(btnEditar);
            divAcoes.appendChild(btnExcluir);
            li.appendChild(divAcoes);

            // cálculo saldo e projeção
            t.parcelasPagas.forEach((p,i)=>{
                const dataP = new Date(t.primeiraParcela);
                dataP.setMonth(dataP.getMonth()+i);
                const mesAtual = new Date().getMonth();
                if(!p && dataP.getMonth()===mesAtual) pend+=t.valorParcela;
                if(p) saldo+=t.valorParcela;
            });
        }
    });

    saldoAtual.textContent = `R$ ${saldo.toFixed(2)}`;
    pendente.textContent = `R$ ${pend.toFixed(2)}`;
    projecao.textContent = `R$ ${(saldo+pend).toFixed(2)}`;
}

// ====== FUNÇÕES DE AÇÃO ======
function efetivar(id){
    const t = transacoes.find(x=>x.id===id);
    if(t) t.status="efetivado";
    atualizarTela();
}

function excluir(id){
    transacoes = transacoes.filter(x=>x.id!==id);
    atualizarTela();
}

// ====== EDITAR SIMPLES ======
function editar(id){
    const t = transacoes.find(x=>x.id===id);
    if(!t) return;
    descricao.value = t.descricao;
    categoria.value = t.categoria;
    valorSimples.value = t.valor;
    dataSimples.value = t.data;
    statusSimples.value = t.status;
    tipoTransacao.value="simples";
    simplesCampos.style.display="block";
    parceladaCampos.style.display="none";
    excluir(id);
}

// ====== EDITAR PARCELADO ======
function editarParcelado(id){
    const t = transacoes.find(x=>x.id===id);
    if(!t) return;
    descricao.value = t.descricao;
    categoria.value = t.categoria;
    valorTotal.value = t.valorTotal;
    valorParcela.value = t.valorParcela;
    numParcelas.value = t.numParcelas;
    dataInicioParcelas.value = t.primeiraParcela;
    tipoTransacao.value="parcelada";
    simplesCampos.style.display="none";
    parceladaCampos.style.display="block";
    excluir(id);
}

// ====== TEMA ESCURO ======
toggleTema.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
});

// ====== INICIAL ======
atualizarTela();
