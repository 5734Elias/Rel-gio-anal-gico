/* =========================================================
   SELETORES (pegamos elementos do HTML)
   ========================================================= */

// Referência ao <body> (para trocar tema e modo escuro)
const body = document.body;

// Ponteiros do relógio (classes do HTML)
const hourHand = document.querySelector(".hour");
const minuteHand = document.querySelector(".minute");
const secondHand = document.querySelector(".second");

// Botão/área que alterna Dark Mode (div com role="button")
const modeSwitch = document.querySelector(".mode-switch");

// Elementos do relógio digital (hora e data)
const digitalTimeEl = document.querySelector("#digital-time");
const digitalDateEl = document.querySelector("#digital-date");

// Botões de tema (Ocean/Sunset/Forest)
const themeButtons = document.querySelectorAll(".theme-btn");

/* =========================================================
   FUNÇÃO DE AJUDA (evita que o JS quebre)
   Se algum elemento não existir, a gente avisa no console,
   mas o relógio continua rodando (ao invés de parar tudo).
   ========================================================= */
const warnIfMissing = (el, name) => {
  if (!el) console.warn(`[Relógio] Elemento não encontrado: ${name}`);
};

/* Verificações (não quebram o código) */
warnIfMissing(hourHand, ".hour");
warnIfMissing(minuteHand, ".minute");
warnIfMissing(secondHand, ".second");
warnIfMissing(modeSwitch, ".mode-switch");
// Os digitais são opcionais, mas avisamos se não existir
warnIfMissing(digitalTimeEl, "#digital-time");
warnIfMissing(digitalDateEl, "#digital-date");

/* =========================================================
   TEMA (salvo no localStorage)
   ========================================================= */

/**
 * Aplica um tema (data-theme no body) e salva a escolha.
 * Também marca visualmente o botão ativo com a classe "is-active".
 */
const setTheme = (theme) => {
  // Define o atributo data-theme no body (usado no CSS: body[data-theme="..."])
  body.dataset.theme = theme;

  // Salva o tema escolhido no localStorage para manter após recarregar
  localStorage.setItem("theme", theme);

  // Atualiza os botões: só o tema escolhido fica com a classe "is-active"
  themeButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.theme === theme);
  });
};

// Ao abrir a página: aplica o tema salvo ou usa "ocean" como padrão
setTheme(localStorage.getItem("theme") || "ocean");

// Clique em cada botão aplica o tema correspondente
themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setTheme(btn.dataset.theme));
});

/* =========================================================
   DARK MODE (salvo no localStorage)
   ========================================================= */

/**
 * Sincroniza a UI do botão com o estado atual (dark ou light).
 * Isso evita ficar com texto trocado.
 */
const syncModeSwitchText = () => {
  if (!modeSwitch) return; // se não existir, não faz nada

  const isDark = body.classList.contains("dark");
  modeSwitch.textContent = isDark ? "Light Mode" : "Dark Mode";
};

// Se a última escolha salva foi Dark Mode, ativa o modo escuro
if (localStorage.getItem("mode") === "Dark Mode") {
  body.classList.add("dark");
}
syncModeSwitchText();

/**
 * Alterna entre modo escuro e claro.
 * - body.classList.toggle("dark") liga/desliga o modo escuro
 * - ajusta texto do botão
 * - salva a escolha no localStorage
 */
const toggleDarkMode = () => {
  // Se o botão não existe, não tenta alternar (evita crash)
  if (!modeSwitch) return;

  const isDarkMode = body.classList.toggle("dark");

  // Atualiza texto do botão
  modeSwitch.textContent = isDarkMode ? "Light Mode" : "Dark Mode";

  // Salva a escolha
  localStorage.setItem("mode", isDarkMode ? "Dark Mode" : "Light Mode");
};

// Só adiciona eventos se o elemento existir
if (modeSwitch) {
  // Clique alterna dark mode
  modeSwitch.addEventListener("click", toggleDarkMode);

  // Suporte a teclado: Enter ou Espaço também alterna
  modeSwitch.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDarkMode();
    }
  });
}

/* =========================================================
   PONTEIROS ANALÓGICOS + RELÓGIO DIGITAL
   ========================================================= */

/**
 * Atualiza:
 * - Rotação dos ponteiros (hora/minuto/segundo)
 * - Texto do relógio digital (hora)
 * - Texto do relógio digital (data)
 */
const updateTime = () => {
  const date = new Date();

  // Pega segundos, minutos e horas (0-23)
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12; // converte para 0-11 (formato 12h)

  // Converte tempo em graus
  // - Segundos: 60 segundos = 360 graus
  const secToDeg = (seconds / 60) * 360;

  // - Minutos: inclui a fração dos segundos (movimento suave)
  const minToDeg = ((minutes + seconds / 60) / 60) * 360;

  // - Horas: inclui a fração dos minutos (movimento suave)
  const hrToDeg = ((hours + minutes / 60) / 12) * 360;

  // Aplica rotação nos ponteiros via CSS transform
  // (Só aplica se o elemento existir — evita quebrar)
  if (secondHand) secondHand.style.transform = `rotate(${secToDeg}deg)`;
  if (minuteHand) minuteHand.style.transform = `rotate(${minToDeg}deg)`;
  if (hourHand) hourHand.style.transform = `rotate(${hrToDeg}deg)`;

  // Atualiza o relógio digital (hora)
  if (digitalTimeEl) {
    digitalTimeEl.textContent = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  }

  // Atualiza o relógio digital (data)
  if (digitalDateEl) {
    digitalDateEl.textContent = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  }
};

/* =========================================================
   INÍCIO
   ========================================================= */

// Atualiza imediatamente ao carregar (não espera 1 segundo)
updateTime();

// Atualiza a cada 1 segundo
setInterval(updateTime, 1000);
