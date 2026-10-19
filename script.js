let asignaturas = {};
let asignaturaActual = null;
let temasSeleccionados = new Set();
let todasLasPreguntas = [];
let preguntasSeleccionadas = [];

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

  seleccionarAsignatura(selector.value);
}

function seleccionarAsignatura(id) {
  asignaturaActual = { id, ...asignaturas[id] };
  temasSeleccionados = new Set();

  const titulo = `Test de ${asignaturaActual.nombre}`;
  document.getElementById("titulo").textContent = titulo;
  document.title = titulo;

  renderizarBotonesTemas();
  document.getElementById("formulario").innerHTML = "";
  document.getElementById("resultado").textContent = "";
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
}

function alternarTema(boton, id) {
  if (temasSeleccionados.has(id)) {
    temasSeleccionados.delete(id);
    boton.classList.remove("seleccionado");
  } else {
    temasSeleccionados.add(id);
    boton.classList.add("seleccionado");
  }
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

  try {
    await cargarPreguntas();
  } catch (error) {
    alert("No se pudieron cargar uno o más archivos de preguntas. Verifica que los archivos existen y son válidos.");
    console.error(error);
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

  const formulario = document.getElementById("formulario");
  formulario.innerHTML = "";
  preguntasSeleccionadas.forEach((pregunta, index) => {
    formulario.innerHTML += crearHTMLPregunta(pregunta, index);
  });

  document.getElementById("resultado").textContent = "";
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
  resultado.style.display = "block";
  resultado.style.color = aprobado ? "green" : "red";
  resultado.style.fontWeight = "bold";
  resultado.style.fontSize = "20px";
  resultado.style.marginTop = "20px";
  resultado.style.textAlign = "center";
  resultado.style.padding = "10px";
  resultado.style.border = "2px solid " + (aprobado ? "green" : "red");
  resultado.style.borderRadius = "5px";
  resultado.style.backgroundColor = aprobado ? "#d4edda" : "#f8d7da";
  resultado.style.width = "50%";
  resultado.style.margin = "0 auto";
  resultado.style.boxSizing = "border-box";
  resultado.style.transition = "all 0.3s ease";
  resultado.style.opacity = "1";
}
