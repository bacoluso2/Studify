const prioridades = { baixa: "Baixa", media: "Média", alta: "Alta" };
const estados = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída"
};

async function requisicao(rota, metodo, dados) {
  const opcoes = { method: metodo };
  if (dados) {
    opcoes.headers = { "Content-Type": "application/json" };
    opcoes.body = JSON.stringify(dados);
  }
  const resposta = await fetch(rota, opcoes);
  const resultado = await resposta.json();
  if (!resposta.ok) {
    throw new Error(resultado.erro || "Não foi possível concluir a operação.");
  }
  return resultado;
}

function elemento(tag, classe, texto) {
  const item = document.createElement(tag);
  item.className = classe;
  if (texto !== undefined) {
    item.textContent = texto;
  }
  return item;
}

function dataDeHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

function diaNoCalendario(data) {
  return Date.parse(data + "T00:00:00Z") / 86400000;
}

function formatarPrazo(prazo) {
  return prazo.split("-").reverse().join("/");
}

function criarPrazo(tarefa) {
  const bloco = elemento("div", "prazo");
  if (!tarefa.prazo) {
    bloco.appendChild(elemento("span", "prazo-data", "Sem prazo definido"));
    return bloco;
  }

  const cabecalho = elemento("div", "prazo-cabecalho");
  const data = elemento("time", "prazo-data", "Prazo: " + formatarPrazo(tarefa.prazo));
  data.dateTime = tarefa.prazo;
  cabecalho.appendChild(data);
  bloco.appendChild(cabecalho);

  if (tarefa.status === "concluida") {
    return bloco;
  }

  const hoje = diaNoCalendario(dataDeHoje());
  const prazo = diaNoCalendario(tarefa.prazo);
  const criacao = diaNoCalendario(tarefa.criada_em?.slice(0, 10));
  const diasRestantes = prazo - hoje;
  const diasTotais = prazo - criacao;
  let percentagem = 0;
  if (diasRestantes <= 0) {
    percentagem = 100;
  } else if (diasTotais > 0) {
    percentagem = Math.max(0, Math.round(100 * (hoje - criacao) / diasTotais));
  }

  let situacao;
  if (diasRestantes < 0) {
    bloco.classList.add("vencido");
    situacao = diasRestantes === -1 ? "Vencida há 1 dia" : "Vencida há " + (-diasRestantes) + " dias";
  } else if (diasRestantes === 0) {
    bloco.classList.add("vence-hoje");
    situacao = "Vence hoje";
  } else {
    situacao = diasRestantes === 1 ? "Falta 1 dia" : "Faltam " + diasRestantes + " dias";
  }
  cabecalho.appendChild(elemento("strong", "prazo-situacao", situacao));

  const barra = elemento("progress", "barra-prazo");
  barra.max = 100;
  barra.value = percentagem;
  barra.setAttribute("aria-label", "Tempo do prazo decorrido para " + tarefa.titulo);
  barra.setAttribute("aria-valuetext", situacao);
  bloco.appendChild(barra);
  return bloco;
}

function criarCartaoTarefa(tarefa, materia) {
  const item = elemento("li", "cartao cartao-tarefa prioridade-" + tarefa.prioridade);
  const topo = elemento("div", "cartao-topo");
  topo.appendChild(elemento("span", "cartao-meta", materia));
  topo.appendChild(elemento("span", "etiqueta etiqueta-prioridade", "Prioridade " + prioridades[tarefa.prioridade].toLowerCase()));
  item.appendChild(topo);
  item.appendChild(elemento("strong", "cartao-titulo", tarefa.titulo));
  item.appendChild(elemento("span", "etiqueta etiqueta-status status-" + tarefa.status, estados[tarefa.status]));

  if (tarefa.descricao) {
    item.appendChild(elemento("p", "cartao-descricao", tarefa.descricao));
  }
  item.appendChild(criarPrazo(tarefa));
  return item;
}

const dataVisivel = document.querySelector("#hoje");
dataVisivel.dateTime = dataDeHoje();
dataVisivel.textContent = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
