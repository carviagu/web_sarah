// ============================================
//  CONFIGURACIÓN: edita aquí tus mensajes
// ============================================

// Mensajes que aparecen al cargar la página (secuencia de arranque)
const BOOT_MESSAGES = [
  { text: "Iniciando sistema...", cls: "dim" },
  { text: "[ OK ] Cargando módulos", cls: "" },
  { text: "[ OK ] Conectando con el servidor", cls: "" },
  { text: "[ OK ] Montando interfaz", cls: "" },
  { text: "", cls: "" },
  { text: "Bienvenido a mi terminal.", cls: "accent" },
  { text: "Escribe 'help' para ver los comandos disponibles.", cls: "dim" },
  { text: "", cls: "" },
];

// Mensajes que se muestran con el comando "mensajes"
const MESSAGES = [
  "Hola, mundo.",
  "Esta web está alojada en GitHub Pages.",
  "Personaliza estos mensajes en script.js.",
];

// Velocidad de escritura (ms por línea en el arranque)
const LINE_DELAY = 350;

// ============================================
//  COMANDOS
// ============================================

const COMMANDS = {
  help() {
    return [
      { text: "Comandos disponibles:", cls: "accent" },
      "  help        muestra esta ayuda",
      "  mensajes    muestra los mensajes",
      "  about       información sobre esta web",
      "  date        fecha y hora actuales",
      "  echo <txt>  repite el texto",
      "  clear       limpia la pantalla",
    ];
  },
  mensajes() {
    return MESSAGES.map((m, i) => `[${i + 1}] ${m}`);
  },
  about() {
    return ["Terminal web hecha con HTML, CSS y JavaScript.", "Sin dependencias. Lista para GitHub Pages."];
  },
  date() {
    return [new Date().toLocaleString("es-ES")];
  },
  echo(args) {
    return [args.join(" ")];
  },
  clear() {
    output.innerHTML = "";
    return [];
  },
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

function print(line) {
  const item = typeof line === "string" ? { text: line, cls: "" } : line;
  const row = document.createElement("div");
  row.className = "row " + (item.cls || "");
  row.textContent = item.text;
  output.appendChild(row);
  terminal.scrollTop = terminal.scrollHeight;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot() {
  for (const line of BOOT_MESSAGES) {
    print(line);
    await sleep(LINE_DELAY);
  }
  busy = false;
  input.focus();
}

function run(raw) {
  print({ text: "visitante@web:~$ " + raw, cls: "accent" });
  const [cmd, ...args] = raw.trim().split(/\s+/);
  if (!cmd) return;

  const fn = COMMANDS[cmd.toLowerCase()];
  if (!fn) {
    print({ text: `comando no encontrado: ${cmd}. Escribe 'help'.`, cls: "error" });
    return;
  }
  fn(args).forEach(print);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (busy) return;
  const value = input.value;
  if (value.trim()) {
    history.push(value);
  }
  historyIndex = history.length;
  input.value = "";
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