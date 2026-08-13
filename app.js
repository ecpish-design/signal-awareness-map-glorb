(() => {
  'use strict';

  const D = window.GLORB_DATA;
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modalRoot');
  const reportRoot = document.getElementById('reportRoot');
  const backBtn = document.getElementById('backBtn');
  const infoBtn = document.getElementById('infoBtn');
  const readBtn = document.getElementById('readBtn');
  const exitBtn = document.getElementById('exitBtn');
  const restartBtn = document.getElementById('restartBtn');
  const globalProgressBar = document.getElementById('globalProgressBar');

  const blankState = () => ({
    studentName: '',
    selectedPath: null,
    maps: {},
    signalSelections: {},
    recovery: { patterns: {}, helps: {} },
    pressureRatings: { sensory: {}, reminder: {}, situational: {}, relational: {} },
    reminderPresence: {},
    screen: { name: 'home', params: {} },
    history: [],
    activeFlow: [],
    activeFlowContext: null,
    wholeIndex: 0,
    customFeelingDraft: '',
    dirty: false,
    suppressUnload: false,
    infoMode: null,
    infoOpen: false,
    completed: false
  });

  let state = blankState();

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (value = '') => String(value).replace(/[&<>'"]/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[ch]));
  const lower = (s = '') => String(s).toLowerCase();
  const cap = (s = '') => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  function markDirty() {
    state.dirty = true;
  }

  window.addEventListener('beforeunload', (event) => {
    if (state.dirty && !state.suppressUnload) {
      event.preventDefault();
      event.returnValue = '';
    }
  });

  function go(name, params = {}, options = {}) {
    if (!options.replace) state.history.push(structuredClone(state.screen));
    state.screen = { name, params };
    render();
  }

  function replace(name, params = {}) {
    state.screen = { name, params };
    render();
  }

  function goBack() {
    if (!state.history.length) return;
    state.screen = state.history.pop();
    render();
  }

  function resetAll() {
    const fresh = blankState();
    state = fresh;
    modalRoot.innerHTML = '';
    reportRoot.innerHTML = '';
    render();
  }

  function toast(message) {
    const old = $('.toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3400);
  }

  function setProgress(value) {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    globalProgressBar.style.width = `${pct}%`;
  }

  function currentProgress() {
    const { name, params } = state.screen;
    if (name === 'home') return 0;
    if (name === 'glorbIntro') return 1;
    if (name === 'nameEntry') return 2;
    if (name === 'pathSelect') return 3;
    if (name === 'startWarning') return 4;
    if (name === 'feelingSelectAll' || name === 'signalSelect' || name === 'customFeeling' || name === 'customSignal') return 8;
    if (name === 'flowStep') {
      const len = Math.max(1, state.activeFlow.length);
      const local = ((params.index || 0) + 1) / len;
      if (state.selectedPath === 'whole') {
        const chunk = 14;
        return 10 + (state.wholeIndex * chunk) + local * chunk;
      }
      return 10 + local * 70;
    }
    if (name === 'recoveryStep') {
      const len = Math.max(1, state.activeFlow.length);
      return 66 + (((params.index || 0) + 1) / len) * 8;
    }
    if (name === 'pressureWelcome') return state.selectedPath === 'whole' ? 74 : 8;
    if (name === 'pressureCategoryIntro') {
      const i = params.domainIndex || 0;
      return state.selectedPath === 'whole' ? 75 + i * 5 : 10 + i * 20;
    }
    if (name === 'pressureReminderImpact') {
      const total = D.pressureDomains.reduce((n, d) => n + d.items.length, 0);
      let done = 0;
      for (let i = 0; i < params.domainIndex; i++) done += D.pressureDomains[i].items.length;
      done += params.itemIndex + 0.5;
      const local = done / total;
      return state.selectedPath === 'whole' ? 75 + local * 20 : 10 + local * 80;
    }
    if (name === 'pressureItem') {
      const total = D.pressureDomains.reduce((n, d) => n + d.items.length, 0);
      let done = 0;
      for (let i = 0; i < params.domainIndex; i++) done += D.pressureDomains[i].items.length;
      done += params.itemIndex + 1;
      const local = done / total;
      return state.selectedPath === 'whole' ? 75 + local * 20 : 10 + local * 80;
    }
    if (name === 'report') return 100;
    return 5;
  }

  function updateNav() {
    backBtn.hidden = state.screen.name === 'home' || !state.history.length;
    exitBtn.style.opacity = state.dirty ? '1' : '.65';
    setProgress(currentProgress());
  }

  function render() {
    closeSpeech();
    updateNav();
    const { name, params } = state.screen;
    const renderers = {
      home: renderHome,
      glorbIntro: renderGlorbIntro,
      nameEntry: renderNameEntry,
      pathSelect: renderPathSelect,
      startWarning: renderStartWarning,
      feelingSelectAll: renderFeelingSelectAll,
      signalSelect: renderSignalSelect,
      customFeeling: renderCustomFeeling,
      customSignal: renderCustomSignal,
      flowStep: () => renderFlowStep(params.index || 0),
      recoveryStep: () => renderFlowStep(params.index || 0, true),
      pressureWelcome: renderPressureWelcome,
      pressureCategoryIntro: () => renderPressureCategoryIntro(params.domainIndex || 0),
      pressureItem: () => renderPressureItem(params.domainIndex || 0, params.itemIndex || 0),
      pressureReminderImpact: () => renderPressureReminderImpact(params.domainIndex || 0, params.itemIndex || 0),
      report: () => renderReportPreview(params.type || 'current')
    };
    const fn = renderers[name] || renderHome;
    fn();
    requestAnimationFrame(() => app.focus({ preventScroll: true }));
  }

  function renderHome() {
    app.innerHTML = `
      <section class="screen screen-fit onboarding-screen">
        <div class="onboarding-card welcome-card">
          <p class="overline">GLORB // SIGNAL MAPPER</p>
          <h1 class="onboarding-title" id="welcomeTitle" aria-label="Let’s map your signals."></h1>
          <p class="onboarding-copy" id="welcomeCopy" aria-label="We’ll look at how different feelings show up for you, what can change them, and what helps. At the end, you’ll have your Signal Map and a guide to what helps you."></p>
          <button id="welcomeNext" class="primary-btn onboarding-next" type="button" hidden>CONTINUE →</button>
        </div>
      </section>`;

    const title = 'LET’S MAP YOUR SIGNALS.';
    const copy = 'We’ll look at how different feelings show up for you, what can change them, and what helps. At the end, you’ll have your Signal Map and a guide to what helps you.';
    const titleEl = $('#welcomeTitle', app);
    const copyEl = $('#welcomeCopy', app);
    const next = $('#welcomeNext', app);
    let cancelled = false;
    const typeInto = (el, text, speed) => new Promise((resolve) => {
      let i = 0;
      const tick = () => {
        if (cancelled) return resolve();
        el.textContent = text.slice(0, i++);
        if (i <= text.length) setTimeout(tick, speed); else resolve();
      };
      tick();
    });
    (async () => {
      await typeInto(titleEl, title, 35);
      await new Promise((r) => setTimeout(r, 180));
      await typeInto(copyEl, copy, 13);
      next.hidden = false;
      next.focus({ preventScroll: true });
      const autoAdvance = setTimeout(() => {
        if (cancelled) return;
        cancelled = true;
        $('.onboarding-card', app)?.classList.add('fade-out');
        setTimeout(() => go('glorbIntro'), 180);
      }, 1400);
      next.dataset.autoTimer = String(autoAdvance);
    })();
    next.addEventListener('click', () => {
      if (next.dataset.autoTimer) clearTimeout(Number(next.dataset.autoTimer));
      cancelled = true;
      $('.onboarding-card', app)?.classList.add('fade-out');
      setTimeout(() => go('glorbIntro'), 180);
    });
  }


  function renderGlorbIntro() {
    app.innerHTML = `
      <section class="screen screen-fit onboarding-screen">
        <div class="onboarding-card glorb-intro-card">
          <div class="glorb-intro-visual"><img src="${D.glorbAsset}" alt="Glorb" /></div>
          <div class="glorb-intro-copy">
            <p class="overline">GLORB // SIGNAL MAPPER</p>
            <h1 class="readable-display">“Humans have signals too.<br>Let’s map yours.”</h1>
            <button id="glorbNext" class="primary-btn" type="button">CONTINUE →</button>
          </div>
        </div>
      </section>`;
    $('#glorbNext', app).addEventListener('click', () => go('nameEntry'));
  }

  function renderNameEntry() {
    app.innerHTML = `
      <section class="screen screen-fit onboarding-screen">
        <div class="onboarding-card name-entry-card">
          <p class="overline">GLORB // SIGNAL MAPPER</p>
          <label class="name-label" for="studentName">WHAT SHOULD WE CALL YOU?</label>
          <input id="studentName" class="name-input name-input-large" type="text" maxlength="40" autocomplete="off" value="${esc(state.studentName)}" placeholder="Type your first name or initials" />
          <div class="button-row"><button id="nameNext" class="primary-btn" type="button">OK →</button></div>
        </div>
      </section>`;
    const input = $('#studentName', app);
    input.focus({ preventScroll: true });
    const next = () => {
      state.studentName = input.value.trim();
      if (!state.studentName) { input.focus(); return toast('Type your first name or initials first.'); }
      go('pathSelect');
    };
    $('#nameNext', app).addEventListener('click', next);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') next(); });
  }

  function renderPathSelect() {
    app.innerHTML = `
      <section class="screen">
        <div class="selection-panel paper-panel pathway-choice-panel">
          <p class="overline">CHOOSE WHAT YOU WANT TO MAP</p>
          <h1 class="readable-page-title">What would you like to do?</h1>
          <div class="path-grid" aria-label="Choose what to map">
            <button class="path-card" data-path="one" type="button">
              <div><h2>MAP ONE FEELING</h2><p>Choose one feeling and explore what it is like for you and what helps.</p><p class="time-estimate">ABOUT 5–8 MINUTES</p></div>
              <span class="start-link">CHOOSE →</span>
            </button>
            <button class="path-card" data-path="whole" type="button">
              <div><h2>MAP MY WHOLE SIGNAL SYSTEM</h2><p>Explore your Signals, what you notice, what helps and Recovery, then explore what can make things harder.</p><p class="time-estimate">ABOUT 20–30 MINUTES</p></div>
              <span class="start-link">CHOOSE →</span>
            </button>
            <button class="path-card" data-path="pressure" type="button">
              <div><h2>EXPLORE WHAT CAN MAKE THINGS HARDER</h2><p>Look at different things that may bother you and rate how much.</p><p class="time-estimate">ABOUT 8–12 MINUTES</p></div>
              <span class="start-link">CHOOSE →</span>
            </button>
          </div>
        </div>
      </section>`;
    $$('.path-card', app).forEach((btn) => btn.addEventListener('click', () => {
      state.selectedPath = btn.dataset.path;
      markDirty();
      go('startWarning');
    }));
  }

  function renderStartWarning() {
    app.innerHTML = `
      <section class="screen screen-fit onboarding-screen">
        <div class="onboarding-card warning-screen-card">
          <p class="overline">BEFORE YOU START</p>
          <h1 class="readable-display">Keep a copy before you leave.</h1>
          <div class="warning-box warning-box-large">
            Your answers are not saved after you leave this page. Before you go, <b>download, print or share your report</b> so you can keep what you have done.
            <br><br>
            If you need to leave before you finish, you can still make a report with everything you have completed so far.
          </div>
          <button id="beginPath" class="primary-btn" type="button">START →</button>
        </div>
      </section>`;
    $('#beginPath', app).addEventListener('click', startSelectedPath);
  }

  function startSelectedPath() {
    if (state.selectedPath === 'one') return go('feelingSelectAll');
    if (state.selectedPath === 'whole') {
      state.wholeIndex = 0;
      return go('signalSelect', { signal: 'low' });
    }
    return go('pressureWelcome');
  }

  function feelingButton(feeling) {
    return `<button class="feeling-card" type="button" data-feeling="${esc(feeling.id)}">
      <img src="${esc(feeling.asset)}" alt="${esc(feeling.label)}" />
      <span>${esc(feeling.label)}</span>
    </button>`;
  }

  function renderFeelingSelectAll() {
    app.innerHTML = `
      <section class="screen">
        <div class="selection-panel paper-panel">
          <p class="overline">MAP ONE FEELING</p>
          <h1 class="readable-page-title">Which feeling would you like to map today?</h1>
          <p class="body-copy">Pick one.</p>
          <div class="feeling-grid all">
            ${D.feelings.map(feelingButton).join('')}
            <button class="feeling-card other" type="button" data-feeling="other"><strong>＋</strong><span>Something else</span></button>
          </div>
        </div>
      </section>`;
    $$('.feeling-card', app).forEach((btn) => btn.addEventListener('click', () => {
      if (btn.dataset.feeling === 'other') return go('customFeeling', { source: 'one' });
      const feeling = D.feelings.find((f) => f.id === btn.dataset.feeling);
      startFeelingFlow(feeling, 'one');
    }));
  }

  function renderSignalSelect() {
    const signalId = state.screen.params.signal || ['low', 'steady', 'rising', 'overload'][state.wholeIndex] || 'low';
    const signal = D.signals[signalId];
    const options = D.feelings.filter((f) => f.signal === signalId);
    const q = signalId === 'steady'
      ? 'When things are going okay, which of these feelings do you have most often?'
      : 'Which of these feelings do you feel most often, or find hardest to deal with?';
    app.innerHTML = `
      <section class="screen signal-selection-screen">
        <div class="signal-orientation ${signal.className}">
          <div class="signal-orientation-copy"><span class="signal-pill">${signal.label}</span><p>${esc(signal.studentDescription)}</p></div>
          <div class="signal-orientation-image"><img src="${signal.overview}" alt="${signal.label} feelings" /></div>
        </div>
        <div class="selection-panel paper-panel">
          <p class="overline">PICK A FEELING</p>
          <h1 class="readable-page-title">${q}</h1>
          <p class="body-copy">Pick one.</p>
          <div class="feeling-grid">
            ${options.map(feelingButton).join('')}
            <button class="feeling-card other" type="button" data-feeling="other"><strong>＋</strong><span>Something else</span></button>
          </div>
        </div>
      </section>`;
    $$('.feeling-card', app).forEach((btn) => btn.addEventListener('click', () => {
      if (btn.dataset.feeling === 'other') return go('customFeeling', { source: 'whole', signal: signalId });
      const feeling = D.feelings.find((f) => f.id === btn.dataset.feeling);
      state.signalSelections[signalId] = feeling.id;
      startFeelingFlow(feeling, 'whole');
    }));
  }

  function renderCustomFeeling() {
    const source = state.screen.params.source || 'one';
    app.innerHTML = `
      <section class="screen screen-fit">
        <div class="transition-wrap">
          <div class="transition-card">
            <p class="overline">SOMETHING ELSE</p>
            <h1>WHAT FEELING WOULD YOU LIKE TO MAP?</h1>
            <p>Use whatever word feels right to you.</p>
            <label class="name-label" for="customFeelingInput">YOUR FEELING</label>
            <input id="customFeelingInput" class="name-input" maxlength="40" value="${esc(state.customFeelingDraft)}" placeholder="Type the feeling" />
            <div class="button-row center" style="margin-top:22px">
              <button id="customFeelingNext" class="primary-btn" type="button">NEXT →</button>
            </div>
          </div>
        </div>
      </section>`;
    const input = $('#customFeelingInput', app);
    $('#customFeelingNext', app).addEventListener('click', () => {
      const label = input.value.trim();
      if (!label) { input.focus(); return toast('Type the feeling first.'); }
      state.customFeelingDraft = label;
      if (source === 'whole') {
        const signal = state.screen.params.signal;
        const custom = makeCustomFeeling(label, signal);
        state.signalSelections[signal] = custom.id;
        startFeelingFlow(custom, 'whole');
      } else {
        go('customSignal', { label });
      }
    });
  }

  function makeCustomFeeling(label, signal) {
    return {
      id: `custom-${signal}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now()}`,
      label,
      signal,
      asset: D.signals[signal].overview,
      custom: true
    };
  }

  function renderCustomSignal() {
    const label = state.screen.params.label || state.customFeelingDraft || 'This feeling';
    app.innerHTML = `
      <section class="screen">
        <div class="selection-panel paper-panel">
          <p class="overline">ONE MORE CHOICE</p>
          <h1>WHICH SIGNAL PICTURE IS CLOSEST TO “${esc(label)}” FOR YOU?</h1>
          <p class="body-copy">There is no perfect answer. Pick the one that fits best today.</p>
          <div class="path-grid" style="grid-template-columns:repeat(4,1fr)">
            ${Object.values(D.signals).map((s) => `<button class="path-card" style="min-height:260px" data-signal="${s.id}" type="button">
              <img src="${s.overview}" alt="${s.label}" style="height:135px;object-fit:contain;background:#fff;padding:6px">
              <div><h2 style="font-size:24px">${s.label}</h2><p>${esc(s.studentDescription)}</p></div>
            </button>`).join('')}
          </div>
        </div>
      </section>`;
    $$('.path-card', app).forEach((btn) => btn.addEventListener('click', () => {
      const custom = makeCustomFeeling(label, btn.dataset.signal);
      startFeelingFlow(custom, 'one');
    }));
  }

  function ensureMap(feeling) {
    if (!state.maps[feeling.id]) {
      state.maps[feeling.id] = {
        feeling: { ...feeling },
        sections: { patterns: {}, actions: {}, broadPressure: {}, selfHelp: {}, otherHelp: {} },
        extraSelfHelp: '',
        extraOtherHelp: '',
        note: ''
      };
    }
    return state.maps[feeling.id];
  }

  function transitionStep(section, heading, copy, feeling, sub = '') {
    return { type: 'transition', section, heading, copy, sub, asset: feeling.asset, feeling };
  }

  function patternStep(section, item, feeling, index, total) {
    return {
      type: 'question', responseType: 'pattern', section, itemId: item.id,
      asset: item.asset, visual: item.visual, question: item.question(lower(feeling.label)),
      overline: `${section === 'patterns' ? 'WHAT HAPPENS FOR YOU' : 'WHAT YOU MAY WANT TO DO'} // ${index + 1} OF ${total}`,
      feeling
    };
  }

  function buildFeelingFlow(feeling) {
    const signal = feeling.signal;
    const steps = [];
    const f = lower(feeling.label);

    if (signal === 'steady') {
      const others = D.feelings.filter((x) => x.signal === 'steady' && x.id !== feeling.id).slice(0, 4);
      steps.push(transitionStep('patterns', `How do you feel when you feel ${feeling.label}?`, 'We’ll look at which other steady feelings fit you too.', feeling));
      others.forEach((other, index) => steps.push({
        type: 'question', responseType: 'pattern', section: 'patterns', itemId: `also-${other.id}`,
        asset: other.asset, visual: other.label,
        question: `When you feel ${f}, do you feel ${lower(other.label)} too?`,
        overline: `WHAT HAPPENS FOR YOU // ${index + 1} OF ${others.length}`,
        feeling
      }));
      return steps;
    }

    const items = D.happensItems[signal] || D.happensItems.rising;
    steps.push(transitionStep('patterns', `When you feel ${feeling.label}, what happens for you?`, 'We’ll look at the things you notice when you feel this way.', feeling));
    items.forEach((item, index) => steps.push(patternStep('patterns', item, feeling, index, items.length)));

    const actions = D.actionItems[signal] || [];
    steps.push(transitionStep('actions', 'What do you feel like doing?', `When you feel ${f}, you might feel like doing different things. Let’s see what happens for you.`, feeling));
    actions.forEach((item, index) => steps.push({
      type: 'question', responseType: 'pattern', section: 'actions', itemId: item.id,
      asset: item.asset, visual: item.visual, question: item.question(f),
      overline: `WHAT YOU MAY WANT TO DO // ${index + 1} OF ${actions.length}`,
      feeling
    }));

    const selfHelp = (D.selfHelpItems[signal] || []).map((n) => D.selfHelpCatalog[n]);
    steps.push(transitionStep('selfHelp', 'What helps you?', `Now we’ll look at things that might help when you feel ${f}.`, feeling));
    selfHelp.forEach((item, index) => steps.push({
      type: 'question', responseType: 'help', section: 'selfHelp', itemId: item.id,
      asset: item.asset, visual: item.visual, label: item.label,
      question: `When you feel ${f}, does ${item.verb} help you?`,
      overline: `WHAT HELPS YOU? // ${index + 1} OF ${selfHelp.length}`,
      feeling
    }));
    steps.push({
      type: 'text', section: 'extraSelfHelp',
      overline: feeling.label.toUpperCase(),
      heading: `Is there something else that helps you when you feel ${lower(feeling.label)}?`,
      helper: 'You can leave this blank if there is nothing else to add.',
      placeholder: `Type anything else that helps when you feel ${f}...`, feeling
    });

    const otherHelp = (D.otherHelpItems[signal] || []).map((n) => D.otherHelpCatalog[n]);
    steps.push(transitionStep('otherHelp', 'How can other people help?', `Now we’ll look at things another person can do that might help when you feel ${f}.`, feeling));
    otherHelp.forEach((item, index) => steps.push({
      type: 'question', responseType: 'help', section: 'otherHelp', itemId: item.id,
      asset: item.asset, visual: item.visual, label: item.label,
      question: `When you feel ${f}, does it help when someone ${item.action}?`,
      overline: `HOW OTHER PEOPLE CAN HELP // ${index + 1} OF ${otherHelp.length}`,
      feeling
    }));
    steps.push({
      type: 'text', section: 'extraOtherHelp',
      overline: feeling.label.toUpperCase(),
      heading: `Is there something else someone can do that helps when you feel ${lower(feeling.label)}?`,
      helper: 'You can leave this blank if there is nothing else to add.',
      placeholder: `Type anything else someone can do...`, feeling
    });

    steps.push({
      type: 'text', section: 'note',
      overline: feeling.label.toUpperCase(),
      heading: `When you feel ${lower(feeling.label)}, what do you want adults to know?`,
      helper: 'You can leave this blank if there is nothing to add.',
      placeholder: `Type anything you want adults to know when you feel ${f}...`, feeling,
      final: true
    });
    return steps;
  }

  function startFeelingFlow(feeling, completion) {
    ensureMap(feeling);
    state.activeFlow = buildFeelingFlow(feeling);
    state.activeFlowContext = { type: 'feeling', feelingId: feeling.id, completion };
    markDirty();
    go('flowStep', { index: 0 });
  }

  function renderFlowStep(index, recovery = false) {
    const step = state.activeFlow[index];
    if (!step) return finishActiveFlow();
    if (step.type === 'transition') return renderTransition(step, index, recovery);
    if (step.type === 'text') return renderTextStep(step, index, recovery);
    return renderQuestionStep(step, index, recovery);
  }

  function renderTransition(step, index, recovery) {
    const sectionLabels = {
      patterns: 'WHAT HAPPENS FOR YOU',
      actions: 'WHAT HAPPENS FOR YOU',
      selfHelp: 'WHAT HELPS YOU',
      otherHelp: 'HOW OTHER PEOPLE CAN HELP',
      recoveryPatterns: 'RECOVERY / RETURN',
      recoveryHelp: 'RECOVERY / RETURN'
    };
    const label = sectionLabels[step.section] || (step.heading === 'RECOVERY' ? 'RECOVERY / RETURN' : 'NEXT SECTION');
    app.innerHTML = `
      <section class="screen screen-fit">
        <div class="transition-wrap">
          <div class="transition-card transition-card-left">
            <div class="transition-copy">
              <p class="overline">${esc(label)}</p>
              <h1>${esc(step.heading)}</h1>
              <p>${esc(step.copy || '')}</p>
              <button id="transitionStart" class="primary-btn" type="button">START →</button>
            </div>
            ${step.asset ? `<div class="emotion-chip"><img src="${step.asset}" alt="${esc(step.feeling?.label || step.heading)}" /></div>` : ''}
          </div>
        </div>
      </section>`;
    $('#transitionStart', app).addEventListener('click', () => go(recovery ? 'recoveryStep' : 'flowStep', { index: index + 1 }));
  }

  function patternButtons() {
    return `
      <button class="answer-btn yes" data-answer="yes" type="button">✓ YES</button>
      <button class="answer-btn sometimes" data-answer="sometimes" type="button">△ SOMETIMES</button>
      <button class="answer-btn no" data-answer="no" type="button">✕ NO</button>
      <button class="answer-btn unknown" data-answer="unsure" type="button">? I’M NOT SURE YET</button>`;
  }

  function helpButtons() {
    return `
      <button class="answer-btn yes" data-answer="yes" type="button">✓ YES</button>
      <button class="answer-btn sometimes" data-answer="sometimes" type="button">△ SOMETIMES</button>
      <button class="answer-btn no" data-answer="no" type="button">✕ NO</button>
      <button class="answer-btn unknown" data-answer="untried" type="button">? I HAVEN’T TRIED THIS YET</button>`;
  }

  function renderQuestionStep(step, index, recovery) {
    app.innerHTML = `
      <section class="screen screen-fit question-screen">
        <div class="question-head">
          <p class="overline">${esc(step.overline || '')}</p>
          <h1 class="question-title">${esc(step.question)}</h1>
        </div>
        <div class="question-card-shell">
          <div class="visual-card">
            ${step.asset ? `<img src="${step.asset}" alt="${esc(step.visual || '')}" />` : `<div class="visual-fallback">${esc(step.visual || '')}</div>`}
          </div>
          <div class="answer-row" role="group" aria-label="Choose your answer">
            ${step.responseType === 'help' ? helpButtons() : patternButtons()}
          </div>
        </div>
      </section>`;
    $$('.answer-btn', app).forEach((btn) => btn.addEventListener('click', () => {
      saveFlowAnswer(step, btn.dataset.answer, recovery);
      btn.setAttribute('aria-pressed', 'true');
      setTimeout(() => go(recovery ? 'recoveryStep' : 'flowStep', { index: index + 1 }), 120);
    }));
  }

  function renderTextStep(step, index, recovery) {
    const context = state.activeFlowContext;
    let existing = '';
    if (recovery) existing = state.recovery[step.section] || '';
    else {
      const map = state.maps[context.feelingId];
      existing = map?.[step.section] || '';
    }
    app.innerHTML = `
      <section class="screen screen-fit">
        <div class="text-screen paper-panel">
          <p class="overline">${esc(step.overline || '')}</p>
          <h1>${esc(step.heading)}</h1>
          <p class="body-copy">${esc(step.helper || '')}</p>
          <textarea id="textAnswer" class="text-area" placeholder="${esc(step.placeholder || 'Type here...')}">${esc(existing)}</textarea>
          <div class="button-row" style="margin-top:18px">
            <button id="textNext" class="primary-btn" type="button">${step.final ? `FINISH ${esc(step.feeling?.label?.toUpperCase() || '')} →` : 'NEXT →'}</button>
            <button id="textSkip" class="secondary-btn" type="button">SKIP</button>
          </div>
        </div>
      </section>`;
    const saveAndNext = (skip = false) => {
      const value = skip ? '' : $('#textAnswer', app).value.trim();
      if (recovery) state.recovery[step.section] = value;
      else state.maps[context.feelingId][step.section] = value;
      markDirty();
      go(recovery ? 'recoveryStep' : 'flowStep', { index: index + 1 });
    };
    $('#textNext', app).addEventListener('click', () => saveAndNext(false));
    $('#textSkip', app).addEventListener('click', () => saveAndNext(true));
  }

  function saveFlowAnswer(step, answer, recovery) {
    markDirty();
    const record = {
      answer,
      label: step.label || step.visual || step.itemId,
      visual: step.visual || step.label || '',
      asset: step.asset || '',
      question: step.question || '',
      adultLabel: step.adultLabel || ''
    };
    if (recovery) {
      const target = step.section === 'recoveryHelp' ? state.recovery.helps : state.recovery.patterns;
      target[step.itemId] = record;
      return;
    }
    const map = state.maps[state.activeFlowContext.feelingId];
    map.sections[step.section][step.itemId] = record;
  }

  function finishActiveFlow() {
    const ctx = state.activeFlowContext;
    if (!ctx) return go('home');
    if (ctx.type === 'feeling') {
      if (ctx.completion === 'one') {
        state.completed = true;
        return go('report', { type: 'one' });
      }
      if (ctx.completion === 'whole') {
        if (state.wholeIndex < 3) {
          state.wholeIndex += 1;
          const nextSignal = ['low', 'steady', 'rising', 'overload'][state.wholeIndex];
          return go('signalSelect', { signal: nextSignal });
        }
        return startRecoveryFlow();
      }
    }
    if (ctx.type === 'recovery') return go('pressureWelcome', { fromWhole: true });
  }

  function startRecoveryFlow() {
    const steps = [
      { type: 'transition', heading: 'Recovery / Return', copy: 'Now we’ll look at what can happen after a really big feeling, and what can help you return.', asset: D.A(32), feeling: { label: 'Recovery', asset: D.A(32) } }
    ];
    D.recoveryPatterns.forEach((item, index) => steps.push({
      type: 'question', responseType: 'pattern', section: 'recoveryPatterns', itemId: item.id,
      asset: item.asset, visual: item.visual, question: item.question,
      overline: `RECOVERY // ${index + 1} OF ${D.recoveryPatterns.length}`
    }));
    steps.push({ type: 'transition', heading: 'What helps after a big feeling?', copy: 'Now we’ll look at things that might help while you recover.', asset: D.A(138), feeling: { label: 'Recovery', asset: D.A(138) } });
    D.recoveryHelp.forEach((item, index) => steps.push({
      type: 'question', responseType: 'help', section: 'recoveryHelp', itemId: item.id,
      asset: item.asset, visual: item.visual, label: item.label, question: item.question,
      overline: `WHAT HELPS AFTER A BIG FEELING? // ${index + 1} OF ${D.recoveryHelp.length}`
    }));
    state.activeFlow = steps;
    state.activeFlowContext = { type: 'recovery', completion: 'whole' };
    go('recoveryStep', { index: 0 });
  }

  function renderPressureWelcome() {
    app.innerHTML = `
      <section class="screen screen-fit">
        <div class="transition-wrap">
          <div class="transition-card transition-card-left pressure-welcome-card">
            <div class="transition-copy">
              <p class="overline">EXPLORE WHAT CAN MAKE THINGS HARDER</p>
              <h1>HOW MUCH DO DIFFERENT THINGS BOTHER YOU?</h1>
              <p>You’ll see one thing at a time. Choose <b>Not at all</b>, <b>A little</b>, <b>Kind of / Sometimes</b>, <b>A lot</b>, <b>A whole lot</b>, or <b>I don’t know</b>.</p>
              <p class="small-copy">For things that remind you of something upsetting, we’ll first ask whether the reminder happens for you. If it does, we’ll then ask how much that reminder bothers you.</p>
              <button id="pressureStart" class="primary-btn" type="button">START →</button>
            </div>
            <div class="emotion-chip rating-strip-chip"><img src="${D.ratingStripAsset}" alt="Rating scale from not at all to a whole lot" /></div>
          </div>
        </div>
      </section>`;
    $('#pressureStart', app).addEventListener('click', () => go('pressureCategoryIntro', { domainIndex: 0 }));
  }

  function renderPressureCategoryIntro(domainIndex) {
    const domain = D.pressureDomains[domainIndex];
    if (!domain) return finishPressureExplorer();
    app.innerHTML = `
      <section class="screen screen-fit">
        <div class="paper-panel text-screen">
          <div class="pressure-intro">
            <div class="pressure-intro-visual"><img src="${domain.overview}" alt="${esc(domain.studentTitle)}" /></div>
            <div class="pressure-intro-copy">
              <p class="overline">${domainIndex + 1} OF ${D.pressureDomains.length}</p>
              <h1>${esc(domain.studentTitle)}</h1>
              <p>${esc(domain.intro)}</p>
              <button id="domainStart" class="primary-btn" type="button">START →</button>
            </div>
          </div>
        </div>
      </section>`;
    $('#domainStart', app).addEventListener('click', () => go('pressureItem', { domainIndex, itemIndex: 0 }));
  }


  function pressureItemQuestion(domainId, itemId) {
    const questions = {
      sensory: {
        'loud-noise': 'How much do loud noises bother you?',
        'bright-lights': 'How much do bright lights bother you?',
        'strong-smells': 'How much do strong smells bother you?',
        'food-tastes-textures': 'How much do some food tastes or textures bother you?',
        'touch': 'How much does being touched bother you?',
        'crowding': 'How much does being in a crowded space bother you?',
        'hot-cold': 'How much does feeling too hot or too cold bother you?',
        'hungry': 'How much does feeling hungry bother you?',
        'tired': 'How much does feeling tired bother you?',
        'sore': 'How much does feeling sore bother you?',
        'toilet': 'How much does needing the toilet bother you?',
        'movement': 'How much does lots of movement bother you?',
        'squished': 'How much does feeling squished bother you?'
      },
      situational: {
        'plans-changing': 'How much do plans changing bother you?',
        'being-rushed': 'How much does being rushed bother you?',
        'waiting': 'How much does waiting bother you?',
        'hard-work': 'How much does hard work bother you?',
        'not-knowing-next': 'How much does not knowing what happens next bother you?',
        'too-many-instructions': 'How much do too many instructions bother you?',
        'new-place-person': 'How much does being somewhere new or meeting someone new bother you?',
        'making-mistake': 'How much does making a mistake bother you?',
        'losing': 'How much does losing bother you?',
        'being-watched': 'How much does being watched bother you?',
        'too-many-people': 'How much does having too many people around you bother you?',
        'moving-task': 'How much does moving from one task to another bother you?'
      },
      relational: {
        'left-out': 'How much does being left out bother you?',
        'teased': 'How much does being teased bother you?',
        'criticised': 'How much does being criticised bother you?',
        'ignored': 'How much does being ignored bother you?',
        'not-listened': 'How much does not being listened to bother you?',
        'too-close': 'How much does someone being too close to you bother you?',
        'arguing': 'How much does arguing bother you?',
        'taking-things': 'How much does someone taking your things bother you?',
        'told-no': 'How much does being told “no” bother you?',
        'unfair': 'How much does feeling that things are unfair bother you?',
        'angry-with-me': 'How much does someone being angry with you bother you?',
        'someone-leaving': 'How much does someone leaving bother you?'
      }
    };
    return questions[domainId]?.[itemId] || `How much does ${String(itemId || 'this').replace(/-/g, ' ')} bother you?`;
  }

  function reminderCheckQuestion(itemId) {
    const questions = {
      place: 'Does a place ever remind you of something upsetting?',
      person: 'Does a person ever remind you of something upsetting?',
      'sound-song': 'Does a sound or song ever remind you of something upsetting?',
      'smell-reminder': 'Does a smell ever remind you of something upsetting?',
      'special-date': 'Does a special date ever remind you of something upsetting?',
      'happened-before': 'Does thinking about something that happened before ever upset you?',
      object: 'Does an object ever remind you of something upsetting?',
      'yelling-reminder': 'Does hearing people yell or argue ever remind you of something upsetting?',
      'someone-leaving-reminder': 'Does someone leaving ever remind you of something upsetting?',
      'happen-again': 'Does thinking that something might happen again ever upset you?'
    };
    return questions[itemId] || 'Does this ever remind you of something upsetting?';
  }

  function renderPressureItem(domainIndex, itemIndex) {
    const domain = D.pressureDomains[domainIndex];
    const item = domain?.items[itemIndex];
    if (!domain) return finishPressureExplorer();
    if (!item) {
      if (domainIndex < D.pressureDomains.length - 1) return go('pressureCategoryIntro', { domainIndex: domainIndex + 1 });
      return finishPressureExplorer();
    }

    if (domain.id === 'reminder' && !state.reminderPresence[item.id]) {
      app.innerHTML = `
        <section class="screen screen-fit question-screen">
          <div class="question-head">
            <p class="overline">${esc(domain.studentTitle)} // ${itemIndex + 1} OF ${domain.items.length}</p>
            <h1 class="question-title">${esc(reminderCheckQuestion(item.id))}</h1>
          </div>
          <div class="question-card-shell">
            <div class="visual-card"><img src="${item.asset}" alt="${esc(item.label)}" /></div>
            <div class="answer-row" role="group" aria-label="Choose your answer">${patternButtons()}</div>
          </div>
        </section>`;
      $$('.answer-btn', app).forEach((btn) => btn.addEventListener('click', () => {
        const answer = btn.dataset.answer;
        state.reminderPresence[item.id] = answer;
        markDirty();
        if (answer === 'yes' || answer === 'sometimes') {
          return setTimeout(() => go('pressureReminderImpact', { domainIndex, itemIndex }), 120);
        }
        if (answer === 'no') {
          state.pressureRatings.reminder[item.id] = { choiceId: 'no-reminder', value: 0, studentLabel: 'No reminder identified', presenceAnswer: answer, presenceQuestion: reminderCheckQuestion(item.id) };
        } else {
          state.pressureRatings.reminder[item.id] = { choiceId: 'unknown-reminder', value: null, studentLabel: 'I’m not sure', presenceAnswer: answer, presenceQuestion: reminderCheckQuestion(item.id) };
        }
        setTimeout(() => go('pressureItem', { domainIndex, itemIndex: itemIndex + 1 }), 120);
      }));
      return;
    }

    if (domain.id === 'reminder') return go('pressureReminderImpact', { domainIndex, itemIndex }, { replace: true });

    const question = pressureItemQuestion(domain.id, item.id);
    app.innerHTML = `
      <section class="screen screen-fit question-screen">
        <div class="question-head">
          <p class="overline">${esc(domain.studentTitle)} // ${itemIndex + 1} OF ${domain.items.length}</p>
          <h1 class="question-title">${esc(question)}</h1>
        </div>
        <div class="rating-shell">
          <div class="rating-visual"><img src="${item.asset}" alt="${esc(item.label)}" /></div>
          <div class="rating-row" role="radiogroup" aria-label="${esc(question)}">
            ${D.ratingChoices.map((choice) => `<button class="rating-btn" type="button" data-choice="${choice.id}" role="radio" aria-label="${esc(choice.studentLabel)}${choice.value === null ? '' : `, ${choice.value}`}" aria-checked="false"><img src="${choice.asset}" alt="" aria-hidden="true"><span class="rating-label">${esc(choice.studentLabel)}</span></button>`).join('')}
          </div>
        </div>
      </section>`;
    $$('.rating-btn', app).forEach((btn) => btn.addEventListener('click', () => {
      const choice = D.ratingChoices.find((c) => c.id === btn.dataset.choice);
      state.pressureRatings[domain.id][item.id] = { choiceId: choice.id, value: choice.value, studentLabel: choice.studentLabel, question };
      markDirty();
      btn.setAttribute('aria-checked', 'true');
      setTimeout(() => go('pressureItem', { domainIndex, itemIndex: itemIndex + 1 }), 120);
    }));
  }


  function renderPressureReminderImpact(domainIndex, itemIndex) {
    const domain = D.pressureDomains[domainIndex];
    const item = domain?.items[itemIndex];
    if (!domain || !item) return finishPressureExplorer();
    const presence = state.reminderPresence[item.id];
    if (!(presence === 'yes' || presence === 'sometimes')) return go('pressureItem', { domainIndex, itemIndex: itemIndex + 1 }, { replace: true });
    app.innerHTML = `
      <section class="screen screen-fit question-screen">
        <div class="question-head">
          <p class="overline">${esc(domain.studentTitle)} // ${itemIndex + 1} OF ${domain.items.length}</p>
          <h1 class="question-title">How much does that reminder bother you?</h1>
        </div>
        <div class="rating-shell">
          <div class="rating-visual"><img src="${item.asset}" alt="${esc(item.label)}" /></div>
          <div class="rating-row" role="radiogroup" aria-label="How much does that reminder bother you?">
            ${D.ratingChoices.map((choice) => `<button class="rating-btn" type="button" data-choice="${choice.id}" role="radio" aria-label="${esc(choice.studentLabel)}${choice.value === null ? '' : `, ${choice.value}`}" aria-checked="false"><img src="${choice.asset}" alt="" aria-hidden="true"><span class="rating-label">${esc(choice.studentLabel)}</span></button>`).join('')}
          </div>
        </div>
      </section>`;
    $$('.rating-btn', app).forEach((btn) => btn.addEventListener('click', () => {
      const choice = D.ratingChoices.find((c) => c.id === btn.dataset.choice);
      state.pressureRatings.reminder[item.id] = {
        choiceId: choice.id,
        value: choice.value,
        studentLabel: choice.studentLabel,
        presenceAnswer: presence,
        presenceQuestion: reminderCheckQuestion(item.id),
        impactQuestion: 'How much does that reminder bother you?'
      };
      markDirty();
      btn.setAttribute('aria-checked', 'true');
      setTimeout(() => go('pressureItem', { domainIndex, itemIndex: itemIndex + 1 }), 120);
    }));
  }

  function finishPressureExplorer() {
    state.completed = true;
    go('report', { type: state.selectedPath === 'whole' ? 'whole' : 'pressure' });
  }

  function answerLabel(answer) {
    const labels = {
      yes: 'Yes', sometimes: 'Sometimes', no: 'No', unsure: 'Not sure yet', untried: 'Not tried yet'
    };
    return labels[answer] || answer;
  }

  function groupRecords(sectionObj = {}) {
    const buckets = { yes: [], sometimes: [], no: [], unsure: [], untried: [] };
    Object.values(sectionObj).forEach((record) => {
      if (buckets[record.answer]) buckets[record.answer].push(record);
    });
    return buckets;
  }

  function listText(records, empty = 'Not mapped yet') {
    if (!records?.length) return `<span class="unknown-line">${esc(empty)}</span>`;
    return records.map((r) => esc(r.label || r.visual)).join(' • ');
  }

  function allMaps() {
    return Object.values(state.maps);
  }

  function mapsBySignal() {
    const out = { low: null, steady: null, rising: null, overload: null };
    allMaps().forEach((m) => { if (m.feeling.signal && !out[m.feeling.signal]) out[m.feeling.signal] = m; });
    return out;
  }

  function severityBand(percent) {
    if (percent === null || Number.isNaN(percent)) return 'NOT ENOUGH INFORMATION YET';
    if (percent < 20) return 'MINIMAL';
    if (percent < 40) return 'LOW';
    if (percent < 60) return 'MODERATE';
    if (percent < 80) return 'HIGH';
    return 'VERY HIGH';
  }

  function ratingAdultLabel(value) {
    if (value === 0) return 'No reported impact';
    if (value === 1) return 'Low impact';
    if (value === 2) return 'Somewhat / Moderate impact';
    if (value === 3) return 'High impact';
    if (value === 4) return 'Very high impact';
    return 'Uncertain / Not enough information yet';
  }

  function pressureStats() {
    const stats = {};
    const highest = [];
    D.pressureDomains.forEach((domain) => {
      let sum = 0, numeric = 0, unknown = 0, answered = 0, reminderIdentified = 0, reminderUnsure = 0;
      const rows = [];
      domain.items.forEach((item) => {
        const response = state.pressureRatings[domain.id][item.id];
        if (!response) return rows.push({ item, response: null });
        answered++;
        if (domain.id === 'reminder') {
          if (response.presenceAnswer === 'yes' || response.presenceAnswer === 'sometimes') reminderIdentified++;
          if (response.presenceAnswer === 'unsure') reminderUnsure++;
        }
        if (response.value === null) unknown++;
        else {
          numeric++;
          sum += response.value;
          if (response.value > 0) highest.push({ domain, item, value: response.value, response });
        }
        rows.push({ item, response });
      });
      const enough = numeric >= Math.ceil(domain.items.length / 2);
      const percent = enough && numeric ? (sum / (numeric * 4)) * 100 : null;
      stats[domain.id] = { domain, sum, numeric, unknown, answered, reminderIdentified, reminderUnsure, percent, average: numeric ? sum / numeric : null, band: severityBand(percent), rows };
    });
    const valid = Object.values(stats).filter((x) => x.percent !== null);
    const overallPercent = valid.length === D.pressureDomains.length ? valid.reduce((n, x) => n + x.percent, 0) / valid.length : null;
    highest.sort((a, b) => b.value - a.value || a.item.label.localeCompare(b.item.label));
    return { stats, overallPercent, overallBand: severityBand(overallPercent), highest };
  }

  function refNumber(id) {
    return D.references.findIndex((r) => r.id === id) + 1;
  }
  function cite(id) {
    const n = refNumber(id);
    return n ? `<a href="#ref-${esc(id)}" aria-label="Go to reference ${n}">[${n}]</a>` : '';
  }

  function reportHeader(title, subtitle = '') {
    return `<p class="report-kicker">GLORB // SIGNAL MAPPER</p><h1>${esc(title)}</h1>${subtitle ? `<p class="report-subtitle">${esc(subtitle)}</p>` : ''}`;
  }

  function buildOneFeelingReport(map, partial = false) {
    const name = state.studentName || 'Student';
    const signal = D.signals[map.feeling.signal];
    return `
      <section class="report-page report-page-landscape">
        ${reportHeader(`${name}’s Signal Map`, partial ? 'Completed information so far' : 'Student-identified information')}
        <div class="single-feeling-report-head ${signal?.className || ''}">
          <img src="${map.feeling.asset}" alt="" />
          <div><div class="report-signal-label">${esc(signal?.label || 'FEELING')}</div><div class="report-feeling-large">${esc(map.feeling.label)}</div></div>
        </div>
        ${adultMapDetails(map)}
        ${reportUseNote()}
      </section>`;
  }

  function adultMapDetails(map) {
    const name = state.studentName || 'the student';
    const p = groupRecords(map.sections.patterns);
    const a = groupRecords(map.sections.actions);
    const s = groupRecords(map.sections.selfHelp);
    const o = groupRecords(map.sections.otherHelp);
    const unsure = [...p.unsure, ...a.unsure];
    const untried = [...s.untried, ...o.untried];
    const noHelp = [...s.no, ...o.no];
    return `
      <div class="pressure-summary-card detailed-map-box">
        <h3>${esc(map.feeling.label)}</h3>
        <p><b>What ${esc(name)} notices:</b> ${listText(p.yes, 'No consistent patterns identified')}</p>
        ${p.sometimes.length ? `<p><b>Sometimes:</b> ${listText(p.sometimes)}</p>` : ''}
        ${a.yes.length || a.sometimes.length ? `<p><b>What ${esc(name)} may want to do:</b> ${listText([...a.yes, ...a.sometimes])}</p>` : ''}
        ${map.feeling.signal !== 'steady' ? `<p><b>Things that help:</b> ${listText(s.yes, 'Not identified yet')}</p>
        ${s.sometimes.length ? `<p><b>Sometimes helps:</b> ${listText(s.sometimes)}</p>` : ''}
        <p><b>How other people can help:</b> ${listText(o.yes, 'Not identified yet')}</p>
        ${o.sometimes.length ? `<p><b>Sometimes helps:</b> ${listText(o.sometimes)}</p>` : ''}
        ${map.extraSelfHelp ? `<p><b>Something else that helps:</b> ${esc(map.extraSelfHelp)}</p>` : ''}
        ${map.extraOtherHelp ? `<p><b>Something else another person can do:</b> ${esc(map.extraOtherHelp)}</p>` : ''}
        ${untried.length ? `<p><b>Things not tried yet:</b> ${listText(untried)}</p>` : ''}
        ${noHelp.length ? `<p><b>${esc(cap(name))} says these do not help:</b> ${listText(noHelp)}</p>` : ''}` : ''}
        ${unsure.length ? `<p><b>Still being learned:</b> ${listText(unsure)}</p>` : ''}
        ${map.note ? `<p><b>${esc(cap(name))} says:</b> “${esc(map.note)}”</p>` : ''}
      </div>`;
  }


  function recordsForMap(map) {
    return {
      patterns: groupRecords(map?.sections?.patterns || {}),
      actions: groupRecords(map?.sections?.actions || {}),
      selfHelp: groupRecords(map?.sections?.selfHelp || {}),
      otherHelp: groupRecords(map?.sections?.otherHelp || {})
    };
  }

  function bulletList(records, empty = 'Not identified yet') {
    if (!records?.length) return `<div class="report-empty">${esc(empty)}</div>`;
    return `<ul class="report-list compact">${records.map((r) => `<li>${esc(r.label || r.visual)}</li>`).join('')}</ul>`;
  }

  function bulletListByResponse(yes = [], sometimes = [], empty = 'Not identified yet') {
    if (!yes.length && !sometimes.length) return `<div class="report-empty">${esc(empty)}</div>`;
    const yesItems = yes.map((r) => `<li>${esc(r.label || r.visual)}</li>`);
    const sometimesItems = sometimes.map((r) => `<li>${esc(r.label || r.visual)} <span class="sometimes-inline">SOMETIMES</span></li>`);
    return `<ul class="report-list compact">${[...yesItems, ...sometimesItems].join('')}</ul>`;
  }

  function signalColumn(id, map) {
    const sig = D.signals[id];
    if (!map) return `<div class="signal-column ${id}"><div class="signal-column-head"><div class="report-signal-label">${sig.label}</div><div class="report-feeling-large small">Not mapped yet</div></div><div class="signal-column-body"><div class="report-empty">No information completed yet.</div></div></div>`;
    const r = recordsForMap(map);
    const steady = id === 'steady';
    return `<div class="signal-column ${id}">
      <div class="signal-column-head"><div class="report-signal-label">${sig.label}</div><div class="report-feeling-large small">${esc(map.feeling.label)}</div></div>
      <div class="signal-column-body">
        <h3>STUDENT-IDENTIFIED SIGNS</h3>${bulletListByResponse(r.patterns.yes, r.patterns.sometimes)}
        ${r.actions.yes.length || r.actions.sometimes.length ? `<h3>MAY WANT TO</h3>${bulletListByResponse(r.actions.yes, r.actions.sometimes)}` : ''}
        ${!steady ? `<h3>HELPS ME</h3>${bulletListByResponse(r.selfHelp.yes, r.selfHelp.sometimes)}
        <h3>OTHER PEOPLE CAN HELP BY</h3>${bulletListByResponse(r.otherHelp.yes, r.otherHelp.sometimes)}` : ''}
      </div>
    </div>`;
  }

  function recoveryColumn() {
    const p = groupRecords(state.recovery.patterns);
    const h = groupRecords(state.recovery.helps);
    return `<div class="signal-column recovery">
      <div class="signal-column-head"><div class="report-signal-label">RECOVERY / RETURN</div><div class="report-feeling-large small">After a big feeling</div></div>
      <div class="signal-column-body"><h3>MAY LOOK / FEEL LIKE</h3>${bulletListByResponse(p.yes, p.sometimes)}<h3>HELPS RECOVERY</h3>${bulletListByResponse(h.yes, h.sometimes)}</div>
    </div>`;
  }

  function buildDetailedColumnsPage() {
    const name = state.studentName || 'Student';
    const bySignal = mapsBySignal();
    return `<section class="report-page report-page-landscape">
      ${reportHeader(`${name}’s Detailed Signal Map`, 'Student-identified information organised by Signal')}
      <div class="signal-columns five">${['low','steady','rising','overload'].map((id) => signalColumn(id, bySignal[id])).join('')}${recoveryColumn()}</div>
    </section>`;
  }

  function buildSignalSystemGuidePage() {
    const name = state.studentName || 'Student';
    return `<section class="report-page report-page-landscape">
      ${reportHeader(`For Adults: How to Read ${name}’s Signal Map`, 'Student-identified information organised for everyday use')}
      <div class="framework-report-box">
        <div class="framework-report-copy"><h2>WHAT IS THE SIGNAL SYSTEM?</h2><p>The Signal System is a student-friendly way to describe changes in energy, attention, tension, thinking, communication and available capacity across the day. It is not a diagnosis, a score or a ranking of behaviour. A student can move between Signals.</p><p><b>Steady does not mean silent, still or perfectly calm.</b> This map records what ${esc(name)} identified for themselves.</p></div>
        <div class="framework-report-image"><img src="${D.combinedSignalAsset}" alt="GLORB Signal System" /></div>
      </div>
      <div class="signal-definition-grid">
        ${['low','steady','rising','overload'].map((id) => `<div class="signal-definition ${id}"><h3>${D.signals[id].label}</h3><p>${esc(D.signals[id].adultDescription)}</p></div>`).join('')}
      </div>
      <div class="report-note"><b>Early response matters.</b><p>Rising Signal is a useful point to notice early changes and use the things ${esc(name)} has identified as helpful before things become much harder. AERO guidance likewise emphasises recognising early change and responding according to the student’s current needs ${cite('aero')}.</p></div>
      ${reportUseNote()}
    </section>`;
  }

  function pathwayStage(id, map, recovery = false) {
    if (recovery) {
      const p = groupRecords(state.recovery.patterns); const h = groupRecords(state.recovery.helps);
      return `<div class="path-stage recovery"><h3>RECOVERY / RETURN</h3><div class="path-feeling">After a big feeling</div><h4>STUDENT IDENTIFIED</h4>${bulletListByResponse(p.yes,p.sometimes)}<h4>HELPS</h4>${bulletListByResponse(h.yes,h.sometimes)}</div>`;
    }
    const sig=D.signals[id];
    if (!map) return `<div class="path-stage ${id}"><h3>${sig.label}</h3><div class="path-feeling">Not mapped</div></div>`;
    const r=recordsForMap(map);
    return `<div class="path-stage ${id}"><h3>${sig.label}</h3><div class="path-feeling">${esc(map.feeling.label)}</div><h4>SIGNS</h4>${bulletListByResponse(r.patterns.yes,r.patterns.sometimes)}<h4>HELPS ME</h4>${bulletListByResponse(r.selfHelp.yes,r.selfHelp.sometimes)}<h4>OTHERS</h4>${bulletListByResponse(r.otherHelp.yes,r.otherHelp.sometimes)}</div>`;
  }

  function buildAdultPathwayPage() {
    const name=state.studentName || 'Student'; const bySignal=mapsBySignal();
    return `<section class="report-page report-page-landscape">
      ${reportHeader(`How ${name}’s Signals Can Build and Change`, 'Low → Rising → Overload → Recovery / Return')}
      <div class="pathway-graphic" aria-hidden="true"><svg viewBox="0 0 1000 220" preserveAspectRatio="none"><polyline points="80,175 360,135 690,35 920,165" fill="none" stroke="#10233a" stroke-width="12" stroke-linejoin="round"/><circle cx="80" cy="175" r="20" fill="#a9cbe9"/><circle cx="360" cy="135" r="20" fill="#f0bf83"/><circle cx="690" cy="35" r="20" fill="#e5aab8"/><circle cx="920" cy="165" r="20" fill="#c7c9bb"/></svg><div class="pathway-labels"><span>LOW</span><span>RISING</span><span>OVERLOAD</span><span>RECOVERY</span></div></div>
      <div class="support-path-grid">${pathwayStage('low',bySignal.low)}${pathwayStage('rising',bySignal.rising)}${pathwayStage('overload',bySignal.overload)}${pathwayStage('recovery',null,true)}</div>
    </section>`;
  }

  function buildAdultQuickGuidePage() {
    const name=state.studentName || 'Student'; const bySignal=mapsBySignal();
    const rising=bySignal.rising ? recordsForMap(bySignal.rising) : null; const overload=bySignal.overload ? recordsForMap(bySignal.overload) : null;
    const recP=groupRecords(state.recovery.patterns); const recH=groupRecords(state.recovery.helps);
    return `<section class="report-page report-page-landscape">
      ${reportHeader('Adult Quick Guide', `Use ${name}’s own identified information first`)}
      <div class="quick-guide-block"><p class="report-kicker">EARLY RESPONSE</p><h2>EARLY SUPPORT MATTERS MOST AT RISING SIGNAL</h2><div class="quick-guide-grid"><div><h3>EARLY SIGNS</h3>${rising?bulletListByResponse(rising.patterns.yes,rising.patterns.sometimes):bulletList([])}</div><div><h3>WHAT HELPS ${esc(name.toUpperCase())}</h3>${rising?bulletListByResponse(rising.selfHelp.yes,rising.selfHelp.sometimes):bulletList([])}</div><div><h3>WHAT OTHER PEOPLE CAN DO</h3>${rising?bulletListByResponse(rising.otherHelp.yes,rising.otherHelp.sometimes):bulletList([])}</div></div></div>
      <div class="quick-guide-block"><h2>IF THE SIGNAL REACHES OVERLOAD</h2><p><b>Support first. Reflection later.</b></p><div class="quick-guide-grid"><div><h3>HELPS SELF</h3>${overload?bulletListByResponse(overload.selfHelp.yes,overload.selfHelp.sometimes):bulletList([])}</div><div><h3>OTHERS CAN HELP BY</h3>${overload?bulletListByResponse(overload.otherHelp.yes,overload.otherHelp.sometimes):bulletList([])}</div><div><h3>RECOVERY / RETURN</h3>${bulletListByResponse([...recP.yes,...recH.yes],[...recP.sometimes,...recH.sometimes])}</div></div></div>
    </section>`;
  }

  function buildWholeStudentPages() {
    const name = state.studentName || 'Student';
    const bySignal = mapsBySignal();
    return `<section class="report-page report-page-landscape student-report-page">
      ${reportHeader(`${name}’s Signal Map`, 'My map')}
      <div class="student-signal-visual"><img src="${D.combinedSignalAsset}" alt="GLORB Signal System" /></div>
      <div class="signal-columns five student-columns">${['low','steady','rising','overload'].map((id) => signalColumn(id, bySignal[id])).join('')}${recoveryColumn()}</div>
    </section>`;
  }

  function buildRecoveryPages() {
    const name = state.studentName || 'Student';
    const patterns = groupRecords(state.recovery.patterns);
    const helps = groupRecords(state.recovery.helps);
    if (![...Object.keys(state.recovery.patterns), ...Object.keys(state.recovery.helps)].length) return '';
    return `<section class="report-page">
      ${reportHeader('Recovery / Return', `What ${name} identified after a big feeling starts to pass`)}
      <div class="signal-report-card recovery" style="min-height:auto"><h3>WHAT I MAY NOTICE AFTERWARDS</h3>${bulletListByResponse(patterns.yes,patterns.sometimes)}<h3>WHAT MAY HELP</h3>${bulletListByResponse(helps.yes,helps.sometimes)}${helps.untried.length?`<h3>NOT TRIED YET</h3>${bulletList(helps.untried)}`:''}</div>
    </section>`;
  }

  function buildPressureStudentPage() {
    const name = state.studentName || 'Student';
    const calc = pressureStats();
    const top = calc.highest.filter((x) => x.value >= 2).slice(0, 10);
    return `<section class="report-page student-report-page">
      ${reportHeader(`What Can Make Things Harder for ${name}`, 'What I said bothers me')}
      ${top.length ? `<div class="student-pressure-grid">${top.map((x) => `<div class="student-pressure-card"><img src="${x.item.asset}" alt=""><div><b>${esc(x.item.label)}</b><p>${esc(x.response.studentLabel)}</p></div></div>`).join('')}</div>` : '<p class="report-empty">Nothing was rated Kind of / Sometimes or higher.</p>'}
    </section>`;
  }

  function buildPressureAdultPages() {
    const name = state.studentName || 'the student';
    const calc = pressureStats();
    const categoryCards = D.pressureDomains.map((domain) => {
      const st = calc.stats[domain.id];
      const pct = st.percent === null ? null : Math.round(st.percent);
      const reminderExtra = domain.id === 'reminder' ? `<p>${st.reminderIdentified || 0} reminder cue${(st.reminderIdentified||0)===1?'':'s'} identified • ${st.reminderUnsure || 0} first-step “not sure”</p>` : '';
      return `<div class="pressure-summary-card"><h3><span>${esc(domain.adultTitle)}</span><span class="impact-pill">${pct === null ? 'NOT ENOUGH INFORMATION YET' : `${pct}% — ${st.band}`}</span></h3>${pct !== null ? `<div class="severity-meter"><b>Student-rated severity</b><div class="severity-track"><span style="width:${pct}%"></span></div><b>${pct}%</b></div><p>Average rating: ${st.average.toFixed(2)} / 4 • ${st.numeric} of ${domain.items.length} items included numerically${st.unknown ? ` • ${st.unknown} uncertain` : ''}</p>` : `<p>Fewer than half of the items in this area have a usable numerical value, so a percentage is not shown.</p>`}${reminderExtra}<p>${esc(domain.adultMeaning || '')}</p></div>`;
    }).join('');
    const overall = calc.overallPercent === null ? null : Math.round(calc.overallPercent);
    return `<section class="report-page">
      ${reportHeader('Identified Pressures on Regulation', `Adult summary of ${name === 'the student' ? 'the student’s' : `${name}’s`} ratings`)}
      <p>The percentages below summarise how strongly ${esc(name)} reported being bothered by the items presented in each area. “I don’t know” and first-step uncertainty are recorded separately rather than treated as “Not at all”.</p>
      ${overall === null ? `<div class="overall-severity"><b>Overall:</b> Not enough information yet to calculate an overall percentage across all four areas.</div>` : `<div class="overall-severity"><b>Overall student-rated severity:</b> ${overall}% — ${calc.overallBand}. Each of the four areas contributes equally to this overall percentage.</div>`}
      <div class="pressure-grid-two">${categoryCards}</div>
      <div class="report-note"><b>How to interpret this</b><p>The percentages are descriptive summaries created from the student’s own ratings. They are not standardised scores and do not identify or rule out a health, developmental or psychological condition.</p></div>
    </section>
    <section class="report-page">
      ${reportHeader('Highest-Rated Items')}
      ${calc.highest.length ? `<table class="report-table"><thead><tr><th>Area</th><th>Item</th><th>Student rating</th></tr></thead><tbody>${calc.highest.slice(0,18).map((x) => `<tr><td>${esc(x.domain.adultTitle)}</td><td>${esc(x.item.label)}</td><td>${esc(x.response.studentLabel)}${x.value===null?'':` — ${x.value}/4`}</td></tr>`).join('')}</tbody></table>` : '<p>No numerical ratings have been entered yet.</p>'}
    </section>
    ${D.pressureDomains.map((domain) => { const st=calc.stats[domain.id]; return `<section class="report-page">${reportHeader(domain.adultTitle, 'Complete item-by-item responses')}<table class="report-table"><thead><tr><th>Item</th>${domain.id==='reminder'?'<th>Reminder identified?</th>':''}<th>Student rating</th><th>Organising description</th></tr></thead><tbody>${st.rows.map(({item,response}) => `<tr><td>${esc(item.label)}</td>${domain.id==='reminder'?`<td>${esc(response?.presenceAnswer ? answerLabel(response.presenceAnswer) : 'Not asked yet')}</td>`:''}<td>${response?esc(response.studentLabel):'Not mapped yet'}</td><td>${esc(item.adultDescriptor)}</td></tr>`).join('')}</tbody></table></section>`; }).join('')}`;
  }

  function buildWholeAdultPages() {
    const bySignal = mapsBySignal();
    const pages = [buildSignalSystemGuidePage(), buildDetailedColumnsPage()];
    if (bySignal.low || bySignal.rising || bySignal.overload || Object.keys(state.recovery.patterns).length) pages.push(buildAdultPathwayPage());
    if (bySignal.rising || bySignal.overload) pages.push(buildAdultQuickGuidePage());
    return pages.join('');
  }

  function reportUseNote() {
    return `<div class="report-note"><b>ABOUT THIS MAP</b><p>This map reflects what the student identified for themselves at the time it was completed. It is designed to support communication and reflection, and to identify what the student can do that helps and what adults can do to help them. It is not a clinical, medical or psychological measure.</p></div>`;
  }

  function buildCurriculumAndReferencesPage() {
    return `<section class="report-page">
      ${reportHeader('About the Framework & Research', 'Adult information')}
      <h2>Curriculum links</h2>
      <p>The mapper supports learning connected with emotional awareness, reflective practice and emotional regulation in the Australian Curriculum Personal and Social Capability ${cite('acara-psc')}. ACARA’s Mental health and wellbeing curriculum connection also highlights learning about factors that influence emotions, communication, help-seeking and responding to change and challenge ${cite('acara-mh')}.</p>
      <h2>Research context</h2>
      <p>AERO guidance for schools describes changing phases of escalation and highlights recognising early changes, adjusting the environment and responding according to the student’s current needs ${cite('aero')}. The GLORB framework is not the AERO model.</p>
      <p>Research supports considering sensory and environmental factors as possible influences while recognising substantial individual variation ${cite('gomez')}. NCTSN resources describe how everyday sights, sounds and experiences can act as reminders for some children ${cite('nctsn')}.</p>
      <p><b>GLORB does not infer why a student responds in a particular way.</b> A reminder response does not mean a student has experienced trauma, and a sensory response does not indicate a particular condition.</p>
      <p><b>GLORB therefore keeps the student’s self-identified responses visible rather than replacing them with an alternate interpretation.</b></p>
      <h2>Important limits</h2>
      <p>The GLORB Signal Framework is a communication framework created for this resource. Its Signal categories and percentage bands are not published research cut-offs. The 0–4 bother ratings are ordinal responses: the points have a meaningful order, but the distance between points should not be treated as an exact scientific interval. GLORB does not measure physiological processes.</p>
      <h2>References</h2><ol class="report-reference-list">${D.references.map((r) => `<li id="ref-${esc(r.id)}">${esc(r.apa)} <a href="${esc(r.url)}">${esc(r.url)}</a></li>`).join('')}</ol>
    </section>`;
  }

  function getThingsThatHelpCards() {
    const cards = [];
    allMaps().forEach((map) => {
      const signal = map.feeling.signal;
      if (signal === 'steady') return;
      ['selfHelp','otherHelp'].forEach((section) => {
        Object.values(map.sections[section] || {}).forEach((record) => {
          if (record.answer === 'yes' || record.answer === 'sometimes') cards.push({ signal, label: record.label, asset: record.asset, sometimes: record.answer === 'sometimes', feeling: map.feeling.label });
        });
      });
      if (map.extraSelfHelp) cards.push({ signal, label: map.extraSelfHelp, asset: '', sometimes: false, feeling: map.feeling.label });
      if (map.extraOtherHelp) cards.push({ signal, label: map.extraOtherHelp, asset: '', sometimes: false, feeling: map.feeling.label });
    });
    Object.values(state.recovery.helps || {}).forEach((record) => {
      if (record.answer === 'yes' || record.answer === 'sometimes') cards.push({ signal: 'recovery', label: record.label, asset: record.asset, sometimes: record.answer === 'sometimes', feeling: 'Recovery / Return' });
    });
    const seen = new Set();
    return cards.filter((c) => { const key=`${c.signal}|${c.label}|${c.sometimes}`; if(seen.has(key)) return false; seen.add(key); return true; });
  }

  function buildHelpCardsPages() {
    const cards = getThingsThatHelpCards();
    const name = state.studentName || 'Student';
    if (!cards.length) return `<section class="report-page">${reportHeader(`Things That Help ${name} Cards`, 'Printable cards')}<div class="report-note"><b>NO CARDS YET</b><p>No “helps” were mapped in the completed sections, so there are no printable cards in this copy.</p></div></section>`;
    const chunks=[]; for(let i=0;i<cards.length;i+=8) chunks.push(cards.slice(i,i+8));
    return chunks.map((chunk,index)=>`<section class="report-page">${reportHeader(`Things That Help ${name} Cards`, chunks.length>1?`Printable cards — page ${index+1} of ${chunks.length}`:'Printable cards')}<p>Cut along the dotted lines. Signal names are printed as well as colour-coded so the cards do not rely on colour alone.</p><div class="report-card-sheet">${chunk.map((c)=>`<div class="cut-card ${c.signal}"><div class="card-signal">${esc(c.signal==='recovery'?'RECOVERY / RETURN':D.signals[c.signal]?.label||'')} • ${esc(c.feeling)}</div>${c.asset?`<img src="${c.asset}" alt="">`:'<div class="text-card-space"></div>'}<div><div class="card-text">${esc(c.label)}</div>${c.sometimes?'<div class="sometimes-tag">SOMETIMES HELPS</div>':''}</div></div>`).join('')}</div></section>`).join('');
  }


  function hasPressureAnswers() {
    return D.pressureDomains.some((d) => Object.keys(state.pressureRatings[d.id] || {}).length);
  }

  function wrapReport(pages, orientation = 'portrait') {
    return `<div class="report-document ${orientation === 'landscape' ? 'landscape' : 'portrait'}">${pages}</div>`;
  }

  function buildFullReportHtml(type = 'current') {
    const maps=allMaps(); const hasPressure=hasPressureAnswers(); const partial=type==='partial'||!state.completed;
    let pages='';
    if (partial) pages += `<section class="report-page">${reportHeader('Current Signal Map', 'Completed information so far')}<div class="report-note"><b>KEEP THIS COPY</b><p>This file contains the sections completed so far. Unfinished sections have not been interpreted as “No”.</p></div></section>`;
    if (maps.length > 1 || state.selectedPath === 'whole') pages += buildWholeAdultPages();
    else if (maps.length === 1) pages += buildSignalSystemGuidePage() + buildOneFeelingReport(maps[0], partial);
    if (hasPressure) pages += buildPressureAdultPages();
    if (!maps.length && !hasPressure) pages += `<section class="report-page">${reportHeader(`${state.studentName||'Student'}’s Signal Map`, 'No questions completed yet')}<p>Return to the mapper to add some answers.</p></section>`;
    pages += buildCurriculumAndReferencesPage();
    return wrapReport(pages,'landscape');
  }

  function buildStudentReportHtml(type = 'current') {
    const maps=allMaps(); const hasPressure=hasPressureAnswers(); let pages='';
    if (maps.length > 1 || state.selectedPath==='whole') pages += buildWholeStudentPages();
    else if (maps.length===1) {
      const map=maps[0]; const signal=D.signals[map.feeling.signal]; const r=recordsForMap(map);
      pages += `<section class="report-page student-report-page">${reportHeader(`${state.studentName||'My'}’s Signal Map`, 'My map')}<div class="single-feeling-report-head ${signal.className}"><img src="${map.feeling.asset}" alt=""><div><div class="report-signal-label">${signal.label}</div><div class="report-feeling-large">${esc(map.feeling.label)}</div></div></div><div class="student-detail-grid"><div><h2>WHAT I NOTICE</h2>${bulletListByResponse(r.patterns.yes,r.patterns.sometimes)}</div>${map.feeling.signal!=='steady'?`<div><h2>WHAT I MIGHT FEEL LIKE DOING</h2>${bulletListByResponse(r.actions.yes,r.actions.sometimes)}</div><div><h2>THINGS THAT HELP ME</h2>${bulletListByResponse(r.selfHelp.yes,r.selfHelp.sometimes)}</div><div><h2>THINGS OTHER PEOPLE CAN DO TO HELP ME</h2>${bulletListByResponse(r.otherHelp.yes,r.otherHelp.sometimes)}</div>`:''}</div>${map.note?`<div class="report-note"><b>I ALSO SAID</b><p>${esc(map.note)}</p></div>`:''}</section>`;
    }
    if (Object.keys(state.recovery.patterns).length || Object.keys(state.recovery.helps).length) pages += buildRecoveryPages();
    if (hasPressure) pages += buildPressureStudentPage();
    if (!pages) pages=`<section class="report-page">${reportHeader('My Signal Map','Nothing mapped yet')}<p>Come back after you have answered some questions.</p></section>`;
    return wrapReport(pages,'landscape');
  }

  function answerTableRows(records={}) {
    return Object.values(records).map((r)=>`<tr><td>${esc(r.question||r.label||r.visual)}</td><td>${esc(answerLabel(r.answer))}</td></tr>`).join('');
  }

  function buildAnswersReportHtml(type = 'current') {
    const name=state.studentName||'Student'; let pages='';
    allMaps().forEach((map)=>{
      const sections=[['What happens for you',map.sections.patterns],['What you may want to do',map.sections.actions],['Things that help',map.sections.selfHelp],['How other people can help',map.sections.otherHelp]];
      pages += `<section class="report-page">${reportHeader(`${name}’s Answers — ${map.feeling.label}`, `${D.signals[map.feeling.signal]?.label||''} • Responses shown as entered`)}${sections.map(([title,recs])=>Object.keys(recs||{}).length?`<h2>${esc(title)}</h2><table class="report-table"><thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>${answerTableRows(recs)}</tbody></table>`:'').join('')}${map.extraSelfHelp?`<h2>Something else that helps</h2><p>${esc(map.extraSelfHelp)}</p>`:''}${map.extraOtherHelp?`<h2>Something else another person can do</h2><p>${esc(map.extraOtherHelp)}</p>`:''}${map.note?`<h2>What I want adults to know</h2><p>${esc(map.note)}</p>`:''}</section>`;
    });
    if (Object.keys(state.recovery.patterns).length || Object.keys(state.recovery.helps).length) pages += `<section class="report-page">${reportHeader(`${name}’s Answers — Recovery / Return`,'Responses shown as entered')}<h2>Recovery</h2><table class="report-table"><thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>${answerTableRows(state.recovery.patterns)}${answerTableRows(state.recovery.helps)}</tbody></table></section>`;
    if (hasPressureAnswers()) D.pressureDomains.forEach((domain)=>{
      pages += `<section class="report-page">${reportHeader(`${name}’s Answers — ${domain.studentTitle}`,'Responses shown as entered')}<table class="report-table"><thead><tr><th>Question asked</th><th>Answer</th></tr></thead><tbody>${domain.items.map((item)=>{
        const r=state.pressureRatings[domain.id][item.id];
        if (!r) {
          const q=domain.id==='reminder'?reminderCheckQuestion(item.id):pressureItemQuestion(domain.id,item.id);
          return `<tr><td>${esc(q)}</td><td>Not answered</td></tr>`;
        }
        if (domain.id==='reminder') {
          const first=`<tr><td>${esc(r.presenceQuestion||reminderCheckQuestion(item.id))}</td><td>${esc(r.presenceAnswer?answerLabel(r.presenceAnswer):'Not answered')}</td></tr>`;
          const second=(r.presenceAnswer==='yes'||r.presenceAnswer==='sometimes')?`<tr><td>${esc(r.impactQuestion||'How much does that reminder bother you?')}</td><td>${esc(r.studentLabel||'Not answered')}</td></tr>`:'';
          return first+second;
        }
        return `<tr><td>${esc(r.question||pressureItemQuestion(domain.id,item.id))}</td><td>${esc(r.studentLabel||'Not answered')}</td></tr>`;
      }).join('')}</tbody></table></section>`;
    });
    if (!pages) pages=`<section class="report-page">${reportHeader(`${name}’s Answers`,'No responses completed yet')}</section>`;
    return wrapReport(pages,'portrait');
  }

  function buildAdultGuideHtml() {
    const pages=`<section class="report-page">${reportHeader('Read This First', 'GLORB // Signal Mapper information')}<div class="framework-report-box"><div class="framework-report-copy"><h2>FOR STUDENTS</h2><p>This mapper helps you show what different feelings are like for you, what you notice, what helps and what other people can do that helps. There are no right answers. Your answers are about you.</p><h2>WHAT HAPPENS TO YOUR ANSWERS?</h2><p>Your answers are kept only while the page is open. If you want to keep them, download, print or share before leaving.</p></div><div class="framework-report-image"><img src="${D.combinedSignalAsset}" alt="GLORB Signal System"></div></div><div class="report-note"><b>WHAT IS THIS FOR?</b><p>The map can make a student’s own experience easier to notice, explain and communicate. It gives students and people working with them a tool to start conversations about what they experience and what helps.</p></div></section>`+
    buildSignalSystemGuidePage()+
    `<section class="report-page">${reportHeader('How the “What Can Make Things Harder” Ratings Work','Adult information')}<p>Sensory, situational and relational items use a 0–4 student-facing rating from Not at all to A whole lot. “I don’t know” is kept separately.</p><p>Reminder-related items use two steps: first, whether a cue reminds the student of something upsetting; then, when it does, how much that reminder bothers them. The response record keeps both answers.</p><div class="math-box">Area percentage = sum of numerical values ÷ (number of numerical values × 4) × 100</div><p>Where all four areas have enough information, the overall percentage is the average of the four area percentages, so each area contributes equally.</p><div class="disclaimer"><b>IMPORTANT:</b> These percentages and display bands are descriptive summaries created by GLORB. They are not standardised results. GLORB does not infer why a student responds in a particular way and does not measure physiological processes.</div>${reportUseNote()}</section>`+
    buildCurriculumAndReferencesPage();
    return wrapReport(pages,'portrait');
  }

  function buildCardsReportHtml() { return wrapReport(buildHelpCardsPages(),'portrait'); }

  function buildReportHtml(type = 'current') {
    return buildFullReportHtml(type);
  }

  function renderReportPreview(type) {
    const html = buildFullReportHtml(type);
    app.innerHTML = `<div class="report-preview-wrap"><div class="report-actions"><button id="reportBack" class="secondary-btn" type="button">← BACK TO MAP</button><button id="downloadZip" class="primary-btn" type="button">DOWNLOAD ZIP</button><button id="printPdf" class="secondary-btn" type="button">PRINT FULL REPORT</button><button id="sharePdf" class="secondary-btn" type="button">SHARE FULL REPORT</button></div>${html}</div>`;
    $('#reportBack', app).addEventListener('click', goBack);
    $('#downloadZip', app).addEventListener('click', () => downloadZip(type));
    $('#printPdf', app).addEventListener('click', () => printReport(type));
    $('#sharePdf', app).addEventListener('click', () => shareReport(type));
  }

  function filename(kind = 'full') {
    const display = (state.studentName || 'Student').trim() || 'Student';
    const safe = display.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'Student';
    const names = { full: `01_${safe}_Full_Signal_Report.pdf`, cards: `02_Things_That_Help_${safe}_Cards.pdf`, answers: `03_${safe}_My_Answers.pdf`, student: `04_${safe}_My_Signal_Map.pdf`, guide: `00_READ_ME_Adult_Guide.pdf`, zip: `${safe}_Signal_Map.zip` };
    return names[kind] || names.full;
  }

  async function waitForImages(root) {
    const images = [...root.querySelectorAll('img')];
    await Promise.all(images.map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    })));
  }

  async function makePdfBlob(type = 'current', kind = 'full') {
    if (!window.html2pdf) throw new Error('PDF library is unavailable');
    const configs = {
      full: { html: buildFullReportHtml(type), orientation: 'landscape' },
      cards: { html: buildCardsReportHtml(), orientation: 'portrait' },
      answers: { html: buildAnswersReportHtml(type), orientation: 'portrait' },
      student: { html: buildStudentReportHtml(type), orientation: 'landscape' },
      guide: { html: buildAdultGuideHtml(), orientation: 'landscape' }
    };
    const cfg=configs[kind]||configs.full;
    reportRoot.style.width = cfg.orientation === 'landscape' ? '277mm' : '190mm';
    reportRoot.innerHTML = cfg.html;
    await waitForImages(reportRoot);
    if (document.fonts?.ready) await document.fonts.ready;
    const element = $('.report-document', reportRoot);
    const opt = { margin:[6,6,6,6], filename:filename(kind), image:{type:'jpeg',quality:.98}, html2canvas:{scale:2,useCORS:true,backgroundColor:'#f6efe3',scrollY:0}, jsPDF:{unit:'mm',format:'a4',orientation:cfg.orientation}, pagebreak:{mode:['css','legacy'],avoid:['.signal-column','.pressure-summary-card','.cut-card','.quick-guide-grid>div']}, enableLinks:true };
    return await window.html2pdf().set(opt).from(element).toPdf().outputPdf('blob');
  }

  async function downloadPdf(type = 'current') {
    try { toast('Making the full report…'); const blob=await makePdfBlob(type,'full'); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename('full'); document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),3000); }
    catch(error){ console.error(error); toast('PDF download is unavailable right now. Use Print instead.'); }
  }


  async function downloadZip(type = 'current') {
    if (!window.JSZip) return toast('ZIP download is unavailable right now.');
    try {
      toast('Making your Signal Map files…');
      const zip = new JSZip();
      const files = [
        ['guide', filename('guide')], ['full', filename('full')], ['cards', filename('cards')], ['answers', filename('answers')], ['student', filename('student')]
      ];
      for (const [kind, name] of files) {
        const blob = await makePdfBlob(type, kind);
        zip.file(name, blob);
      }
      const out = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const url=URL.createObjectURL(out); const a=document.createElement('a'); a.href=url; a.download=filename('zip'); document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),5000);
      toast('Your ZIP is ready.');
    } catch(error) { console.error(error); toast('The ZIP could not be created. Try printing or sharing the full report.'); }
  }

  function printReport(type = 'current') {
    reportRoot.style.width='277mm';
    reportRoot.innerHTML = buildFullReportHtml(type);
    document.body.classList.add('printing-landscape');
    waitForImages(reportRoot).then(() => setTimeout(() => { window.print(); setTimeout(()=>document.body.classList.remove('printing-landscape'),400); }, 80));
  }

  async function shareReport(type = 'current') {
    try {
      const blob = await makePdfBlob(type,'full');
      const file = new File([blob], filename('full'), { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ title: `${state.studentName || 'Student'}’s GLORB Signal Map`, files: [file] });
      else toast('This device cannot share the PDF directly. Download the ZIP or print the full report instead.');
    } catch (error) { if (error?.name !== 'AbortError') { console.error(error); toast('Sharing is unavailable right now. Download the ZIP instead.'); } }
  }

  function openInfo() {
    state.infoOpen = true;
    state.infoMode = null;
    renderInfoModal();
  }

  function closeInfo() {
    state.infoOpen = false;
    state.infoMode = null;
    modalRoot.innerHTML = '';
  }

  function renderInfoModal() {
    const content = state.infoMode === 'student' ? studentInfoHtml() : state.infoMode === 'adult' ? adultInfoHtml() : infoChoiceHtml();
    modalRoot.innerHTML = `<div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="More information">
      <div class="modal-card">
        <div class="modal-head"><h2>MORE INFORMATION</h2><button id="closeInfo" class="close-btn" type="button" aria-label="Close more information">✕</button></div>
        <div class="modal-body">${content}</div>
      </div>
    </div>`;
    $('#closeInfo', modalRoot).addEventListener('click', closeInfo);
    $('.modal-backdrop', modalRoot).addEventListener('click', (e) => { if (e.target.classList.contains('modal-backdrop')) closeInfo(); });
    $$('.info-mode-btn', modalRoot).forEach((btn) => btn.addEventListener('click', () => { state.infoMode = btn.dataset.mode; renderInfoModal(); }));
    const chooser = $('#infoChooser', modalRoot);
    if (chooser) chooser.focus();
  }

  function infoChoiceHtml() {
    return `<p class="overline">CHOOSE WHAT YOU WANT TO READ</p>
      <h1 class="readable-page-title" style="margin-bottom:22px">Who is this information for?</h1>
      <div class="info-choice">
        <button id="infoChooser" class="info-mode-btn" data-mode="student" type="button"><h3>FOR STUDENTS</h3><p>What this is, why you are doing it, what happens to your answers, and how the bother scale works.</p></button>
        <button class="info-mode-btn" data-mode="adult" type="button"><h3>FOR ADULTS</h3><p>Framework rationale, mathematical method, interpretation rules, research, limits, data information and full references.</p></button>
      </div>`;
  }

  function studentInfoHtml() {
    return `<div class="button-row" style="margin-bottom:18px"><button class="secondary-btn info-mode-btn" data-mode="adult" type="button">VIEW FOR ADULTS →</button></div>
      <section class="info-section"><h2>WHAT IS THIS?</h2><p>GLORB // SIGNAL MAPPER is a way to show what different feelings are like for you. You can map one feeling, map your whole Signal System, or look at things that can make things harder.</p><p>There are no right answers. Your answers are about <b>you</b>.</p></section>
      <section class="info-section"><h2>WHY AM I DOING IT?</h2><p>Your map can make it easier to explain what you notice, what helps you, what another person can do that helps, and things that can make things harder.</p><p>You can share your report with someone you trust if you want to.</p></section>
      <section class="info-section"><h2>WHAT HAPPENS TO MY ANSWERS?</h2><p>Your answers are kept only while this page is open. They are not saved by the Signal Mapper after you leave.</p><p>If you want to keep your map, <b>download, print or share your report before you leave the page.</b></p></section>
      <section class="info-section"><h2>WHAT DO THE BOTHER RATINGS MEAN?</h2><p>You will see one thing at a time. Pick the answer that is closest to how much it bothers you.</p>
        <div class="info-scale"><div>0<br>NOT AT ALL</div><div>1<br>A LITTLE</div><div>2<br>KIND OF / SOMETIMES</div><div>3<br>A LOT</div><div>4<br>A WHOLE LOT</div><div>I DON’T KNOW</div></div>
        <p><b>I don’t know is always okay.</b> It is kept separately and does not count as “Not at all”.</p></section>`;
  }

  function adultInfoHtml() {
    return `<div class="button-row" style="margin-bottom:18px"><button class="secondary-btn info-mode-btn" data-mode="student" type="button">← VIEW FOR STUDENTS</button></div>
      <section class="info-section"><h2>WHAT IS THE SIGNAL MAPPER?</h2>
        <p>GLORB // SIGNAL MAPPER is a student-led communication and reflection tool. It helps a student describe feelings they notice, what happens for them, what they may want to do, what helps, what another person can do that helps, and what Recovery can look like.</p>
        <p><b>The student is describing their own experience.</b> The mapper does not decide what the student is feeling or why.</p>
        <p>Its educational rationale is consistent with Australian Curriculum learning in emotional awareness, reflective practice and emotional regulation ${cite('acara-psc')}, and with curriculum learning about factors that influence emotions, communication and help-seeking ${cite('acara-mh')}.</p>
      </section>
      <section class="info-section"><h2>WHAT CAN THIS MAP HELP WITH?</h2>
        <p>The map can make a student’s own experience easier to notice, explain and communicate. It gives students and people working with them a tool to start conversations about what they experience and what helps.</p>
        <p>It may help show what the student notices early, what they can do that helps, what other people can do to help them, and what Recovery or return can look like for that student.</p>
        <p>The map is one perspective: the student’s. It is intended to sit alongside conversation, observation and knowledge of the student across settings.</p>
      </section>
      <section class="info-section"><h2>WHAT IS THE GLORB SIGNAL FRAMEWORK?</h2>
        <p>The framework is a visual way of talking about changes in energy, attention, tension, thinking, communication and available capacity.</p>
        <div class="framework-info-visual"><div><ul><li><b>Low Signal:</b> things may feel lower, slower, heavier or harder to start.</li><li><b>Steady Signal:</b> the student currently has enough capacity for what is happening. Steady does not mean silent, still or perfectly calm.</li><li><b>Rising Signal:</b> the student may notice early changes in their body, thoughts, feelings or behaviour. Early help can be useful here.</li><li><b>Signal Overload:</b> the feeling may be very strong and thinking, talking, listening or flexible responding may become harder.</li><li><b>Recovery / Return:</b> the student may need time before they feel ready to fully return.</li></ul></div><img src="${D.combinedSignalAsset}" alt="GLORB Signal System visual" /></div>
        <div class="disclaimer">The Signal categories are a GLORB communication framework. They are not published scientific categories and should not be treated as fixed labels. GLORB does not measure physiological processes.</div>
        <p>AERO guidance for schools separately describes changing phases of escalation and emphasises recognising early changes, adjusting the environment and responding according to the student’s current needs ${cite('aero')}. The GLORB framework is not the AERO model.</p>
      </section>
      <section class="info-section"><h2>WHY IS IT DESIGNED THIS WAY?</h2>
        <p>Feelings can involve body sensations, thinking, communication, actions and what a person needs from other people. GLORB separates these pieces and shows one clear question at a time so the student does not have to hold several tasks in mind at once.</p>
        <p>W3C cognitive-accessibility guidance recommends clear, recognisable controls and easy-to-understand instructions ${cite('w3c-controls')}. WCAG 2.2 also includes requirements for usable pointer targets ${cite('wcag22')}. The interface therefore uses large buttons, consistent placement and no drag-only interactions.</p>
      </section>
      <section class="info-section"><h2>WHAT DOES “WHAT CAN MAKE THINGS HARDER” DO?</h2>
        <p>This part looks at individual experiences one at a time. Sensory, situational and relational items ask how much the specific item bothers the student. Reminder-related items first ask whether something reminds the student of something upsetting; when it does, the student then rates how much that reminder bothers them.</p>
        <ol><li><b>Things around me → Sensory pressures:</b> sounds, lights, smells, tastes/textures, touch, movement, temperature, crowding and internal body feelings.</li><li><b>Things that remind me → Reminder-related pressures:</b> cues the student identifies as reminding them of something upsetting.</li><li><b>Situations I find hard → Situational pressures:</b> changes, waiting, being rushed, difficult work, uncertainty, many instructions, mistakes, being watched and transitions.</li><li><b>Things other people do → Relational pressures:</b> exclusion, teasing, criticism, being ignored, feeling unheard, personal space, conflict, belongings, limits, unfairness, another person’s anger and separation.</li></ol>
        <div class="disclaimer">These four groups are an organising system used by GLORB. They are not four universal psychological types.</div>
        <p>Research supports considering sensory/environmental input as one possible influence on children’s regulation, while also showing substantial individual variation and limits in the evidence ${cite('gomez')}. NCTSN resources also describe how everyday sights, sounds and experiences can act as reminders for some children ${cite('nctsn')}.</p>
        <p><b>GLORB does not infer why a student responds in a particular way. A reminder response does not mean a student has experienced trauma, and a sensory response does not indicate a particular condition.</b></p>
        <p><b>GLORB is a tool for recording and communicating what a student self-identifies about their own experience.</b></p>
      </section>
      <section class="info-section"><h2>HOW DOES THE RATING SYSTEM WORK?</h2>
        <p>The student sees:</p>
        <div class="info-scale"><div>0<br>NOT AT ALL</div><div>1<br>A LITTLE</div><div>2<br>KIND OF / SOMETIMES</div><div>3<br>A LOT</div><div>4<br>A WHOLE LOT</div><div>I DON’T KNOW</div></div>
        <p>Behind the scenes the numeric answers are stored as 0, 1, 2, 3 and 4. “I don’t know” is stored separately.</p>
        <table class="report-table"><thead><tr><th>Student sees</th><th>Stored value</th><th>Adult interpretation</th></tr></thead><tbody>
          <tr><td>Not at all</td><td>0</td><td>No reported impact</td></tr><tr><td>A little</td><td>1</td><td>Low impact</td></tr><tr><td>Kind of / Sometimes</td><td>2</td><td>Somewhat / Moderate impact</td></tr><tr><td>A lot</td><td>3</td><td>High impact</td></tr><tr><td>A whole lot</td><td>4</td><td>Very high impact</td></tr><tr><td>I don’t know</td><td>—</td><td>Uncertain / not enough information yet</td></tr>
        </tbody></table>
        <p>For reminder-related items, a first-step <b>No</b> records that no upsetting reminder was identified for that cue and contributes zero to the reminder-area summary. <b>I’m not sure yet</b> is kept separately. When the student answers Yes or Sometimes, their second-step 0–4 impact rating is used. Both answers remain visible in the response record.</p>
        <p>ABS guidance describes rating scales as ordinal data: response options have a meaningful order, but the interval between points should not automatically be treated as an exact scientific distance. ABS also recommends labelling all rating points and keeping “don’t know” separate when appropriate ${cite('abs-rating')}.</p>
      </section>
      <section class="info-section"><h2>HOW ARE THE PERCENTAGES CALCULATED?</h2>
        <p>For each of the four areas:</p><div class="math-box">sum of numerical ratings ÷ (number of numerical ratings × 4) × 100</div>
        <p>“I don’t know” and reminder responses marked “I’m not sure yet” are excluded from the numerator and denominator. They are reported separately.</p>
        <p>If fewer than half of the items in one area receive a numerical value, GLORB shows <b>Not enough information yet</b> instead of a percentage.</p>
        <p>Where all four areas have enough information, the overall percentage is the average of the four area percentages so each area contributes equally:</p><div class="math-box">(Sensory % + Reminder % + Situational % + Relational %) ÷ 4</div>
        <h3>DISPLAY BANDS</h3><p>0–19% Minimal • 20–39% Low • 40–59% Moderate • 60–79% High • 80–100% Very high.</p>
        <div class="disclaimer">These bands are GLORB display bands. They are not published research cut-offs or standardised results.</div>
      </section>
      <section class="info-section"><h2>THE STUDENT’S VOICE COMES FIRST</h2>
        <p>The mapper records what the student says fits them. It does not independently decide whether an answer is “correct”. Adults may notice different things, and a student may respond differently in different settings.</p>
        <p>Research on child and adolescent reporting shows that perspectives from young people, parents and teachers can differ in meaningful ways across contexts ${cite('de-los-reyes')}. <b>GLORB therefore keeps the student’s self-identified responses visible rather than replacing them with an alternate interpretation.</b></p>
      </section>
      <section class="info-section"><h2>IMPORTANT LIMITS</h2>
        <div class="disclaimer"><b>THIS IS NOT A CLINICAL, MEDICAL OR PSYCHOLOGICAL MEASURE.</b><br>GLORB // SIGNAL MAPPER has not been validated as a health measure. It should not be used to identify, confirm or rule out a health, developmental or psychological condition. Its percentages and display bands are descriptive summaries created by this resource.</div>
        <p>A student’s responses reflect what they identify at the time they complete the map and may be different on another day or in another setting. Use the map alongside conversation with the student, observation, family knowledge, professional judgement, existing school information and relevant school procedures.</p>
      </section>
      <section class="info-section"><h2>WHY DOESN’T IT SAVE MY ANSWERS?</h2>
        <p>The mapper is intentionally designed not to keep a permanent copy of student response content. This reduces the amount of personal student information the website needs to collect or hold.</p>
        <p>Instead, the student or adult chooses whether to keep a copy by downloading, printing or sharing the generated files before leaving.</p>
      </section>
      <section class="info-section"><h2>WHAT HAPPENS TO STUDENT ANSWERS?</h2>
        <p>The Signal Mapper keeps answers in the page’s working memory only. This build does not use local storage, cookies or a student account to keep response content. Refreshing, starting over, closing the tab or leaving the page removes the current in-page answers.</p>
        <p>That is why the interface repeatedly tells users to download, print or share before leaving.</p>
        <p>Generated PDFs are created in the browser. The website host and third-party files used to deliver the webpage may still receive ordinary technical web requests. The GLORB code does not place the student’s response content in the webpage URL.</p>
      </section>
      <section class="info-section references"><h2>REFERENCES & FURTHER READING</h2>
        <ol>${D.references.map((r) => `<li id="ref-${esc(r.id)}"><b>${esc(r.apa)}</b><br><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.url)}</a></li>`).join('')}</ol>
      </section>`;
  }

  function openExitModal() {
    const hasAnything = state.dirty;
    modalRoot.innerHTML = `<div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Print, share and exit">
      <div class="modal-card" style="max-width:780px">
        <div class="modal-head"><h2>BEFORE YOU LEAVE</h2><button id="closeExit" class="close-btn" type="button">✕</button></div>
        <div class="modal-body"><h1 style="font-size:48px;line-height:1;margin-bottom:16px">YOUR ANSWERS WILL BE LOST WHEN YOU LEAVE THIS PAGE.</h1>
          <p class="body-copy">Make a report first if you want to keep what you have done so far.</p>
          <div class="confirm-actions">
            <button id="exitView" class="primary-btn" type="button">VIEW REPORT</button>
            <button id="exitDownload" class="secondary-btn" type="button">DOWNLOAD ZIP</button>
            <button id="exitPrint" class="secondary-btn" type="button">PRINT</button>
            <button id="exitShare" class="secondary-btn" type="button">SHARE REPORT</button>
            <button id="exitKeep" class="secondary-btn" type="button">KEEP WORKING</button>
          </div>
          ${!hasAnything ? '<p class="small-copy" style="margin-top:16px">Nothing has been mapped yet.</p>' : ''}
        </div>
      </div>
    </div>`;
    const close = () => modalRoot.innerHTML = '';
    $('#closeExit', modalRoot).addEventListener('click', close);
    $('#exitKeep', modalRoot).addEventListener('click', close);
    $('#exitView', modalRoot).addEventListener('click', () => { close(); go('report', { type: 'partial' }); });
    $('#exitDownload', modalRoot).addEventListener('click', () => downloadZip('partial'));
    $('#exitPrint', modalRoot).addEventListener('click', () => printReport('partial'));
    $('#exitShare', modalRoot).addEventListener('click', () => shareReport('partial'));
  }

  function openRestartModal() {
    modalRoot.innerHTML = `<div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Start over">
      <div class="modal-card" style="max-width:700px">
        <div class="modal-head"><h2>START OVER?</h2><button id="closeRestart" class="close-btn" type="button">✕</button></div>
        <div class="modal-body"><h1 style="font-size:46px;line-height:1">STARTING OVER WILL ERASE YOUR ANSWERS.</h1>
          <p class="body-copy">Print, download or share your report first if you want to keep them.</p>
          <div class="confirm-actions"><button id="confirmRestart" class="primary-btn" type="button">START OVER</button><button id="cancelRestart" class="secondary-btn" type="button">KEEP WORKING</button></div>
        </div>
      </div>
    </div>`;
    $('#closeRestart', modalRoot).addEventListener('click', () => modalRoot.innerHTML = '');
    $('#cancelRestart', modalRoot).addEventListener('click', () => modalRoot.innerHTML = '');
    $('#confirmRestart', modalRoot).addEventListener('click', resetAll);
  }

  function closeSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function readCurrent() {
    if (!('speechSynthesis' in window)) return toast('Read aloud is not available in this browser.');
    window.speechSynthesis.cancel();
    const source = state.infoOpen ? $('.modal-body', modalRoot) : app;
    if (!source) return;
    const text = source.innerText.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-AU';
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  }

  backBtn.addEventListener('click', goBack);
  infoBtn.addEventListener('click', openInfo);
  readBtn.addEventListener('click', readCurrent);
  exitBtn.addEventListener('click', openExitModal);
  restartBtn.addEventListener('click', () => state.dirty ? openRestartModal() : resetAll());

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (state.infoOpen) closeInfo();
      else if (modalRoot.innerHTML) modalRoot.innerHTML = '';
    }
  });

  render();
})();
