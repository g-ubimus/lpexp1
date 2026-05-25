let liteplayEngine = null;

const startLP = async (event, editorId) => {
  if (event) event.preventDefault();
  if (!liteplayEngine) {
    try {
      console.log("Loading liteTocar engine...");
      const { liteTocar } =
        await import("https://g-ubimus.github.io/liteTocar.js/src/core/liteTocar.constants.js");
      liteplayEngine = await lpLoad();
      Object.assign(window, liteplayEngine);
      console.log("liteTocar is ready!");
    } catch (error) {
      console.error("Failed to load liteTocar:", error);
      return;
    }
  }
  try {
    const codeEditorLP = document.getElementById(editorId);
    const userLP = codeEditorLP.value;
    eval(userLP);
  } catch (error) {
    console.error("Failed to execute liteTocar code:", error);
  }
};

const stopLP = async (event) => {
  if (event) event.preventDefault();
  if (liteplayEngine) {
    try {
      console.log("Pararping audio...");
      await reset();
      console.log("Audio stopped.");
    } catch (error) {
      console.log("Failed to stop liteTocar:", error);
      return;
    }
  }
};

let csound = null;

(function () {
  const resize = (el) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  document.addEventListener("input", (e) => {
    if (e.target.matches(".textarea-code")) resize(e.target);
  });
  const observer = new MutationObserver(() => {
    document.querySelectorAll(".textarea-code").forEach(resize);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

// Csd headers
const baseCsd = `
<CsoundSynthesizer>
<CsOptions>
-odac -m128
</CsOptions>
<CsInstruments>
sr = 48000
ksmps = 32
nchnls = 2
0dbfs = 1
seed(0)
</CsInstruments>
<CsScore>
</CsScore>
</CsoundSynthesizer>
`;

// start button
const startCsound = async (event, editorId) => {
  if (event) event.preventDefault();
  try {
    if (!csound) {
      console.log("Starting Csound...");
      const { Csound } =
        await import("https://cdn.jsdelivr.net/npm/@csound/browser@6.18.7/dist/csound.js");
      csound = await Csound();
    }

    await csound.reset();
    // compile headers
    await csound.compileCsdText(baseCsd);

    // compile text
    const codeEditor = document.getElementById(editorId);
    const userOrc = codeEditor.value;
    await csound.compileOrc(userOrc);
    await csound.start();
  } catch (error) {
    console.error("Failed to execute Csound code:", error);
  }
};

// stop button
const stopCsound = async (event) => {
  if (event) event.preventDefault();
  if (csound) {
    console.log("Pararping audio...");
    // not using stop to prevent having to load csound again
    await csound.reset();
  }
};

// =========================================================================
// Intro screen: consent
// =========================================================================
const introScreen = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: left; max-width: 800px; margin: 0 auto; padding: 10px;">' +
    '<h3 style="text-align: center; margin-bottom: 30px;">Formulário de Consentimento</h3>' +
    '<div class="task-wrapper" style="margin-bottom: 25px;">' +
    '<form id="form-consent">' +
    '<p style="margin-bottom: 20px;"><b>Por favor, verifique cada declaração abaixo para indicar sua concordância:</b></p>' +
    // Checkbox 1
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-1" name="consent_explained" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-1" style="margin-left: 10px; cursor: pointer;">O propósito e a natureza do estudo foram explicados verbalmente e por escrito. Eu pude fazer perguntas, que foram respondidas satisfatoriamente.</label>' +
    "</div>" +
    // Checkbox 2
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-2" name="consent_voluntary" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-2" style="margin-left: 10px; cursor: pointer;">Estou participando voluntariamente.</label>' +
    "</div>" +
    // Checkbox 3
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-3" name="consent_withdraw" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-3" style="margin-left: 10px; cursor: pointer;">Eu entendo que posso me retirar do estudo, sem repercussões, a qualquer momento, seja antes de começar ou enquanto eu estiver participando.</label>' +
    "</div>" +
    // Checkbox 4
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-4" name="consent_data_withdraw" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-4" style="margin-left: 10px; cursor: pointer;">Eu entendo que posso retirar a permissão para usar os dados até a análise de dados em 1 de julho de 2026.</label>' +
    "</div>" +
    // Checkbox 5
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-5" name="consent_data_management" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-5" style="margin-left: 10px; cursor: pointer;">Foi-me explicado como os meus dados serão geridos e que posso acessá-los mediante pedido.</label>' +
    "</div>" +
    // Checkbox 6
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-6" name="consent_confidentiality" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-6" style="margin-left: 10px; cursor: pointer;">Compreendo os limites de confidencialidade conforme descrito na ficha de informações.</label>' +
    "</div>" +
    // Checkbox 7
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-7" name="consent_agreement" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-7" style="margin-left: 10px; cursor: pointer;">Confirmo que li a <a href="./information_pt.html" target=_blank>ficha de informações</a> e concordo em participar no estudo do Prof. Victor Lazzarini.</label>' +
    "</div>" +
    //'<hr style="margin: 30px 0; border: 0; border-top: 1px solid #ccc;">' +
    // Digital Signature
    //'<div style="margin-bottom: 20px;">' +
    //'<label for="participant-name"><b>Digital Signature (Type your full name):</b></label><br>' +
    //'<input type="text" id="participant-name" name="participant_name" required style="width: 100%; max-width: 400px; padding: 8px; margin-top: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Participant Name in block capitals">' +
    //"</div>" +
    // Footer Information
    '<div style="margin-top: 40px; padding-top: 20px; border-top: 2px dashed #eee;">' +
    '<p style="font-size: 0.85em; color: #555; line-height: 1.4; margin-bottom: 15px;">' +
    "Se durante sua participação neste estudo você sentir que as informações e diretrizes que lhe foram dadas foram negligenciadas ou desconsideradas de alguma forma, ou se você está infeliz com o processo, entre em contato com o Secretário do Comitê de Ética da Universidade de Maynooth em <b>research.ethics@mu.ie</b> ou <b>+353 (0)1 708 6019</b>. Por favor, tenha certeza de que suas preocupações serão tratadas de maneira sensível." +
    "</p>" +
    '<p style="font-size: 0.85em; color: #555; line-height: 1.4;">' +
    'Para suas informações, o Controlador de Dados para este projeto de pesquisa é a Universidade Maynooth, Maynooth, Co. O Kildare. O escritório de Proteção de Dados está localizado na Sala 17/27, Rye Hall Extension, North Campus, Maynooth University, que pode ser contatado em  <b>dataprotection@mu.ie</b>. As políticas de privacidade de dados da Maynooth University podem ser encontradas em <a href="https://www.maynoothuniversity.ie/data-protection" target="_blank">https://www.maynoothuniversity.ie/data-protection</a>.' +
    "</p>" +
    "</div>" +
    "</form>" +
    '<div style="margin-top: 35px; text-align: center;">' +
    '<button id="btn-submit-consent" type="submit" form="form-consent">Eu concordo e desejo continuar &rarr;</button>' +
    "</div>" +
    "</div>" +
    "</div>",
});

// =========================================================================
// Task 1: Read csound code and describe it
// =========================================================================
const csoundTask1_Desc = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: left;">' +
    '<h3 style="text-align: center; margin-bottom: 30px;">Tarefa #1: Lendo código em Csound</h3>' +
    '<div class="task-wrapper">' +
    "<p>Abaixo você verá um trecho do código de Csound. Leia-o atentamente.</p>" +
    '<textarea id="csound-preview-task1" readonly="readonly" class="textarea-code">' +
    "instr plucked\n" +
    "\tkFrequency = mtof(p4)\n" +
    "\tiFrequency = mtof:i(p4)\n" +
    "\tkEnv = linseg(.1, p3, 0)\n" +
    "\taSignal = pluck(kEnv, kFrequency, iFrequency, 0, 1)\n" +
    "\toutall(tanh(aSignal))\n" +
    "endin\n" +
    'schedule("plucked", 0, 1, 60)\n' +
    'schedule("plucked", 1, 1, 64)\n' +
    'schedule("plucked", 2, 1, 67)\n' +
    "</textarea>\n" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p>Agora que você leu o código, descreva em algumas palavras o que som você acredita que ele faz quando executado::</p>" +
    '<form id="form-csound-task1-desc">' +
    '<textarea name="csound_data_task1_description" id="csound-answer-task1-desc" class="textarea-code" required></textarea>' +
    "</form>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task1-desc" type="submit" form="form-csound-task1-desc">Continuar &rarr;</button>' +
    "</div>" +
    "</div>" +
    "</div>",
});

// =========================================================================
// Task 1: Self-evaluation of Csound code description correctness
// =========================================================================
const csoundTask1_Eval = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: left; padding-bottom: 40px;">' +
    '<h3 style="text-align: center; margin-bottom: 30px;">Tarefa #1: Lendo código em Csound</h3>' +
    '<div class="task-wrapper">' +
    '<p>Now listen to the sound the code produces by clicking on "Tocar".</p>' +
    '<textarea id="csound-execution-task1" readonly="readonly" class="textarea-code">' +
    "instr plucked\n" +
    "\tkFrequency = mtof(p4)\n" +
    "\tiFrequency = mtof:i(p4)\n" +
    "\tkEnv = linseg(.1, p3, 0)\n" +
    "\taSignal = pluck(kEnv, kFrequency, iFrequency, 0, 1)\n" +
    "\toutall(tanh(aSignal))\n" +
    "endin\n" +
    'schedule("plucked", 0, 1, 60)\n' +
    'schedule("plucked", 1, 1, 64)\n' +
    'schedule("plucked", 2, 1, 67)\n' +
    "</textarea>\n" +
    '<div style="margin-top: 10px;">' +
    '<button id="btn-csound-run-task1" class="button-run">▶ Tocar</button>\n' +
    '<button id="btn-csound-stop-task1" class="button-stop">■ Parar</button>\n' +
    "</div>" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p><b>O som resultante é o que você esperava que fosse?</b></p>" +
    '<form id="form-csound-task1-eval">' +
    '<input type="radio" id="csound-radio-task1-yes" name="csound_data_task1_correctness" value="2" required>' +
    '<label for="csound-radio-task1-yes">Sim, exatamente.</label>&nbsp;&nbsp;' +
    '<input type="radio" id="csound-radio-task1-partly" name="csound_data_task1_correctness" value="1" required>' +
    '<label for="csound-radio-task1-partly">Em parte.</label>&nbsp;&nbsp;' +
    '<input type="radio" id="csound-radio-task1-no" name="csound_data_task1_correctness" value="0" required>' +
    '<label for="csound-radio-task1-no">Não, de modo algum.</label></br>' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "Em uma escala de 1 a 7, quão difícil foi concluir essa tarefa?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Muito fácil</b></span>' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Muito difícil</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task1-eval" type="submit" form="form-csound-task1-eval">Continuar &rarr;</button>' +
    "</div>" +
    "</div>" +
    "</div>",
  events: {
    "click button#btn-csound-run-task1": function (event) {
      startCsound(event, "csound-execution-task1");
    },
    "click button#btn-csound-stop-task1": function (event) {
      stopCsound(event);
    },
  },
});

// =========================================================================
// Task 2: Modify Csound code
// =========================================================================
const csoundTask2_Modify = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: left;">' +
    '<h3 style="text-align: center; margin-bottom: 30px;">Tarefa #2: Modificando código em Csound</h3>' +
    '<div class="task-wrapper">' +
    "<p>O seguinte trecho de código usa o mesmo gerador de som da última tarefa para executar as seguintes operações:<br>" +
    "<b>1.</b> Calcula quando a próxima nota deve começar (a cada 0,25 segundos).<br>" +
    "<b>2.</b> Define por quanto tempo a nota vai soar (0,25 segundos).<br>" +
    "<b>3.</b> Escolhe um valor MIDI aleatório entre 48 (C3) e 84 (C6).<br>" +
    '<b>4.</b> Programa o instrumento "plucked" usando essas variáveis.<br>' +
    "<b>5.</b> Move-se para a próxima nota.<br>" +
    "Leia atentamente e execute-o quantas vezes for necessário para entender sua funcionalidade.</p>" +
    '<textarea id="csound-preview-task2" readonly="readonly" class="textarea-code">' +
    "instr plucked\n" +
    "\tkFrequency = mtof(p4)\n" +
    "\tiFrequency = mtof:i(p4)\n" +
    "\tkEnv = linseg(.1, p3, 0)\n" +
    "\taSignal = pluck(kEnv, kFrequency, iFrequency, 0, 1)\n" +
    "\toutall(tanh(aSignal))\n" +
    "endin\n" +
    "\tinstr generator\n" +
    "\t\tiCounter = 0\n" +
    "\t\tiNotesToTocar = 16\n" +
    "\t\t\tiDuration = .25\n" +
    "\t\twhile iCounter < iNotesToTocar do\n" +
    "\t\t\tiStartTime = iCounter * iDuration\n" +
    "\t\t\tiRandomPitch = int(random:i(48, 72))\n" +
    '\t\t\tschedule("plucked", iStartTime, iDuration, iRandomPitch)\n' +
    "\t\t\tiCounter += 1\n" +
    "\t\tod\n" +
    "\tendin\n" +
    'schedule("generator", 0, 1)\n' +
    "</textarea>" +
    '<div style="margin-top: 10px;">' +
    '<button id="btn-csound-run-preview2" class="button-run">▶ Tocar</button>\n' +
    '<button id="btn-csound-stop-preview2" class="button-stop">■ Parar</button>\n' +
    "</div>" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p>Agora, modifique o código de forma que:<br>" +
    "<b>1.</b> As notas são reproduzidas no registro agudo.<br>" +
    "<b>2.</b> Apenas 8 notas são tocadas.<br>" +
    "<b>3.</b> A duração de cada nota é duplicada.<br><br>" +
    "Quando terminar, clique para continuar.</p>" +
    '<form id="form-csound-task2-modify">' +
    '<textarea name="csound_data_task2_modification" id="csound-editor-task2" class="textarea-code" required>' +
    "instr plucked\n" +
    "\tkFrequency = mtof(p4)\n" +
    "\tiFrequency = mtof:i(p4)\n" +
    "\tkEnv = linseg(.1, p3, 0)\n" +
    "\taSignal = pluck(kEnv, kFrequency, iFrequency, 0, 1)\n" +
    "\toutall(tanh(aSignal))\n" +
    "endin\n" +
    "\tinstr generator\n" +
    "\t\tiCounter = 0\n" +
    "\t\tiNotesToTocar = 16\n" +
    "\t\t\tiDuration = .25\n" +
    "\t\twhile iCounter < iNotesToTocar do\n" +
    "\t\t\tiStartTime = iCounter * iDuration\n" +
    "\t\t\tiRandomPitch = int(random:i(48, 72))\n" +
    '\t\t\tschedule("plucked", iStartTime, iDuration, iRandomPitch)\n' +
    "\t\t\tiCounter += 1\n" +
    "\t\tod\n" +
    "\tendin\n" +
    'schedule("generator", 0, 1)\n' +
    "</textarea>" +
    "</form>" +
    '<div style="margin-top: 10px;">' +
    '<button id="btn-csound-run-task2" class="button-run">▶ Tocar</button>\n' +
    '<button id="btn-csound-stop-task2" class="button-stop">■ Parar</button>\n' +
    "</div>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task2" type="submit" form="form-csound-task2-modify">Continuar &rarr;</button>' +
    "</div>" +
    "</div>" +
    "</div>",
  events: {
    "click button#btn-csound-run-preview2": function (event) {
      startCsound(event, "csound-preview-task2");
    },
    "click button#btn-csound-stop-preview2": function (event) {
      stopCsound(event);
    },
    "click button#btn-csound-run-task2": function (event) {
      startCsound(event, "csound-editor-task2");
    },
    "click button#btn-csound-stop-task2": function (event) {
      stopCsound(event);
    },
  },
});

// =========================================================================
// Task 2: Self-evaluation of Csound modification difficulty
// =========================================================================
const csoundTask2_Eval = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: left;">' +
    '<h3 style="text-align: center; margin-bottom: 30px;">Tarefa #2: Modificando código em Csound</h3>' +
    '<div class="task-wrapper">' +
    '<form id="form-csound-task2-eval">' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "Em uma escala de 1 a 7, quão difícil foi concluir essa tarefa?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Muito fácil</b></span>' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Muito difícil</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task2-eval" type="submit" form="form-csound-task2-eval">Continuar &rarr;</button>' +
    "</div>" +
    "</div>" +
    "</div>",
});

// =========================================================================
// Task 3: Creating with Csound
// =========================================================================
const csoundTask3_Create = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: left; padding-bottom: 40px;">' +
    '<h3 style="text-align: center; margin-bottom: 30px;">Tarefa #3: Criando com o Csound</h3>' +
    '<div class="task-wrapper">' +
    "<p>Agora, gostaríamos de ver como você modificaria livremente o código das últimas tarefas para criar algo do seu agrado:</p>" +
    '<form id="form-csound-task3-create">' +
    '<textarea name="csound_data_task3_creation" id="csound-editor-task3" class="textarea-code" required>' +
    "instr plucked\n" +
    "\tkFrequency = mtof(p4)\n" +
    "\tiFrequency = mtof:i(p4)\n" +
    "\tkEnv = linseg(.1, p3, 0)\n" +
    "\taSignal = pluck(kEnv, kFrequency, iFrequency, 0, 1)\n" +
    "\toutall(tanh(aSignal))\n" +
    "endin\n" +
    "\tinstr generator\n" +
    "\t\tiCounter = p2\n" +
    "\t\tiNotesToTocar = 16\n" +
    "\t\t\tiDuration = .25\n" +
    "\t\twhile iCounter < iNotesToTocar do\n" +
    "\t\t\tiStartTime = iCounter * iDuration\n" +
    "\t\t\tiRandomPitch = int(random:i(48, 72))\n" +
    '\t\t\tschedule("plucked", iStartTime, iDuration, iRandomPitch)\n' +
    "\t\t\tiCounter += 1\n" +
    "\t\tod\n" +
    "\tendin\n" +
    'schedule("plucked", 0, 1, 60)\n' +
    'schedule("plucked", 1, 1, 64)\n' +
    'schedule("plucked", 2, 1, 67)\n' +
    'schedule("generator", 3, 1)\n' +
    "</textarea>" +
    "</form>" +
    '<div style="margin-top: 10px;">' +
    '<button id="btn-csound-run-task3" class="button-run">▶ Tocar</button>\n' +
    '<button id="btn-csound-stop-task3" class="button-stop">■ Parar</button>\n' +
    "</div>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task3" type="submit" form="form-csound-task3-create">Continuar &rarr;</button>' +
    "</div>" +
    "</div>" +
    "</div>",
  events: {
    "click button#btn-csound-run-task3": function (event) {
      startCsound(event, "csound-editor-task3");
    },
    "click button#btn-csound-stop-task3": function (event) {
      stopCsound(event);
    },
  },
});

// =========================================================================
// Task 3: Self-evaluation of Csound creativity difficulty
// =========================================================================
const csoundTask3_Eval = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: left;">' +
    '<h3 style="text-align: center; margin-bottom: 30px;">Tarefa #3: Criando com o Csound</h3>' +
    '<div class="task-wrapper">' +
    '<form id="form-csound-task3-eval">' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "Em uma escala de 1 a 7, quão difícil foi concluir essa tarefa?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Muito fácil</b></span>' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Muito difícil</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task3-eval" type="submit" form="form-csound-task3-eval">Continuar &rarr;</button>' +
    "</div>" +
    "</div>" +
    "</div>",
});

// =========================================================================
// Csound SUS
// =========================================================================
const csoundSUS = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center; padding-bottom: 40px;">' +
    "<h3>Avaliação do sistema Csound</h3>" +
    '<div style="width: 80%; max-width: 900px; margin: 0 auto; text-align: left;">' +
    "<p>Por favor, indique o quanto você concorda ou discorda com as seguintes declarações sobre o sistema que acabou de usar.</p>" +
    '<form id="sus-csound">' +
    '<table style="width: 100%; border-collapse: separate; border-spacing: 0 15px; text-align: center;">' +
    "<thead>" +
    "<tr>" +
    '<th style="text-align: left; width: 50%;">Declaração</th>' +
    "<th>1<br><small>Discordo<br>fortemente</small></th>" +
    "<th>2</th>" +
    "<th>3</th>" +
    "<th>4</th>" +
    "<th>5<br><small>Concordo<br>fortemente</small></th>" +
    "</tr>" +
    "</thead>" +
    "<tbody>" +
    // Q1
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">1. Acho que gostaria de usar este sistema com frequência.</td>' +
    '<td><input type="radio" name="susCsound_1" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_1" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_1" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_1" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_1" value="5" required></td>' +
    "</tr>" +
    // Q2
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">2. Achei o sistema desnecessariamente complexo.</td>' +
    '<td><input type="radio" name="susCsound_2" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_2" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_2" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_2" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_2" value="5" required></td>' +
    "</tr>" +
    // Q3
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">3. Achei o sistema fácil de usar.</td>' +
    '<td><input type="radio" name="susCsound_3" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_3" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_3" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_3" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_3" value="5" required></td>' +
    "</tr>" +
    // Q4
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">4. Acho que precisaria de apoio técnico para poder utilizar este sistema.</td>' +
    '<td><input type="radio" name="susCsound_4" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_4" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_4" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_4" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_4" value="5" required></td>' +
    "</tr>" +
    // Q5
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">5. Achei que as várias funções neste sistema estavam bem integradas.</td>' +
    '<td><input type="radio" name="susCsound_5" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_5" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_5" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_5" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_5" value="5" required></td>' +
    "</tr>" +
    // Q6
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">6. Achei que havia muita inconsistência neste sistema.</td>' +
    '<td><input type="radio" name="susCsound_6" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_6" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_6" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_6" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_6" value="5" required></td>' +
    "</tr>" +
    // Q7
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">7. Eu imagino que a maioria das pessoas aprenderia a usar esse sistema muito rapidamente.</td>' +
    '<td><input type="radio" name="susCsound_7" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_7" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_7" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_7" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_7" value="5" required></td>' +
    "</tr>" +
    // Q8
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">8. Achei o sistema muito complicado de usar.</td>' +
    '<td><input type="radio" name="susCsound_8" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_8" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_8" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_8" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_8" value="5" required></td>' +
    "</tr>" +
    // Q9
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">9. Senti-me muito confiante em usar o sistema.</td>' +
    '<td><input type="radio" name="susCsound_9" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_9" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_9" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_9" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_9" value="5" required></td>' +
    "</tr>" +
    // Q10
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">10. Precisaria aprender muitas coisas antes que eu pudesse utilizar este sistema.</td>' +
    '<td><input type="radio" name="susCsound_10" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_10" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_10" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_10" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_10" value="5" required></td>' +
    "</tr>" +
    "</tbody>" +
    "</table>" +
    "</form>" +
    '<div style="text-align: center; margin-top: 30px;">' +
    '<button id="submit-sus1" type="submit" form="sus-csound">Submeter &rarr;</button>' +
    "</div>" +
    "</div>" +
    "</div>",
});

// =========================================================================
// Task 1: Read liteTocar code and describe it
// =========================================================================
const lpTask1_Desc = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>Tarefa #1: Lendo código de litePlay</h3>" +
    '<div class="task-wrapper">' +
    "<p>Abaixo você verá um trecho do código litePlay.js. Leia-o atentamente.</p>" +
    '<textarea id="liteplay-preview-task1" readonly="readonly" class="textarea-code">' +
    'arpeggio({howLoud: .5, howLong: 1, onSomething: steelAcousticGuitar}, [C4, E4, G4], 1, "forward").play()' +
    "</textarea>" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p>Agora que você leu o código, descreva em algumas palavras o que som você acredita que ele faz quando executado:</p>" +
    '<form id="form-liteplay-task1-desc">' +
    '<textarea name="liteplay_data_task1_description" id="liteplay-answer-task1-desc" class="textarea-code" required></textarea>' +
    "</form>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task1-desc" type="submit" form="form-liteplay-task1-desc">Continuar &rarr;</button>' +
    "</div>",
  events: {
    "click button#btn-submit-liteplay-task1-desc": function (event) {
      startLP(event, "lpLoad()");
    },
  },
});

// =========================================================================
// Task 1: Self-evaluation of liteTocar code description correctness
// =========================================================================
const lpTask1_Eval = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center; padding-bottom: 40px;">' +
    "<h3>Tarefa #1: Lendo código em litePlay.js</h3>" +
    // Code area (Execution target)
    '<div class="task-wrapper">' +
    '<p>Agora ouça o som que o código produz clicando em "Tocar".</p>' +
    '<textarea id="liteplay-execution-task1" readonly="readonly" class="textarea-code">' +
    'arpeggio({howLoud: .5, howLong: 1, onSomething: steelAcousticGuitar}, [C4, E4, G4], 1, "forward").play()' +
    "</textarea>" +
    '<div style="text-align: center; margin-top: 10px;">' +
    '<button id="btn-liteplay-run-task1" class="button-run">▶ Tocar</button>\n' +
    '<button id="btn-liteplay-stop-task1" class="button-stop">■ Parar</button>\n' +
    "</div>" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p><b>O som resultante é o que você esperava que fosse?</b></p>" +
    '<form id="form-liteplay-task1-eval">' +
    '<input type="radio" id="liteplay-radio-task1-yes" name="liteplay_data_task1_correctness" value="2" required>' +
    '<label for="liteplay-radio-task1-yes">Sim, exactamente.</label>&nbsp;&nbsp;' +
    '<input type="radio" id="liteplay-radio-task1-partly" name="liteplay_data_task1_correctness" value="1" required>' +
    '<label for="liteplay-radio-task1-partly">Em parte.</label>&nbsp;&nbsp;' +
    '<input type="radio" id="liteplay-radio-task1-no" name="liteplay_data_task1_correctness" value="0" required>' +
    '<label for="liteplay-radio-task1-no">Não, de modo algum.</label></br>' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "In a scale from 1 to 7, how hard was it to complete this task?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Muito fácil</b></span>' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Muito difícil</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task1-eval" type="submit" form="form-liteplay-task1-eval">Continuar &rarr;</button>' +
    "</div>",
  events: {
    "click button#btn-liteplay-run-task1": function (event) {
      startLP(event, "liteplay-execution-task1");
    },
    "click button#btn-liteplay-stop-task1": function (event) {
      stopLP(event);
    },
  },
});

// =========================================================================
// Task 2: Modify liteTocar code
// =========================================================================
const lpTask2_Modify = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>Tarefa #2: Modificando o código em litePlay.js</h3>" +
    '<div class="task-wrapper">' +
    "<p>O seguinte trecho de código usa o mesmo gerador de som da última tarefa para executar as seguintes operações:<br>" +
    "<b>1.</b> Calcula quando a próxima nota deve começar (a cada 0,25 segundos).<br>" +
    "<b>2.</b> Define por quanto tempo a nota vai soar (0,25 segundos).<br>" +
    "<b>3.</b> Escolhe um valor MIDI aleatório entre 48 (C3) e 84 (C6).<br>" +
    '<b>4.</b> Programa o instrumento "plucked" usando essas variáveis.<br>' +
    "<b>5.</b> Move-se para a próxima nota.<br>" +
    "Leia atentamente e execute-o quantas vezes for necessário para entender sua funcionalidade.</p>" +
    "Read it attentively and execute it as many times needed to understand its functionality.</p>" +
    // PREVIEW AREA
    '<textarea id="liteplay-preview-task2" readonly="readonly" class="textarea-code">' +
    "ostinato({what: midPitch, howLoud: .5, howLong: .25, onSomething: steelAcousticGuitar}, 16).play()" +
    "</textarea>" +
    '<div style="text-align: center; margin-top: 10px;">' +
    '<button id="btn-liteplay-run-preview2" class="button-run">▶ Tocar</button>\n' +
    '<button id="btn-liteplay-stop-preview2" class="button-stop">■ Parar</button>\n' +
    "</div>" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p>Agora, modifique o código de forma que:<br>" +
    "<b>1.</b> As notas são reproduzidas no registro agudo.<br>" +
    "<b>2.</b> Apenas 8 notas são tocadas.<br>" +
    "<b>3.</b> A duração de cada nota é duplicada.<br><br>" +
    "Quando terminar, clique para continuar.</p>" +
    // EDITOR FORM
    '<form id="form-liteplay-task2-modify">' +
    '<textarea name="liteplay_data_task2_modification" id="liteplay-editor-task2" class="textarea-code" required>' +
    "ostinato({what: midPitch, howLoud: .5, howLong: .25, onSomething: steelAcousticGuitar}, 16).play()" +
    "</textarea>" +
    "</form>" +
    '<div style="text-align: center; margin-top: 10px;">' +
    '<button id="btn-liteplay-run-task2" class="button-run">▶ Tocar</button>\n' +
    '<button id="btn-liteplay-stop-task2" class="button-stop">■ Parar</button>\n' +
    "</div>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task2" type="submit" form="form-liteplay-task2-modify">Continuar &rarr;</button>' +
    "</div>",
  events: {
    "click button#btn-liteplay-run-preview2": function (event) {
      startLP(event, "liteplay-preview-task2");
    },
    "click button#btn-liteplay-stop-preview2": function (event) {
      stopLP(event);
    },
    "click button#btn-liteplay-run-task2": function (event) {
      startLP(event, "liteplay-editor-task2");
    },
    "click button#btn-liteplay-stop-task2": function (event) {
      stopLP(event);
    },
  },
});

// =========================================================================
// Task 2: Self-evaluation of liteTocar modification correctness
// =========================================================================
const lpTask2_Eval = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>Tarefa #2: Modificando código em litePlay.js</h3>" +
    '<div class="task-wrapper">' +
    '<form id="form-liteplay-task2-eval">' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "Em uma escala de 1 a 7, quão difícil foi concluir essa tarefa?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Muito fácil</b></span>' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Muito difícil</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task2-eval" type="submit" form="form-liteplay-task2-eval">Continuar &rarr;</button>' +
    "</div>",
});

// =========================================================================
// Task 3: Creating with liteTocar
// =========================================================================
const lpTask3_Create = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>Tarefa #3: Criando com litePlay.js</h3>" +
    '<div class="task-wrapper">' +
    "<p>Agora, gostaríamos de ver como você modificaria livremente o código das últimas tarefas para criar algo do seu agrado:</p>" +
    '<form id="form-liteplay-task3-create">' +
    '<textarea name="liteplay_data_task3_modification" id="liteplay-editor-task3" class="textarea-code" required>' +
    'let a = arpeggio({howLoud: .5, howLong: 1, onSomething: steelAcousticGuitar}, [C4, E4, G4], 1, "forward").play();\n' +
    "let b = ostinato({what: midPitch, howLoud: .5, when: a, howLong: .25, onSomething: steelAcousticGuitar}, 16).play()" +
    "</textarea>" +
    "</form>" +
    '<div style="text-align: center; margin-top: 10px;">' +
    '<button id="btn-liteplay-run-task3" class="button-run">▶ Tocar</button>\n' +
    '<button id="btn-liteplay-stop-task3" class="button-stop">■ Parar</button>\n' +
    "</div>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task3" type="submit" form="form-liteplay-task3-create">Continuar &rarr;</button>' +
    "</div>",
  events: {
    "click button#btn-liteplay-run-task3": function (event) {
      startLP(event, "liteplay-editor-task3");
    },
    "click button#btn-liteplay-stop-task3": function (event) {
      stopLP(event);
    },
  },
});

// =========================================================================
// Task 3: Self-evaluation of liteTocar creativity
// =========================================================================
const lpTask3_Eval = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>Tarefa #3: Criando com litePlay.js</h3>" +
    '<div class="task-wrapper">' +
    '<form id="form-liteplay-task3-eval">' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "Em uma escala de 1 a 7, quão difícil foi concluir essa tarefa?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Muito fácil</b></span>' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Muito difícil</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task3-eval" type="submit" form="form-liteplay-task3-eval">Continuar &rarr;</button>' +
    "</div>",
});

// =========================================================================
// liteTocar.js SUS
// =========================================================================
const lpSUS = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>liteTocar.js System Evaluation</h3>" +
    '<div style="width: 80%; max-width: 900px; margin: 0 auto; text-align: left;">' +
    "<p>Por favor, indique o quanto você concorda ou discorda com as seguintes declarações sobre o sistema que acabou de usar.</p>" +
    '<form id="sus-lp">' +
    '<table style="width: 100%; border-collapse: separate; border-spacing: 0 15px; text-align: center;">' +
    "<thead>" +
    "<tr>" +
    '<th style="text-align: left; width: 50%;">Statement</th>' +
    "<th>1<br><small>Discordo<br>fortemente</small></th>" +
    "<th>2</th>" +
    "<th>3</th>" +
    "<th>4</th>" +
    "<th>5<br><small>Concordo<br>fortemente</small></th>" +
    "</tr>" +
    "</thead>" +
    "<tbody>" +
    // Q1
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">1. Acho que gostaria de usar este sistema com frequência.</td>' +
    '<td><input type="radio" name="suslp_1" value="1" required></td>' +
    '<td><input type="radio" name="suslp_1" value="2" required></td>' +
    '<td><input type="radio" name="suslp_1" value="3" required></td>' +
    '<td><input type="radio" name="suslp_1" value="4" required></td>' +
    '<td><input type="radio" name="suslp_1" value="5" required></td>' +
    "</tr>" +
    // Q2
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">2. Achei o sistema desnecessariamente complexo.</td>' +
    '<td><input type="radio" name="suslp_2" value="1" required></td>' +
    '<td><input type="radio" name="suslp_2" value="2" required></td>' +
    '<td><input type="radio" name="suslp_2" value="3" required></td>' +
    '<td><input type="radio" name="suslp_2" value="4" required></td>' +
    '<td><input type="radio" name="suslp_2" value="5" required></td>' +
    "</tr>" +
    // Q3
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">3. Achei o sistema fácil de usar.</td>' +
    '<td><input type="radio" name="suslp_3" value="1" required></td>' +
    '<td><input type="radio" name="suslp_3" value="2" required></td>' +
    '<td><input type="radio" name="suslp_3" value="3" required></td>' +
    '<td><input type="radio" name="suslp_3" value="4" required></td>' +
    '<td><input type="radio" name="suslp_3" value="5" required></td>' +
    "</tr>" +
    // Q4
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">4. Acho que precisaria de apoio técnico para poder utilizar este sistema.</td>' +
    '<td><input type="radio" name="suslp_4" value="1" required></td>' +
    '<td><input type="radio" name="suslp_4" value="2" required></td>' +
    '<td><input type="radio" name="suslp_4" value="3" required></td>' +
    '<td><input type="radio" name="suslp_4" value="4" required></td>' +
    '<td><input type="radio" name="suslp_4" value="5" required></td>' +
    "</tr>" +
    // Q5
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">5. Achei que as várias funções neste sistema estavam bem integradas.</td>' +
    '<td><input type="radio" name="suslp_5" value="1" required></td>' +
    '<td><input type="radio" name="suslp_5" value="2" required></td>' +
    '<td><input type="radio" name="suslp_5" value="3" required></td>' +
    '<td><input type="radio" name="suslp_5" value="4" required></td>' +
    '<td><input type="radio" name="suslp_5" value="5" required></td>' +
    "</tr>" +
    // Q6
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">6. Achei que havia muita inconsistência neste sistema.</td>' +
    '<td><input type="radio" name="suslp_6" value="1" required></td>' +
    '<td><input type="radio" name="suslp_6" value="2" required></td>' +
    '<td><input type="radio" name="suslp_6" value="3" required></td>' +
    '<td><input type="radio" name="suslp_6" value="4" required></td>' +
    '<td><input type="radio" name="suslp_6" value="5" required></td>' +
    "</tr>" +
    // Q7
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">7. Eu imagino que a maioria das pessoas aprenderia a usar esse sistema muito rapidamente.</td>' +
    '<td><input type="radio" name="suslp_7" value="1" required></td>' +
    '<td><input type="radio" name="suslp_7" value="2" required></td>' +
    '<td><input type="radio" name="suslp_7" value="3" required></td>' +
    '<td><input type="radio" name="suslp_7" value="4" required></td>' +
    '<td><input type="radio" name="suslp_7" value="5" required></td>' +
    "</tr>" +
    // Q8
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">8. Achei o sistema muito complicado de usar.</td>' +
    '<td><input type="radio" name="suslp_8" value="1" required></td>' +
    '<td><input type="radio" name="suslp_8" value="2" required></td>' +
    '<td><input type="radio" name="suslp_8" value="3" required></td>' +
    '<td><input type="radio" name="suslp_8" value="4" required></td>' +
    '<td><input type="radio" name="suslp_8" value="5" required></td>' +
    "</tr>" +
    // Q9
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">9. Senti-me muito confiante em usar o sistema.</td>' +
    '<td><input type="radio" name="suslp_9" value="1" required></td>' +
    '<td><input type="radio" name="suslp_9" value="2" required></td>' +
    '<td><input type="radio" name="suslp_9" value="3" required></td>' +
    '<td><input type="radio" name="suslp_9" value="4" required></td>' +
    '<td><input type="radio" name="suslp_9" value="5" required></td>' +
    "</tr>" +
    // Q10
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">10. Precisaria aprender muitas coisas antes que eu pudesse utilizar este sistema.</td>' +
    '<td><input type="radio" name="suslp_10" value="1" required></td>' +
    '<td><input type="radio" name="suslp_10" value="2" required></td>' +
    '<td><input type="radio" name="suslp_10" value="3" required></td>' +
    '<td><input type="radio" name="suslp_10" value="4" required></td>' +
    '<td><input type="radio" name="suslp_10" value="5" required></td>' +
    "</tr>" +
    "</tbody>" +
    "</table>" +
    "</form>" +
    '<div style="text-align: center; margin-top: 30px;">' +
    '<button id="submit-sus2" type="submit" form="sus-lp">Submeter &rarr;</button>' +
    "</div>" +
    "</div>" +
    "</div>",
});

// =========================================================================
// Goldsmiths Musical Sophistication Index Test
// =========================================================================
const goldsmithTest = new lab.html.Form({
  content:
    '<div class="w-l text-left" style="display: block">' +
    '<h2 class="text-center">Por favor, fale-nos de você mesmo</h2>' +
    '<p class="text-center">Antes de terminar, gostaríamos de aprender um pouco mais sobre você.</p>' +
    "" +
    '<form id="goldmsi">' +
    "      <table>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu passo muito do meu tempo livre fazendo atividades relacionadas à música." +
    "</td>" +
    "<td>" +
    '<select name="gold1" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Às vezes eu escolho uma música que pode me causar arrepios." +
    "</td>" +
    "<td>" +
    '<select name="gold2" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Gosto de escrever sobre música, por exemplo, em blogs e fóruns." +
    "</td>" +
    "<td>" +
    '<select name="gold3" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Se alguém começar a cantar uma música que eu não conheço, eu geralmente consigo participar." +
    "</td>" +
    "<td>" +
    '<select name="gold4" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu sou capaz de julgar se alguém é um bom cantor ou não." +
    "</td>" +
    "<td>" +
    '<select name="gold5" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu geralmente sei quando estou ouvindo uma música pela primeira vez." +
    "</td>" +
    "<td>" +
    '<select name="gold6" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Posso cantar ou tocar música de memória." +
    "</td>" +
    "<td>" +
    '<select name="gold7" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Intrigo-me com estilos musicais que não conheço e quero descobrir mais." +
    "</td>" +
    "<td>" +
    '<select name="gold8" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Peças musicais raramente evocam emoções em mim." +
    "</td>" +
    "<td>" +
    '<select name="gold9" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Acho difícil detectar erros em uma performance de uma música, mesmo que eu conheça a música." +
    "</td>" +
    "<td>" +
    '<select name="gold11" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Posso comparar e discutir diferenças entre duas apresentações ou versões da mesma música." +
    "</td>" +
    "<td>" +
    '<select name="gold12" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Tenho dificuldade em reconhecer uma música que me é familiar quando tocada de uma maneira diferente ou por um artista diferente." +
    "</td>" +
    "<td>" +
    '<select name="gold13" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu nunca recebi elogios por meus talentos como musicista." +
    "</td>" +
    "<td>" +
    '<select name="gold14" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Muitas vezes leio ou pesquiso na internet por coisas relacionadas a música." +
    "</td>" +
    "<td>" +
    '<select name="gold15" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Muitas vezes eu escolho certas músicas para me motivar ou me animar." +
    "</td>" +
    "<td>" +
    '<select name="gold16" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu não sou capaz de cantar em harmonia quando alguém está cantando uma música familiar." +
    "</td>" +
    "<td>" +
    '<select name="gold17" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu posso dizer quando as pessoas cantam ou tocam fora do tempo com a batida." +
    "</td>" +
    "<td>" +
    '<select name="gold18" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu sou capaz de identificar o que é especial sobre uma determinada peça musical." +
    "</td>" +
    "<td>" +
    '<select name="gold19" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu sou capaz de falar sobre as emoções que uma peça de música evoca em mim." +
    "</td>" +
    "<td>" +
    '<select name="gold20" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Não gasto muito da minha renda disponível em música." +
    "</td>" +
    "<td>" +
    '<select name="gold21" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu posso dizer quando as pessoas cantam ou tocam desafinado." +
    "</td>" +
    "<td>" +
    '<select name="gold22" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Quando canto, não faço ideia se estou desafinando ou não." +
    "</td>" +
    "<td>" +
    '<select name="gold23" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "A música é uma espécie de vício para mim - eu não poderia viver sem ela." +
    "</td>" +
    "<td>" +
    '<select name="gold24" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu não gosto de cantar em público porque tenho medo de cantar notas erradas." +
    "</td>" +
    "<td>" +
    '<select name="gold25" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Quando ouço uma música, geralmente consigo identificar seu gênero." +
    "</td>" +
    "<td>" +
    '<select name="gold26" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu não me consideraria um músico." +
    "</td>" +
    "<td>" +
    '<select name="gold27" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu acompanho novidades no mundo da música (por exemplo. novos artistas ou gravações)." +
    "</td>" +
    "<td>" +
    '<select name="gold28" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Depois de escutar uma música que desconhecia duas ou três vezes, eu geralmente posso cantá-la sozinha." +
    "</td>" +
    "<td>" +
    '<select name="gold29" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Só preciso escutar uma música que desconhecia uma vez e posso cantá-la horas depois." +
    "</td>" +
    "<td>" +
    '<select name="gold30" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "A música pode evocar minhas memórias de pessoas e lugares passados." +
    "</td>" +
    "<td>" +
    '<select name="gold31" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">Discordo totalmente</option>' +
    '<option value="1">Discordo fortemente</option>' +
    '<option value="2">Discordo</option>' +
    '<option value="3">Não concordo, nem discordo</option>' +
    '<option value="4">Concordo</option>' +
    '<option value="5">Concordo fortemente</option>' +
    '<option value="6">Concordo totalmente</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu me envolvi na prática regular e diária de um instrumento musical (incluindo voz) por ___ anos." +
    "</td>" +
    "<td>" +
    '<select name="gold32" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">1</option>' +
    '<option value="2">2</option>' +
    '<option value="3">3</option>' +
    '<option value="4">4-5</option>' +
    '<option value="5">6-9</option>' +
    '<option value="6">10 ou mais</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "No auge do meu interesse, eu praticava ___ horas por dia no meu instrumento primário." +
    "</td>" +
    "<td>" +
    '<select name="gold33" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">0.5</option>' +
    '<option value="2">1</option>' +
    '<option value="3">1.5</option>' +
    '<option value="4">2</option>' +
    '<option value="5">3-4</option>' +
    '<option value="6">5 ou mais</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Assisti ___ eventos musicais ao vivo como parte da plateia nos últimos doze meses." +
    "</td>" +
    "<td>" +
    '<select name="gold34" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">1</option>' +
    '<option value="2">2</option>' +
    '<option value="3">3</option>' +
    '<option value="4">4-6</option>' +
    '<option value="5">7-10</option>' +
    '<option value="6">11 ou mais</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Tenho formação formal em teoria musical há __ anos." +
    "</td>" +
    "<td>" +
    '<select name="gold35" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">0.5</option>' +
    '<option value="2">1</option>' +
    '<option value="3">2</option>' +
    '<option value="4">3</option>' +
    '<option value="5">4-6</option>' +
    '<option value="6">7 ou mais</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Tive ___ anos de treinamento formal em um instrumento musical (incluindo voz) durante minha vida." +
    "</td>" +
    "<td>" +
    '<select name="gold36" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">0.5</option>' +
    '<option value="2">1</option>' +
    '<option value="3">2</option>' +
    '<option value="4">3-5</option>' +
    '<option value="5">6-9</option>' +
    '<option value="6">10 ou mais</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Posso tocar ___ instrumentos musicais." +
    "</td>" +
    "<td>" +
    '<select name="gold37" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">1</option>' +
    '<option value="2">2</option>' +
    '<option value="3">3</option>' +
    '<option value="4">4</option>' +
    '<option value="5">5</option>' +
    '<option value="6">6 ou mais</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Eu ouço música atentamente por __ por dia." +
    "</td>" +
    "<td>" +
    '<select name="gold38" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">0-15 min</option>' +
    '<option value="1">15-30 min</option>' +
    '<option value="2">30-60 min</option>' +
    '<option value="3">60-90 min</option>' +
    '<option value="4">2hrs</option>' +
    '<option value="5">2-3hrs</option>' +
    '<option value="6">4hrs ou mais</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "O instrumento que toco melhor (incluindo voz) é ____." +
    "</td>" +
    "<td>" +
    '<select name="gold39" required class="w-100">' +
    '<option value="" selected>' +
    "-- Por favor, escolha uma opção --" +
    "</option>" +
    '<option value="0">nenhum</option>' +
    '<option value="1">voz</option>' +
    '<option value="2">piano</option>' +
    '<option value="3">guitarra</option>' +
    '<option value="4">bateria</option>' +
    '<option value="5">xilofone</option>' +
    '<option value="6">flauta</option>' +
    '<option value="7">oboé</option>' +
    '<option value="8">clarineta</option>' +
    '<option value="9">fagote</option>' +
    '<option value="10">trompete</option>' +
    '<option value="11">trombone</option>' +
    '<option value="12">tuba</option>' +
    '<option value="13">saxofone</option>' +
    '<option value="14">trompa</option>' +
    '<option value="15">violino</option>' +
    '<option value="16">violoncelo</option>' +
    '<option value="17">viola</option>' +
    '<option value="18">contrabaixo</option>' +
    '<option value="19">harpa</option>' +
    '<option value="20">outro</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    "        <colgroup>" +
    '          <col style="width: 45%">' +
    '          <col style="width: 55%">' +
    "        </colgroup>" +
    "      </table>" +
    "    </form>" +
    '<div class="w-l text-center">' +
    '<button id="submit-gold" type="submit" form="goldmsi">Finalizar o teste.</button>' +
    "</div>" +
    "</div>",
});

const GOOGLE_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbz-jPN1E6eOD5IP3EwBZScmBmhH4UUAD7Mm2tVUbBbZGLsNB476jVwXm_7wn0dk2wix/exec";

const thankYouScreen = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: left; max-width: 800px; margin: 0 auto; padding: 10px;">' +
    '<h3 style="text-align: center; margin-bottom: 30px;">Obrigado!</h3>' +
    '<div class="task-wrapper" style="margin-bottom: 25px;">' +
    "  <p>Agradecemos imensamente sua disponibilidade de tempo para participação neste estudo.</p>" +
    "  <p>Por favor, clique no botão abaixo e aguarde alguns momentos até que seus dados sejam salvos com segurança.</p>" +
    "</div>" +
    "" +
    '<div id="save-container" style="margin-top: 35px; text-align: center;">' +
    '  <button id="btn-finish-experiment" type="submit" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">' +
    "    Salvar dados & finalizar" +
    "  </button>" +
    "  " +
    '  <div id="loading-ui" style="display: none; flex-direction: column; align-items: center;">' +
    '    <p style="margin-bottom: 10px; font-weight: bold; color: #d32f2f;">' +
    "      Transmitindo os dados, por favor NÃO FECHE esta página ainda..." +
    "    </p>" +
    '    <div style="width: 100%; max-width: 400px; background-color: #e0e0e0; border-radius: 5px; overflow: hidden; height: 20px;">' +
    '      <div id="progress-bar" style="width: 0%; height: 100%; background-color: #4CAF50; transition: width 0.8s ease;"></div>' +
    "    </div>" +
    "  </div>" +
    "  " +
    '  <div id="success-ui" style="display: none; margin-top: 20px;">' +
    '    <h3 style="color: #4CAF50; margin-bottom: 10px;">Dados salvos com sucesso!</h3>' +
    '    <p style="font-weight: bold;">Agora você pode fechar esta página com segurança.</p>' +
    "  </div>" +
    "</div>" +
    "</div>",
  events: {
    "click button#btn-finish-experiment": function (event) {
      event.preventDefault();

      document.getElementById("btn-finish-experiment").style.display = "none";
      document.getElementById("loading-ui").style.display = "flex";

      const progressBar = document.getElementById("progress-bar");
      setTimeout(() => {
        progressBar.style.width = "40%";
      }, 100);
      setTimeout(() => {
        progressBar.style.width = "75%";
      }, 800);

      const experimentData = this.options.datastore.exportJson();

      fetch(GOOGLE_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: experimentData,
      })
        .then(() => {
          progressBar.style.width = "100%";

          setTimeout(() => {
            document.getElementById("loading-ui").style.display = "none";
            document.getElementById("success-ui").style.display = "block";
          }, 900);
        })
        .catch((error) => {
          console.error("Data transmission failed:", error);

          document.getElementById("loading-ui").innerHTML =
            '<p style="color:red; font-weight:bold;">Transmissão de dados falhou. Fazendo o download do backup...</p>';

          this.options.datastore.download();
        });
    },
  },
});

// =========================================================================
// Study logic:
// Begin screen
// Define csound block
// Define liteTocar block
// Randomize between the two
// Goldsmith test in the beggining
// Than you screen
// =========================================================================
const csoundBlock = new lab.flow.Sequence({
  content: [
    csoundTask1_Desc,
    csoundTask1_Eval,
    csoundTask2_Modify,
    csoundTask2_Eval,
    csoundTask3_Create,
    csoundTask3_Eval,
    csoundSUS,
  ],
  data: { condition: "csound" },
});

const liteplayBlock = new lab.flow.Sequence({
  content: [
    lpTask1_Desc,
    lpTask1_Eval,
    lpTask2_Modify,
    lpTask2_Eval,
    lpTask3_Create,
    lpTask3_Eval,
    lpSUS,
  ],
  data: { condition: "liteplay" },
});

const experimentalCondition = Math.random() < 0.5 ? csoundBlock : liteplayBlock;

const study = new lab.flow.Sequence({
  content: [introScreen, experimentalCondition, goldsmithTest, thankYouScreen],
});

const d = new Date();
const hours = d.getHours().toString();
const minutes = d.getMinutes().toString();
const seconds = d.getSeconds().toString();
const mili = d.getMilliseconds().toString();
const datetime = hours + minutes + seconds + mili;

// =========================================================================
// STUDY EXECUTION & DATA TRANSMISSION
// =========================================================================

//study.on("end", function () {
//  const experimentData = study.options.datastore.exportJson();
//
//  fetch(GOOGLE_WEB_APP_URL, {
//    method: "POST",
//    mode: "no-cors",
//    headers: {
//      "Content-Type": "text/plain;charset=utf-8",
//    },
//    body: experimentData,
//  })
//    .then(() => {
//      console.log("Data successfully sent to Google Sheets!");
//    })
//    .catch((error) => {
//      console.error("Data transmission failed:", error);
//    });
//});

//study.on("end", function () {
//  study.options.datastore.download(
//    (filetype = "csv"),
//    (filename = "data_" + datetime),
//  );
//});

study.run();
