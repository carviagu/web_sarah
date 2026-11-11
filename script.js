// ============================================
//  CONFIGURACIÓN: edita aquí tus mensajes
// ============================================

// Mensajes que aparecen al cargar la página (secuencia de arranque)
const BOOT_MESSAGES = [
  { text: "[ OK ] Cargando módulos", cls: "" },
  { text: "[ OK ] Conectando con el servidor", cls: "" },
  { text: "[ OK ] Montando interfaz", cls: "" },
  { text: "", cls: "" },
  { text: "Bienvenido a SarahOS.", cls: "accent" },
  { text: "Se requiere identificación para continuar.", cls: "dim" },
  { text: "", cls: "" },
];

// Nombre de usuario que da acceso (no distingue mayúsculas/minúsculas)
const USERNAME = "Sarita";

// Mensajes que se muestran uno a uno tras iniciar sesión
// (también con el comando "mensajes")
const MESSAGES = [
  { text: "21 de junio... Primera Conversación", cls: "" },
  { text: "10 de julio... Primera Cita", cls: "special" },
  { text: "...", cls: "" },
  { text: "31 de julio... Bolos... y Primer Beso", cls: "special" },
  { text: "...", cls: "" },
  { text: "8 de septiembre... Retiro y Agosto superado", cls: "" },
  { text: "...", cls: "" },
  { text: "12 de octubre... Novios", cls: "special" },
  { text: "...", cls: "" },
  { text: "7 de noviembre... Reto Burgos", cls: "" },
  { text: "12 de noviembre...", cls: ""},
  { text: "¡LOGRO DESBLOQUEADO!", cls: "special"},
];

// Foto que se muestra al pulsar el botón final.
// Sube la imagen al repositorio junto a index.html y pon aquí su nombre.
const PHOTO_SRC = "burgos.jpg";
const PHOTO_BUTTON_TEXT = "[ Ver Logro ]";
const PHOTO_HIDE_TEXT = "[ Ocultar Logro ]";

// Tiempo entre un mensaje y el siguiente (ms)
const MESSAGE_DELAY = 2500;

// Velocidad de escritura (ms por línea en el arranque)
const LINE_DELAY = 350;

// Duración de la barra de carga inicial (ms)
const LOAD_DURATION = 3000;

// ============================================
//  COMANDOS
// ============================================

const COMMANDS = {
  help() {
    return [
      { text: "Comandos disponibles:", cls: "accent" },
      "  help        muestra esta ayuda",
      "  mensajes    muestra los mensajes",
      "  date        fecha"
    ];
  },
  mensajes() {
    return MESSAGES.slice();
  },
  date() {
    return ["12-10-2026"];
  },
  clear() {
    output.innerHTML = "";
    return [];
  }
};

// ============================================
//  LÓGICA DE LA TERMINAL
// ============================================

const output = document.getElementById("output");
const form = document.getElementById("form");
const input = document.getElementById("input");
const terminal = document.getElementById("terminal");

const history = [];
let historyIndex = 0;
let busy = true;
let mode = "login"; // "login" | "shell"
let promptText = USERNAME.toLowerCase() + "@sarahos:~$";
const promptLabel = document.querySelector(".prompt");

function print(line) {
  const item = typeof line === "string" ? { text: line, cls: "" } : line;
  const row = document.createElement("div");
  row.className = "row " + (item.cls || "");
  row.textContent = item.text;
  output.appendChild(row);
  terminal.scrollTop = terminal.scrollHeight;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const loader = document.getElementById("loader");
const barFill = document.getElementById("bar-fill");
const barPercent = document.getElementById("bar-percent");
const bar = loader.querySelector(".bar");

// Barra de carga con avance irregular para que parezca real
async function showLoader() {
  const start = performance.now();
  let progress = 0;
  while (progress < 100) {
    const elapsed = performance.now() - start;
    const target = Math.min(100, (elapsed / LOAD_DURATION) * 100);
    // pequeños saltos aleatorios
    progress = Math.min(100, Math.max(progress, target - Math.random() * 8));
    if (elapsed >= LOAD_DURATION) progress = 100;
    const value = Math.floor(progress);
    barFill.style.width = value + "%";
    barPercent.textContent = value + "%";
    bar.setAttribute("aria-valuenow", value);
    await sleep(80);
  }
  await sleep(400);
  loader.hidden = true;
  terminal.hidden = false;
}

// Botón que muestra u oculta la foto dentro de la terminal
function addPhotoButton() {
  const row = document.createElement("div");
  row.className = "row";
 
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "term-btn";
  btn.textContent = PHOTO_BUTTON_TEXT;
  row.appendChild(btn);
  output.appendChild(row);
 
  let img = null;
 
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
 
    if (img) {
      img.remove();
      img = null;
      btn.textContent = PHOTO_BUTTON_TEXT;
      return;
    }
 
    img = document.createElement("img");
    img.className = "photo";
    img.alt = "Foto";
    img.addEventListener("load", () => {
      terminal.scrollTop = terminal.scrollHeight;
    });
    img.addEventListener("error", () => {
      img.remove();
      img = null;
      btn.textContent = PHOTO_BUTTON_TEXT;
      print({ text: `No se encuentra la imagen '${PHOTO_SRC}'.`, cls: "error" });
    });
    img.src = PHOTO_SRC;
    row.appendChild(img);
    btn.textContent = PHOTO_HIDE_TEXT;
  });
 
  terminal.scrollTop = terminal.scrollHeight;
}

async function boot() {
  await showLoader();
  for (const line of BOOT_MESSAGES) {
    print(line);
    await sleep(LINE_DELAY);
  }
  promptLabel.textContent = "Usuario:";
  busy = false;
  input.focus();
}

async function login(value) {
  print({ text: "Usuario: " + value, cls: "accent" });

  if (value.trim().toLowerCase() !== USERNAME.toLowerCase()) {
    print({ text: "Usuario no reconocido. Inténtalo de nuevo.", cls: "error" });
    return;
  }

  busy = true;
  print({ text: "Acceso concedido. Bienvenida, " + USERNAME + ".", cls: "accent" });
  await sleep(MESSAGE_DELAY / 2);
  print("");

  for (const message of MESSAGES) {
    print(message);
    await sleep(MESSAGE_DELAY);
  }

  print("");
  addPhotoButton();
  
  print("");
  print({ text: "CONTINUARÁ...", cls: "dim" });

  mode = "shell";
  promptLabel.textContent = promptText;
  busy = false;
  input.focus();
}

function run(raw) {
  print({ text: promptText + " " + raw, cls: "accent" });
  const [cmd, ...args] = raw.trim().split(/\s+/);
  if (!cmd) return;

  const fn = COMMANDS[cmd.toLowerCase()];
  if (!fn) {
    print({ text: `comando no encontrado: ${cmd}. Escribe 'help'.`, cls: "error" });
    return;
  }
  fn(args).forEach(print);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (busy) return;
  const value = input.value;
  input.value = "";

  if (mode === "login") {
    await login(value);
    return;
  }

  if (value.trim()) {
    history.push(value);
  }
  historyIndex = history.length;
  run(value);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) historyIndex--;
    input.value = history[historyIndex] || "";
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < history.length) historyIndex++;
    input.value = history[historyIndex] || "";
  }
});

// Al hacer clic en cualquier parte de la terminal, se enfoca el input
terminal.addEventListener("click", () => input.focus());

boot();