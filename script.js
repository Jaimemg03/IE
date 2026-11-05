let asignaturas = {};
let asignaturaActual = null;
let temasSeleccionados = new Set();
let todasLasPreguntas = [];
let preguntasSeleccionadas = [];
let modoActual = "examen";
let indiceEstudio = 0;
let respuestasEstudio = [];

const LETRAS = ["a", "b", "c", "d", "e", "f", "g", "h"];

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
  try {
    const respuesta = await fetch("./asignaturas.json");
    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar asignaturas.json: ${respuesta.statusText}`);
    }
    asignaturas = await respuesta.json();
  } catch (error) {
    alert("No se pudo cargar el catálogo de asignaturas (asignaturas.json).");
    console.error(error);
    return;
  }

  const selector = document.getElementById("asignatura");
  Object.entries(asignaturas).forEach(([id, asignatura]) => {
    const opcion = document.createElement("option");
    opcion.value = id;
    opcion.textContent = asignatura.nombre;
    selector.appendChild(opcion);
  });

  selector.addEventListener("change", () => seleccionarAsignatura(selector.value));
  document.getElementById("botonTodos").addEventListener("click", seleccionarTodosLosTemas);
  document.getElementById("botonGenerar").addEventListener("click", generarPreguntas);
  document.getElementById("botonCorregir").addEventListener("click", corregir);
  document.getElementById("botonAnterior").addEventListener("click", () => moverEstudio(-1));
  document.getElementById("botonSiguiente").addEventListener("click", () => moverEstudio(1));
  document.getElementById("botonVolver").addEventListener("click", mostrarConfiguracion);
  document.getElementById("botonVolverCuestionario").addEventListener("click", mostrarCuestionario);
  document.getElementById("formulario").addEventListener("change", manejarCambioEstudio);

  document.querySelectorAll('input[name="modo"]').forEach(radio => {
    radio.addEventListener("change", () => cambiarModo(radio.value));
  });

  seleccionarAsignatura(selector.value);
}

function seleccionarAsignatura(id) {
  asignaturaActual = { id, ...asignaturas[id] };
  temasSeleccionados = new Set();

  const titulo = `Test de ${asignaturaActual.nombre}`;
  document.getElementById("titulo").textContent = titulo;
  document.title = titulo;

  renderizarBotonesTemas();
  reiniciarCuestionario();
  mostrarConfiguracion();
}

function reiniciarCuestionario() {
  preguntasSeleccionadas = [];
  respuestasEstudio = [];
  indiceEstudio = 0;

  document.getElementById("formulario").innerHTML = "";
  document.getElementById("resumenCuestionario").textContent = "";
  document.getElementById("vistaCuestionario").hidden = true;
  document.getElementById("botonVolverCuestionario").hidden = true;

  limpiarResultado();
  actualizarNavegacionEstudio();
  actualizarControlesModo();
}

function limpiarResultado() {
  const resultado = document.getElementById("resultado");
  resultado.textContent = "";
  resultado.classList.remove("aprobado", "suspendido");
}

function mostrarConfiguracion() {
  document.getElementById("vistaConfiguracion").hidden = false;
  document.getElementById("vistaCuestionario").hidden = true;
  document.getElementById("botonVolverCuestionario").hidden = preguntasSeleccionadas.length === 0;
  desplazarArriba();
}

function mostrarCuestionario() {
  if (preguntasSeleccionadas.length === 0) {
    return;
  }

  document.getElementById("vistaConfiguracion").hidden = true;
  document.getElementById("vistaCuestionario").hidden = false;
  desplazarArriba();
}

function desplazarArriba() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderizarBotonesTemas() {
  const contenedor = document.getElementById("contenedorBotones");
  contenedor.innerHTML = "";

  asignaturaActual.temas.forEach(tema => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton tema";
    boton.textContent = tema.nombre;
    boton.dataset.id = tema.id;
    boton.addEventListener("click", () => alternarTema(boton, tema.id));
    contenedor.appendChild(boton);
  });

  actualizarBotonTodos();
}

function actualizarBotonTodos() {
  const boton = document.getElementById("botonTodos");
  const todosSeleccionados =
    asignaturaActual.temas.length > 0 &&
    asignaturaActual.temas.every(tema => temasSeleccionados.has(tema.id));

  boton.textContent = todosSeleccionados ? "Quitar todos" : "Seleccionar todos";
}

function alternarTema(boton, id) {
  if (temasSeleccionados.has(id)) {
    temasSeleccionados.delete(id);
    boton.classList.remove("seleccionado");
  } else {
    temasSeleccionados.add(id);
    boton.classList.add("seleccionado");
  }

  actualizarBotonTodos();
}

function seleccionarTodosLosTemas() {
  const botones = document.querySelectorAll("#contenedorBotones .tema");
  const todosSeleccionados =
    asignaturaActual.temas.length > 0 &&
    asignaturaActual.temas.every(tema => temasSeleccionados.has(tema.id));

  if (todosSeleccionados) {
    temasSeleccionados.clear();
    botones.forEach(boton => boton.classList.remove("seleccionado"));
  } else {
    asignaturaActual.temas.forEach(tema => temasSeleccionados.add(tema.id));
    botones.forEach(boton => boton.classList.add("seleccionado"));
  }

  actualizarBotonTodos();
}

async function cargarPreguntas() {
  const temasElegidos = asignaturaActual.temas.filter(tema => temasSeleccionados.has(tema.id));

  if (temasElegidos.length === 0) {
    throw new Error("No se ha seleccionado ningún tema.");
  }

  todasLasPreguntas = [];

  const promesas = temasElegidos.map(tema =>
    fetch(`./${tema.archivo}`).then(response => {
      if (!response.ok) {
        throw new Error(`Error al cargar el archivo de preguntas: ${tema.archivo}`);
      }
      return response.json();
    })
  );

  const dataArrays = await Promise.all(promesas);
  todasLasPreguntas = dataArrays.flat();
}

async function generarPreguntas() {
  if (temasSeleccionados.size === 0) {
    alert("Por favor, selecciona al menos un tema antes de generar preguntas.");
    return;
  }

  const botonGenerar = document.getElementById("botonGenerar");
  botonGenerar.disabled = true;
  botonGenerar.textContent = "Generando...";

  try {
    await cargarPreguntas();
  } catch (error) {
    alert("No se pudieron cargar uno o más archivos de preguntas. Verifica que los archivos existen y son válidos.");
    console.error(error);
    return;
  } finally {
    botonGenerar.disabled = false;
    botonGenerar.textContent = "Generar cuestionario";
  }

  if (todasLasPreguntas.length === 0) {
    alert("No hay preguntas disponibles en los temas seleccionados.");
    return;
  }

  const inputCantidad = document.getElementById("cantidad");
  inputCantidad.max = todasLasPreguntas.length;

  let cantidad = parseInt(inputCantidad.value, 10);
  if (isNaN(cantidad) || cantidad < 1) {
    cantidad = todasLasPreguntas.length;
  }
  cantidad = Math.min(cantidad, todasLasPreguntas.length);

  preguntasSeleccionadas = mezclar([...todasLasPreguntas]).slice(0, cantidad);

  limpiarResultado();
  renderizarPreguntas();
  actualizarCabeceraCuestionario();
  mostrarCuestionario();
}

function actualizarCabeceraCuestionario() {
  const modo = modoActual === "estudio" ? "Estudio" : "Examen";
  document.getElementById("tituloCuestionario").textContent =
    `Cuestionario de ${asignaturaActual.nombre}`;
  document.getElementById("resumenCuestionario").textContent =
    `${preguntasSeleccionadas.length} preguntas · Modo ${modo}`;
}

function renderizarPreguntas() {
  const formulario = document.getElementById("formulario");
  formulario.innerHTML = "";

  if (modoActual === "estudio") {
    indiceEstudio = 0;
    respuestasEstudio = preguntasSeleccionadas.map(() => null);
    renderizarPreguntaEstudio();
  } else {
    preguntasSeleccionadas.forEach((pregunta, index) => {
      formulario.innerHTML += crearHTMLPregunta(pregunta, index);
    });
  }

  actualizarControlesModo();
}

function renderizarPreguntaEstudio() {
  const formulario = document.getElementById("formulario");
  const pregunta = preguntasSeleccionadas[indiceEstudio];

  formulario.innerHTML = crearHTMLPregunta(pregunta, indiceEstudio);

  const respuestaGuardada = respuestasEstudio[indiceEstudio];
  if (respuestaGuardada !== null) {
    const input = formulario.querySelector(
      `input[name="p${indiceEstudio}"][value="${respuestaGuardada}"]`
    );
    if (input) {
      input.checked = true;
    }
    aplicarFeedbackEstudio(indiceEstudio);
  }

  actualizarNavegacionEstudio();
}

function moverEstudio(direccion) {
  if (modoActual !== "estudio") {
    return;
  }

  const nuevoIndice = indiceEstudio + direccion;
  if (nuevoIndice < 0 || nuevoIndice >= preguntasSeleccionadas.length) {
    return;
  }

  indiceEstudio = nuevoIndice;
  renderizarPreguntaEstudio();
}

function manejarCambioEstudio(evento) {
  if (modoActual !== "estudio") {
    return;
  }

  const input = evento.target;
  if (!input.matches('input[type="radio"]')) {
    return;
  }

  // Una vez respondida, la pregunta queda fijada para poder ver la corrección.
  if (respuestasEstudio[indiceEstudio] !== null) {
    const anterior = document.querySelector(
      `input[name="p${indiceEstudio}"][value="${respuestasEstudio[indiceEstudio]}"]`
    );
    if (anterior) {
      anterior.checked = true;
    }
    return;
  }

  respuestasEstudio[indiceEstudio] = input.value;
  aplicarFeedbackEstudio(indiceEstudio);
}

function aplicarFeedbackEstudio(index) {
  const pregunta = preguntasSeleccionadas[index];
  const divPregunta = document.getElementById(`pregunta${index}`);
  const respuestaElegida = respuestasEstudio[index];

  if (!pregunta || !divPregunta || respuestaElegida === null) {
    return;
  }

  const esOpcionMultiple = Array.isArray(pregunta.opciones);
  const indiceCorrecto = obtenerIndiceCorrecto(pregunta);

  let acierto = false;
  if (esOpcionMultiple) {
    acierto = parseInt(respuestaElegida, 10) === indiceCorrecto;
  } else {
    acierto = respuestaElegida === String(pregunta.respuesta);
  }

  divPregunta.classList.toggle("correcta", acierto);
  divPregunta.classList.toggle("incorrecta", !acierto);

  const opciones = divPregunta.querySelectorAll("label.opcion");
  let etiquetaCorrecta = null;

  if (esOpcionMultiple && indiceCorrecto >= 0) {
    etiquetaCorrecta = opciones[indiceCorrecto];
  } else {
    const inputCorrecto = divPregunta.querySelector(
      `input[value="${String(pregunta.respuesta)}"]`
    );
    etiquetaCorrecta = inputCorrecto ? inputCorrecto.closest("label.opcion") : null;
  }

  if (etiquetaCorrecta) {
    etiquetaCorrecta.classList.add("opcion-correcta");
  }

  if (!acierto) {
    const inputElegido = divPregunta.querySelector(`input[value="${respuestaElegida}"]`);
    const etiquetaElegida = inputElegido ? inputElegido.closest("label.opcion") : null;
    if (etiquetaElegida) {
      etiquetaElegida.classList.add("opcion-incorrecta");
    }
  }

  let feedback = divPregunta.querySelector(".feedback-estudio");
  if (!feedback) {
    feedback = document.createElement("p");
    feedback.className = "feedback-estudio";
    divPregunta.appendChild(feedback);
  }

  feedback.classList.toggle("acierto", acierto);
  feedback.classList.toggle("fallo", !acierto);
  feedback.textContent = acierto
    ? "¡Correcto!"
    : `Incorrecto. La respuesta correcta es: ${obtenerTextoRespuestaCorrecta(pregunta)}.`;
}

function obtenerTextoRespuestaCorrecta(pregunta) {
  if (Array.isArray(pregunta.opciones)) {
    const indice = obtenerIndiceCorrecto(pregunta);
    if (indice >= 0 && pregunta.opciones[indice] !== undefined) {
      return `${LETRAS[indice]}. ${pregunta.opciones[indice]}`;
    }
    return "No disponible";
  }

  return String(pregunta.respuesta) === "true" ? "Verdadero" : "Falso";
}

function actualizarNavegacionEstudio() {
  const progreso = document.getElementById("progresoEstudio");
  const total = preguntasSeleccionadas.length;

  progreso.textContent = total > 0
    ? `Pregunta ${indiceEstudio + 1} de ${total}`
    : "";

  document.getElementById("botonAnterior").disabled = indiceEstudio <= 0;
  document.getElementById("botonSiguiente").disabled = indiceEstudio >= total - 1;
}

function actualizarControlesModo() {
  const enEstudio = modoActual === "estudio";
  document.getElementById("navegacionEstudio").hidden = !enEstudio;
  document.getElementById("botonCorregir").hidden = enEstudio;

  if (enEstudio) {
    actualizarNavegacionEstudio();
  }
}

function cambiarModo(modo) {
  if (modo === modoActual) {
    return;
  }

  modoActual = modo;
  limpiarResultado();

  if (preguntasSeleccionadas.length > 0) {
    renderizarPreguntas();
    actualizarCabeceraCuestionario();
  } else {
    document.getElementById("formulario").innerHTML = "";
    actualizarControlesModo();
  }
}

function crearHTMLPregunta(pregunta, index) {
  let html = `<div class="pregunta" id="pregunta${index}">`;
  html += `<p><strong>${index + 1}. </strong>${pregunta.pregunta}</p>`;

  if (Array.isArray(pregunta.opciones)) {
    pregunta.opciones.forEach((opcion, i) => {
      html += `<label class="opcion"><input type="radio" name="p${index}" value="${i}"> ${LETRAS[i]}. ${opcion}</label>`;
    });
  } else {
    html += `<label class="opcion"><input type="radio" name="p${index}" value="true"> Verdadero</label>`;
    html += `<label class="opcion"><input type="radio" name="p${index}" value="false"> Falso</label>`;
  }

  html += "</div>";
  return html;
}

function mezclar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Devuelve el índice correcto para preguntas de opción múltiple.
// Admite la respuesta como número (índice 0-based), como letra ("a", "b", ...)
// o como el texto exacto de una de las opciones.
function obtenerIndiceCorrecto(pregunta) {
  if (!Array.isArray(pregunta.opciones)) {
    return null;
  }

  const respuesta = pregunta.respuesta;

  if (typeof respuesta === "number") {
    return respuesta;
  }

  if (typeof respuesta === "string") {
    const indiceLetra = LETRAS.indexOf(respuesta.trim().toLowerCase());
    if (indiceLetra !== -1) {
      return indiceLetra;
    }
    const indiceTexto = pregunta.opciones.indexOf(respuesta);
    if (indiceTexto !== -1) {
      return indiceTexto;
    }
  }

  return -1;
}

function corregir() {
  if (modoActual !== "examen") {
    return;
  }

  if (preguntasSeleccionadas.length === 0) {
    alert("Primero debes generar las preguntas antes de corregir.");
    return;
  }

  let correctas = 0;

  preguntasSeleccionadas.forEach((pregunta, index) => {
    const seleccionada = document.querySelector(`input[name="p${index}"]:checked`);
    const divPregunta = document.getElementById(`pregunta${index}`);
    const esOpcionMultiple = Array.isArray(pregunta.opciones);
    const indiceCorrecto = obtenerIndiceCorrecto(pregunta);

    let acierto = false;
    if (seleccionada) {
      if (esOpcionMultiple) {
        acierto = parseInt(seleccionada.value, 10) === indiceCorrecto;
      } else {
        acierto = seleccionada.value === String(pregunta.respuesta);
      }
    }

    if (acierto) {
      correctas++;
      divPregunta.classList.add("correcta");
      divPregunta.classList.remove("incorrecta");
    } else {
      divPregunta.classList.add("incorrecta");
      divPregunta.classList.remove("correcta");
    }

    // Resalta la opción correcta para poder repasar el fallo.
    if (esOpcionMultiple && indiceCorrecto >= 0) {
      const opciones = divPregunta.querySelectorAll("label.opcion");
      if (opciones[indiceCorrecto]) {
        opciones[indiceCorrecto].classList.add("opcion-correcta");
      }
    }
  });

  const resultado = document.getElementById("resultado");
  const aprobado = correctas >= preguntasSeleccionadas.length / 2;

  resultado.textContent = `Has acertado ${correctas} de ${preguntasSeleccionadas.length} preguntas.`;
  resultado.classList.remove("aprobado", "suspendido");
  resultado.classList.add(aprobado ? "aprobado" : "suspendido");
}
