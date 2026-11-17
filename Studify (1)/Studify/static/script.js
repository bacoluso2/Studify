const grupos = ["usuarios", "materias", "tarefas"];
const registros = { usuarios: [], materias: [], tarefas: [] };
const aviso = document.querySelector("#aviso");

const chaves = {
  usuarios: "id_usuario",
  materias: "id_materia",
  tarefas: "id_tarefa"
};

function buscarNome(grupo, id) {
  for (const registro of registros[grupo]) {
    if (registro[chaves[grupo]] === id) {
      return registro.nome;
    }
  }
  return "";
}

function preencherOpcoes(seletor, grupo, avisoVazio) {
  const select = document.querySelector(seletor);
  const anterior = select.value;
  select.textContent = "";

  const inicial = document.createElement("option");
  inicial.value = "";
  inicial.textContent = avisoVazio;
  select.appendChild(inicial);

  for (const registro of registros[grupo]) {
    const opcao = document.createElement("option");
    opcao.value = registro[chaves[grupo]];
    opcao.textContent = registro.nome + " (#" + opcao.value + ")";
    select.appendChild(opcao);
  }
  select.value = anterior;
  if (select.selectedIndex === -1) {
    select.value = "";
  }
}

function mensagem(form, texto, erro) {
  const campo = form.querySelector(".mensagem");
  campo.textContent = texto;
  campo.className = erro ? "mensagem erro" : "mensagem";
  campo.hidden = !texto;
}

function limpar(form) {
  form.reset();
  form.dataset.id = "";
  form.querySelector('button[type="submit"]').textContent = "Cadastrar";
  form.querySelector(".cancelar").hidden = true;
  if (form.elements.senha) {
    form.elements.senha.required = true;
    form.elements.senha.placeholder = "";
  }
}

function editar(form, grupo, registro) {
  form.dataset.id = registro[chaves[grupo]];
  for (const campo of form.querySelectorAll("[name]")) {
    campo.value = registro[campo.name] ?? "";
  }
  if (form.elements.senha) {
    form.elements.senha.required = false;
    form.elements.senha.placeholder = "Preencha somente para trocar";
  }
  form.querySelector('button[type="submit"]').textContent = "Salvar alterações";
  form.querySelector(".cancelar").hidden = false;
  mensagem(form, "Editando " + (registro.nome || registro.titulo) + ".", false);
  form.querySelector("input").focus();
}

async function atualizarAposSalvar(form, texto) {
  try {
    await carregar();
    mensagem(form, texto, false);
  } catch (erro) {
    mensagem(form, texto + " Recarregue a página para atualizar a lista.", true);
  }
}

async function excluir(form, grupo, registro, botao) {
  if (!confirm("Excluir " + (registro.nome || registro.titulo) + "?")) {
    return;
  }
  const id = registro[chaves[grupo]];
  botao.disabled = true;
  try {
    await requisicao("/" + grupo + "/" + id, "DELETE");
    if (form.dataset.id === String(id)) {
      limpar(form);
    }
    await atualizarAposSalvar(form, "Registro excluído.");
  } catch (erro) {
    mensagem(form, erro.message, true);
  } finally {
    botao.disabled = false;
  }
}

function mostrar(grupo) {
  const secao = document.querySelector("#" + grupo);
  const lista = secao.querySelector(".registros");
  const form = secao.querySelector("form");
  lista.textContent = "";

  if (registros[grupo].length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "vazio";
    vazio.textContent = "Nenhum registro cadastrado.";
    lista.appendChild(vazio);
  }

  for (const registro of registros[grupo]) {
    let item;
    if (grupo === "tarefas") {
      item = criarCartaoTarefa(registro, buscarNome("materias", registro.id_materia));
    } else {
      item = elemento("li", "cartao");
      item.appendChild(elemento("strong", "cartao-titulo", registro.nome));
      const detalhe = grupo === "usuarios" ? registro.email : buscarNome("usuarios", registro.id_usuario);
      item.appendChild(elemento("p", "cartao-meta", detalhe));
      if (registro.descricao) {
        item.appendChild(elemento("p", "cartao-descricao", registro.descricao));
      }
    }

    const acoes = document.createElement("div");
    acoes.className = "acoes";
    const botaoEditar = document.createElement("button");
    botaoEditar.className = "secundario";
    botaoEditar.textContent = "Editar";
    botaoEditar.addEventListener("click", function () {
      editar(form, grupo, registro);
    });

    const botaoExcluir = document.createElement("button");
    botaoExcluir.className = "secundario";
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.addEventListener("click", function () {
      excluir(form, grupo, registro, botaoExcluir);
    });

    acoes.appendChild(botaoEditar);
    acoes.appendChild(botaoExcluir);
    item.appendChild(acoes);
    lista.appendChild(item);
  }
}

async function carregar() {
  const usuarios = await requisicao("/usuarios", "GET");
  const materias = await requisicao("/materias", "GET");
  const tarefas = await requisicao("/tarefas", "GET");

  registros.usuarios = usuarios;
  registros.materias = materias;
  registros.tarefas = tarefas;
  preencherOpcoes("#materia-usuario", "usuarios", usuarios.length ? "Selecione um usuário" : "Cadastre um usuário primeiro");
  preencherOpcoes("#tarefa-materia", "materias", materias.length ? "Selecione uma matéria" : "Cadastre uma matéria primeiro");
  for (const grupo of grupos) {
    mostrar(grupo);
  }
  atualizarResumo(tarefas);
}

for (const grupo of grupos) {
  const form = document.querySelector("#" + grupo + " form");
  const campo = form.querySelector("fieldset");
  form.querySelector(".cancelar").addEventListener("click", function () {
    limpar(form);
    mensagem(form, "", false);
  });

  form.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    const dados = {};
    for (const entrada of form.querySelectorAll("[name]")) {
      dados[entrada.name] = entrada.value.trim();
    }
    if (form.elements.senha) {
      dados.senha = form.elements.senha.value;
      if (!dados.senha && form.dataset.id) {
        delete dados.senha;
      }
    }
    if (form.elements.descricao) {
      dados.descricao = dados.descricao || null;
    }
    if (grupo === "materias") {
      dados.id_usuario = Number(dados.id_usuario);
    }
    if (grupo === "tarefas") {
      dados.id_materia = Number(dados.id_materia);
      dados.prazo = dados.prazo || null;
    }

    const id = form.dataset.id;
    const rota = "/" + grupo + (id ? "/" + id : "");
    campo.disabled = true;
    mensagem(form, "Salvando…", false);
    try {
      await requisicao(rota, id ? "PUT" : "POST", dados);
      limpar(form);
      await atualizarAposSalvar(form, id ? "Alterações salvas." : "Registro cadastrado.");
    } catch (erro) {
      mensagem(form, erro.message, true);
    } finally {
      campo.disabled = false;
    }
  });
}

function atualizarResumo(tarefas) {
  const abertas = tarefas.filter((tarefa) => tarefa.status !== "concluida");
  const vencidas = abertas.filter((tarefa) => tarefa.prazo && tarefa.prazo < dataDeHoje());
  const concluidas = tarefas.length - abertas.length;
  const percentual = tarefas.length ? Math.round(100 * concluidas / tarefas.length) : 0;

  document.querySelector("#total-abertas").textContent = abertas.length;
  document.querySelector("#total-vencidas").textContent = vencidas.length;
  document.querySelector("#total-concluidas").textContent = concluidas;
  document.querySelector("#progresso").textContent = percentual + "%";
  document.querySelector("#anel").style.setProperty("--progresso", percentual + "%");
  document.querySelector("#resumo-plano").textContent = abertas.length === 1
    ? "Você tem 1 tarefa em aberto."
    : "Você tem " + abertas.length + " tarefas em aberto.";
}

carregar().then(function () {
  aviso.hidden = true;
  for (const campo of document.querySelectorAll("fieldset")) {
    campo.disabled = false;
  }

  const id = Number(new URLSearchParams(location.search).get("editar"));
  const tarefa = registros.tarefas.find((registro) => registro.id_tarefa === id);
  if (tarefa) {
    editar(document.querySelector("#tarefas form"), "tarefas", tarefa);
  }
}).catch(function (erro) {
  aviso.textContent = erro.message + " Recarregue a página para tentar novamente.";
  aviso.className = "erro";
});
