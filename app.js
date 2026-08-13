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
      feelingSelectAll: renderFeelingSelectAll,
      signalSelect: renderSignalSelect,
      customFeeling: renderCustomFeeling,
      customSignal: renderCustomSignal,
      flowStep: () => renderFlowStep(params.index || 0),
      recoveryStep: () => renderFlowStep(params.index || 0, true),
      pressureWelcome: renderPressureWelcome,
      pressureCategoryIntro: () => renderPressureCategoryIntro(params.domainIndex || 0),
      pressureItem: () => renderPressureItem(params.domainIndex || 0, params.itemIndex || 0),
      report: () => renderReportPreview(params.type || 'current')
    };
    const fn = renderers[name] || renderHome;
    fn();
    requestAnimationFrame(() => app.focus({ preventScroll: true }));
  }

  function renderHome() {
    app.innerHTML = `
      <section class="screen">
        <div class="paper-panel">
          <div class="paper-inner">
            <div class="home-layout">
              <div>
                <p class="overline">GLORB // SIGNAL MAPPER</p>
                <h1 class="hero-title">LET’S MAP<br>YOUR SIGNALS.</h1>
                <p class="hero-subtitle">We’ll look at how different feelings show up for you, what can change them, and what helps. At the end, you’ll have your Signal Map and a guide to what helps you.</p>
              </div>
              <div class="home-glorb">
                <div>
                  <img src="${D.glorbAsset}" alt="Glorb, the Zorbax-9 research alien" />
                  <p class="glorb-line">“Humans have signals too. Let’s map yours.”</p>
                </div>
              </div>
            </div>

            <div class="name-row">
              <label>
                <span class="name-label">WHAT SHOULD WE CALL YOU?</span>
                <input id="studentName" class="name-input" type="text" maxlength="40" autocomplete="off" value="${esc(state.studentName)}" placeholder="Type your first name or the name you want on your map" />
              </label>
              <div class="warning-box">
                <strong>BEFORE YOU START</strong><br>
                Your answers are not saved after you leave this page. Before you go, <b>download, print or share your report</b> so you can keep what you have done. You can make a report at any time, even if you have not finished everything.
              </div>
            </div>

            <div class="path-grid" aria-label="Choose what to map">
              <button class="path-card" data-path="one" type="button">
                <div><h2>MAP ONE FEELING</h2><p>Choose one feeling and map what it is like for you and what helps.</p></div>
                <span class="start-link">START →</span>
              </button>
              <button class="path-card" data-path="whole" type="button">
                <div><h2>MAP MY WHOLE SIGNAL SYSTEM</h2><p>Map feelings across your Signals, what can make things harder, what helps, and Recovery.</p></div>
                <span class="start-link">START →</span>
              </button>
              <button class="path-card" data-path="pressure" type="button">
                <div><h2>EXPLORE WHAT CAN MAKE THINGS HARDER</h2><p>Look at different things that can affect you and rate how much they bother you.</p></div>
                <span class="start-link">START →</span>
              </button>
            </div>
          </div>
        </div>
      </section>`;

    const nameInput = $('#studentName', app);
    nameInput.addEventListener('input', () => {
      state.studentName = nameInput.value.trimStart();
    });
    $$('.path-card', app).forEach((btn) => btn.addEventListener('click', () => {
      state.studentName = nameInput.value.trim();
      if (!state.studentName) {
        nameInput.focus();
        toast('Type the name you want on the map first.');
        return;
      }
      state.selectedPath = btn.dataset.path;
      markDirty();
      if (state.selectedPath === 'one') go('feelingSelectAll');
      if (state.selectedPath === 'whole') {
        state.wholeIndex = 0;
        go('signalSelect', { signal: 'low' });
      }
      if (state.selectedPath === 'pressure') go('pressureWelcome');
    }));
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
          <h1>WHICH FEELING WOULD YOU LIKE TO MAP TODAY?</h1>
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
      ? 'WHEN THINGS ARE GOING OKAY, WHICH OF THESE FEELINGS DO YOU HAVE MOST OFTEN?'
      : 'WHICH OF THESE FEELINGS DO YOU FEEL MOST OFTEN, OR FIND HARDEST TO DEAL WITH?';
    app.innerHTML = `
      <section class="screen">
        <div class="selection-header">
          <aside class="signal-side ${signal.className}">
            <span class="signal-pill">${signal.label}</span>
            <img src="${signal.overview}" alt="${signal.label} feelings" />
            <p>${esc(signal.studentDescription)}</p>
          </aside>
          <div class="selection-panel paper-panel">
            <p class="overline">PICK A FEELING</p>
            <h1>${q}</h1>
            <p class="body-copy">Pick one.</p>
            <div class="feeling-grid">
              ${options.map(feelingButton).join('')}
              <button class="feeling-card other" type="button" data-feeling="other"><strong>＋</strong><span>Something else</span></button>
            </div>
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
      steps.push(transitionStep('patterns', 'WHAT STEADY CAN FEEL LIKE', `We’ll check a few other feelings that can show up when things are going okay.`, feeling));
      others.forEach((other, index) => steps.push({
        type: 'question', responseType: 'pattern', section: 'patterns', itemId: `also-${other.id}`,
        asset: other.asset, visual: other.label,
        question: `When you feel ${f}, do you feel ${lower(other.label)} too?`,
        overline: `WHAT STEADY CAN FEEL LIKE // ${index + 1} OF ${others.length}`,
        feeling
      }));
    } else {
      const items = D.happensItems[signal] || D.happensItems.rising;
      steps.push(transitionStep('patterns', 'WHAT HAPPENS FOR YOU', `Now we’ll look at what you notice when you feel ${f}.`, feeling));
      items.forEach((item, index) => steps.push(patternStep('patterns', item, feeling, index, items.length)));

      const actions = D.actionItems[signal] || [];
      steps.push(transitionStep('actions', 'WHAT DO YOU WANT TO DO?', `Feelings can make us want to do different things. Let’s see what fits you when you feel ${f}.`, feeling));
      actions.forEach((item, index) => steps.push({
        type: 'question', responseType: 'pattern', section: 'actions', itemId: item.id,
        asset: item.asset, visual: item.visual, question: item.question(f),
        overline: `WHAT YOU MAY WANT TO DO // ${index + 1} OF ${actions.length}`,
        feeling
      }));
    }

    steps.push(transitionStep('broadPressure', 'WHAT CAN CHANGE THIS FEELING?', `Now we’ll check four kinds of things that can change how ${f} feels for you.`, feeling));
    D.broadPressure.forEach((item, index) => steps.push({
      type: 'question', responseType: 'pattern', section: 'broadPressure', itemId: item.id,
      asset: item.asset, visual: item.studentTitle, question: D.pressureQuestion(item.id, signal, feeling.label),
      adultLabel: item.adultTitle,
      overline: `WHAT CAN CHANGE THIS FEELING? // ${index + 1} OF ${D.broadPressure.length}`,
      feeling
    }));

    const selfHelp = (D.selfHelpItems[signal] || []).map((n) => D.selfHelpCatalog[n]);
    const selfHeading = signal === 'steady' ? 'WHAT HELPS YOU STAY THIS WAY?' : 'WHAT HELPS YOU?';
    const selfCopy = signal === 'steady'
      ? `Now we’ll look at things that might help you stay feeling ${f}.`
      : `Now we’ll look at things that might help when you feel ${f}.`;
    steps.push(transitionStep('selfHelp', selfHeading, selfCopy, feeling));
    selfHelp.forEach((item, index) => steps.push({
      type: 'question', responseType: 'help', section: 'selfHelp', itemId: item.id,
      asset: item.asset, visual: item.visual, label: item.label,
      question: signal === 'steady'
        ? `When you feel ${f}, does ${item.verb} help you stay ${f}?`
        : `When you feel ${f}, does ${item.verb} help you?`,
      overline: `${selfHeading} // ${index + 1} OF ${selfHelp.length}`,
      feeling
    }));
    steps.push({
      type: 'text', section: 'extraSelfHelp',
      overline: feeling.label.toUpperCase(),
      heading: `IS THERE SOMETHING ELSE THAT HELPS YOU WHEN YOU FEEL ${feeling.label.toUpperCase()}?`,
      helper: 'You can leave this blank if there is nothing else to add.',
      placeholder: `Type anything else that helps when you feel ${f}...`, feeling
    });

    const otherHelp = (D.otherHelpItems[signal] || []).map((n) => D.otherHelpCatalog[n]);
    steps.push(transitionStep('otherHelp', 'HOW CAN OTHER PEOPLE HELP?', `Now we’ll look at things another person can do that might help when you feel ${f}.`, feeling));
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
      heading: `IS THERE SOMETHING ELSE SOMEONE CAN DO THAT HELPS WHEN YOU FEEL ${feeling.label.toUpperCase()}?`,
      helper: 'You can leave this blank if there is nothing else to add.',
      placeholder: `Type anything else someone can do...`, feeling
    });

    steps.push({
      type: 'text', section: 'note',
      overline: feeling.label.toUpperCase(),
      heading: `WHEN YOU FEEL ${feeling.label.toUpperCase()}, WHAT DO YOU WANT ADULTS TO KNOW?`,
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
    app.innerHTML = `
      <section class="screen screen-fit">
        <div class="transition-wrap">
          <div class="transition-card">
            ${step.asset ? `<div class="emotion-chip"><img src="${step.asset}" alt="${esc(step.feeling?.label || step.heading)}" /></div>` : ''}
            <p class="overline">NEW QUESTION</p>
            <h1>${esc(step.heading)}</h1>
            <p>${esc(step.copy || '')}</p>
            <button id="transitionStart" class="primary-btn" type="button">START →</button>
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
      { type: 'transition', heading: 'RECOVERY', copy: 'Now we’ll look at what can happen after a really big feeling, and what can help you return.', asset: D.A(32), feeling: { label: 'Recovery', asset: D.A(32) } }
    ];
    D.recoveryPatterns.forEach((item, index) => steps.push({
      type: 'question', responseType: 'pattern', section: 'recoveryPatterns', itemId: item.id,
      asset: item.asset, visual: item.visual, question: item.question,
      overline: `RECOVERY // ${index + 1} OF ${D.recoveryPatterns.length}`
    }));
    steps.push({ type: 'transition', heading: 'WHAT HELPS AFTER A BIG FEELING?', copy: 'Now we’ll look at things that might help while you recover.', asset: D.A(138), feeling: { label: 'Recovery', asset: D.A(138) } });
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
          <div class="transition-card" style="max-width:1180px">
            <div class="emotion-chip" style="width:230px;height:175px"><img src="${D.ratingStripAsset}" alt="How much does this bother you scale" /></div>
            <p class="overline">EXPLORE WHAT CAN MAKE THINGS HARDER</p>
            <h1>HOW MUCH DOES THIS BOTHER YOU?</h1>
            <p>You’ll see one thing at a time. Choose <b>Not at all</b>, <b>A little</b>, <b>Kind of / Sometimes</b>, <b>A lot</b>, <b>A whole lot</b>, or <b>I don’t know</b>.</p>
            <p class="small-copy">There are four groups: things around you, things that remind you of something, situations, and things other people do.</p>
            <button id="pressureStart" class="primary-btn" type="button">START →</button>
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

  function renderPressureItem(domainIndex, itemIndex) {
    const domain = D.pressureDomains[domainIndex];
    const item = domain?.items[itemIndex];
    if (!domain) return finishPressureExplorer();
    if (!item) {
      if (domainIndex < D.pressureDomains.length - 1) return go('pressureCategoryIntro', { domainIndex: domainIndex + 1 });
      return finishPressureExplorer();
    }
    app.innerHTML = `
      <section class="screen screen-fit question-screen">
        <div class="question-head">
          <p class="overline">${esc(domain.studentTitle)} // ${itemIndex + 1} OF ${domain.items.length}</p>
          <h1 class="question-title">HOW MUCH DOES THIS BOTHER YOU?</h1>
        </div>
        <div class="rating-shell">
          <div class="rating-visual"><img src="${item.asset}" alt="${esc(item.label)}" /></div>
          <div class="rating-row" role="radiogroup" aria-label="How much does ${esc(item.label)} bother you?">
            ${D.ratingChoices.map((choice) => `<button class="rating-btn" type="button" data-choice="${choice.id}" role="radio" aria-label="${esc(choice.studentLabel)}${choice.value === null ? '' : `, ${choice.value}`}" aria-checked="false"><img src="${choice.asset}" alt="" aria-hidden="true"></button>`).join('')}
          </div>
        </div>
      </section>`;
    $$('.rating-btn', app).forEach((btn) => btn.addEventListener('click', () => {
      const choice = D.ratingChoices.find((c) => c.id === btn.dataset.choice);
      state.pressureRatings[domain.id][item.id] = { choiceId: choice.id, value: choice.value, studentLabel: choice.studentLabel };
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
      let sum = 0, numeric = 0, unknown = 0, answered = 0;
      const rows = [];
      domain.items.forEach((item) => {
        const response = state.pressureRatings[domain.id][item.id];
        if (!response) return rows.push({ item, response: null });
        answered++;
        if (response.value === null) unknown++;
        else {
          numeric++;
          sum += response.value;
          highest.push({ domain, item, value: response.value, response });
        }
        rows.push({ item, response });
      });
      const enough = numeric >= Math.ceil(domain.items.length / 2);
      const percent = enough && numeric ? (sum / (numeric * 4)) * 100 : null;
      stats[domain.id] = {
        domain, sum, numeric, unknown, answered, percent,
        average: numeric ? sum / numeric : null,
        band: severityBand(percent), rows
      };
    });
    const valid = Object.values(stats).filter((s) => s.percent !== null);
    const overallPercent = valid.length === D.pressureDomains.length
      ? valid.reduce((n, s) => n + s.percent, 0) / valid.length
      : null;
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
    const f = map.feeling;
    const p = groupRecords(map.sections.patterns);
    const a = groupRecords(map.sections.actions);
    const b = groupRecords(map.sections.broadPressure);
    const s = groupRecords(map.sections.selfHelp);
    const o = groupRecords(map.sections.otherHelp);
    const signal = D.signals[f.signal];
    return `
      <section class="report-page">
        ${reportHeader(`${name}’s Feeling Map`, partial ? 'Partial map — completed information so far' : 'Student-identified summary')}
        <div class="signal-report-card ${signal?.className || ''}" style="min-height:90mm">
          <strong>${esc(signal?.label || 'FEELING')}</strong>
          <div class="feeling-name">${esc(f.label)}</div>
          <h3>WHAT HAPPENS FOR ME</h3><p>${listText([...p.yes, ...p.sometimes], 'Not mapped yet')}</p>
          ${a.yes.length || a.sometimes.length ? `<h3>WHAT I MAY WANT TO DO</h3><p>${listText([...a.yes, ...a.sometimes])}</p>` : ''}
          <h3>THINGS THAT CAN CHANGE THIS FEELING</h3><p>${listText([...b.yes, ...b.sometimes], 'Nothing identified yet')}</p>
          <h3>THINGS THAT HELP ME</h3><p>${listText([...s.yes, ...s.sometimes], 'Not mapped yet')}</p>
          <h3>HOW OTHER PEOPLE CAN HELP</h3><p>${listText([...o.yes, ...o.sometimes], 'Not mapped yet')}</p>
        </div>
        ${map.note ? `<div class="report-note"><strong>WHAT ${esc(name.toUpperCase())} WANTS ADULTS TO KNOW</strong><p>${esc(map.note)}</p></div>` : ''}
      </section>
      <section class="report-page">
        ${reportHeader(`For adults: How to read ${name}’s map`, 'This section keeps the student’s own responses at the centre.')}
        <p>This map records what ${esc(name)} identified for themselves when they completed it. Responses can change across days, settings and experiences. Use it alongside conversations with ${esc(name)}, what the adults around them already know, and what is happening in the current context.</p>
        <div class="report-note"><strong>ABOUT THE SIGNAL</strong><p><b>${esc(signal?.label || '')}:</b> ${esc(signal?.adultDescription || '')}</p></div>
        ${adultMapDetails(map)}
        ${reportUseNote()}
      </section>`;
  }

  function adultMapDetails(map) {
    const name = state.studentName || 'the student';
    const p = groupRecords(map.sections.patterns);
    const a = groupRecords(map.sections.actions);
    const b = groupRecords(map.sections.broadPressure);
    const s = groupRecords(map.sections.selfHelp);
    const o = groupRecords(map.sections.otherHelp);
    const unsure = [...p.unsure, ...a.unsure, ...b.unsure];
    const untried = [...s.untried, ...o.untried];
    const noHelp = [...s.no, ...o.no];
    return `
      <div class="pressure-summary-card">
        <h3>${esc(map.feeling.label)}</h3>
        <p><b>What ${esc(name)} notices:</b> ${listText(p.yes, 'No consistent patterns identified')}</p>
        ${p.sometimes.length ? `<p><b>Sometimes:</b> ${listText(p.sometimes)}</p>` : ''}
        ${a.yes.length || a.sometimes.length ? `<p><b>What ${esc(name)} may want to do:</b> ${listText([...a.yes, ...a.sometimes])}</p>` : ''}
        <p><b>Identified pressures on regulation:</b> ${listText([...b.yes, ...b.sometimes], 'No broad pressure area identified')}</p>
        <p><b>Things that help:</b> ${listText(s.yes, 'Not identified yet')}</p>
        ${s.sometimes.length ? `<p><b>Sometimes helps:</b> ${listText(s.sometimes)}</p>` : ''}
        <p><b>How other people can help:</b> ${listText(o.yes, 'Not identified yet')}</p>
        ${o.sometimes.length ? `<p><b>Sometimes helps:</b> ${listText(o.sometimes)}</p>` : ''}
        ${map.extraSelfHelp ? `<p><b>Something else that helps:</b> ${esc(map.extraSelfHelp)}</p>` : ''}
        ${map.extraOtherHelp ? `<p><b>Something else another person can do:</b> ${esc(map.extraOtherHelp)}</p>` : ''}
        ${unsure.length ? `<p><b>Still being learned:</b> ${listText(unsure)}</p>` : ''}
        ${untried.length ? `<p><b>Things not tried yet:</b> ${listText(untried)}</p>` : ''}
        ${noHelp.length ? `<p><b>${esc(cap(name))} says these do not help:</b> ${listText(noHelp)}</p>` : ''}
      </div>`;
  }

  function buildWholeStudentPages() {
    const name = state.studentName || 'Student';
    const bySignal = mapsBySignal();
    const cards = ['low','steady','rising','overload'].map((id) => {
      const map = bySignal[id];
      const sig = D.signals[id];
      if (!map) return `<div class="signal-report-card ${id}"><strong>${sig.label}</strong><div class="feeling-name">NOT MAPPED YET</div></div>`;
      const help = groupRecords(map.sections.selfHelp);
      const other = groupRecords(map.sections.otherHelp);
      return `<div class="signal-report-card ${id}">
        <strong>${sig.label}</strong>
        <div class="feeling-name">${esc(map.feeling.label)}</div>
        <p><b>HELPS:</b> ${listText([...help.yes, ...help.sometimes, ...other.yes, ...other.sometimes], 'Not identified yet')}</p>
      </div>`;
    }).join('');
    return `
      <section class="report-page">
        ${reportHeader(`${name}’s Signal Map`, 'Student-identified summary')}
        <div class="signal-report-grid">${cards}</div>
        <p style="margin-top:8mm">This is your map of the feelings you chose and the things you said can help.</p>
      </section>
      <section class="report-page">
        ${reportHeader(`${name}’s Signal Pathway`, 'A personal map of how signals can change')}
        <div class="pathway">
          ${['low','steady','rising','overload'].map((id) => `<div class="pathway-node ${id}"><strong>${D.signals[id].label}</strong><span>${esc(bySignal[id]?.feeling?.label || 'Not mapped')}</span></div>`).join('')}
          <div class="pathway-node recovery"><strong>RECOVERY</strong><span>Return</span></div>
        </div>
        <div class="report-note"><b>This is a personal map, not a fixed order.</b><p>Signals can move forwards or backwards, change quickly, or look different on different days.</p></div>
        <h2>THINGS THAT HELP ME</h2>
        ${['low','steady','rising','overload'].map((id) => {
          const map = bySignal[id];
          if (!map) return '';
          const s = groupRecords(map.sections.selfHelp);
          const o = groupRecords(map.sections.otherHelp);
          return `<div class="signal-report-card ${id}" style="min-height:auto;margin-bottom:4mm"><b>${D.signals[id].label} — ${esc(map.feeling.label)}</b><p>${listText([...s.yes, ...s.sometimes, ...o.yes, ...o.sometimes], 'Not identified yet')}</p></div>`;
        }).join('')}
      </section>`;
  }

  function buildRecoveryPages() {
    const name = state.studentName || 'Student';
    const patterns = groupRecords(state.recovery.patterns);
    const helps = groupRecords(state.recovery.helps);
    if (![...Object.keys(state.recovery.patterns), ...Object.keys(state.recovery.helps)].length) return '';
    return `<section class="report-page">
      ${reportHeader('Recovery & Return', `What ${name} identified after a very big feeling`)}
      <div class="signal-report-card recovery" style="min-height:auto">
        <h3>WHAT RECOVERY CAN LOOK LIKE</h3>
        <p>${listText([...patterns.yes, ...patterns.sometimes], 'Not mapped yet')}</p>
        <h3>THINGS THAT HELP</h3>
        <p>${listText(helps.yes, 'Not identified yet')}</p>
        ${helps.sometimes.length ? `<h3>SOMETIMES HELPS</h3><p>${listText(helps.sometimes)}</p>` : ''}
        ${helps.untried.length ? `<h3>THINGS NOT TRIED YET</h3><p>${listText(helps.untried)}</p>` : ''}
      </div>
      <div class="report-note"><b>For adults</b><p>Recovery may be gradual. Time, reduced demands and a paced return can be useful while the student regains capacity.</p></div>
    </section>`;
  }

  function buildPressureStudentPage() {
    const name = state.studentName || 'Student';
    const calc = pressureStats();
    const top = calc.highest.filter((x) => x.value >= 2).slice(0, 8);
    return `<section class="report-page">
      ${reportHeader(`What Can Make Things Harder for ${name}`, 'Student-rated summary')}
      <p>These are the things ${esc(name)} rated highest when asked “How much does this bother you?”</p>
      ${top.length ? `<div class="signal-report-grid">${top.map((x) => `<div class="signal-report-card" style="min-height:45mm">
        <img src="${x.item.asset}" alt="" style="height:25mm;width:100%;object-fit:contain">
        <div class="feeling-name" style="font-size:14pt">${esc(x.item.label)}</div>
        <p><b>${esc(x.response.studentLabel)}</b> — ${x.value}/4</p>
      </div>`).join('')}</div>` : '<p class="unknown-line">No item was rated Kind of / Sometimes or higher.</p>'}
      <div class="report-note"><b>Remember:</b><p>This summary shows what ${esc(name)} reported today. It can look different on another day or in another place.</p></div>
    </section>`;
  }

  function buildPressureAdultPages() {
    const name = state.studentName || 'the student';
    const calc = pressureStats();
    const categoryCards = D.pressureDomains.map((domain) => {
      const s = calc.stats[domain.id];
      const pct = s.percent === null ? null : Math.round(s.percent);
      return `<div class="pressure-summary-card">
        <h3><span>${esc(domain.adultTitle)}</span><span class="impact-pill">${pct === null ? 'NOT ENOUGH INFORMATION YET' : `${pct}% — ${s.band}`}</span></h3>
        ${pct !== null ? `<div class="severity-meter"><b>Student-rated severity</b><div class="severity-track"><span style="width:${pct}%"></span></div><b>${pct}%</b></div>
        <p>Average rating: ${s.average.toFixed(2)} / 4 • ${s.numeric} of ${domain.items.length} items rated numerically${s.unknown ? ` • ${s.unknown} “I don’t know”` : ''}</p>` : `<p>Fewer than half of the items in this area received a numerical rating, so a percentage is not shown.</p>`}
        <p>${esc(domain.adultMeaning || '')}</p>
      </div>`;
    }).join('');
    const overall = calc.overallPercent === null ? null : Math.round(calc.overallPercent);
    return `
      <section class="report-page">
        ${reportHeader('Identified Pressures on Regulation', `Adult summary of ${name === 'the student' ? 'the student’s' : `${name}’s`} ratings`)}
        <p>The percentages below summarise how strongly ${esc(name)} reported being bothered by the items presented in each area. “I don’t know” is recorded separately and is not treated as zero.</p>
        ${categoryCards}
        <div class="report-note"><b>How to interpret this</b><p>The percentage is a descriptive summary created by GLORB from the student’s 0–4 ratings. It is not a standardised score and does not identify or rule out a health or psychological condition.</p></div>
        ${overall === null ? `<p><b>Overall:</b> Not enough information yet to calculate an overall percentage across all four areas.</p>` : `<p><b>Overall student-rated severity:</b> ${overall}% — ${calc.overallBand}. Each of the four areas contributes equally to this overall percentage.</p>`}
      </section>
      <section class="report-page">
        ${reportHeader('Highest-Rated Items', 'The individual responses matter as much as the summary percentages')}
        ${calc.highest.length ? `<table class="report-table"><thead><tr><th>Area</th><th>Item</th><th>Student response</th><th>Adult description</th></tr></thead><tbody>
          ${calc.highest.slice(0, 14).map((x) => `<tr><td>${esc(x.domain.adultTitle)}</td><td>${esc(x.item.label)}</td><td>${esc(x.response.studentLabel)} (${x.value}/4)</td><td>${esc(ratingAdultLabel(x.value))}</td></tr>`).join('')}
        </tbody></table>` : '<p>No numerical ratings have been entered yet.</p>'}
      </section>
      ${D.pressureDomains.map((domain) => {
        const s = calc.stats[domain.id];
        return `<section class="report-page">
          ${reportHeader(domain.adultTitle, 'Complete item-by-item responses')}
          <table class="report-table"><thead><tr><th>Item</th><th>Student response</th><th>Adult interpretation</th><th>Organising description</th></tr></thead><tbody>
          ${s.rows.map(({item,response}) => `<tr><td>${esc(item.label)}</td><td>${response ? esc(response.studentLabel) : 'Not mapped yet'}</td><td>${response ? esc(ratingAdultLabel(response.value)) : 'Not mapped yet'}</td><td>${esc(item.adultDescriptor)}</td></tr>`).join('')}
          </tbody></table>
        </section>`;
      }).join('')}`;
  }

  function buildWholeAdultPages() {
    const name = state.studentName || 'Student';
    const bySignal = mapsBySignal();
    return `
      <section class="report-page">
        ${reportHeader(`For Adults: How to Read ${name}’s Signal Map`, 'Student-identified information organised for everyday use')}
        <p>The Signal Map is a visual way of organising changes in energy, attention, tension, communication and available capacity. It records what ${esc(name)} identified for themselves when completing the mapper.</p>
        <p><b>Activation / arousal:</b> In this report, these words are used descriptively for changes in alertness, energy, tension and readiness to respond. GLORB does not directly measure physiological arousal, and the Signal labels are not fixed arousal levels.</p>
        <div class="signal-report-grid">
          ${['low','steady','rising','overload'].map((id) => `<div class="signal-report-card ${id}" style="min-height:42mm"><b>${D.signals[id].label}</b><p>${esc(D.signals[id].adultDescription)}</p></div>`).join('')}
        </div>
        <div class="report-note"><b>Early response matters.</b><p>Rising Signal is a useful point to notice early changes and use the things ${esc(name)} has identified as helpful before the feeling becomes much bigger. AERO guidance likewise emphasises recognising early change and responding according to the student’s current needs ${cite('aero')}.</p></div>
        ${reportUseNote()}
      </section>
      ${['low','steady','rising','overload'].map((id) => bySignal[id] ? `<section class="report-page">${reportHeader(`${D.signals[id].label}: ${bySignal[id].feeling.label}`, `${name}’s detailed map`)}${adultMapDetails(bySignal[id])}</section>` : '').join('')}`;
  }

  function reportUseNote() {
    return `<div class="report-note"><b>ABOUT THIS MAP</b><p>This map reflects what the student identified for themselves at the time it was completed. It is intended to support communication, reflection and everyday adjustments. It is not a clinical, medical or psychological measure.</p></div>`;
  }

  function buildCurriculumAndReferencesPage() {
    return `<section class="report-page">
      ${reportHeader('About the Framework & Research', 'Adult information')}
      <h2>Curriculum links</h2>
      <p>The mapper supports learning connected with emotional awareness, reflective practice and emotional regulation in the Australian Curriculum Personal and Social Capability ${cite('acara-psc')}. ACARA’s Mental health and wellbeing curriculum connection also highlights learning about factors that influence emotions, communication, help-seeking and responding to change and challenge ${cite('acara-mh')}.</p>
      <h2>Important limits</h2>
      <p>The GLORB Signal Framework is a communication framework created for this resource. Its Signal categories and percentage bands are not published research cut-offs. The 0–4 bother ratings are ordinal responses: the points have a meaningful order, but the distance between points should not be treated as an exact scientific interval. ABS guidance recommends clearly labelled rating points and keeping “don’t know” separate where appropriate ${cite('abs-rating')}.</p>
      <p>Research reviews of youth emotion-regulation questionnaires also show that measures vary considerably in the strength of their supporting evidence. This is why GLORB presents its numbers as descriptive summaries of the student’s own answers rather than as standardised results ${cite('mazefsky')}.</p>
      <h2>References</h2>
      <ol class="report-reference-list">
        ${D.references.map((r) => `<li id="ref-${esc(r.id)}">${esc(r.apa)} <a href="${esc(r.url)}">${esc(r.url)}</a></li>`).join('')}
      </ol>
    </section>`;
  }

  function getThingsThatHelpCards() {
    const cards = [];
    allMaps().forEach((map) => {
      const signal = map.feeling.signal;
      ['selfHelp','otherHelp'].forEach((section) => {
        Object.values(map.sections[section]).forEach((record) => {
          if (record.answer === 'yes' || record.answer === 'sometimes') {
            cards.push({ signal, label: record.label, asset: record.asset, sometimes: record.answer === 'sometimes', feeling: map.feeling.label });
          }
        });
      });
    });
    const seen = new Set();
    return cards.filter((c) => {
      const key = `${c.signal}|${c.label}|${c.sometimes}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }

  function buildHelpCardsPages() {
    const cards = getThingsThatHelpCards();
    if (!cards.length) return '';
    const name = state.studentName || 'Student';
    const chunks = [];
    for (let i = 0; i < cards.length; i += 8) chunks.push(cards.slice(i, i + 8));
    return chunks.map((chunk, index) => `<section class="report-page">
      ${reportHeader(`Things That Help ${name} Cards`, chunks.length > 1 ? `Printable cards — page ${index + 1} of ${chunks.length}` : 'Printable cards')}
      <p>Cut along the dotted lines. The Signal name is printed as well as colour-coded so the cards do not rely on colour alone.</p>
      <div class="report-card-sheet">
        ${chunk.map((c) => `<div class="cut-card ${c.signal}">
          <div class="card-signal">${esc(D.signals[c.signal]?.label || '')} • ${esc(c.feeling)}</div>
          <img src="${c.asset}" alt="" />
          <div><div class="card-text">${esc(c.label)}</div>${c.sometimes ? '<div class="sometimes-tag">SOMETIMES HELPS</div>' : ''}</div>
        </div>`).join('')}
      </div>
    </section>`).join('');
  }

  function buildReportHtml(type = 'current') {
    const maps = allMaps();
    const hasPressure = D.pressureDomains.some((d) => Object.keys(state.pressureRatings[d.id]).length);
    const partial = type === 'partial' || !state.completed;
    let html = `<div class="report-document">`;
    if (partial) {
      html += `<section class="report-page">${reportHeader('Partial Map', 'This report contains the sections completed so far.')}<div class="report-note"><b>KEEP THIS COPY</b><p>Any unfinished areas are shown as not mapped yet. The current webpage does not keep the student’s answers after the page is left.</p></div></section>`;
    }
    if (type === 'pressure' && !maps.length) {
      html += buildPressureStudentPage() + buildPressureAdultPages() + buildCurriculumAndReferencesPage();
    } else if (type === 'one' && maps.length === 1 && state.selectedPath === 'one') {
      html += buildOneFeelingReport(maps[0], partial);
      if (hasPressure) html += buildPressureAdultPages();
      html += buildCurriculumAndReferencesPage() + buildHelpCardsPages();
    } else if (state.selectedPath === 'whole' || maps.length > 1) {
      html += buildWholeStudentPages();
      html += buildRecoveryPages();
      if (hasPressure) html += buildPressureStudentPage();
      html += buildWholeAdultPages();
      if (hasPressure) html += buildPressureAdultPages();
      html += buildCurriculumAndReferencesPage();
      html += buildHelpCardsPages();
    } else if (maps.length) {
      html += buildOneFeelingReport(maps[0], partial);
      if (hasPressure) html += buildPressureAdultPages();
      html += buildCurriculumAndReferencesPage() + buildHelpCardsPages();
    } else if (hasPressure) {
      html += buildPressureStudentPage() + buildPressureAdultPages() + buildCurriculumAndReferencesPage();
    } else {
      html += `<section class="report-page">${reportHeader(`${state.studentName || 'Student'}’s Signal Map`, 'No questions have been mapped yet')}<p>Return to the mapper to add some answers before making a report.</p></section>`;
    }
    html += `</div>`;
    return html;
  }

  function renderReportPreview(type) {
    const html = buildReportHtml(type);
    app.innerHTML = `<div class="report-preview-wrap">
      <div class="report-actions">
        <button id="reportBack" class="secondary-btn" type="button">← BACK TO MAP</button>
        <button id="downloadPdf" class="primary-btn" type="button">DOWNLOAD PDF</button>
        <button id="printPdf" class="secondary-btn" type="button">PRINT</button>
        <button id="sharePdf" class="secondary-btn" type="button">SHARE REPORT</button>
      </div>
      ${html}
    </div>`;
    $('#reportBack', app).addEventListener('click', goBack);
    $('#downloadPdf', app).addEventListener('click', () => downloadPdf(type));
    $('#printPdf', app).addEventListener('click', () => printReport(type));
    $('#sharePdf', app).addEventListener('click', () => shareReport(type));
  }

  function filename() {
    const safe = (state.studentName || 'student').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
    return `${safe || 'student'}-glorb-signal-map.pdf`;
  }

  async function waitForImages(root) {
    const images = [...root.querySelectorAll('img')];
    await Promise.all(images.map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    })));
  }

  async function makePdfBlob(type = 'current') {
    if (!window.html2pdf) throw new Error('PDF library is unavailable');
    reportRoot.innerHTML = buildReportHtml(type);
    await waitForImages(reportRoot);
    if (document.fonts?.ready) await document.fonts.ready;
    const element = $('.report-document', reportRoot);
    const opt = {
      margin: [7, 7, 7, 7],
      filename: filename(),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#f6efe3', scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.signal-report-card', '.pressure-summary-card', '.cut-card'] },
      enableLinks: true
    };
    return await window.html2pdf().set(opt).from(element).toPdf().outputPdf('blob');
  }

  async function downloadPdf(type = 'current') {
    try {
      toast('Making your PDF…');
      const blob = await makePdfBlob(type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename(); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (error) {
      console.error(error);
      toast('PDF download is unavailable right now. Use Print and choose Save as PDF instead.');
    }
  }

  function printReport(type = 'current') {
    reportRoot.innerHTML = buildReportHtml(type);
    waitForImages(reportRoot).then(() => setTimeout(() => window.print(), 80));
  }

  async function shareReport(type = 'current') {
    try {
      const blob = await makePdfBlob(type);
      const file = new File([blob], filename(), { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: `${state.studentName || 'Student'}’s GLORB Signal Map`, files: [file] });
      } else {
        toast('This device cannot share the PDF directly. Download it, then share it from your device.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error(error);
        toast('Sharing is unavailable right now. Download the PDF instead.');
      }
    }
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
      <h1 style="font-size:clamp(42px,5vw,70px);margin-bottom:8px">WHO IS THIS INFORMATION FOR?</h1>
      <p class="body-copy">The student version is short. The adult version explains the framework, maths, research, limits and references.</p>
      <div class="info-choice">
        <button id="infoChooser" class="info-mode-btn" data-mode="student" type="button"><h3>FOR STUDENTS</h3><p>What this is, why you are doing it, what happens to your answers, and how the bother scale works.</p></button>
        <button class="info-mode-btn" data-mode="adult" type="button"><h3>FOR ADULTS</h3><p>Framework rationale, mathematical method, interpretation rules, research, limits, data information and full references.</p></button>
      </div>`;
  }

  function studentInfoHtml() {
    return `<div class="button-row" style="margin-bottom:18px"><button class="secondary-btn info-mode-btn" data-mode="adult" type="button">VIEW FOR ADULTS →</button></div>
      <section class="info-section"><h2>WHAT IS THIS?</h2><p>GLORB // SIGNAL MAPPER is a way to show what different feelings are like for you. You can map one feeling, map your whole Signal System, or look at things that can make things harder.</p><p>There are no right answers. Your answers are about <b>you</b>.</p></section>
      <section class="info-section"><h2>WHY AM I DOING IT?</h2><p>Your map can make it easier to explain what you notice, what can change a feeling, what helps you, and what another person can do that helps.</p><p>You can share your report with someone you trust if you want to.</p></section>
      <section class="info-section"><h2>WHAT HAPPENS TO MY ANSWERS?</h2><p>Your answers are kept only while this page is open. They are not saved by the Signal Mapper after you leave.</p><p>If you want to keep your map, <b>download, print or share your report before you leave the page.</b></p></section>
      <section class="info-section"><h2>WHAT DOES “HOW MUCH DOES THIS BOTHER YOU?” MEAN?</h2><p>You will see one thing at a time. Pick the answer that is closest to how much it bothers you.</p>
        <div class="info-scale"><div>0<br>NOT AT ALL</div><div>1<br>A LITTLE</div><div>2<br>KIND OF / SOMETIMES</div><div>3<br>A LOT</div><div>4<br>A WHOLE LOT</div><div>I DON’T KNOW</div></div>
        <p><b>I don’t know is always okay.</b> It is kept separately and does not count as “Not at all”.</p></section>`;
  }

  function adultInfoHtml() {
    return `<div class="button-row" style="margin-bottom:18px"><button class="secondary-btn info-mode-btn" data-mode="student" type="button">← VIEW FOR STUDENTS</button></div>
      <section class="info-section"><h2>WHAT IS THE SIGNAL MAPPER?</h2>
        <p>GLORB // SIGNAL MAPPER is a student-led communication and reflection tool. It helps a student describe feelings they notice, what happens for them, what can change a feeling, what they may want to do, what helps, what another person can do that helps, and what Recovery can look like.</p>
        <p><b>The student is describing their own experience.</b> The mapper does not decide what the student is feeling or why.</p>
        <p>Its educational rationale is consistent with Australian Curriculum learning in emotional awareness, reflective practice and emotional regulation ${cite('acara-psc')}, and with curriculum learning about factors that influence emotions, communication and help-seeking ${cite('acara-mh')}.</p>
      </section>
      <section class="info-section"><h2>WHAT CAN THIS MAP HELP WITH?</h2>
        <p>The map can make a student’s own experience easier to notice, explain and communicate. It can give teachers, parents or carers, speech pathologists, occupational therapists, inclusion staff and other trusted adults a shared starting point for conversation.</p>
        <p>It may help show patterns such as what the student notices early, what tends to make things harder, which responses help, which responses do not help, and what Recovery or return can look like for that student.</p>
        <p>The map is one perspective: the student’s. It is intended to sit alongside conversation, observation and knowledge of the student across settings.</p>
      </section>
      <section class="info-section"><h2>WHAT IS THE GLORB SIGNAL FRAMEWORK?</h2>
        <p>The framework is a visual way of talking about changes in energy, attention, tension and available capacity.</p>
        <p><b>For adults:</b> GLORB sometimes uses the words activation or arousal descriptively for changes in alertness, energy, tension and readiness to respond. The mapper does not directly measure physiological arousal.</p>
        <ul><li><b>Low Signal:</b> things may feel lower, slower, heavier or harder to start.</li><li><b>Steady Signal:</b> the student currently has enough capacity for what is happening. Steady does not mean silent, still or perfectly calm.</li><li><b>Rising Signal:</b> energy, tension or urgency may be building.</li><li><b>Signal Overload:</b> the feeling may be very strong and thinking, talking, listening or flexible responding may become harder.</li><li><b>Recovery:</b> the student may need time before they feel ready to fully return.</li></ul>
        <div class="disclaimer">The Signal categories are a GLORB communication framework. They are not published scientific categories and should not be treated as fixed labels.</div>
        <p>AERO guidance for schools separately describes changing phases of escalation and emphasises recognising early changes, adjusting the environment and responding according to the student’s current needs ${cite('aero')}. The GLORB framework is not the AERO model.</p>
      </section>
      <section class="info-section"><h2>WHY IS IT DESIGNED THIS WAY?</h2>
        <p>Feelings can involve body sensations, thinking, communication, actions and what a person needs from other people. GLORB separates these pieces and shows one clear question at a time so the student does not have to hold several tasks in mind at once.</p>
        <p>W3C cognitive-accessibility guidance recommends clear, recognisable controls and easy-to-understand instructions ${cite('w3c-controls')}. WCAG 2.2 also includes requirements for usable pointer targets ${cite('wcag22')}. The interface therefore uses large buttons, consistent placement and no drag-only interactions.</p>
      </section>
      <section class="info-section"><h2>WHAT DOES “WHAT CAN MAKE THINGS HARDER” DO?</h2>
        <p>This part looks at individual experiences one at a time and asks the student how much each one bothers them. GLORB organises the items into four practical groups:</p>
        <ol><li><b>Things around me → Sensory pressures:</b> sounds, lights, smells, tastes/textures, touch, movement, temperature, crowding and internal body feelings.</li><li><b>Things that remind me → Reminder-related pressures:</b> places, people, sounds, smells, dates, objects or experiences that remind the student of something from before.</li><li><b>Situations I find hard → Situational pressures:</b> changes, waiting, being rushed, difficult work, uncertainty, many instructions, mistakes, being watched and transitions.</li><li><b>Things other people do → Relational pressures:</b> exclusion, teasing, criticism, being ignored, feeling unheard, personal space, conflict, belongings, limits, unfairness, another person’s anger and separation.</li></ol>
        <div class="disclaimer">These four groups are an organising system used by GLORB. They are not four universal psychological types.</div>
        <p>Research supports considering sensory/environmental input as one possible influence on children’s regulation, while also showing substantial individual variation and limits in the evidence ${cite('gomez')}. NCTSN resources also describe how everyday sights, sounds and experiences can act as reminders for some children ${cite('nctsn')}. A reminder response in GLORB does <b>not</b> mean that the student has experienced trauma.</p>
      </section>
      <section class="info-section"><h2>HOW DOES THE RATING SYSTEM WORK?</h2>
        <p>The student sees:</p>
        <div class="info-scale"><div>0<br>NOT AT ALL</div><div>1<br>A LITTLE</div><div>2<br>KIND OF / SOMETIMES</div><div>3<br>A LOT</div><div>4<br>A WHOLE LOT</div><div>I DON’T KNOW</div></div>
        <p>Behind the scenes the numeric answers are stored as 0, 1, 2, 3 and 4. “I don’t know” is stored separately.</p>
        <table class="report-table"><thead><tr><th>Student sees</th><th>Stored value</th><th>Adult interpretation</th></tr></thead><tbody>
          <tr><td>Not at all</td><td>0</td><td>No reported impact</td></tr><tr><td>A little</td><td>1</td><td>Low impact</td></tr><tr><td>Kind of / Sometimes</td><td>2</td><td>Somewhat / Moderate impact</td></tr><tr><td>A lot</td><td>3</td><td>High impact</td></tr><tr><td>A whole lot</td><td>4</td><td>Very high impact</td></tr><tr><td>I don’t know</td><td>—</td><td>Uncertain / not enough information yet</td></tr>
        </tbody></table>
        <p>ABS guidance describes rating scales as ordinal data: response options have a meaningful order, but the interval between points should not automatically be treated as an exact scientific distance. ABS also recommends labelling all rating points and keeping “don’t know” separate when appropriate ${cite('abs-rating')}.</p>
      </section>
      <section class="info-section"><h2>HOW ARE THE PERCENTAGES CALCULATED?</h2>
        <p>For each of the four areas:</p><div class="math-box">sum of numerical ratings ÷ (number of numerical ratings × 4) × 100</div>
        <p>Example: if 10 items receive numerical answers and those ratings add to 24:</p><div class="math-box">24 ÷ (10 × 4) × 100 = 60%</div>
        <p><b>“I don’t know” is excluded from the numerator and denominator</b>, because counting it as zero would falsely mean “Not at all”. It is reported separately.</p>
        <p>If fewer than half of the items in one area receive a numerical answer, GLORB shows <b>Not enough information yet</b> instead of a percentage.</p>
        <p>Where all four areas have enough information, the overall percentage is the average of the four area percentages so each area contributes equally:</p><div class="math-box">(Sensory % + Reminder % + Situational % + Relational %) ÷ 4</div>
        <h3>DISPLAY BANDS</h3><p>0–19% Minimal • 20–39% Low • 40–59% Moderate • 60–79% High • 80–100% Very high.</p>
        <div class="disclaimer">These bands are GLORB display bands. They are not published research cut-offs or standardised results.</div>
      </section>
      <section class="info-section"><h2>WHAT DO THE NUMBERS MEAN?</h2>
        <p>The numbers make the student’s own responses easier to summarise and compare across the four areas. A higher percentage means the student gave higher ratings across more of the items they answered in that area.</p>
        <p>The percentage does not explain <i>why</i> something bothers the student. The individual item responses remain part of the report because they are often more useful than the summary number.</p>
        <p>Research reviews of youth emotion-regulation questionnaires show that formal measures vary considerably in the strength of their supporting evidence. GLORB therefore presents its custom percentages as descriptive summaries of the student’s own responses rather than standardised results ${cite('mazefsky')}.</p>
      </section>
      <section class="info-section"><h2>THE STUDENT’S VOICE COMES FIRST</h2>
        <p>The mapper records what the student says fits them. It does not independently decide whether an answer is “correct”. Adults may notice different things, and a student may respond differently in different settings.</p>
        <p>Research on child and adolescent reporting shows that perspectives from young people, parents and teachers can differ in meaningful ways across contexts ${cite('de-los-reyes')}. GLORB therefore keeps the student’s self-identified responses visible rather than replacing them with an adult interpretation.</p>
      </section>
      <section class="info-section"><h2>IMPORTANT LIMITS</h2>
        <div class="disclaimer"><b>THIS IS NOT A CLINICAL, MEDICAL OR PSYCHOLOGICAL MEASURE.</b><br>GLORB // SIGNAL MAPPER has not been validated as a health measure. It should not be used to identify, confirm or rule out a health, developmental or psychological condition. Its percentages and display bands are descriptive summaries created by this resource.</div>
        <p>A student’s responses reflect what they identify at the time they complete the map and may be different on another day or in another setting. Use the map alongside conversation with the student, observation, family knowledge, professional judgement, existing school information and relevant school procedures.</p>
      </section>
      <section class="info-section"><h2>WHY DOESN’T IT SAVE MY ANSWERS?</h2>
        <p>The mapper is intentionally designed not to keep a permanent copy of student response content. This reduces the amount of personal student information the website needs to collect or hold.</p>
        <p>Instead, the student or adult chooses whether to keep a copy by downloading, printing or sharing the report before leaving.</p>
      </section>
      <section class="info-section"><h2>WHAT HAPPENS TO STUDENT ANSWERS?</h2>
        <p>The Signal Mapper keeps answers in the page’s working memory only. This build does not use local storage, cookies or a student account to keep response content. Refreshing, starting over, closing the tab or leaving the page removes the current in-page answers.</p>
        <p>That is why the interface repeatedly tells users to download, print or share the report before leaving.</p>
        <p>When a report is created, the PDF is generated in the browser. The website host and any third-party files used to deliver the webpage may still receive ordinary technical web requests. The GLORB code does not send the student’s response content to an analytics service or place it in the webpage URL.</p>
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
            <button id="exitDownload" class="secondary-btn" type="button">DOWNLOAD PDF</button>
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
    $('#exitDownload', modalRoot).addEventListener('click', () => downloadPdf('partial'));
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
