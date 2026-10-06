import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from supabase import create_client, Client


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("SUPABASE_URL leída por Python:", repr(SUPABASE_URL))
print("SUPABASE_KEY encontrada:", bool(SUPABASE_KEY))


if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "No se encontraron SUPABASE_URL y SUPABASE_KEY en el archivo .env"
    )


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


app = FastAPI(
    title="Sistema de Detección de Riesgo Escolar API"
)


@app.get("/")
def inicio():
    return {
        "mensaje": "API del Sistema de Detección de Riesgo Escolar funcionando"
    }


@app.get("/estudiantes")
def obtener_estudiantes():

    respuesta = (
        supabase
        .table("estudiantes")
        .select("*")
        .execute()
    )

    return respuesta.data