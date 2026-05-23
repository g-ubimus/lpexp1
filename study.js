let liteplayEngine = null;

const startLP = async (event, editorId) => {
  if (event) event.preventDefault();
  if (!liteplayEngine) {
    try {
      console.log("Loading litePlay engine...");
      const { litePlay } =
        await import("https://g-ubimus.github.io/litePlay.js/src/core/litePlay.constants.js");
      liteplayEngine = await lpLoad();
      Object.assign(window, liteplayEngine);
      console.log("litePlay is ready!");
    } catch (error) {
      console.error("Failed to load litePlay:", error);
      return;
    }
  }
  try {
    const codeEditorLP = document.getElementById(editorId);
    const userLP = codeEditorLP.value;
    eval(userLP);
  } catch (error) {
    console.error("Failed to execute litePlay code:", error);
  }
};

const stopLP = async (event) => {
  if (event) event.preventDefault();
  if (liteplayEngine) {
    try {
      console.log("Stopping audio...");
      await reset();
      console.log("Audio stopped.");
    } catch (error) {
      console.log("Failed to stop litePlay:", error);
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
    console.log("Stopping audio...");
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
    '<h3 style="text-align: center; margin-bottom: 30px;">Consent Form</h3>' +
    '<div class="task-wrapper" style="margin-bottom: 25px;">' +
    '<form id="form-consent">' +
    '<p style="margin-bottom: 20px;"><b>Please check each statement below to indicate your agreement:</b></p>' +
    // Checkbox 1
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-1" name="consent_explained" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-1" style="margin-left: 10px; cursor: pointer;">The purpose and nature of the study has been explained to me verbally & in writing. I’ve been able to ask questions, which were answered satisfactorily.</label>' +
    "</div>" +
    // Checkbox 2
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-2" name="consent_voluntary" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-2" style="margin-left: 10px; cursor: pointer;">I am participating voluntarily.</label>' +
    "</div>" +
    // Checkbox 3
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-3" name="consent_withdraw" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-3" style="margin-left: 10px; cursor: pointer;">I understand that I can withdraw from the study, without repercussions, at any time, whether that is before it starts or while I am participating.</label>' +
    "</div>" +
    // Checkbox 4
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-4" name="consent_data_withdraw" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-4" style="margin-left: 10px; cursor: pointer;">I understand that I can withdraw permission to use the data right up to data analysis on July 1st, 2026.</label>' +
    "</div>" +
    // Checkbox 5
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-5" name="consent_data_management" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-5" style="margin-left: 10px; cursor: pointer;">It has been explained to me how my data will be managed and that I may access them on request.</label>' +
    "</div>" +
    // Checkbox 6
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-6" name="consent_confidentiality" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-6" style="margin-left: 10px; cursor: pointer;">I understand the limits of confidentiality as described in the information sheet.</label>' +
    "</div>" +
    // Checkbox 7
    '<div style="margin-bottom: 15px; display: flex; align-items: flex-start;">' +
    '<input type="checkbox" id="chk-consent-7" name="consent_agreement" value="yes" required style="margin-top: 4px;">' +
    '<label for="chk-consent-7" style="margin-left: 10px; cursor: pointer;">I confirm that I\'ve read the <a href=\"./information.html\" target="_blank">information sheet</a> and I agree to participate in Prof. Victor Lazzarini\'s research study.</label>' +
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
    "If during your participation in this study you feel the information and guidelines that you were given have been neglected or disregarded in any way, or if you are unhappy about the process, please contact the Secretary of the Maynooth University Ethics Committee at <b>research.ethics@mu.ie</b> or <b>+353 (0)1 708 6019</b>. Please be assured that your concerns will be dealt with in a sensitive manner." +
    "</p>" +
    '<p style="font-size: 0.85em; color: #555; line-height: 1.4;">' +
    'For your information the Data Controller for this research project is Maynooth University, Maynooth, Co. Kildare. The Data Protection office is located in Room 17/27, Rye Hall Extension, North Campus, Maynooth University, which can be contacted at <b>dataprotection@mu.ie</b>. Maynooth University Data Privacy policies can be found at <a href="https://www.maynoothuniversity.ie/data-protection" target="_blank">https://www.maynoothuniversity.ie/data-protection</a>.' +
    "</p>" +
    "</div>" +
    "</form>" +
    '<div style="margin-top: 35px; text-align: center;">' +
    '<button id="btn-submit-consent" type="submit" form="form-consent">I Consent & Continue &rarr;</button>' +
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
    '<h3 style="text-align: center; margin-bottom: 30px;">Task #1: Reading Csound code</h3>' +
    '<div class="task-wrapper">' +
    "<p>Below you'll see a snippet of <i>Csound</i> code. Read it attentively.</p>" +
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
    "<p>Now that you've read the code, describe in a few words what sound you believe it does when executed:</p>" +
    '<form id="form-csound-task1-desc">' +
    '<textarea name="csound_data_task1_description" id="csound-answer-task1-desc" class="textarea-code" required></textarea>' +
    "</form>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task1-desc" type="submit" form="form-csound-task1-desc">Continue &rarr;</button>' +
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
    '<h3 style="text-align: center; margin-bottom: 30px;">Task #1: Reading Csound code</h3>' +
    '<div class="task-wrapper">' +
    '<p>Now listen to the sound the code produces by clicking on "Run".</p>' +
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
    '<button id="btn-csound-run-task1" class="button-run">▶ Run</button>\n' +
    '<button id="btn-csound-stop-task1" class="button-stop">■ Stop</button>\n' +
    "</div>" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p><b>Is the resulting sound what you expected it to be?</b></p>" +
    '<form id="form-csound-task1-eval">' +
    '<input type="radio" id="csound-radio-task1-yes" name="csound_data_task1_correctness" value="2" required>' +
    '<label for="csound-radio-task1-yes">Yes, exactly.</label>&nbsp;&nbsp;' +
    '<input type="radio" id="csound-radio-task1-partly" name="csound_data_task1_correctness" value="1" required>' +
    '<label for="csound-radio-task1-partly">Partly.</label>&nbsp;&nbsp;' +
    '<input type="radio" id="csound-radio-task1-no" name="csound_data_task1_correctness" value="0" required>' +
    '<label for="csound-radio-task1-no">No, not at all.</label></br>' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "In a scale from 1 to 7, how hard was it to complete this task?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Very Easy</b></span>' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task1_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Very Hard</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task1-eval" type="submit" form="form-csound-task1-eval">Continue &rarr;</button>' +
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
    '<h3 style="text-align: center; margin-bottom: 30px;">Task #2: Modifying Csound code</h3>' +
    '<div class="task-wrapper">' +
    "<p>The following code snippet uses the same sound generator of the last task to perform the following operations:<br>" +
    "<b>1.</b> Calculate when the note should start (every 0.25 seconds).<br>" +
    "<b>2.</b> Set how long the note will sound.<br>" +
    "<b>3.</b> Pick a random MIDI pitch between 48 (C3) and 84 (C6).<br>" +
    '<b>4.</b> Schedule the "plucked" instrument using our variables.<br>' +
    "<b>5.</b> Move to the next note.<br>" +
    "Read it attentively and execute it as many times needed to understand its functionality.</p>" +
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
    "\t\tiNotesToPlay = 16\n" +
    "\t\t\tiDuration = .25\n" +
    "\t\twhile iCounter < iNotesToPlay do\n" +
    "\t\t\tiStartTime = iCounter * iDuration\n" +
    "\t\t\tiRandomPitch = int(random:i(48, 72))\n" +
    '\t\t\tschedule("plucked", iStartTime, iDuration, iRandomPitch)\n' +
    "\t\t\tiCounter += 1\n" +
    "\t\tod\n" +
    "\tendin\n" +
    'schedule("generator", 0, 1)\n' +
    "</textarea>" +
    '<div style="margin-top: 10px;">' +
    '<button id="btn-csound-run-preview2" class="button-run">▶ Run</button>\n' +
    '<button id="btn-csound-stop-preview2" class="button-stop">■ Stop</button>\n' +
    "</div>" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p>Now, modify the code so that:<br>" +
    "<b>1.</b> The notes are played in the high register.<br>" +
    "<b>2.</b> Only 8 notes are played.<br>" +
    "<b>3.</b> The duration of each note is doubled.<br><br>" +
    "When finished, click to continue.</p>" +
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
    "\t\tiNotesToPlay = 16\n" +
    "\t\t\tiDuration = .25\n" +
    "\t\twhile iCounter < iNotesToPlay do\n" +
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
    '<button id="btn-csound-run-task2" class="button-run">▶ Run</button>\n' +
    '<button id="btn-csound-stop-task2" class="button-stop">■ Stop</button>\n' +
    "</div>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task2" type="submit" form="form-csound-task2-modify">Continue &rarr;</button>' +
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
    '<h3 style="text-align: center; margin-bottom: 30px;">Task #2: Modifying Csound code</h3>' +
    '<div class="task-wrapper">' +
    '<form id="form-csound-task2-eval">' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "In a scale from 1 to 7, how hard was it to complete this task?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Very Easy</b></span>' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task2_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Very Hard</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task2-eval" type="submit" form="form-csound-task2-eval">Continue &rarr;</button>' +
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
    '<h3 style="text-align: center; margin-bottom: 30px;">Task #3: Creating with Csound</h3>' +
    '<div class="task-wrapper">' +
    "<p>Now, we'll like to see how you would freely modify the same code from the last task to create something that you like:</p>" +
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
    "\t\tiNotesToPlay = 16\n" +
    "\t\t\tiDuration = .25\n" +
    "\t\twhile iCounter < iNotesToPlay do\n" +
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
    '<button id="btn-csound-run-task3" class="button-run">▶ Run</button>\n' +
    '<button id="btn-csound-stop-task3" class="button-stop">■ Stop</button>\n' +
    "</div>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task3" type="submit" form="form-csound-task3-create">Continue &rarr;</button>' +
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
    '<h3 style="text-align: center; margin-bottom: 30px;">Task #3: Creating with Csound</h3>' +
    '<div class="task-wrapper">' +
    '<form id="form-csound-task3-eval">' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "In a scale from 1 to 7, how hard was it to complete this task?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Very Easy</b></span>' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="csound_data_task3_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Very Hard</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    '<div style="margin-top: 20px;">' +
    '<button id="btn-submit-csound-task3-eval" type="submit" form="form-csound-task3-eval">Continue &rarr;</button>' +
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
    "<h3>Csound system evaluation</h3>" +
    '<div style="width: 80%; max-width: 900px; margin: 0 auto; text-align: left;">' +
    "<p>Please indicate how strongly you agree or disagree with the following statements regarding the system you just used.</p>" +
    '<form id="sus-csound">' +
    '<table style="width: 100%; border-collapse: separate; border-spacing: 0 15px; text-align: center;">' +
    "<thead>" +
    "<tr>" +
    '<th style="text-align: left; width: 50%;">Statement</th>' +
    "<th>1<br><small>Strongly<br>Disagree</small></th>" +
    "<th>2</th>" +
    "<th>3</th>" +
    "<th>4</th>" +
    "<th>5<br><small>Strongly<br>Agree</small></th>" +
    "</tr>" +
    "</thead>" +
    "<tbody>" +
    // Q1
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">1. I think that I would like to use this system frequently.</td>' +
    '<td><input type="radio" name="susCsound_1" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_1" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_1" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_1" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_1" value="5" required></td>' +
    "</tr>" +
    // Q2
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">2. I found the system unnecessarily complex.</td>' +
    '<td><input type="radio" name="susCsound_2" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_2" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_2" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_2" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_2" value="5" required></td>' +
    "</tr>" +
    // Q3
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">3. I thought the system was easy to use.</td>' +
    '<td><input type="radio" name="susCsound_3" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_3" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_3" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_3" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_3" value="5" required></td>' +
    "</tr>" +
    // Q4
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">4. I think that I would need the support of a technical person to be able to use this system.</td>' +
    '<td><input type="radio" name="susCsound_4" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_4" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_4" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_4" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_4" value="5" required></td>' +
    "</tr>" +
    // Q5
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">5. I found the various functions in this system were well integrated.</td>' +
    '<td><input type="radio" name="susCsound_5" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_5" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_5" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_5" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_5" value="5" required></td>' +
    "</tr>" +
    // Q6
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">6. I thought there was too much inconsistency in this system.</td>' +
    '<td><input type="radio" name="susCsound_6" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_6" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_6" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_6" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_6" value="5" required></td>' +
    "</tr>" +
    // Q7
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">7. I would imagine that most people would learn to use this system very quickly.</td>' +
    '<td><input type="radio" name="susCsound_7" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_7" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_7" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_7" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_7" value="5" required></td>' +
    "</tr>" +
    // Q8
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">8. I found the system very cumbersome to use.</td>' +
    '<td><input type="radio" name="susCsound_8" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_8" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_8" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_8" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_8" value="5" required></td>' +
    "</tr>" +
    // Q9
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">9. I felt very confident using the system.</td>' +
    '<td><input type="radio" name="susCsound_9" value="1" required></td>' +
    '<td><input type="radio" name="susCsound_9" value="2" required></td>' +
    '<td><input type="radio" name="susCsound_9" value="3" required></td>' +
    '<td><input type="radio" name="susCsound_9" value="4" required></td>' +
    '<td><input type="radio" name="susCsound_9" value="5" required></td>' +
    "</tr>" +
    // Q10
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">10. I needed to learn a lot of things before I could get going with this system.</td>' +
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
    '<button id="submit-sus1" type="submit" form="sus-csound">Submit &rarr;</button>' +
    "</div>" +
    "</div>" +
    "</div>",
});

// =========================================================================
// Task 1: Read litePlay code and describe it
// =========================================================================
const lpTask1_Desc = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>Task #1: Reading litePlay code</h3>" +
    '<div class="task-wrapper">' +
    "<p>Below you'll see a snippet of <i>litePlay.js</i> code. Read it attentively.</p>" +
    '<textarea id="liteplay-preview-task1" readonly="readonly" class="textarea-code">' +
    'arpeggio({howLoud: .5, howLong: 1, onSomething: steelAcousticGuitar}, [C4, E4, G4], 1, "forward").play()' +
    "</textarea>" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p>Now that you've read the code, describe in a few words what sound you believe it does when executed:</p>" +
    '<form id="form-liteplay-task1-desc">' +
    '<textarea name="liteplay_data_task1_description" id="liteplay-answer-task1-desc" class="textarea-code" required></textarea>' +
    "</form>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task1-desc" type="submit" form="form-liteplay-task1-desc">Continue &rarr;</button>' +
    "</div>",
  events: {
    "click button#btn-submit-liteplay-task1-desc": function (event) {
      startLP(event, "lpLoad()");
    },
  },
});

// =========================================================================
// Task 1: Self-evaluation of litePlay code description correctness
// =========================================================================
const lpTask1_Eval = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center; padding-bottom: 40px;">' +
    "<h3>Task #1: Reading litePlay code</h3>" +
    // Code area (Execution target)
    '<div class="task-wrapper">' +
    '<p>Now listen to the sound the code produces by clicking on "Run".</p>' +
    '<textarea id="liteplay-execution-task1" readonly="readonly" class="textarea-code">' +
    'arpeggio({howLoud: .5, howLong: 1, onSomething: steelAcousticGuitar}, [C4, E4, G4], 1, "forward").play()' +
    "</textarea>" +
    '<div style="text-align: center; margin-top: 10px;">' +
    '<button id="btn-liteplay-run-task1" class="button-run">▶ Run</button>\n' +
    '<button id="btn-liteplay-stop-task1" class="button-stop">■ Stop</button>\n' +
    "</div>" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p><b>Is the resulting sound what you expected it to be?</b></p>" +
    '<form id="form-liteplay-task1-eval">' +
    '<input type="radio" id="liteplay-radio-task1-yes" name="liteplay_data_task1_correctness" value="2" required>' +
    '<label for="liteplay-radio-task1-yes">Yes, exactly.</label>&nbsp;&nbsp;' +
    '<input type="radio" id="liteplay-radio-task1-partly" name="liteplay_data_task1_correctness" value="1" required>' +
    '<label for="liteplay-radio-task1-partly">Partly.</label>&nbsp;&nbsp;' +
    '<input type="radio" id="liteplay-radio-task1-no" name="liteplay_data_task1_correctness" value="0" required>' +
    '<label for="liteplay-radio-task1-no">No, not at all.</label></br>' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "In a scale from 1 to 7, how hard was it to complete this task?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Very Easy</b></span>' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task1_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Very Hard</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task1-eval" type="submit" form="form-liteplay-task1-eval">Continue &rarr;</button>' +
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
// Task 2: Modify litePlay code
// =========================================================================
const lpTask2_Modify = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>Task #2: Modifying litePlay.js code</h3>" +
    '<div class="task-wrapper">' +
    "<p>The following code snippet performs the following operations:<br>" +
    "<b>1.</b> Calculate when a new note should start (every 0.25 seconds).<br>" +
    "<b>2.</b> Set how long the note will sound.<br>" +
    "<b>3.</b> Pick a random MIDI pitch between 48 (C3) and 84 (C6).<br>" +
    '<b>4.</b> Schedule the "plucked" instrument using our variables.<br>' +
    "<b>5.</b> Move to the next note.<br>" +
    "Read it attentively and execute it as many times needed to understand its functionality.</p>" +
    // PREVIEW AREA
    '<textarea id="liteplay-preview-task2" readonly="readonly" class="textarea-code">' +
    "ostinato({what: midPitch, howLoud: .5, howLong: .25, onSomething: steelAcousticGuitar}, 16).play()" +
    "</textarea>" +
    '<div style="text-align: center; margin-top: 10px;">' +
    '<button id="btn-liteplay-run-preview2" class="button-run">▶ Run</button>\n' +
    '<button id="btn-liteplay-stop-preview2" class="button-stop">■ Stop</button>\n' +
    "</div>" +
    "</div>" +
    '<div class="task-wrapper">' +
    "<p>Now, modify the code so that:<br>" +
    "<b>1.</b> The notes are played in the high register.<br>" +
    "<b>2.</b> Only 8 notes are played.<br>" +
    "<b>3.</b> The duration of each note is doubled.<br><br>" +
    "When finished, click to continue.</p>" +
    // EDITOR FORM
    '<form id="form-liteplay-task2-modify">' +
    '<textarea name="liteplay_data_task2_modification" id="liteplay-editor-task2" class="textarea-code" required>' +
    "ostinato({what: midPitch, howLoud: .5, howLong: .25, onSomething: steelAcousticGuitar}, 16).play()" +
    "</textarea>" +
    "</form>" +
    '<div style="text-align: center; margin-top: 10px;">' +
    '<button id="btn-liteplay-run-task2" class="button-run">▶ Run</button>\n' +
    '<button id="btn-liteplay-stop-task2" class="button-stop">■ Stop</button>\n' +
    "</div>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task2" type="submit" form="form-liteplay-task2-modify">Continue &rarr;</button>' +
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
// Task 2: Self-evaluation of litePlay modification correctness
// =========================================================================
const lpTask2_Eval = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>Task #2: Modifying litePlay.js code</h3>" +
    '<div class="task-wrapper">' +
    '<form id="form-liteplay-task2-eval">' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "In a scale from 1 to 7, how hard was it to complete this task?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Very Easy</b></span>' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task2_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Very Hard</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task2-eval" type="submit" form="form-liteplay-task2-eval">Continue &rarr;</button>' +
    "</div>",
});

// =========================================================================
// Task 3: Creating with litePlay
// =========================================================================
const lpTask3_Create = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>Task #3: Creating with litePlay.js</h3>" +
    '<div class="task-wrapper">' +
    "<p>Now, we'll like to see how you would modify the same code from the last two tasks to create something different, with comlete freedom:</p>" +
    '<form id="form-liteplay-task3-create">' +
    '<textarea name="liteplay_data_task3_modification" id="liteplay-editor-task3" class="textarea-code" required>' +
    'let a = arpeggio({howLoud: .5, howLong: 1, onSomething: steelAcousticGuitar}, [C4, E4, G4], 1, "forward").play();\n' +
    "let b = ostinato({what: midPitch, howLoud: .5, when: a, howLong: .25, onSomething: steelAcousticGuitar}, 16).play()" +
    "</textarea>" +
    "</form>" +
    '<div style="text-align: center; margin-top: 10px;">' +
    '<button id="btn-liteplay-run-task3" class="button-run">▶ Run</button>\n' +
    '<button id="btn-liteplay-stop-task3" class="button-stop">■ Stop</button>\n' +
    "</div>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task3" type="submit" form="form-liteplay-task3-create">Continue &rarr;</button>' +
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
// Task 3: Self-evaluation of litePlay creativity
// =========================================================================
const lpTask3_Eval = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>Task #3: Creating with litePlay.js</h3>" +
    '<div class="task-wrapper">' +
    '<form id="form-liteplay-task3-eval">' +
    '<table style="width: 100%;">' +
    "<tr>" +
    '<td class="font-weight-bold" style="text-align: left; padding-bottom: 10px;">' +
    "In a scale from 1 to 7, how hard was it to complete this task?" +
    "</td>" +
    "</tr>" +
    "<tr>" +
    '<td style="text-align: left;">' +
    '<span style="margin-right: 10px;"><b>Very Easy</b></span>' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="1" required> 1</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="2" required> 2</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="3" required> 3</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="4" required> 4</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="5" required> 5</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="6" required> 6</label>&nbsp;&nbsp;' +
    '<label><input type="radio" name="liteplay_data_task3_difficulty" value="7" required> 7</label>' +
    '<span style="margin-left: 10px;"><b>Very Hard</b></span>' +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</form>" +
    "</div>" +
    '<button id="btn-submit-liteplay-task3-eval" type="submit" form="form-liteplay-task3-eval">Continue &rarr;</button>' +
    "</div>",
});

// =========================================================================
// litePlay.js SUS
// =========================================================================
const lpSUS = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: center;">' +
    "<h3>litePlay.js System Evaluation</h3>" +
    '<div style="width: 80%; max-width: 900px; margin: 0 auto; text-align: left;">' +
    "<p>Please indicate how strongly you agree or disagree with the following statements regarding the system you just used.</p>" +
    '<form id="sus-lp">' +
    '<table style="width: 100%; border-collapse: separate; border-spacing: 0 15px; text-align: center;">' +
    "<thead>" +
    "<tr>" +
    '<th style="text-align: left; width: 50%;">Statement</th>' +
    "<th>1<br><small>Strongly<br>Disagree</small></th>" +
    "<th>2</th>" +
    "<th>3</th>" +
    "<th>4</th>" +
    "<th>5<br><small>Strongly<br>Agree</small></th>" +
    "</tr>" +
    "</thead>" +
    "<tbody>" +
    // Q1
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">1. I think that I would like to use this system frequently.</td>' +
    '<td><input type="radio" name="suslp_1" value="1" required></td>' +
    '<td><input type="radio" name="suslp_1" value="2" required></td>' +
    '<td><input type="radio" name="suslp_1" value="3" required></td>' +
    '<td><input type="radio" name="suslp_1" value="4" required></td>' +
    '<td><input type="radio" name="suslp_1" value="5" required></td>' +
    "</tr>" +
    // Q2
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">2. I found the system unnecessarily complex.</td>' +
    '<td><input type="radio" name="suslp_2" value="1" required></td>' +
    '<td><input type="radio" name="suslp_2" value="2" required></td>' +
    '<td><input type="radio" name="suslp_2" value="3" required></td>' +
    '<td><input type="radio" name="suslp_2" value="4" required></td>' +
    '<td><input type="radio" name="suslp_2" value="5" required></td>' +
    "</tr>" +
    // Q3
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">3. I thought the system was easy to use.</td>' +
    '<td><input type="radio" name="suslp_3" value="1" required></td>' +
    '<td><input type="radio" name="suslp_3" value="2" required></td>' +
    '<td><input type="radio" name="suslp_3" value="3" required></td>' +
    '<td><input type="radio" name="suslp_3" value="4" required></td>' +
    '<td><input type="radio" name="suslp_3" value="5" required></td>' +
    "</tr>" +
    // Q4
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">4. I think that I would need the support of a technical person to be able to use this system.</td>' +
    '<td><input type="radio" name="suslp_4" value="1" required></td>' +
    '<td><input type="radio" name="suslp_4" value="2" required></td>' +
    '<td><input type="radio" name="suslp_4" value="3" required></td>' +
    '<td><input type="radio" name="suslp_4" value="4" required></td>' +
    '<td><input type="radio" name="suslp_4" value="5" required></td>' +
    "</tr>" +
    // Q5
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">5. I found the various functions in this system were well integrated.</td>' +
    '<td><input type="radio" name="suslp_5" value="1" required></td>' +
    '<td><input type="radio" name="suslp_5" value="2" required></td>' +
    '<td><input type="radio" name="suslp_5" value="3" required></td>' +
    '<td><input type="radio" name="suslp_5" value="4" required></td>' +
    '<td><input type="radio" name="suslp_5" value="5" required></td>' +
    "</tr>" +
    // Q6
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">6. I thought there was too much inconsistency in this system.</td>' +
    '<td><input type="radio" name="suslp_6" value="1" required></td>' +
    '<td><input type="radio" name="suslp_6" value="2" required></td>' +
    '<td><input type="radio" name="suslp_6" value="3" required></td>' +
    '<td><input type="radio" name="suslp_6" value="4" required></td>' +
    '<td><input type="radio" name="suslp_6" value="5" required></td>' +
    "</tr>" +
    // Q7
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">7. I would imagine that most people would learn to use this system very quickly.</td>' +
    '<td><input type="radio" name="suslp_7" value="1" required></td>' +
    '<td><input type="radio" name="suslp_7" value="2" required></td>' +
    '<td><input type="radio" name="suslp_7" value="3" required></td>' +
    '<td><input type="radio" name="suslp_7" value="4" required></td>' +
    '<td><input type="radio" name="suslp_7" value="5" required></td>' +
    "</tr>" +
    // Q8
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">8. I found the system very cumbersome to use.</td>' +
    '<td><input type="radio" name="suslp_8" value="1" required></td>' +
    '<td><input type="radio" name="suslp_8" value="2" required></td>' +
    '<td><input type="radio" name="suslp_8" value="3" required></td>' +
    '<td><input type="radio" name="suslp_8" value="4" required></td>' +
    '<td><input type="radio" name="suslp_8" value="5" required></td>' +
    "</tr>" +
    // Q9
    '<tr style="background-color: #f9f9f9;">' +
    '<td style="text-align: left; padding: 10px;">9. I felt very confident using the system.</td>' +
    '<td><input type="radio" name="suslp_9" value="1" required></td>' +
    '<td><input type="radio" name="suslp_9" value="2" required></td>' +
    '<td><input type="radio" name="suslp_9" value="3" required></td>' +
    '<td><input type="radio" name="suslp_9" value="4" required></td>' +
    '<td><input type="radio" name="suslp_9" value="5" required></td>' +
    "</tr>" +
    // Q10
    "<tr>" +
    '<td style="text-align: left; padding: 10px;">10. I needed to learn a lot of things before I could get going with this system.</td>' +
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
    '<button id="submit-sus2" type="submit" form="sus-lp">Submit &rarr;</button>' +
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
    '<h2 class="text-center">Please tell us about yourself</h2>' +
    '<p class="text-center">Before the study can start, we would like to learn a bit more about you. </p>' +
    "" +
    '<form id="goldmsi">' +
    "      <table>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I spend a lot of my free time doing music-related activities." +
    "</td>" +
    "<td>" +
    '<select name="gold1" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I sometimes choose music that can trigger shivers down my spine. " +
    "</td>" +
    "<td>" +
    '<select name="gold2" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I enjoy writing about music, for example on blogs and forums." +
    "</td>" +
    "<td>" +
    '<select name="gold3" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "If somebody starts singing a song I don't know, I can usually join in." +
    "</td>" +
    "<td>" +
    '<select name="gold4" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I am able to judge whether someone is a good singer or not." +
    "</td>" +
    "<td>" +
    '<select name="gold5" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I usually know when I'm hearing a song for the first time." +
    "</td>" +
    "<td>" +
    '<select name="gold6" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I can sing or play music from memory." +
    "</td>" +
    "<td>" +
    '<select name="gold7" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I'm intrigued by musical styles I'm not familiar with and want to find out more." +
    "</td>" +
    "<td>" +
    '<select name="gold8" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Pieces of music rarely evoke emotions for me." +
    "</td>" +
    "<td>" +
    '<select name="gold9" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I find it difficult to spot mistakes in a performance of a song even if I know the tune." +
    "</td>" +
    "<td>" +
    '<select name="gold11" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I can compare and discuss differences between two performances or versions of the same piece of music." +
    "</td>" +
    "<td>" +
    '<select name="gold12" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I have trouble recognizing a familiar song when played in a different way or by a different performer." +
    "</td>" +
    "<td>" +
    '<select name="gold13" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I have never been complimented for my talents as a musical performer." +
    "</td>" +
    "<td>" +
    '<select name="gold14" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I often read or search the internet for things related to music." +
    "</td>" +
    "<td>" +
    '<select name="gold15" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I often pick certain music to motivate or excite me. " +
    "</td>" +
    "<td>" +
    '<select name="gold16" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I am not able to sing in harmony when somebody is singing a familiar tune. " +
    "</td>" +
    "<td>" +
    '<select name="gold17" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I can tell when people sing or play out of time with the beat." +
    "</td>" +
    "<td>" +
    '<select name="gold18" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I am able to identify what is special about a given musical piece." +
    "</td>" +
    "<td>" +
    '<select name="gold19" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I am able to talk about the emotions that a piece of music evokes for me." +
    "</td>" +
    "<td>" +
    '<select name="gold20" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I don't spend much of my disposable income on music." +
    "</td>" +
    "<td>" +
    '<select name="gold21" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I can tell when people sing or play out of tune." +
    "</td>" +
    "<td>" +
    '<select name="gold22" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "When I sing, I have no idea whether I'm in tune or not." +
    "</td>" +
    "<td>" +
    '<select name="gold23" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Music is kind of an addiction for me - I couldn't live without it." +
    "</td>" +
    "<td>" +
    '<select name="gold24" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I don’t like singing in public because I’m afraid that I would sing wrong notes." +
    "</td>" +
    "<td>" +
    '<select name="gold25" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "When I hear a music I can usually identify its genre." +
    "</td>" +
    "<td>" +
    '<select name="gold26" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I would not consider myself a musician." +
    "</td>" +
    "<td>" +
    '<select name="gold27" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I keep track of new of music that I come across (e.g. new artists or recordings)." +
    "</td>" +
    "<td>" +
    '<select name="gold28" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "After hearing a new song two or three times, I can usually sing it by myself." +
    "</td>" +
    "<td>" +
    '<select name="gold29" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I only need to hear a new tune once and I can sing it back hours later." +
    "</td>" +
    "<td>" +
    '<select name="gold30" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "Music can evoke my memories of past people and places." +
    "</td>" +
    "<td>" +
    '<select name="gold31" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">Completely disagree</option>' +
    '<option value="1">Strongly disagree</option>' +
    '<option value="2">Disagree</option>' +
    '<option value="3">Neither agree or disagree</option>' +
    '<option value="4">Agree</option>' +
    '<option value="5">Strongly agree</option>' +
    '<option value="6">Completely agree</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I engaged in regular, daily practice of a musical instrument (including voice) for ___ years. " +
    "</td>" +
    "<td>" +
    '<select name="gold32" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">1</option>' +
    '<option value="2">2</option>' +
    '<option value="3">3</option>' +
    '<option value="4">4-5</option>' +
    '<option value="5">6-9</option>' +
    '<option value="6">10 or more</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "At the peak of my interest, I practiced ___ hours per day on my primary instrument." +
    "</td>" +
    "<td>" +
    '<select name="gold33" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">0.5</option>' +
    '<option value="2">1</option>' +
    '<option value="3">1.5</option>' +
    '<option value="4">2</option>' +
    '<option value="5">3-4</option>' +
    '<option value="6">5 or more</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I have attended _ live music events as an audience member in the past twelve months." +
    "</td>" +
    "<td>" +
    '<select name="gold34" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">1</option>' +
    '<option value="2">2</option>' +
    '<option value="3">3</option>' +
    '<option value="4">4-6</option>' +
    '<option value="5">7-10</option>' +
    '<option value="6">11 or more</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I have had formal training in music theory for __ years" +
    "</td>" +
    "<td>" +
    '<select name="gold35" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">0.5</option>' +
    '<option value="2">1</option>' +
    '<option value="3">2</option>' +
    '<option value="4">3</option>' +
    '<option value="5">4-6</option>' +
    '<option value="6">7 or more</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I have had __ years of formal training on a musical instrument (including voice) during my lifetime. " +
    "</td>" +
    "<td>" +
    '<select name="gold36" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">0.5</option>' +
    '<option value="2">1</option>' +
    '<option value="3">2</option>' +
    '<option value="4">3-5</option>' +
    '<option value="5">6-9</option>' +
    '<option value="6">10 or more</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I can play ___ musical instruments" +
    "</td>" +
    "<td>" +
    '<select name="gold37" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">0</option>' +
    '<option value="1">1</option>' +
    '<option value="2">2</option>' +
    '<option value="3">3</option>' +
    '<option value="4">4</option>' +
    '<option value="5">5</option>' +
    '<option value="6">6 or more</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "I listen attentively to music for __ per day." +
    "</td>" +
    "<td>" +
    '<select name="gold38" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">0-15 min</option>' +
    '<option value="1">15-30 min</option>' +
    '<option value="2">30-60 min</option>' +
    '<option value="3">60-90 min</option>' +
    '<option value="4">2hrs</option>' +
    '<option value="5">2-3hrs</option>' +
    '<option value="6">4hrs or more</option>' +
    "</select>" +
    "</td>" +
    "</tr>" +
    '<tr style="height: 100px">' +
    '<td class="font-weight-bold">' +
    "The instrument I play best (including voice) is ____" +
    "</td>" +
    "<td>" +
    '<select name="gold39" required class="w-100">' +
    '<option value="" selected>' +
    "-- Please click to select --" +
    "</option>" +
    '<option value="0">NA</option>' +
    '<option value="1">voice</option>' +
    '<option value="2">piano</option>' +
    '<option value="3">guitar</option>' +
    '<option value="4">drums</option>' +
    '<option value="5">xylophone</option>' +
    '<option value="6">flute</option>' +
    '<option value="7">oboe</option>' +
    '<option value="8">clarinet</option>' +
    '<option value="9">bassoon</option>' +
    '<option value="10">trumpet</option>' +
    '<option value="11">trombone</option>' +
    '<option value="12">tuba</option>' +
    '<option value="13">saxophone</option>' +
    '<option value="14">horn</option>' +
    '<option value="15">violin</option>' +
    '<option value="16">cello</option>' +
    '<option value="17">alto</option>' +
    '<option value="18">double bass</option>' +
    '<option value="19">harp</option>' +
    '<option value="20">other</option>' +
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
    '<button id="submit-gold" type="submit" form="goldmsi">Finish test.</button>' +
    "</div>" +
    "</div>",
});

const thankYouScreen = new lab.html.Form({
  content:
    '<div style="width: 100%; text-align: left; max-width: 800px; margin: 0 auto; padding: 10px;">' +
    '<h3 style="text-align: center; margin-bottom: 30px;">Thank You!</h3>' +
    '<div class="task-wrapper" style="margin-bottom: 25px;">' +
    "<p>Your responses have been successfully recorded.</p>" +
    "<p>We greatly appreciate your time and participation in this research study.</p>" +
    "<p>Please click the button below to finalize your session and export your data. Once the file downloads, you may safely close this browser window.</p>" +
    "</div>" +
    '<div style="margin-top: 35px; text-align: center;">' +
    '<button id="btn-finish-experiment" type="submit">Complete Study & Save Data</button>' +
    "</div>" +
    "</div>",
  events: {
    "click button#btn-finish-experiment": function (event) {
      event.preventDefault();
      this.end();
    },
  },
});

// =========================================================================
// Study logic:
// Begin screen
// Define csound block
// Define litePlay block
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
// STUDY EXECUTION & DATA TRANSMISSION (Google Sheets Backend)
// =========================================================================
const GOOGLE_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyANppfcfti7ABQrIqtbXxNjP9AcQCsu80Jb1W3zI2ufGILyFhe3cr7lRKT2VXUhQS-/exec";

study.on("end", function () {
  study.options.datastore.transmit(GOOGLE_WEB_APP_URL, {
    headers: { "Content-Type": "text/plain;charset=utf-8" },
  });
});

//study.on("end", function () {
//  study.options.datastore.download(
//    (filetype = "csv"),
//    (filename = "data_" + datetime),
//  );
//});

study.run();
