-- Modelo físico do Studify
-- Dialeto: MySQL / MariaDB

CREATE DATABASE IF NOT EXISTS studify
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE studify;

CREATE TABLE usuario (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario)
) ENGINE=InnoDB;

CREATE TABLE materia (
    id_materia INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NULL,
    PRIMARY KEY (id_materia),
    CONSTRAINT fk_materia_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
) ENGINE=InnoDB;

CREATE TABLE tarefa (
    id_tarefa INT NOT NULL AUTO_INCREMENT,
    id_materia INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NULL,
    prazo DATE NULL,
    prioridade ENUM('baixa', 'media', 'alta') NOT NULL DEFAULT 'media',
    status ENUM('pendente', 'em_andamento', 'concluida') NOT NULL DEFAULT 'pendente',
    criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_tarefa),
    CONSTRAINT fk_tarefa_materia
        FOREIGN KEY (id_materia)
        REFERENCES materia (id_materia)
) ENGINE=InnoDB;
