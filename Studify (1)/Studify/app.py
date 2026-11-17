from datetime import date, datetime

from flask import Flask, jsonify, request
from pymysql import MySQLError

from dao import MateriaDAO, TarefaDAO, UsuarioDAO
from models import Materia, Tarefa, Usuario

app = Flask(__name__)
usuario_dao = UsuarioDAO()
materia_dao = MateriaDAO()
tarefa_dao = TarefaDAO()


def listar(dao):
    registros = dao.listar()
    for registro in registros:
        for campo, valor in registro.items():
            if isinstance(valor, (date, datetime)):
                registro[campo] = valor.isoformat()
    return jsonify(registros)


def salvar(modelo, dao, campo_id, id_registro=None):
    if request.method == "DELETE":
        if dao.excluir(id_registro) == 0:
            return jsonify(erro="Registro não encontrado."), 404
        return jsonify(mensagem="Registro excluído."), 200
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify(erro="Envie um objeto JSON com Content-Type application/json."), 400
    try:
        if modelo == Usuario:
            registro = Usuario.do_json(dados, edicao=id_registro is not None)
        else:
            registro = modelo.do_json(dados)
    except ValueError as erro:
        return jsonify(erro=str(erro)), 400
    if id_registro is None:
        return jsonify({campo_id: dao.cadastrar(registro)}), 201
    if dao.atualizar(id_registro, registro) == 0:
        return jsonify(erro="Registro não encontrado."), 404
    return jsonify({campo_id: id_registro}), 200


@app.get("/")
def inicio():
    return app.send_static_file("index.html")


@app.get("/pendencias")
def pendencias():
    return app.send_static_file("pendencias.html")


@app.route("/usuarios", methods=["GET", "POST"])
def usuarios():
    if request.method == "GET":
        return listar(usuario_dao)
    return salvar(Usuario, usuario_dao, "id_usuario")


@app.route("/materias", methods=["GET", "POST"])
def materias():
    if request.method == "GET":
        return listar(materia_dao)
    return salvar(Materia, materia_dao, "id_materia")


@app.route("/tarefas", methods=["GET", "POST"])
def tarefas():
    if request.method == "GET":
        return listar(tarefa_dao)
    return salvar(Tarefa, tarefa_dao, "id_tarefa")


@app.route("/usuarios/<int:id_usuario>", methods=["PUT", "DELETE"])
def usuario(id_usuario):
    return salvar(Usuario, usuario_dao, "id_usuario", id_usuario)


@app.route("/materias/<int:id_materia>", methods=["PUT", "DELETE"])
def materia(id_materia):
    return salvar(Materia, materia_dao, "id_materia", id_materia)


@app.route("/tarefas/<int:id_tarefa>", methods=["PUT", "DELETE"])
def tarefa(id_tarefa):
    return salvar(Tarefa, tarefa_dao, "id_tarefa", id_tarefa)


@app.errorhandler(MySQLError)
def erro_banco(erro):
    codigo = erro.args[0] if erro.args else None
    if codigo == 1452:
        campo = "id_usuario" if request.path.startswith("/materias") else "id_materia"
        return jsonify(erro=f"O registro informado em {campo} não existe."), 400
    if codigo == 1451:
        if request.path.startswith("/usuarios"):
            return jsonify(erro="Exclua ou transfira as matérias deste usuário primeiro."), 409
        return jsonify(erro="Exclua ou transfira as tarefas desta matéria primeiro."), 409
    if codigo == 1049:
        return jsonify(erro="Banco não encontrado. Confira DB_NAME ou importe o SQL da Etapa 1."), 503
    if codigo in (1044, 1045, 2002, 2003, 2006, 2013):
        return jsonify(erro="Confira se o MySQL está iniciado e revise o arquivo .env."), 503
    app.logger.error("Erro do MySQL (código %s).", codigo)
    return jsonify(erro="Não foi possível concluir a operação no banco."), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
