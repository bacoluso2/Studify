from datetime import date

from werkzeug.security import generate_password_hash


def texto(dados, campo, limite=None, opcional=False):
    valor = dados.get(campo)
    if valor is None and opcional:
        return None
    if not isinstance(valor, str) or not valor.strip():
        raise ValueError(f"Informe {campo} como texto.")
    valor = valor.strip()
    if limite is not None and len(valor) > limite:
        raise ValueError(f"{campo} aceita até {limite} caracteres.")
    return valor


def identificador(dados, campo):
    valor = dados.get(campo)
    if type(valor) is not int or not 1 <= valor <= 2147483647:
        raise ValueError(f"{campo} deve ser um número inteiro positivo válido.")
    return valor


def descricao(dados):
    valor = texto(dados, "descricao", opcional=True)
    if valor is not None and len(valor.encode("utf-8")) > 65535:
        raise ValueError("A descrição é longa demais.")
    return valor


class Usuario:
    def __init__(self, nome, email, senha_hash):
        self.nome = nome
        self.email = email
        self.senha_hash = senha_hash

    @classmethod
    def do_json(cls, dados, edicao=False):
        email = texto(dados, "email", 255).lower()
        if email.count("@") != 1 or not all(email.split("@")) or any(c.isspace() for c in email):
            raise ValueError("Informe um e-mail válido.")
        nome = texto(dados, "nome", 100)
        senha = dados.get("senha")
        if edicao and senha is None:
            return cls(nome, email, None)
        if not isinstance(senha, str) or not senha.strip() or len(senha) > 128:
            raise ValueError("Informe uma senha de até 128 caracteres.")
        return cls(nome, email, generate_password_hash(senha))


class Materia:
    def __init__(self, id_usuario, nome, descricao):
        self.id_usuario = id_usuario
        self.nome = nome
        self.descricao = descricao

    @classmethod
    def do_json(cls, dados):
        return cls(identificador(dados, "id_usuario"), texto(dados, "nome", 100), descricao(dados))


class Tarefa:
    def __init__(self, id_materia, titulo, descricao, prazo, prioridade, status):
        self.id_materia = id_materia
        self.titulo = titulo
        self.descricao = descricao
        self.prazo = prazo
        self.prioridade = prioridade
        self.status = status

    @classmethod
    def do_json(cls, dados):
        prioridade = dados.get("prioridade", "media")
        status = dados.get("status", "pendente")
        if prioridade not in ("baixa", "media", "alta"):
            raise ValueError("Use baixa, media ou alta como prioridade.")
        if status not in ("pendente", "em_andamento", "concluida"):
            raise ValueError("Use pendente, em_andamento ou concluida como status.")
        prazo = texto(dados, "prazo", opcional=True)
        if prazo is not None:
            try:
                data = date.fromisoformat(prazo)
                if data.isoformat() != prazo or data.year < 1000:
                    raise ValueError
            except ValueError:
                raise ValueError("Informe o prazo no formato AAAA-MM-DD.") from None
            prazo = data
        return cls(
            identificador(dados, "id_materia"), texto(dados, "titulo", 150),
            descricao(dados), prazo, prioridade, status,
        )
