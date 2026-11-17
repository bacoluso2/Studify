# Studify

Projeto Integrado de DWS, POO e BD. O sistema permite cadastrar usuários, associar matérias a eles e organizar tarefas por matéria, prazo, prioridade e status.

## Como rodar no Windows

1. Abra o XAMPP e inicie o MySQL. No phpMyAdmin, importe `banco/studify.sql` para criar o banco `studify` em uma instalação nova. O projeto usa as tabelas `usuario`, `materia` e `tarefa`.
2. Abra o PowerShell na pasta que contém `app.py` e execute:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   Copy-Item .env.example .env
   .\.venv\Scripts\python.exe app.py
   ```

   Se as configurações do MySQL forem diferentes das do XAMPP padrão, edite o arquivo `.env` antes de iniciar o Flask. Se já tiver um `.env`, atualize `DB_NAME=studify` nele.
3. Com o Flask rodando, abra [http://127.0.0.1:5000](http://127.0.0.1:5000).

Se você já tiver dados da etapa anterior, exporte as três tabelas pelo phpMyAdmin. Crie o banco vazio `studify`, selecione-o e importe essa exportação com a estrutura e os dados das tabelas. Pule a importação de `banco/studify.sql` nesse caso.

## Como usar

Cadastre um usuário, cadastre uma matéria vinculada a ele e então adicione uma tarefa para essa matéria. Cada seção lista os registros e permite editar ou excluir. Para excluir uma matéria com tarefas ou um usuário com matérias, exclua ou transfira primeiro os registros vinculados.

Veja **Pendências** para acompanhar as tarefas pendentes e em andamento, com filtros por prioridade e prazo. As prioridades baixa, média e alta aparecem em verde, âmbar e vermelho. A barra indica a parte do prazo que já passou entre a data de criação e o dia de entrega. Quando a tarefa vence, a barra fica cheia e o texto mostra há quantos dias ela está vencida.

## Arquivos

- `docs/Diagrama_de_Classes.pdf` — classes, DAOs e relacionamentos.
- `banco/studify.sql` — estrutura do banco MySQL/MariaDB.
- `models.py`, `dao.py`, `conexao.py` e `app.py` — classes Python, acesso ao banco e rotas Flask.
- `static/` — painel e página de pendências em HTML, CSS responsivo e JavaScript que chama as rotas via Fetch.

As rotas `/usuarios`, `/materias` e `/tarefas` recebem GET para listar e POST para cadastrar. Com o ID na URL, recebem PUT para editar e DELETE para excluir.

## Entrega no GitHub

Adicione os arquivos ao repositório que vocês já usam para manter os commits das etapas anteriores. Faça o commit da integração, envie com **Push origin** no GitHub Desktop e confira se o professor está como colaborador em **Settings → Collaborators**. O e-mail indicado no enunciado é `leonardo.stephan@eaportal.org`.
