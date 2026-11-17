from os import getenv

import pymysql
from dotenv import load_dotenv

load_dotenv()


def conectar():
    return pymysql.connect(
        host=getenv("DB_HOST", "127.0.0.1"),
        port=int(getenv("DB_PORT", "3306")),
        user=getenv("DB_USER", "root"),
        password=getenv("DB_PASSWORD", ""),
        database=getenv("DB_NAME", "studify"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=5,
        client_flag=pymysql.constants.CLIENT.FOUND_ROWS,
    )
