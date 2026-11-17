from conexao import conectar


def consultar(sql):
    conexao = conectar()
    try:
        with conexao.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conexao.close()


def gravar(sql, valores, cadastro=False):
    conexao = conectar()
    try:
        with conexao.cursor() as cursor:
            cursor.execute(sql, valores)
            conexao.commit()
            if cadastro:
                return cursor.lastrowid
            return cursor.rowcount
    finally:
        conexao.close()


class UsuarioDAO:
    def listar(self):
        return consultar("SELECT id_usuario, nome, email, criado_em FROM usuario ORDER BY id_usuario")

    def cadastrar(self, usuario):
        return gravar(
            "INSERT INTO usuario (nome, email, senha_hash) VALUES (%s, %s, %s)",
            (usuario.nome, usuario.email, usuario.senha_hash), True,
        )

    def atualizar(self, id_usuario, usuario):
        return gravar(
            """UPDATE usuario SET nome = %s, email = %s,
               senha_hash = COALESCE(%s, senha_hash) WHERE id_usuario = %s""",
            (usuario.nome, usuario.email, usuario.senha_hash, id_usuario),
        )

    def excluir(self, id_usuario):
        return gravar("DELETE FROM usuario WHERE id_usuario = %s", (id_usuario,))


class MateriaDAO:
    def listar(self):
        return consultar("SELECT id_materia, id_usuario, nome, descricao FROM materia ORDER BY id_materia")

    def cadastrar(self, materia):
        return gravar(
            "INSERT INTO materia (id_usuario, nome, descricao) VALUES (%s, %s, %s)",
            (materia.id_usuario, materia.nome, materia.descricao), True,
        )

    def atualizar(self, id_materia, materia):
        return gravar(
            "UPDATE materia SET id_usuario = %s, nome = %s, descricao = %s WHERE id_materia = %s",
            (materia.id_usuario, materia.nome, materia.descricao, id_materia),
        )

    def excluir(self, id_materia):
        return gravar("DELETE FROM materia WHERE id_materia = %s", (id_materia,))


class TarefaDAO:
    def listar(self):
        return consultar(
            """SELECT id_tarefa, id_materia, titulo, descricao, prazo, prioridade, status,
                      criada_em FROM tarefa ORDER BY id_tarefa"""
        )

    def cadastrar(self, tarefa):
        return gravar(
            """INSERT INTO tarefa (id_materia, titulo, descricao, prazo, prioridade, status)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (tarefa.id_materia, tarefa.titulo, tarefa.descricao, tarefa.prazo,
             tarefa.prioridade, tarefa.status), True,
        )

    def atualizar(self, id_tarefa, tarefa):
        return gravar(
            """UPDATE tarefa SET id_materia = %s, titulo = %s, descricao = %s,
               prazo = %s, prioridade = %s, status = %s WHERE id_tarefa = %s""",
            (tarefa.id_materia, tarefa.titulo, tarefa.descricao, tarefa.prazo,
             tarefa.prioridade, tarefa.status, id_tarefa),
        )

    def excluir(self, id_tarefa):
        return gravar("DELETE FROM tarefa WHERE id_tarefa = %s", (id_tarefa,))
