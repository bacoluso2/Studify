const lista = document.querySelector(".lista-pendencias");
const aviso = document.querySelector("#aviso");
const prioridade = document.querySelector("#filtrar-prioridade");
const prazo = document.querySelector("#filtrar-prazo");

const ordemPrioridade = { alta: 0, media: 1, baixa: 2 };
let tarefasAbertas = [];
let materias = [];

function ordenarTarefas(a, b) {
  const porPrazo = (a.prazo ?? "99999").localeCompare(b.prazo ?? "99999");
  return porPrazo || ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade];
}

function conferePrazo(tarefa, hoje) {
  if (prazo.value === "vencidas") {
    return tarefa.prazo && tarefa.prazo < hoje;
  }
  if (prazo.value === "hoje") {
    return tarefa.prazo === hoje;
  }
  if (prazo.value === "sem-prazo") {
    return !tarefa.prazo;
  }
  return true;
}

function mostrarPendencias() {
  const hoje = dataDeHoje();
  const filtradas = tarefasAbertas.filter((tarefa) =>
    (!prioridade.value || tarefa.prioridade === prioridade.value) && conferePrazo(tarefa, hoje)
  );

  lista.replaceChildren();
  aviso.textContent = filtradas.length === 1 ? "1 tarefa em aberto" : filtradas.length + " tarefas em aberto";
  if (!filtradas.length) {
    lista.appendChild(elemento("li", "vazio", tarefasAbertas.length
      ? "Nenhuma tarefa corresponde aos filtros."
      : "Você está em dia. Nenhuma tarefa em aberto."));
    return;
  }

  for (const tarefa of filtradas) {
    const materia = materias.find((registro) => registro.id_materia === tarefa.id_materia);
    const cartao = criarCartaoTarefa(tarefa, materia?.nome ?? "");
    const link = elemento("a", "abrir-tarefa", "Abrir tarefa");
    link.href = "/?editar=" + tarefa.id_tarefa + "#tarefas";
    link.setAttribute("aria-label", "Abrir tarefa: " + tarefa.titulo);
    cartao.appendChild(link);
    lista.appendChild(cartao);
  }
}

async function carregarPendencias() {
  prioridade.disabled = true;
  prazo.disabled = true;
  try {
    const [tarefas, listaMaterias] = await Promise.all([
      requisicao("/tarefas", "GET"), requisicao("/materias", "GET")
    ]);
    materias = listaMaterias;
    tarefasAbertas = tarefas.filter((tarefa) => tarefa.status !== "concluida").sort(ordenarTarefas);
    if (new URLSearchParams(location.search).get("filtro") === "vencidas") {
      prazo.value = "vencidas";
    }
    mostrarPendencias();
    prioridade.disabled = false;
    prazo.disabled = false;
  } catch (erro) {
    aviso.textContent = erro.message + " Recarregue a página para tentar novamente.";
    aviso.className = "erro";
  }
}

prioridade.addEventListener("change", mostrarPendencias);
prazo.addEventListener("change", mostrarPendencias);
carregarPendencias();
