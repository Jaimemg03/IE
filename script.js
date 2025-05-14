let todasLasPreguntas = [];
let preguntasSeleccionadas = [];
let numeroArchivoJson = 0;

const contenedorBotones = document.createElement("div");
contenedorBotones.id = "contenedorBotones";
contenedorBotones.style.marginBottom = "20px";
document.body.insertBefore(contenedorBotones, document.getElementById("formulario"));

for (let i = 1; i <= 7; i++) {
  const boton = document.createElement("button");
  boton.textContent = `Tema ${i}`;
  boton.className = "boton";
  boton.style.marginRight = "10px";
  boton.onclick = () => seleccionarTema(boton, i);
  contenedorBotones.appendChild(boton);
}

let archivosSeleccionados = new Set();

function seleccionarTema(boton, numero) {
  if (!archivosSeleccionados.has(numero)) {
    archivosSeleccionados.add(numero);
    boton.style.backgroundColor = "#d4edda"; // Cambia el color del botón para indicar selección
  } else {
    archivosSeleccionados.delete(numero);
    boton.style.backgroundColor = ""; // Restaura el color original del botón
  }
}

async function cargarPreguntas() {
  if (archivosSeleccionados.size === 0) {
    throw new Error("No se ha seleccionado ningún archivo JSON.");
  }

  // Reinicia el array de preguntas antes de cargar nuevas
  todasLasPreguntas = [];

  const numerosArchivos = Array.from(archivosSeleccionados);
  const promesas = numerosArchivos.map(numero =>
    fetch(`./test_tema_${numero}.json`) // Modifica la ruta según sea necesario
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al cargar el archivo JSON: ${response.statusText}`);
        }
        return response.json();
      })
  );

  try {
    const dataArrays = await Promise.all(promesas);
    todasLasPreguntas = dataArrays.flat(); // Combina todas las preguntas en un solo array
  } catch (error) {
    alert("No se pudieron cargar uno o más archivos JSON. Verifica que los archivos existen y son válidos.");
    console.error(error);
    throw error; // Lanza el error para que `generarPreguntas` lo maneje
  }
}

async function generarPreguntas() {
  if (archivosSeleccionados.size === 0) {
    alert("Por favor, selecciona al menos un tema antes de generar preguntas.");
    return;
  }

  try {
    await cargarPreguntas(); // Espera a que las preguntas se carguen

    const cantidad = parseInt(document.getElementById("cantidad").value);
    preguntasSeleccionadas = todasLasPreguntas.sort(() => 0.5 - Math.random()).slice(0, cantidad);
    const formulario = document.getElementById("formulario");
    formulario.innerHTML = "";
    preguntasSeleccionadas.forEach((p, index) => {
      formulario.innerHTML += `
        <div class="pregunta" id="pregunta${index}">
          <p><strong>${index + 1}. </strong>${p.pregunta}</p>
          <label><input type="radio" name="p${index}" value="true"> Verdadero</label><br>
          <label><input type="radio" name="p${index}" value="false"> Falso</label>
        </div>
      `;
    });
    document.getElementById("resultado").textContent = "";
  } catch (error) {
    alert("Ocurrió un error al generar las preguntas. Por favor, inténtalo de nuevo.");
    console.error(error);
  }
}

function corregir() {
  let correctas = 0;
  preguntasSeleccionadas.forEach((p, index) => {
    const respuesta = document.querySelector(`input[name="p${index}"]:checked`);
    const divPregunta = document.getElementById(`pregunta${index}`);
    if (respuesta) {
      if (respuesta.value === p.respuesta.toString()) {
        correctas++;
        divPregunta.classList.add("correcta");
        divPregunta.classList.remove("incorrecta");
      } else {
        divPregunta.classList.add("incorrecta");
        divPregunta.classList.remove("correcta");
      }
    } else {
      divPregunta.classList.add("incorrecta");
    }
  });

  const resultado = document.getElementById("resultado");
  resultado.textContent = `Has acertado ${correctas} de ${preguntasSeleccionadas.length} preguntas.`;
  resultado.style.display = "block";
  resultado.style.color = correctas >= preguntasSeleccionadas.length/2 ? "green" : "red";
  resultado.style.fontWeight = "bold";
  resultado.style.fontSize = "20px";
  resultado.style.marginTop = "20px";
  resultado.style.textAlign = "center";
  resultado.style.padding = "10px";
  resultado.style.border = "2px solid " + (correctas >= preguntasSeleccionadas.length/2 ? "green" : "red");
  resultado.style.borderRadius = "5px";
  resultado.style.backgroundColor = correctas >= preguntasSeleccionadas.length/2 ? "#d4edda" : "#f8d7da";
  resultado.style.width = "50%";
  resultado.style.margin = "0 auto";
  resultado.style.boxSizing = "border-box";
  resultado.style.transition = "all 0.3s ease";
  resultado.style.opacity = "1";
}