import os

from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from supabase import create_client, Client


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

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# =========================
# APLICACIÓN FASTAPI
# =========================

app = FastAPI(
    title="Sistema de Detección de Riesgo Escolar API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# MODELOS
# =========================

class CursoRequest(BaseModel):
    nombre: str
    grado: str


class EstudianteRequest(BaseModel):
    numero_orden: int
    nombres: str
    apellidos: str
    grado: str
    seccion: str


class NotaRequest(BaseModel):
    estudiante_id: int
    curso_id: int
    semestre: int
    calificacion: float | None = None


class AsistenciaRequest(BaseModel):
    estudiante_id: int
    fecha: str
    estado: str
    observacion: str | None = None
    semestre: int


class ObservacionRequest(BaseModel):
    estudiante_id: int
    observacion: str
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

    respuesta = (
        supabase
        .table("estudiantes")
        .select("*")
        .order("numero_orden")
        .execute()
    )

    return respuesta.data


@app.post("/estudiantes")
def agregar_estudiante(
    estudiante: EstudianteRequest
):

    respuesta = (
        supabase
        .table("estudiantes")
        .insert({
            "numero_orden": estudiante.numero_orden,
            "nombres": estudiante.nombres,
            "apellidos": estudiante.apellidos,
            "grado": estudiante.grado,
            "seccion": estudiante.seccion,
            "riesgo": "Bajo"
        })
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=400,
            detail="No se pudo agregar la estudiante."
        )

    return respuesta.data[0]


@app.put("/estudiantes/{estudiante_id}")
def editar_estudiante(
    estudiante_id: int,
    estudiante: EstudianteRequest
):

    respuesta = (
        supabase
        .table("estudiantes")
        .update({
            "numero_orden": estudiante.numero_orden,
            "nombres": estudiante.nombres,
            "apellidos": estudiante.apellidos,
            "grado": estudiante.grado,
            "seccion": estudiante.seccion
        })
        .eq("id", estudiante_id)
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=404,
            detail="Estudiante no encontrada."
        )

    return respuesta.data[0]


@app.delete("/estudiantes/{estudiante_id}")
def eliminar_estudiante(
    estudiante_id: int
):

    respuesta = (
        supabase
        .table("estudiantes")
        .delete()
        .eq("id", estudiante_id)
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=404,
            detail="Estudiante no encontrada."
        )

    return {
        "mensaje": "Estudiante eliminada correctamente"
    }


# =========================
# CURSOS
# =========================

@app.get("/cursos")
def obtener_cursos():

    respuesta = (
        supabase
        .table("cursos")
        .select("*")
        .execute()
    )

    return respuesta.data


@app.post("/cursos")
def agregar_curso(
    curso: CursoRequest
):

    respuesta = (
        supabase
        .table("cursos")
        .insert({
            "nombre": curso.nombre,
            "grado": curso.grado
        })
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=400,
            detail="No se pudo agregar el curso."
        )

    return respuesta.data[0]


@app.put("/cursos/{curso_id}")
def editar_curso(
    curso_id: int,
    curso: CursoRequest
):

    respuesta = (
        supabase
        .table("cursos")
        .update({
            "nombre": curso.nombre,
            "grado": curso.grado
        })
        .eq("id", curso_id)
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=404,
            detail="Curso no encontrado."
        )

    return respuesta.data[0]


@app.delete("/cursos/{curso_id}")
def eliminar_curso(
    curso_id: int
):

    respuesta = (
        supabase
        .table("cursos")
        .delete()
        .eq("id", curso_id)
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=404,
            detail="Curso no encontrado."
        )

    return {
        "mensaje": "Curso eliminado correctamente"
    }


# =========================
# NOTAS
# =========================

@app.get("/notas/estudiante/{estudiante_id}/semestre/{semestre}")
def obtener_notas_estudiante(
    estudiante_id: int,
    semestre: int
):

    respuesta = (
        supabase
        .table("notas")
        .select("*")
        .eq("estudiante_id", estudiante_id)
        .eq("semestre", semestre)
        .execute()
    )

    return respuesta.data


@app.get("/notas/estudiante/{estudiante_id}")
def obtener_todas_las_notas(
    estudiante_id: int
):

    respuesta = (
        supabase
        .table("notas")
        .select("*")
        .eq("estudiante_id", estudiante_id)
        .order("semestre")
        .order("curso_id")
        .execute()
    )

    return respuesta.data


@app.post("/notas")
def guardar_nota(
    nota: NotaRequest
):

    if nota.semestre < 1 or nota.semestre > 4:
        raise HTTPException(
            status_code=400,
            detail="El semestre debe estar entre 1 y 4."
        )

    if (
        nota.calificacion is not None
        and (
            nota.calificacion < 0
            or nota.calificacion > 20
        )
    ):
        raise HTTPException(
            status_code=400,
            detail="La calificación debe estar entre 0 y 20."
        )

    existente = (
        supabase
        .table("notas")
        .select("*")
        .eq("estudiante_id", nota.estudiante_id)
        .eq("curso_id", nota.curso_id)
        .eq("semestre", nota.semestre)
        .execute()
    )

    if existente.data:

        respuesta = (
            supabase
            .table("notas")
            .update({
                "calificacion": nota.calificacion
            })
            .eq("id", existente.data[0]["id"])
            .execute()
        )

    else:

        respuesta = (
            supabase
            .table("notas")
            .insert({
                "estudiante_id": nota.estudiante_id,
                "curso_id": nota.curso_id,
                "semestre": nota.semestre,
                "calificacion": nota.calificacion
            })
            .execute()
        )

    if not respuesta.data:
        raise HTTPException(
            status_code=400,
            detail="No se pudo guardar la nota."
        )

    return respuesta.data[0]


@app.delete("/notas/{estudiante_id}/{curso_id}/{semestre}")
def eliminar_nota(
    estudiante_id: int,
    curso_id: int,
    semestre: int
):

    respuesta = (
        supabase
        .table("notas")
        .delete()
        .eq("estudiante_id", estudiante_id)
        .eq("curso_id", curso_id)
        .eq("semestre", semestre)
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=404,
            detail="Nota no encontrada."
        )

    return {
        "mensaje": "Nota eliminada correctamente"
    }


# =========================
# ASISTENCIAS
# =========================

@app.get("/asistencias/estudiante/{estudiante_id}")
def obtener_asistencias(
    estudiante_id: int
):

    respuesta = (
        supabase
        .table("asistencias")
        .select("*")
        .eq("estudiante_id", estudiante_id)
        .order("fecha", desc=True)
        .execute()
    )

    return respuesta.data


@app.get("/asistencias/estudiante/{estudiante_id}/semestre/{semestre}")
def obtener_asistencias_semestre(
    estudiante_id: int,
    semestre: int
):

    if semestre < 1 or semestre > 4:
        raise HTTPException(
            status_code=400,
            detail="El semestre debe estar entre 1 y 4."
        )

    respuesta = (
        supabase
        .table("asistencias")
        .select("*")
        .eq("estudiante_id", estudiante_id)
        .eq("semestre", semestre)
        .order("fecha", desc=True)
        .execute()
    )

    return respuesta.data


@app.post("/asistencias")
def registrar_asistencia(
    asistencia: AsistenciaRequest
):

    if asistencia.estado not in ["Asistió", "Inasistió"]:
        raise HTTPException(
            status_code=400,
            detail="El estado debe ser 'Asistió' o 'Inasistió'."
        )

    if asistencia.semestre < 1 or asistencia.semestre > 4:
        raise HTTPException(
            status_code=400,
            detail="El semestre debe estar entre 1 y 4."
        )

    existente = (
        supabase
        .table("asistencias")
        .select("*")
        .eq("estudiante_id", asistencia.estudiante_id)
        .eq("fecha", asistencia.fecha)
        .execute()
    )

    if existente.data:

        respuesta = (
            supabase
            .table("asistencias")
            .update({
                "estado": asistencia.estado,
                "observacion": asistencia.observacion,
                "semestre": asistencia.semestre
            })
            .eq("id", existente.data[0]["id"])
            .execute()
        )

    else:

        respuesta = (
            supabase
            .table("asistencias")
            .insert({
                "estudiante_id": asistencia.estudiante_id,
                "fecha": asistencia.fecha,
                "estado": asistencia.estado,
                "observacion": asistencia.observacion,
                "semestre": asistencia.semestre
            })
            .execute()
        )

    if not respuesta.data:
        raise HTTPException(
            status_code=400,
            detail="No se pudo guardar la asistencia."
        )

    return respuesta.data[0]


@app.delete("/asistencias/{estudiante_id}/{fecha}")
def eliminar_asistencia(
    estudiante_id: int,
    fecha: str
):

    respuesta = (
        supabase
        .table("asistencias")
        .delete()
        .eq("estudiante_id", estudiante_id)
        .eq("fecha", fecha)
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=404,
            detail="Asistencia no encontrada."
        )

    return {
        "mensaje": "Asistencia eliminada correctamente"
    }


# =========================
# OBSERVACIONES
# =========================

@app.get("/observaciones/estudiante/{estudiante_id}")
def obtener_observaciones(
    estudiante_id: int
):

    respuesta = (
        supabase
        .table("observaciones")
        .select("*")
        .eq("estudiante_id", estudiante_id)
        .order("fecha", desc=True)
        .execute()
    )

    return respuesta.data


@app.post("/observaciones")
def agregar_observacion(
    observacion: ObservacionRequest
):

    datos = {
        "estudiante_id": observacion.estudiante_id,
        "observacion": observacion.observacion
    }

    if observacion.fecha:
        datos["fecha"] = observacion.fecha

    respuesta = (
        supabase
        .table("observaciones")
        .insert(datos)
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=400,
            detail="No se pudo guardar la observación."
        )

    return respuesta.data[0]


@app.delete("/observaciones/{observacion_id}")
def eliminar_observacion(
    observacion_id: int
):

    respuesta = (
        supabase
        .table("observaciones")
        .delete()
        .eq("id", observacion_id)
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=404,
            detail="Observación no encontrada."
        )

    return {
        "mensaje": "Observación eliminada correctamente"
    }