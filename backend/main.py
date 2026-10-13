
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import Client, create_client


# =========================
# CONFIGURACIÓN
# =========================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "No se encontraron SUPABASE_URL y SUPABASE_KEY en el archivo .env"
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Sistema de Detección de Riesgo Escolar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# FUNCIONES AUXILIARES
# =========================

def consultar(consulta):
    """Ejecuta una consulta de lectura y devuelve sus resultados."""
    try:
        return consulta.execute().data
    except Exception as error:
        print(f"Error de consulta en Supabase: {error}")
        raise HTTPException(
            status_code=500,
            detail="No se pudo consultar la base de datos."
        ) from error


def ejecutar_mutacion(consulta, mensaje_error, mensaje_no_encontrado=None):
    """Ejecuta una inserción, actualización o eliminación."""
    try:
        respuesta = consulta.execute()
    except Exception as error:
        print(f"Error de escritura en Supabase: {error}")
        raise HTTPException(
            status_code=500,
            detail=mensaje_error
        ) from error

    if not respuesta.data:
        if mensaje_no_encontrado:
            raise HTTPException(
                status_code=404,
                detail=mensaje_no_encontrado
            )

        raise HTTPException(status_code=400, detail=mensaje_error)

    return respuesta.data[0]


# =========================
# MODELOS Y VALIDACIONES
# =========================

class CursoRequest(BaseModel):
    nombre: str = Field(min_length=1)
    grado: str = Field(min_length=1)


class EstudianteRequest(BaseModel):
    numero_orden: int = Field(gt=0)
    nombres: str = Field(min_length=1)
    apellidos: str = Field(min_length=1)
    grado: str = Field(min_length=1)
    seccion: str = Field(min_length=1)


class NotaRequest(BaseModel):
    estudiante_id: int = Field(gt=0)
    curso_id: int = Field(gt=0)
    semestre: int = Field(ge=1, le=4)
    calificacion: float | None = Field(default=None, ge=0, le=20)


class AsistenciaRequest(BaseModel):
    estudiante_id: int = Field(gt=0)
    fecha: str = Field(min_length=1)
    estado: str
    observacion: str | None = None
    semestre: int = Field(ge=1, le=4)


class ObservacionRequest(BaseModel):
    estudiante_id: int = Field(gt=0)
    observacion: str = Field(min_length=1)
    fecha: str | None = None


# =========================
# INICIO
# =========================

@app.get("/")
def inicio():
    return {
        "mensaje": "API del Sistema de Detección de Riesgo Escolar funcionando"
    }


# =========================
# ESTUDIANTES
# =========================

@app.get("/estudiantes")
def obtener_estudiantes():
    return consultar(
        supabase.table("estudiantes")
        .select("*")
        .order("numero_orden")
    )


@app.post("/estudiantes")
def agregar_estudiante(estudiante: EstudianteRequest):
    datos = estudiante.model_dump()
    datos["riesgo"] = "Sin analizar"

    return ejecutar_mutacion(
        supabase.table("estudiantes").insert(datos),
        "No se pudo agregar la estudiante."
    )


@app.put("/estudiantes/{estudiante_id}")
def editar_estudiante(estudiante_id: int, estudiante: EstudianteRequest):
    return ejecutar_mutacion(
        supabase.table("estudiantes")
        .update(estudiante.model_dump())
        .eq("id", estudiante_id),
        "No se pudo editar la estudiante.",
        "Estudiante no encontrada."
    )


@app.delete("/estudiantes/{estudiante_id}")
def eliminar_estudiante(estudiante_id: int):
    ejecutar_mutacion(
        supabase.table("estudiantes")
        .delete()
        .eq("id", estudiante_id),
        "No se pudo eliminar la estudiante.",
        "Estudiante no encontrada."
    )

    return {"mensaje": "Estudiante eliminada correctamente"}


# =========================
# CURSOS
# =========================

@app.get("/cursos")
def obtener_cursos():
    return consultar(
        supabase.table("cursos").select("*")
    )


@app.post("/cursos")
def agregar_curso(curso: CursoRequest):
    return ejecutar_mutacion(
        supabase.table("cursos").insert(curso.model_dump()),
        "No se pudo agregar el curso."
    )


@app.put("/cursos/{curso_id}")
def editar_curso(curso_id: int, curso: CursoRequest):
    return ejecutar_mutacion(
        supabase.table("cursos")
        .update(curso.model_dump())
        .eq("id", curso_id),
        "No se pudo editar el curso.",
        "Curso no encontrado."
    )


@app.delete("/cursos/{curso_id}")
def eliminar_curso(curso_id: int):
    ejecutar_mutacion(
        supabase.table("cursos")
        .delete()
        .eq("id", curso_id),
        "No se pudo eliminar el curso.",
        "Curso no encontrado."
    )

    return {"mensaje": "Curso eliminado correctamente"}


# =========================
# NOTAS
# =========================

@app.get("/notas/estudiante/{estudiante_id}/semestre/{semestre}")
def obtener_notas_semestre(estudiante_id: int, semestre: int):
    if not 1 <= semestre <= 4:
        raise HTTPException(400, "El semestre debe estar entre 1 y 4.")

    return consultar(
        supabase.table("notas")
        .select("*")
        .eq("estudiante_id", estudiante_id)
        .eq("semestre", semestre)
    )


@app.get("/notas/estudiante/{estudiante_id}")
def obtener_todas_las_notas(estudiante_id: int):
    return consultar(
        supabase.table("notas")
        .select("*")
        .eq("estudiante_id", estudiante_id)
        .order("semestre")
        .order("curso_id")
    )


@app.post("/notas")
def guardar_nota(nota: NotaRequest):
    datos_clave = (
        supabase.table("notas")
        .select("id")
        .eq("estudiante_id", nota.estudiante_id)
        .eq("curso_id", nota.curso_id)
        .eq("semestre", nota.semestre)
    )

    existentes = consultar(datos_clave)

    datos = {
        "estudiante_id": nota.estudiante_id,
        "curso_id": nota.curso_id,
        "semestre": nota.semestre,
        "calificacion": nota.calificacion
    }

    if existentes:
        consulta = (
            supabase.table("notas")
            .update({"calificacion": nota.calificacion})
            .eq("id", existentes[0]["id"])
        )
    else:
        consulta = supabase.table("notas").insert(datos)

    return ejecutar_mutacion(
        consulta,
        "No se pudo guardar la nota."
    )


@app.delete("/notas/{estudiante_id}/{curso_id}/{semestre}")
def eliminar_nota(estudiante_id: int, curso_id: int, semestre: int):
    ejecutar_mutacion(
        supabase.table("notas")
        .delete()
        .eq("estudiante_id", estudiante_id)
        .eq("curso_id", curso_id)
        .eq("semestre", semestre),
        "No se pudo eliminar la nota.",
        "Nota no encontrada."
    )

    return {"mensaje": "Nota eliminada correctamente"}


# =========================
# ASISTENCIAS
# =========================

@app.get("/asistencias/estudiante/{estudiante_id}")
def obtener_asistencias(estudiante_id: int):
    return consultar(
        supabase.table("asistencias")
        .select("*")
        .eq("estudiante_id", estudiante_id)
        .order("fecha", desc=True)
    )


@app.get("/asistencias/estudiante/{estudiante_id}/semestre/{semestre}")
def obtener_asistencias_semestre(estudiante_id: int, semestre: int):
    if not 1 <= semestre <= 4:
        raise HTTPException(400, "El semestre debe estar entre 1 y 4.")

    return consultar(
        supabase.table("asistencias")
        .select("*")
        .eq("estudiante_id", estudiante_id)
        .eq("semestre", semestre)
        .order("fecha", desc=True)
    )


@app.post("/asistencias")
def registrar_asistencia(asistencia: AsistenciaRequest):
    if asistencia.estado not in ("Asistió", "Inasistió"):
        raise HTTPException(
            status_code=400,
            detail="El estado debe ser 'Asistió' o 'Inasistió'."
        )

    existentes = consultar(
        supabase.table("asistencias")
        .select("id")
        .eq("estudiante_id", asistencia.estudiante_id)
        .eq("fecha", asistencia.fecha)
    )

    datos = asistencia.model_dump()

    if existentes:
        consulta = (
            supabase.table("asistencias")
            .update({
                "estado": asistencia.estado,
                "observacion": asistencia.observacion,
                "semestre": asistencia.semestre
            })
            .eq("id", existentes[0]["id"])
        )
    else:
        consulta = supabase.table("asistencias").insert(datos)

    return ejecutar_mutacion(
        consulta,
        "No se pudo guardar la asistencia."
    )


@app.delete("/asistencias/{estudiante_id}/{fecha}")
def eliminar_asistencia(estudiante_id: int, fecha: str):
    ejecutar_mutacion(
        supabase.table("asistencias")
        .delete()
        .eq("estudiante_id", estudiante_id)
        .eq("fecha", fecha),
        "No se pudo eliminar la asistencia.",
        "Asistencia no encontrada."
    )

    return {"mensaje": "Asistencia eliminada correctamente"}


# =========================
# OBSERVACIONES
# =========================

@app.get("/observaciones/estudiante/{estudiante_id}")
def obtener_observaciones(estudiante_id: int):
    return consultar(
        supabase.table("observaciones")
        .select("*")
        .eq("estudiante_id", estudiante_id)
        .order("fecha", desc=True)
    )


@app.post("/observaciones")
def agregar_observacion(observacion: ObservacionRequest):
    datos = observacion.model_dump(exclude_none=True)

    return ejecutar_mutacion(
        supabase.table("observaciones").insert(datos),
        "No se pudo guardar la observación."
    )


@app.delete("/observaciones/{observacion_id}")
def eliminar_observacion(observacion_id: int):
    ejecutar_mutacion(
        supabase.table("observaciones")
        .delete()
        .eq("id", observacion_id),
        "No se pudo eliminar la observación.",
        "Observación no encontrada."
    )

    return {"mensaje": "Observación eliminada correctamente"}
