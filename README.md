# Test de autoevaluación

Este proyecto es una herramienta interactiva diseñada para el **estudio y la autoevaluación** de distintas asignaturas, desarrollada como apoyo para el grado de Ingeniería Informática en la **Universidad de La Laguna**. Permite seleccionar la asignatura, elegir los temas a practicar y generar un cuestionario dinámico y personalizable.

## Características

- **Configuración y cuestionario separados:** La configuración (modo, asignatura, temas y número de preguntas) se muestra en una pantalla independiente del cuestionario, con opción de volver a ella en cualquier momento.
- **Selección de asignatura:** El usuario elige la asignatura que quiere practicar (por ejemplo, Inteligencia Emocional o Dirección y Gestión de Proyectos).
- **Selección de temas:** Los temas mostrados se adaptan a la asignatura elegida, con opción de seleccionar todos de una vez.
- **Dos modos de práctica:**
  - **Modo examen:** Muestra todas las preguntas y no corrige nada hasta pulsar "Corregir respuestas".
  - **Modo estudio:** Muestra una pregunta cada vez; al marcar una respuesta se indica al instante si es correcta y cuál es la opción correcta. Permite avanzar y retroceder con los botones "Siguiente" y "Anterior".
- **Generación de preguntas:** El programa genera un número configurable de preguntas aleatorias basadas en los temas seleccionados.
- **Tipos de pregunta:** Soporta preguntas de **Verdadero/Falso** y de **opción múltiple** (a/b/c/d).
- **Corrección automática:** En modo examen, al terminar, corrige las respuestas, marca los aciertos y fallos, resalta la opción correcta y muestra la puntuación.
- **Interfaz intuitiva:** Diseño visual atractivo y fácil de usar.

## Estructura del Proyecto

```
.
├── index.html                  # Estructura principal de la aplicación
├── script.js                   # Lógica del programa
├── styles.css                  # Estilos para la interfaz
├── asignaturas.json            # Catálogo de asignaturas y temas
└── asignaturas/
    ├── inteligencia-emocional/
    │   ├── test_tema_1.json
    │   └── ...
    └── direccion-gestion-proyectos/
        └── test_tema_1.json
```

## Cómo añadir una asignatura o un tema

Todo se controla desde el fichero **`asignaturas.json`**:

1. Crea la carpeta `asignaturas/<id-asignatura>/` y añade dentro los ficheros JSON de cada tema.
2. Añade una entrada en `asignaturas.json` con el nombre visible y la lista de temas:

```json
{
  "mi-asignatura": {
    "nombre": "Mi Asignatura",
    "temas": [
      { "id": 1, "nombre": "Tema 1 - Introducción", "archivo": "asignaturas/mi-asignatura/test_tema_1.json" }
    ]
  }
}
```

La interfaz se genera automáticamente a partir de este catálogo: no hace falta tocar `index.html` ni `script.js`.

## Formato de las preguntas

Cada fichero de tema es un array de preguntas. Se admiten dos formatos:

**Verdadero / Falso**

```json
{ "pregunta": "Las emociones son reacciones adaptativas.", "respuesta": true }
```

**Opción múltiple**

```json
{
  "pregunta": "¿Qué es un Sprint en Scrum?",
  "opciones": ["...", "...", "...", "..."],
  "respuesta": 1
}
```

En las preguntas de opción múltiple, `respuesta` es el **índice (empezando en 0)** de la opción correcta. También se admiten la letra (`"b"`) o el texto exacto de la opción.

## Requisitos

Para ejecutar este programa necesitas:

- Un navegador web moderno (Google Chrome, Mozilla Firefox, etc.).
- Un servidor local para cargar los archivos JSON (por ejemplo la extensión "Live Server" de Visual Studio Code), ya que `fetch` no funciona abriendo el fichero directamente.

También puedes usar el enlace a GitHub Pages de este repositorio.

## Instalación y Uso

1. **Clona el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd IE
   ```

2. **Abre el proyecto en Visual Studio Code (o tu editor preferido).**

3. **Inicia un servidor local:** con la extensión "Live Server", haz clic en "Go Live".

4. **Accede a la aplicación:** abre en el navegador la URL proporcionada (por ejemplo, http://127.0.0.1:5500/index.html).

5. **Utiliza el programa:**

   - Selecciona el modo de práctica: **Examen** o **Estudio**.
   - Selecciona la asignatura.
   - Selecciona los temas que deseas incluir.
   - Indica el número de preguntas que deseas responder.
   - Pulsa "Generar cuestionario" para comenzar.
   - En **modo examen**, responde las preguntas y pulsa "Corregir respuestas" para ver tu puntuación.
   - En **modo estudio**, marca una respuesta para ver la corrección al instante y usa "Siguiente" y "Anterior" para navegar entre preguntas.
   - Usa "Cambiar configuración" para volver a la pantalla de configuración sin perder las opciones elegidas.

## Licencia
Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

## Autores
Desarrollado por Jaime Martín y Adrián Padrón para preparar exámenes en la Universidad de La Laguna.
