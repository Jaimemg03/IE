# Test de Inteligencia Emocional

Este proyecto es una herramienta interactiva diseñada para el **estudio de la inteligencia emocional**, desarrollada como parte de la asignatura de **Inteligencia Emocional** del grado de Ingeniería Informática en la **Universidad de La Laguna**. El programa permite a los estudiantes practicar y evaluar sus conocimientos sobre diversos temas relacionados con la inteligencia emocional mediante un cuestionario dinámico y personalizable.

## Características

- **Selección de Temas:** Los usuarios pueden elegir entre diferentes temas relacionados con la inteligencia emocional.
- **Generación de Preguntas:** El programa genera un número configurable de preguntas aleatorias basadas en los temas seleccionados.
- **Corrección Automática:** Una vez completado el cuestionario, el programa corrige las respuestas y muestra el resultado.
- **Interfaz Intuitiva:** Diseño visual atractivo y fácil de usar, con botones interactivos y retroalimentación visual para las respuestas correctas e incorrectas.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:
```
/src 
  ├── index.html # Estructura principal de la aplicación 
  ├── script.js # Lógica del programa 
  ├── styles.css # Estilos para la interfaz 
/tests 
  ├── test_tema_1.json # Preguntas del tema 1 
  ├── test_tema_2.json # Preguntas del tema 2 
  ├── ... # Otros archivos de preguntas
```

## Requisitos

Para ejecutar este programa, necesitas:

- Un navegador web moderno (Google Chrome, Mozilla Firefox, etc.).
- Un servidor local para cargar los archivos JSON (puedes usar extensiones como "Live Server" en Visual Studio Code).

o bien utilizar el enlace a github Pages de este mismo repositorio [Click here](jaimemg03.github.io/IE/)

## Instalación y Uso

1. **Clona el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd IE
   ```

2. **Abre el proyecto en Visual Studio Code (o tu editor preferido).**

3. **Inicia un servidor local:** Si usas Visual Studio Code, instala la extensión "Live Server" y haz clic en "Go Live" para iniciar el servidor.

4. **Accede a la aplicación:** Abre el navegador y accede a la URL proporcionada por el servidor (por ejemplo, http://127.0.0.1:5500/src/index.html).

5. **Utiliza el programa:**

Selecciona los temas que deseas incluir en el cuestionario.
Indica el número de preguntas que deseas responder.
Haz clic en "Generar preguntas" para comenzar.
Responde las preguntas y haz clic en "Corregir respuestas" para ver tu puntuación.

## Licencia
Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

## Autores
Desarrollado por Jaime Martín y Adrián Padrón para preparar el exámen de la asignatura de Inteligencia Emocional en la Universidad de La Laguna.
