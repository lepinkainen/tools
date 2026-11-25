(function () {
  const VERSION = 1;
  const DEFAULT_STORAGE_KEY = 'christmas_quiz_elf_state_v1';
  const MAX_RECENT_LINES = 3;

  const dialogues = {
    start: {
      curious: [
        'Tervetuloa pajalle, katsotaan mitä osaat.',
        'Tonttu kurkistaa kirjapinkasta ja mutisee: aloitetaan.',
        'Hmm... pitäisikö minun edes auttaa? No, mennään.'
      ],
      default: ['Aloitetaanhan peli.']
    },
    hint: {
      curious: [
        'Tarvitsetko jo vihjeen? No olkoon.',
        'Huhuu, katso tarkkaan – anna vihjeen johdattaa.',
        'Avaan salaisen muistikirjani vain vähän.'
      ],
      cocky: [
        'Tässä, mutta seuraavaan vastaat itse!',
        'Vain koska olen hyvällä tuulella.',
        'Et kai tarvitse tätä joka kysyessä?'
      ],
      mocking: [
        'Oho, taas vihje? Joko eksyit metsään?',
        'Pidän kirjaa jokaisesta vihjeestä!',
        'Jospa vielä annankin tämän... ehkä.'
      ],
      impressed: [
        'Ehkä tämä hidastaa sinua...',
        'Otan riskin ja annan vihjeen.',
        'En malta olla auttamatta, vaikka osaat jo liikaa.'
      ],
      reluctantly_helpful: [
        'Hyvä on, mestari saa vihjeenkin.',
        'Älä kerro muille että autoin näin paljon.',
        'Päästän sinut käsiksi suurempaan salaisuuteen.'
      ],
      default: ['Tässäpä pieni vihje.']
    },
    correct: {
      curious: [
        'Hei, sehän meni oikein!',
        'Hyvin keksitty – tonttu nyökkää.',
        'Sinulla on selvästi lahjoja.'
      ],
      cocky: [
        'Näköjään osuit vahingossa oikeaan.',
        'Seuraava on varmasti vaikeampi... ehkä.',
        'Tonttu naureskelee: kyllä sinä sen tajusit.',
        'Tuuriakin pitää olla.',
        'Hmph, ihan sattumalta varmaan.',
        'Ei tämä vielä mitään tarkoita.'
      ],
      mocking: [
        'No jopas, sait jotain oikein.',
        'Ehkä olikin tuuria, hmm?',
        'Kirjaan ylös: ei enää ihan hukassa.'
      ],
      impressed: [
        'No hyvä on, taas meni oikein...',
        'Täytyykö sinun osata KAIKKI?',
        'Tämähän alkaa olla tylsää.'
      ],
      reluctantly_helpful: [
        'Hyvä. Nyt avaamme pajavaraston ovia.',
        'Tämä taso ansaitsee kunnon palkinnon.',
        'En enää edes viitsi ärsyttää – liian taitavaa.'
      ],
      default: ['Oikein!']
    },
    wrong: {
      curious: [
        'Ei ihan, kokeile eri kulmaa.',
        'Tonttu pyörittelee silmiään hieman.',
        'Ei hätää, ota uusi yritys.'
      ],
      cocky: [
        'Olisithan voinut arvata oikein...',
        'Ei näin pitkälle pääse vahingossa.',
        'Tämän ajan jälkeen odotin parempaa.'
      ],
      mocking: [
        'Heh, tästä pitää kertoa muillekin tontuille.',
        'Kävikö pipari? Nimittäin väärin.',
        'Se oli jo aika villi arvaus.'
      ],
      impressed: [
        'Hah! Vihdoinkin virhe!',
        'No nyt vasta hengähdytin.',
        'Etkö olekaan täydellinen?'
      ],
      reluctantly_helpful: [
        'Olkoon, autan vielä vaikka meni pieleen.',
        'Loppusuoralla ei saa hyytyä!',
        'Korjaa suunta – ratkaisu odottaa.'
      ],
      default: ['Ei aivan.']
    },
    milestone: {
      1: [
        'Ensimmäinen paketti kilahti!',
        'Teit juuri tarpeeksi ansaitaksesi ensimmäisen vihjeen.',
        'Hyvä, avaan varastosta ensimmäisen vihjeen.',
        'Tässä joulusipuli numero yksi.'
      ],
      2: [
        'Toinen taso aukeaa!',
        'Tonttu pudottaa toisen vihjeen.',
        'Paketti kaksi kolahti pöydälle.',
        'Saat toisen salaisuuden.'
      ],
      3: [
        'Kolmas paketti paljastuu kuin ihmeen kaupalla.',
        'Olet jo pitkällä.',
        'Tonttu poistuu ja palaa vihje kädessään.',
        'Kolmas vihje tuoksuu piparille.'
      ],
      4: [
        'Viimeinen aarre! Käytä viisaasti.',
        'Kaikki paketit auki.',
        'Olet ansainnut suuren salaisuuden.',
        'Tämä on loppuhuipennus.'
      ],
      completion: [
        'Kaikki paketit kerätty! Tässä viimeinen salaisuus.',
        'Olet suorittanut koko matkan – ansaittu palkinto odottaa.',
        'Tonttu nyökkää kunnioittavasti: olet ansainnut tämän.',
        'Lopullinen lahja paljastuu nyt.'
      ]
    }
  };

  let config = {
    totalQuestions: 30,
    milestones: [], // Empty by default - populated during init if clues exist
    storageKey: DEFAULT_STORAGE_KEY
  };

  let state = null;

  function getDefaultState() {
    return {
      version: VERSION,
      mood: 'curious',
      correctStreak: 0,
      wrongStreak: 0,
      hintsUsed: 0,
      answeredCount: 0,
      milestonesUnlocked: 0,
      milestonesGranted: config.milestones.map(() => false),
      lastCategory: null,
      recentLines: []
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(config.storageKey || DEFAULT_STORAGE_KEY);
      if (!raw) return getDefaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== VERSION) {
        return getDefaultState();
      }
      const hydrated = {
        ...getDefaultState(),
        ...parsed
      };
      hydrated.milestonesGranted = ensureMilestoneArray(hydrated.milestonesGranted);
      hydrated.recentLines = Array.isArray(parsed.recentLines) ? parsed.recentLines.slice(-MAX_RECENT_LINES) : [];
      return hydrated;
    } catch (err) {
      console.warn('Elf state reset due to parse error', err);
      return getDefaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(config.storageKey || DEFAULT_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Unable to persist elf state', err);
    }
  }

  function ensureMilestoneArray(existing) {
    const arr = Array.isArray(existing) ? existing.slice(0, config.milestones.length) : [];
    while (arr.length < config.milestones.length) {
      arr.push(false);
    }
    return arr;
  }

  function recordLine(line) {
    if (!line) return;
    state.recentLines = state.recentLines || [];
    state.recentLines.push(line);
    while (state.recentLines.length > MAX_RECENT_LINES) {
      state.recentLines.shift();
    }
  }

  function pickLine(type, mood, fallback) {
    const bank = dialogues[type] || {};
    const moodLines = bank[mood] || [];
    const defaultLines = bank.default || fallback || ['...'];
    let candidates = moodLines.length ? moodLines : defaultLines;
    candidates = candidates.filter((line) => !state.recentLines.includes(line));
    if (candidates.length === 0) {
      candidates = moodLines.length ? moodLines : defaultLines;
    }
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    recordLine(choice);
    return choice;
  }

  function setMood(newMood) {
    if (!newMood) return;
    state.mood = newMood;
  }

  function recalcMood() {
    if (state.mood === 'reluctantly_helpful') {
      return;
    }
    if (state.wrongStreak >= 2) {
      setMood('mocking');
      return;
    }
    if (state.correctStreak >= 2) {
      setMood('impressed');
      return;
    }
    if (state.milestonesGranted[0] && state.mood !== 'mocking' && state.mood !== 'impressed') {
      setMood('cocky');
      return;
    }
    if (!state.milestonesGranted[0]) {
      setMood('curious');
    }
  }

  function makeResponse(type, fx) {
    const text = pickLine(type, state.mood);
    const response = { text, mood: state.mood };
    if (fx) {
      response.fx = fx;
    }
    saveState();
    return response;
  }

  const Elf = {
    init(userConfig = {}) {
      config = {
        ...config,
        ...userConfig,
        storageKey: userConfig.storageKey || DEFAULT_STORAGE_KEY,
        milestones: Array.isArray(userConfig.milestones) && userConfig.milestones.length
          ? userConfig.milestones
          : config.milestones
      };
      state = loadState();
      state.milestonesGranted = ensureMilestoneArray(state.milestonesGranted);
      saveState();
      return { mood: state.mood, answeredCount: state.answeredCount };
    },

    onQuizStart() {
      if (!state) {
        state = loadState();
      }
      const text = pickLine('start', state.mood);
      saveState();
      return { text, mood: state.mood };
    },

    onHintUsed(context = {}) {
      if (!state) state = loadState();
      state.hintsUsed += 1;
      state.lastCategory = context.category || null;
      return makeResponse('hint');
    },

    onAnswer(context = {}) {
      if (!state) state = loadState();
      state.answeredCount += 1;
      state.lastCategory = context.category || null;
      if (context.correct) {
        state.correctStreak += 1;
        state.wrongStreak = 0;
      } else {
        state.wrongStreak += 1;
        state.correctStreak = 0;
      }

      if (state.mood === 'mocking' && context.correct && state.correctStreak >= 2) {
        // calm down after a couple of correct answers
        state.mood = state.milestonesGranted[0] ? 'cocky' : 'curious';
      }

      recalcMood();

      const fx = context.correct ? { sparkle: true } : { shake: true };
      return makeResponse(context.correct ? 'correct' : 'wrong', fx);
    },

    checkMilestone(questionIndex) {
      if (!state) state = loadState();
      if (!config.milestones || !config.milestones.length) return null;
      const milestoneIdx = config.milestones.findIndex(
        (threshold, idx) => questionIndex === threshold && !state.milestonesGranted[idx]
      );
      if (milestoneIdx === -1) return null;
      return { unlocked: true, milestoneNumber: milestoneIdx + 1 };
    },

    onMilestone(context = {}) {
      if (!state) state = loadState();
      const milestoneNumber = context.milestoneNumber;
      const idx = milestoneNumber - 1;
      if (idx < 0 || idx >= state.milestonesGranted.length) {
        return { title: 'Salainen paketti', text: 'Hmm...', mood: state.mood };
      }
      if (!state.milestonesGranted[idx]) {
        state.milestonesGranted[idx] = true;
        state.milestonesUnlocked += 1;
        if (idx === 0 && state.mood !== 'mocking') {
          setMood('cocky');
        }
        if (idx === state.milestonesGranted.length - 1) {
          setMood('reluctantly_helpful');
        }
        saveState();
      }
      const key = idx + 1;
      const lineChoices = dialogues.milestone[key] || dialogues.milestone.completion || ['Paketti avautuu!'];
      const text = lineChoices[Math.floor(Math.random() * lineChoices.length)];
      recordLine(text);
      saveState();
      return {
        title: `Paketti ${key}`,
        text, // No longer contains CLUE_X placeholder
        mood: state.mood,
        fx: { confetti: true }
      };
    },

    reset() {
      state = getDefaultState();
      try {
        localStorage.removeItem(config.storageKey || DEFAULT_STORAGE_KEY);
      } catch (err) {
        console.warn('Unable to clear elf state', err);
      }
      saveState();
      return { ...state };
    }
  };

  window.Elf = Elf;
})();
