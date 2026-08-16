export type LandingLang = 'de' | 'ua' | 'en' | 'tr' | 'es' | 'ru';

export interface LandingTranslation {
  nav: {
    features: string;
    whatInside: string;
    howItWorks: string;
    pricing: string;
    faq: string;
    blog: string;
    ctaDemo: string;
  };
  hero: {
    preHeadline: string;
    h1: string;
    h1Highlight: string;
    h1After: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustText: string;
    badge1Val: string;
    badge1Label: string;
    badge2Val: string;
    badge2Label: string;
    badge3Val: string;
    badge3Label: string;
    badge4Val: string;
    badge4Label: string;
  };
  pain: {
    title: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    conclusion: string;
  };
  inside: {
    title: string;
    subtitle: string;
    item1Title: string;
    item1Desc: string;
    item2Title: string;
    item2Desc: string;
    item3Title: string;
    item3Desc: string;
    item4Title: string;
    item4Desc: string;
  };
  preview: {
    title: string;
    subtitle: string;
    tabHoeren: string;
    tabWortschatz: string;
    tabSchreiben: string;
    tabSprechen: string;
    hoerenTitle: string;
    hoerenAudioDesc: string;
    hoerenQuestion: string;
    hoerenOptA: string;
    hoerenOptB: string;
    hoerenOptC: string;
    wortschatzFrontPrompt: string;
    wortschatzFrontMeaning: string;
    wortschatzFrontGap: string;
    wortschatzBackTerm: string;
    wortschatzBackMeaning: string;
    wortschatzBackExample: string;
    wortschatzClickToFlip: string;
    schreibenTitle: string;
    schreibenPrompt: string;
    schreibenPhases: string[];
    sprechenTitle: string;
    sprechenPrompt: string;
    sprechenTimer: string;
  };
  comparison: {
    title: string;
    subtitle: string;
    colFeature: string;
    colTutor: string;
    colBooks: string;
    colApp: string;
    rowPrice: string;
    rowTutorPrice: string;
    rowBooksPrice: string;
    rowAppPrice: string;
    rowAccess: string;
    rowTutorAccess: string;
    rowBooksAccess: string;
    rowAppAccess: string;
    rowAudio: string;
    rowTutorAudio: string;
    rowBooksAudio: string;
    rowAppAudio: string;
    rowSpeaking: string;
    rowTutorSpeaking: string;
    rowBooksSpeaking: string;
    rowAppSpeaking: string;
    rowSrs: string;
    rowTutorSrs: string;
    rowBooksSrs: string;
    rowAppSrs: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    plan1Name: string;
    plan1Price: string;
    plan1Period: string;
    plan1Desc: string;
    plan2Name: string;
    plan2Badge: string;
    plan2Price: string;
    plan2Period: string;
    plan2Desc: string;
    plan3Name: string;
    plan3Price: string;
    plan3Period: string;
    plan3Desc: string;
    btnStart: string;
    btnUnlock: string;
    btnLifetime: string;
    features1: string[];
    features2: string[];
    features3: string[];
    paymentTitle: string;
  };
  faq: {
    title: string;
    subtitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
  };
  footer: {
    leadTitle: string;
    leadSubtitle: string;
    leadCta: string;
    rights: string;
    disclaimer: string;
  };
}

export const LANDING_LANGUAGES: Record<LandingLang, { label: string; flag: string }> = {
  de: { label: 'Deutsch', flag: '🇩🇪' },
  ua: { label: 'Українська', flag: '🇺🇦' },
  en: { label: 'English', flag: '🇬🇧' },
  tr: { label: 'Türkçe', flag: '🇹🇷' },
  es: { label: 'Español', flag: '🇪🇸' },
  ru: { label: 'Русский', flag: '🌐' },
};

export const LANDING_TRANSLATIONS: Record<LandingLang, LandingTranslation> = {
  ua: {
    nav: {
      features: 'Переваги',
      whatInside: 'Що всередині',
      howItWorks: 'Як це працює',
      pricing: 'Тарифи',
      faq: 'Часті запитання',
      blog: 'Блог',
      ctaDemo: 'Спробувати Demo',
    },
    hero: {
      preHeadline: '🇩🇪 Підготовка до Deutsch-Test für den Beruf B2 (DTB / telc)',
      h1: 'Склади іспит B2 Beruf з ',
      h1Highlight: 'першого разу',
      h1After: '. Без стресу та зубріння.',
      subtitle:
        'Єдина платформа, де зібрані всі реальні теми іспиту: 12 повних модельтестів (8 автентичних + 4 бонусних), 92 теми для листів (Forumsbeitrag) та 171 ситуація для усної частини. Тренуйся онлайн з телефона або ПК.',
      ctaPrimary: 'Спробувати безкоштовно (Demo)',
      ctaSecondary: 'Подивитися всі тарифи',
      trustText: 'Формат завдань на 100% відповідає стандартам реального іспиту DTB (BAMF / telc)',
      badge1Val: '12',
      badge1Label: 'Модельтестів',
      badge2Val: '92',
      badge2Label: 'Теми листів B2',
      badge3Val: '171',
      badge3Label: 'Ситуація Sprechen',
      badge4Val: '385',
      badge4Label: 'Слів Wortschatz SRS',
    },
    pain: {
      title: 'Провалити іспит — це дорого, довго та стресово.',
      card1Title: '❌ Черги на перескладання',
      card1Desc: 'Чекати нового терміну іспиту у мовній школі можна від 3 до 6 місяців, втрачаючи час.',
      card2Title: '❌ Втрачені гроші',
      card2Desc: 'Повторний іспит за свій рахунок коштує €170–€230 без урахування додаткових курсів.',
      card3Title: '❌ Загроза кар’єрі та майбутньому',
      card3Desc: 'Без офіційного сертифіката B2 Beruf не дадуть визнання диплома (Anerkennung) та постійний контракт.',
      conclusion: 'Не грай у рулетку. Натренуй формат завдань до автоматизму ще до дня іспиту.',
    },
    inside: {
      title: 'Усе, що потрібно для підготовки — в одному місці.',
      subtitle: 'Більше жодних розрізнених PDF-файлів та підручників по €25.',
      item1Title: '🎧 12 Повних Modelltests',
      item1Desc: 'Lesen, Hören та Sprachbausteine за таймером з автоматичним підрахунком балів та аудіозаписами носіїв.',
      item2Title: '✍️ 92 теми Forumsbeitrag & Листів',
      item2Desc: 'Реальні теми з іспитів: скарги (Beschwerde), запити інформації та пропозиції щодо оптимізації роботи з шаблонами.',
      item3Title: '🗣 171 ситуація для Sprechen',
      item3Desc: '104 теми для Teil 2 (Презентація/Дискусія) та 67 тем для Teil 3 (Вирішення проблеми з колегою) зі зразками відповідей.',
      item4Title: '🎮 Інтерактивний Wortschatz SRS',
      item4Desc: '385 найважливіших Nomen-Verb-Verbindungen та професійних фраз з картками, контекстними пропусками та аудіо.',
    },
    preview: {
      title: 'Як проходить твоє тренування?',
      subtitle: 'Сучасний інтерактивний інтерфейс, адаптований під смартфони та ноутбуки.',
      tabHoeren: '🎧 Hören & Lesen',
      tabWortschatz: '🎴 Wortschatz SRS',
      tabSchreiben: '✍️ Schreibtrainer',
      tabSprechen: '🗣️ Sprechen Teil 2/3',
      hoerenTitle: 'Hören Teil 1: Telefongespräch am Arbeitsplatz',
      hoerenAudioDesc: 'Аудіозапис носія німецької мови з офіційними паузами',
      hoerenQuestion: 'Was ist der Hauptgrund für den Anruf von Herrn Weber?',
      hoerenOptA: 'a) Eine Terminverschiebung für die Teambesprechung anfragen',
      hoerenOptB: 'b) Die fehlerhafte Rechnungsstellung der Lieferanten beanstanden (Richtig)',
      hoerenOptC: 'c) Sich über neue Arbeitszeiten im Betrieb informieren',
      wortschatzFrontPrompt: '💡 Gesuchte Bedeutung / Kontext:',
      wortschatzFrontMeaning: 'die Verantwortung / Zuständigkeit für eine Aufgabe haben',
      wortschatzFrontGap: 'Für welche Aufgabenbereiche sind Sie im Betrieb [ _______ ]?',
      wortschatzBackTerm: 'zuständig sein für (+ Akk.)',
      wortschatzBackMeaning: 'мати відповідальність за щось / бути відповідальним',
      wortschatzBackExample: 'Frau Weber ist in unserer Abteilung für die Rechnungsprüfung zuständig.',
      wortschatzClickToFlip: 'Клацніть, щоб перевернути картку 🔄',
      schreibenTitle: 'Schreiben: Beschwerdebrief über defekte Arbeitsgeräte',
      schreibenPrompt: 'Sie haben vor zwei Wochen neue Bürostühle bestellt, die mangelhaft geliefert wurden...',
      schreibenPhases: ['1. Betreff & Anrede', '2. Grund des Schreibens', '3. Mängelbeschreibung', '4. Fristsetzung & Forderung'],
      sprechenTitle: 'Sprechen Teil 3: Gemeinsam eine Lösung finden',
      sprechenPrompt: 'Situation: Im Betrieb fällt kurzfristig die Kaffeemaschine im Pausenraum aus...',
      sprechenTimer: '⏱️ Vorbereitungszeit: 01:30 min | Sprechzeit: 03:00 min',
    },
    comparison: {
      title: 'Інвестуй у свої знання розумно.',
      subtitle: 'Чому підготовка з Beruf B2+ — це найвигідніше рішення на ринку.',
      colFeature: 'Параметр',
      colTutor: 'Приватний репетитор',
      colBooks: 'Друковані підручники',
      colApp: 'Beruf B2+ Trainer',
      rowPrice: 'Вартість',
      rowTutorPrice: '€150 – €250 / міс.',
      rowBooksPrice: '€40 – €60 (2 книги)',
      rowAppPrice: 'від €14.99 (Одноразово)',
      rowAccess: 'Доступність',
      rowTutorAccess: 'Тільки 1–2 год на тиждень',
      rowBooksAccess: 'Тільки вдома на папері',
      rowAppAccess: '24/7 з телефону та ПК',
      rowAudio: 'Аудіо та інтерактив',
      rowTutorAudio: 'Залежить від викладача',
      rowBooksAudio: 'Незручні CD-диски або лінки',
      rowAppAudio: 'Миттєве аудіо в 1 клік',
      rowSpeaking: 'Усна частина (Sprechen)',
      rowTutorSpeaking: 'Обмежена кількість тем',
      rowBooksSpeaking: 'Лише 3–4 приклади',
      rowAppSpeaking: '171 інтерактивна ситуація',
      rowSrs: 'Тренажер слів (SRS)',
      rowTutorSrs: 'Немає',
      rowBooksSrs: 'Немає (лише список)',
      rowAppSrs: '385 карток з алгоритмом повторень',
    },
    pricing: {
      title: 'Оберіть свій тарифний план',
      subtitle: 'Без прихованих підписок. Прозорий доступ на обраний період.',
      plan1Name: '14 днів (Intensive Sprint)',
      plan1Price: '€14.99',
      plan1Period: 'за 14 днів доступу',
      plan1Desc: 'Ідеально, якщо іспит уже на носі і треба терміново «набити руку» на тестах.',
      plan2Name: '30 днів (Full Prep)',
      plan2Badge: '🔥 Хіт продажів',
      plan2Price: '€24.99',
      plan2Period: 'за 30 днів доступу',
      plan2Desc: 'Оптимальний вибір для спокійної та системної підготовки до всіх частин іспиту.',
      plan3Name: 'Lifetime (Назавжди)',
      plan3Price: '€49.99',
      plan3Period: 'одноразово назавжди',
      plan3Desc: 'Повний необмежений доступ до всіх 12 тестів та оновлень бази назавжди.',
      btnStart: 'Спробувати 14 днів',
      btnUnlock: 'Отримати повний доступ на 30 днів',
      btnLifetime: 'Отримати Lifetime доступ',
      features1: [
        'Усі 12 Modelltests (Lesen, Hören, Sprachbausteine)',
        '385 слів Wortschatz з розумними картками',
        'Аудіозаписи носіїв мови',
        'Статистика помилок',
      ],
      features2: [
        'Усі 12 повних Modelltests',
        '92 теми Forumsbeitrag & листів з шаблонами',
        '171 ситуація для Sprechen Teil 2 та 3',
        'Інтерактивний Wortschatz SRS тренажер',
        'Пріоритетна підтримка',
      ],
      features3: [
        'Довічний доступ без обмеження за часом',
        'Усі поточні та майбутні бонусні модельтести',
        'Усі 92 теми листів + 171 тема Sprechen',
        'Офлайн PWA-доступ на телефоні',
      ],
      paymentTitle: 'Безпечна оплата через Stripe (Apple Pay, Google Pay, Visa, Mastercard, PayPal)',
    },
    faq: {
      title: 'Часті запитання (FAQ)',
      subtitle: 'Відповіді на все, що вас цікавить перед початком підготовки.',
      q1: 'Чи підходять ваші тести для іспитів telc та BAMF DTB?',
      a1: 'Так, на 100%. Усі завдання, структура балів, типи питань та часові ліміти повністю відповідають чинному офіційному формату Deutsch-Test für den Beruf B2.',
      q2: 'Як я можу оплатити доступ?',
      a2: 'Оплата відбувається через міжнародну захищену систему Stripe. Ви можете оплатити будь-якою банківською карткою, Apple Pay, Google Pay або PayPal.',
      q3: 'Чи працює платформа на мобільному телефоні (iPhone / Android)?',
      a3: 'Так! Платформа повністю оптимізована під мобільні екрани. Ви можете тренуватися в транспорті, вдома чи на роботі без необхідності завантажувати важкі файли.',
      q4: 'Чи є в тестах справжні аудіозаписи для частини Hören?',
      a4: 'Так. Для всіх завдань частини Hören ми підготували якісні аудіофайли з реальними голосами носіїв мови та регламентованими паузами для читання завдань.',
    },
    footer: {
      leadTitle: 'Склади B2 Beruf з першого разу та отримай сертифікат',
      leadSubtitle: 'Почни тренування вже зараз безкоштовно.',
      leadCta: 'Спробувати безкоштовно (Demo)',
      rights: '© 2026 Beruf B2+ Trainer. Усі права захищено.',
      disclaimer: 'Не є офіційним продуктом telc gGmbH або BAMF. Платформа створена для ефективної самостійної підготовки до іспиту DTB B2.',
    },
  },
  de: {
    nav: {
      features: 'Funktionen',
      whatInside: 'Inhalte',
      howItWorks: 'Ablauf',
      pricing: 'Preise',
      faq: 'FAQ',
      blog: 'Ratgeber',
      ctaDemo: 'Demo testen',
    },
    hero: {
      preHeadline: '🇩🇪 Vorbereitung auf den Deutsch-Test für den Beruf B2 (DTB / telc)',
      h1: 'Bestehen Sie die B2 Beruf Prüfung beim ',
      h1Highlight: '1. Versuch',
      h1After: '. Ohne Stress und stures Pauken.',
      subtitle:
        'Die umfassende Lernplattform mit allen echten Prüfungsthemen: 12 vollständige Modelltests (8 Original + 4 Bonus DTB), 92 Forumsbeitrag- & Briefthemen sowie 171 Sprechsituationen. Online trainieren auf Smartphone und PC.',
      ctaPrimary: 'Kostenlos testen (Demo)',
      ctaSecondary: 'Alle Tarife ansehen',
      trustText: 'Aufgabenformat entspricht zu 100% den Standards der offiziellen DTB-Prüfung (BAMF / telc)',
      badge1Val: '12',
      badge1Label: 'Modelltests',
      badge2Val: '92',
      badge2Label: 'Schreibthemen',
      badge3Val: '171',
      badge3Label: 'Sprechsituationen',
      badge4Val: '385',
      badge4Label: 'SRS-Wortschatzkarten',
    },
    pain: {
      title: 'Die B2-Prüfung nicht zu bestehen ist teuer und zeitraubend.',
      card1Title: '❌ Lange Wartezeiten',
      card1Desc: 'Auf einen neuen Prüfungstermin an Sprachschulen wartet man oft 3 bis 6 Monate.',
      card2Title: '❌ Hohe Wiederholungskosten',
      card2Desc: 'Eine Wiederholungsprüfung aus eigener Tasche kostet €170–€230 ohne Extrakurse.',
      card3Title: '❌ Gefahr für die Karriere',
      card3Desc: 'Ohne B2-Beruf-Zertifikat gibt es keine Berufsanerkennung (Anerkennung) und keinen Festvertrag.',
      conclusion: 'Spielen Sie nicht mit Ihrer Zukunft. Trainieren Sie das Format bis zum Automatismus.',
    },
    inside: {
      title: 'Alles für Ihre Vorbereitung an einem Ort.',
      subtitle: 'Schluss mit unübersichtlichen PDF-Sammlungen und teuren €25-Büchern.',
      item1Title: '🎧 12 Vollständige Modelltests',
      item1Desc: 'Lesen, Hören und Sprachbausteine nach Prüfungszeit mit sofortiger Punkteauswertung und Audio.',
      item2Title: '✍️ 92 Forumsbeitrag- & Schreibthemen',
      item2Desc: 'Echte Prüfungsthemen: Beschwerden, Informationsbitten und Optimierungsvorschläge mit Satzbausteinen.',
      item3Title: '🗣 171 Sprechsituationen',
      item3Desc: '104 Themen für Teil 2 (Präsentation/Diskussion) und 67 Situationen für Teil 3 (Problemlösung im Betrieb).',
      item4Title: '🎮 Interaktiver Wortschatz & SRS',
      item4Desc: '385 berufsrelevante Nomen-Verb-Verbindungen & Redemittel mit Spaced-Repetition-Karteikarten und Audio.',
    },
    preview: {
      title: 'Wie läuft Ihr Training ab?',
      subtitle: 'Moderne, intuitive Benutzeroberfläche – optimiert für Handy, Tablet und Desktop.',
      tabHoeren: '🎧 Hören & Lesen',
      tabWortschatz: '🎴 Wortschatz SRS',
      tabSchreiben: '✍️ Schreibtrainer',
      tabSprechen: '🗣️ Sprechen Teil 2/3',
      hoerenTitle: 'Hören Teil 1: Telefongespräch am Arbeitsplatz',
      hoerenAudioDesc: 'Muttersprachliche Audioaufnahme mit originalen Lese- & Bearbeitungspausen',
      hoerenQuestion: 'Was ist der Hauptgrund für den Anruf von Herrn Weber?',
      hoerenOptA: 'a) Eine Terminverschiebung für die Teambesprechung anfragen',
      hoerenOptB: 'b) Die fehlerhafte Rechnungsstellung der Lieferanten beanstanden (Richtig)',
      hoerenOptC: 'c) Sich über neue Arbeitszeiten im Betrieb informieren',
      wortschatzFrontPrompt: '💡 Gesuchte Bedeutung / Kontext:',
      wortschatzFrontMeaning: 'die Verantwortung / Zuständigkeit für eine Aufgabe haben',
      wortschatzFrontGap: 'Für welche Aufgabenbereiche sind Sie im Betrieb [ _______ ]?',
      wortschatzBackTerm: 'zuständig sein für (+ Akk.)',
      wortschatzBackMeaning: 'die Verantwortung für etwas tragen',
      wortschatzBackExample: 'Frau Weber ist in unserer Abteilung für die Rechnungsprüfung zuständig.',
      wortschatzClickToFlip: 'Klicken zum Umdrehen der Karte 🔄',
      schreibenTitle: 'Schreiben: Beschwerdebrief über defekte Arbeitsgeräte',
      schreibenPrompt: 'Sie haben vor zwei Wochen neue Bürostühle bestellt, die mangelhaft geliefert wurden...',
      schreibenPhases: ['1. Betreff & Anrede', '2. Grund des Schreibens', '3. Mängelbeschreibung', '4. Fristsetzung & Forderung'],
      sprechenTitle: 'Sprechen Teil 3: Gemeinsam eine Lösung finden',
      sprechenPrompt: 'Situation: Im Betrieb fällt kurzfristig die Kaffeemaschine im Pausenraum aus...',
      sprechenTimer: '⏱️ Vorbereitungszeit: 01:30 min | Sprechzeit: 03:00 min',
    },
    comparison: {
      title: 'Investieren Sie klug in Ihren Erfolg.',
      subtitle: 'Warum Beruf B2+ das effektivste Preis-Leistungs-Verhältnis bietet.',
      colFeature: 'Kriterium',
      colTutor: 'Privater Nachhilfelehrer',
      colBooks: 'Gedruckte Lehrbücher',
      colApp: 'Beruf B2+ Trainer',
      rowPrice: 'Preis',
      rowTutorPrice: '€150 – €250 / Monat',
      rowBooksPrice: '€40 – €60 (2 Bücher)',
      rowAppPrice: 'ab €14.99 (Einmalig)',
      rowAccess: 'Verfügbarkeit',
      rowTutorAccess: 'Nur 1–2 Std. pro Woche',
      rowBooksAccess: 'Nur zu Hause auf Papier',
      rowAppAccess: '24/7 auf Handy & PC',
      rowAudio: 'Audio & Interaktivität',
      rowTutorAudio: 'Abhängig vom Lehrer',
      rowBooksAudio: 'Umständliche Audio-CDs / Web-Links',
      rowAppAudio: 'Direktes Audio mit 1 Klick',
      rowSpeaking: 'Mündliche Prüfung',
      rowTutorSpeaking: 'Wenige Themen pro Stunde',
      rowBooksSpeaking: 'Nur 3–4 statische Beispiele',
      rowAppSpeaking: '171 interaktive Situationen',
      rowSrs: 'Wortschatz-Trainer (SRS)',
      rowTutorSrs: 'Nicht vorhanden',
      rowBooksSrs: 'Nur statische Wortlisten',
      rowAppSrs: '385 Karten mit Spaced-Repetition-Algorithmus',
    },
    pricing: {
      title: 'Wählen Sie Ihren passenden Plan',
      subtitle: 'Keine Abofallen. Volle Kostentransparenz.',
      plan1Name: '14 Tage (Intensive Sprint)',
      plan1Price: '€14.99',
      plan1Period: 'für 14 Tage Zugang',
      plan1Desc: 'Perfekt für den Endspurt, wenn die Prüfung unmittelbar bevorsteht.',
      plan2Name: '30 Tage (Full Prep)',
      plan2Badge: '🔥 Bestseller',
      plan2Price: '€24.99',
      plan2Period: 'für 30 Tage Zugang',
      plan2Desc: 'Die beliebteste Wahl für eine gründliche, strukturierte Vorbereitung.',
      plan3Name: 'Lifetime (Unbegrenzt)',
      plan3Price: '€49.99',
      plan3Period: 'einmalig dauerhaft',
      plan3Desc: 'Unbegrenzter dauerhafter Zugriff auf alle 12 Modelltests und zukünftige Updates.',
      btnStart: '14 Tage starten',
      btnUnlock: '30 Tage Full Prep freischalten',
      btnLifetime: 'Lifetime Zugang sichern',
      features1: [
        'Alle 12 Modelltests (Lesen, Hören, Sprachbausteine)',
        '385 Wortschatzkarten mit intelligentem Wiederholen',
        'Muttersprachliche Audioaufnahmen',
        'Detaillierte Fehleranalyse',
      ],
      features2: [
        'Alle 12 Modelltests in voller Länge',
        '92 Forumsbeitrag- & Schreibthemen mit Bausteinen',
        '171 Sprechsituationen für Teil 2 & Teil 3',
        'Interaktiver Wortschatz SRS-Trainer',
        'Prioritäts-Support',
      ],
      features3: [
        'Lebenslanger unbegrenzter Zugang ohne Zeitlimit',
        'Alle aktuellen und künftigen Bonus-Modelltests',
        'Alle 92 Schreibthemen + 171 Sprechthemen',
        'Offline PWA-Nutzung auf dem Smartphone',
      ],
      paymentTitle: 'Sichere Bezahlung via Stripe (Apple Pay, Google Pay, Visa, Mastercard, PayPal)',
    },
    faq: {
      title: 'Häufig gestellte Fragen (FAQ)',
      subtitle: 'Alles, was Sie vor dem Start Ihrer Vorbereitung wissen müssen.',
      q1: 'Sind die Tests mit den offiziellen telc / BAMF DTB Prüfungen kompatibel?',
      a1: 'Ja, zu 100%. Aufgabenformate, Zeitbegrenzungen, Bewertungsschemata und Fragentypen entsprechen exakt dem aktuellen Prüfungsreglement.',
      q2: 'Welche Zahlungsmethoden werden akzeptiert?',
      a2: 'Die Zahlungsabwicklung erfolgt über den verschlüsselten Zahlungsdienstleister Stripe. Wir akzeptieren alle gängigen Kreditkarten, Apple Pay, Google Pay und PayPal.',
      q3: 'Funktioniert die Plattform auf Smartphones (iOS / Android)?',
      a3: 'Ja! Die Anwendung ist voll responsiv und funktioniert auf allen modernen Handys, Tablets und PCs ohne App-Download.',
      q4: 'Gibt es echte Audioaufnahmen für den Hören-Teil?',
      a4: 'Ja. Alle Hörverstehensübungen enthalten professionelle Audioaufnahmen mit authentischen muttersprachlichen Sprechern und echten Pausen.',
    },
    footer: {
      leadTitle: 'Bestehen Sie die B2 Beruf Prüfung beim ersten Mal',
      leadSubtitle: 'Starten Sie Ihr kostenloses Training noch heute.',
      leadCta: 'Kostenlos testen (Demo)',
      rights: '© 2026 Beruf B2+ Trainer. Alle Rechte vorbehalten.',
      disclaimer: 'Kein offizielles Produkt der telc gGmbH oder des BAMF. Entwickelt zur effizienten Prüfungsvorbereitung.',
    },
  },
  en: {
    nav: {
      features: 'Features',
      whatInside: 'What’s Inside',
      howItWorks: 'How it works',
      pricing: 'Pricing',
      faq: 'FAQ',
      blog: 'Guides',
      ctaDemo: 'Try Demo',
    },
    hero: {
      preHeadline: '🇩🇪 German B2 Professional Exam Prep (DTB / telc)',
      h1: 'Pass the B2 Beruf Exam on your ',
      h1Highlight: 'first try',
      h1After: '. Without stress and cramming.',
      subtitle:
        'The all-in-one exam trainer: 12 full model tests (8 official + 4 bonus DTB), 92 letter/forum topics and 171 speaking situations. Practice online on mobile or PC.',
      ctaPrimary: 'Try Demo for Free',
      ctaSecondary: 'View all plans',
      trustText: '100% aligned with official DTB (BAMF / telc) exam standards',
      badge1Val: '12',
      badge1Label: 'Model Tests',
      badge2Val: '92',
      badge2Label: 'Writing Topics',
      badge3Val: '171',
      badge3Label: 'Speaking Prompts',
      badge4Val: '385',
      badge4Label: 'SRS Vocab Cards',
    },
    pain: {
      title: 'Failing the B2 exam is expensive and time-consuming.',
      card1Title: '❌ Long Retake Queues',
      card1Desc: 'Waiting for a new exam date at language schools takes 3 to 6 months.',
      card2Title: '❌ Expensive Retake Fees',
      card2Desc: 'Retaking the exam out of pocket costs €170–€230 without extra courses.',
      card3Title: '❌ Career Setback',
      card3Desc: 'Without the B2 Beruf certificate, professional diploma recognition (Anerkennung) and permanent contracts are withheld.',
      conclusion: 'Don’t gamble with your career. Master the exam format beforehand.',
    },
    inside: {
      title: 'Everything you need in one place.',
      subtitle: 'No more scattered PDF files and €25 paper textbooks.',
      item1Title: '🎧 12 Full Model Tests',
      item1Desc: 'Reading, Listening and Grammar with official timing, instant scoring, and native speaker audios.',
      item2Title: '✍️ 92 Writing & Forum Topics',
      item2Desc: 'Authentic exam scenarios: complaints, information requests, and workflow suggestions with sample structures.',
      item3Title: '🗣 171 Speaking Prompts',
      item3Desc: '104 Part 2 presentations/discussions and 67 Part 3 workplace problem-solving tasks.',
      item4Title: '🎮 Interactive Wortschatz SRS',
      item4Desc: '385 essential workplace phrases with Spaced Repetition flashcards and audio.',
    },
    preview: {
      title: 'How does your training work?',
      subtitle: 'Clean, interactive interface tailored for smartphones and laptops.',
      tabHoeren: '🎧 Listening & Reading',
      tabWortschatz: '🎴 Vocab SRS',
      tabSchreiben: '✍️ Writing Trainer',
      tabSprechen: '🗣️ Speaking Part 2/3',
      hoerenTitle: 'Listening Part 1: Workplace Phone Call',
      hoerenAudioDesc: 'Native German audio recording with official exam pauses',
      hoerenQuestion: 'What is the main reason for Mr. Weber’s call?',
      hoerenOptA: 'a) Request to postpone the team meeting',
      hoerenOptB: 'b) Complain about incorrect supplier invoice (Correct)',
      hoerenOptC: 'c) Ask about new company working hours',
      wortschatzFrontPrompt: '💡 Meaning & Context Clue:',
      wortschatzFrontMeaning: 'to be in charge of / responsible for a task',
      wortschatzFrontGap: 'Für welche Aufgabenbereiche sind Sie im Betrieb [ _______ ]?',
      wortschatzBackTerm: 'zuständig sein für (+ Acc.)',
      wortschatzBackMeaning: 'to be responsible for something',
      wortschatzBackExample: 'Frau Weber ist in unserer Abteilung für die Rechnungsprüfung zuständig.',
      wortschatzClickToFlip: 'Click to flip card 🔄',
      schreibenTitle: 'Writing: Complaint letter regarding defective workplace equipment',
      schreibenPrompt: 'You ordered new office chairs two weeks ago which arrived damaged...',
      schreibenPhases: ['1. Subject & Salutation', '2. Purpose of letter', '3. Defect details', '4. Deadline & Action requested'],
      sprechenTitle: 'Speaking Part 3: Solving a Problem Together',
      sprechenPrompt: 'Situation: The coffee machine in the staff room broke down unexpectedly...',
      sprechenTimer: '⏱️ Prep time: 01:30 min | Speaking time: 03:00 min',
    },
    comparison: {
      title: 'Invest wisely in your success.',
      subtitle: 'Why Beruf B2+ gives you the highest return on investment.',
      colFeature: 'Feature',
      colTutor: 'Private Tutor',
      colBooks: 'Paper Books',
      colApp: 'Beruf B2+ Trainer',
      rowPrice: 'Price',
      rowTutorPrice: '€150 – €250 / month',
      rowBooksPrice: '€40 – €60 (2 books)',
      rowAppPrice: 'from €14.99 (One-time)',
      rowAccess: 'Availability',
      rowTutorAccess: 'Only 1–2 hours/week',
      rowBooksAccess: 'Only at home on paper',
      rowAppAccess: '24/7 on Phone & PC',
      rowAudio: 'Audio & Interactive',
      rowTutorAudio: 'Depends on tutor',
      rowBooksAudio: 'Inconvenient CDs/links',
      rowAppAudio: 'Instant 1-click audio',
      rowSpeaking: 'Speaking Prompts',
      rowTutorSpeaking: 'Few topics per hour',
      rowBooksSpeaking: 'Only 3–4 static samples',
      rowAppSpeaking: '171 interactive prompts',
      rowSrs: 'Vocab SRS System',
      rowTutorSrs: 'None',
      rowBooksSrs: 'Static word lists only',
      rowAppSrs: '385 cards with Spaced Repetition',
    },
    pricing: {
      title: 'Choose your preparation plan',
      subtitle: 'No recurring subscriptions. Transparent one-time access.',
      plan1Name: '14 Days (Sprint)',
      plan1Price: '€14.99',
      plan1Period: 'for 14 days access',
      plan1Desc: 'Ideal for rapid revision right before your exam.',
      plan2Name: '30 Days (Full Prep)',
      plan2Badge: '🔥 Bestseller',
      plan2Price: '€24.99',
      plan2Period: 'for 30 days access',
      plan2Desc: 'Most popular package for thorough, relaxed preparation.',
      plan3Name: 'Lifetime Access',
      plan3Price: '€49.99',
      plan3Period: 'one-time lifetime',
      plan3Desc: 'Unlimited lifetime access to all 12 model tests and future updates.',
      btnStart: 'Start 14 Days',
      btnUnlock: 'Unlock 30 Days Full Prep',
      btnLifetime: 'Get Lifetime Access',
      features1: [
        'All 12 Model Tests (Reading, Listening, Language elements)',
        '385 Vocab cards with smart review',
        'Native speaker audio files',
        'Mistake analytics',
      ],
      features2: [
        'All 12 Full Model Tests',
        '92 Writing/Forum scenarios with sentence templates',
        '171 Speaking scenarios for Part 2 & 3',
        'Interactive Vocab SRS Trainer',
        'Priority Support',
      ],
      features3: [
        'Lifetime access with no time limits',
        'All current and future bonus tests',
        'All 92 writing + 171 speaking prompts',
        'Offline PWA support on smartphone',
      ],
      paymentTitle: 'Secure payments powered by Stripe (Apple Pay, Google Pay, Visa, Mastercard, PayPal)',
    },
    faq: {
      title: 'Frequently Asked Questions (FAQ)',
      subtitle: 'Everything you need to know before starting your prep.',
      q1: 'Does this match official telc & BAMF DTB exam formats?',
      a1: 'Yes, 100%. All test structures, scoring formulas, audio pauses, and question types strictly adhere to official DTB B2 regulations.',
      q2: 'How can I pay for access?',
      a2: 'Payments are processed securely via Stripe. You can pay with any credit/debit card, Apple Pay, Google Pay, or PayPal.',
      q3: 'Does it work on mobile phones (iOS / Android)?',
      a3: 'Yes! The web platform is fully responsive and optimized for mobile browsers. You can also install it to your home screen as a PWA.',
      q4: 'Are there authentic audio recordings for the Listening section?',
      a4: 'Yes, all listening exercises include high-quality recordings from native German speakers with regulated examination pauses.',
    },
    footer: {
      leadTitle: 'Pass your B2 Beruf exam and get certified',
      leadSubtitle: 'Start practicing today for free.',
      leadCta: 'Try Free Demo',
      rights: '© 2026 Beruf B2+ Trainer. All rights reserved.',
      disclaimer: 'Not an official product of telc gGmbH or BAMF. Developed for independent exam preparation.',
    },
  },
  tr: {
    nav: {
      features: 'Özellikler',
      whatInside: 'İçerik',
      howItWorks: 'Nasıl Çalışır',
      pricing: 'Fiyatlar',
      faq: 'SSS',
      blog: 'Rehber',
      ctaDemo: 'Demo Dene',
    },
    hero: {
      preHeadline: '🇩🇪 Deutsch-Test für den Beruf B2 (DTB / telc) Hazırlık',
      h1: 'B2 Beruf Sınavını ',
      h1Highlight: 'İlk Seferde',
      h1After: ' Geçin. Stres ve ezber olmadan.',
      subtitle:
        'Tüm gerçek sınav konularını içeren tek platform: 12 tam model sınav (8 orijinal + 4 bonus DTB), 92 mektup/forum konusu ve 171 sözlü sınav senaryosu. Telefondan ve PC’den online çalışın.',
      ctaPrimary: 'Ücretsiz Dene (Demo)',
      ctaSecondary: 'Tüm Fiyatları Gör',
      trustText: 'Soru formatı %100 resmi DTB (BAMF / telc) sınav standartlarına uygundur',
      badge1Val: '12',
      badge1Label: 'Model Test',
      badge2Val: '92',
      badge2Label: 'Yazma Konusu',
      badge3Val: '171',
      badge3Label: 'Sözlü Durum',
      badge4Val: '385',
      badge4Label: 'SRS Kelime Kartı',
    },
    pain: {
      title: 'B2 sınavında kalmak pahalı ve zaman kaybettiricidir.',
      card1Title: '❌ Uzun Tekrar Sınavı Kuyrukları',
      card1Desc: 'Dil okullarında yeni bir sınav tarihi için 3 ila 6 ay beklemek gerekebilir.',
      card2Title: '❌ Yüksek Tekrar Ücretleri',
      card2Desc: 'Sınavı tekrar almak kendi cebinizden €170–€230 tutar.',
      card3Title: '❌ Kariyer Engeli',
      card3Desc: 'B2 Beruf sertifikası olmadan diploma denkliği (Anerkennung) ve kalıcı iş sözleşmesi verilmez.',
      conclusion: 'Kariyerinizi şansa bırakmayın. Sınav formatını otomatikleşene kadar pratik yapın.',
    },
    inside: {
      title: 'Hazırlık için ihtiyacınız olan her şey tek yerde.',
      subtitle: 'Dağınık PDF’lere ve €25’luk pahalı kitaplara son.',
      item1Title: '🎧 12 Tam Modelltest',
      item1Desc: 'Lesen, Hören ve Sprachbausteine sınav süresiyle, anında puanlama ve anadili Almanca olan ses kayıtları.',
      item2Title: '✍️ 92 Forumsbeitrag & Mektup Konusu',
      item2Desc: 'Şikayet (Beschwerde), bilgi talebi ve iş yeri önerileri için hazır kalıplar ve örnekler.',
      item3Title: '🗣 171 Sprechen Senaryosu',
      item3Desc: 'Teil 2 için 104 sunum konusu ve Teil 3 için 67 iş yeri problem çözme diyaloğu.',
      item4Title: '🎮 İnteraktif Wortschatz & SRS',
      item4Desc: 'Spaced Repetition kelime kartları ve sesli telaffuz ile 385 temel mesleki kalıp.',
    },
    preview: {
      title: 'Çalışma süreciniz nasıl işler?',
      subtitle: 'Akıllı telefon ve bilgisayarlar için optimize edilmiş modern arayüz.',
      tabHoeren: '🎧 Hören & Lesen',
      tabWortschatz: '🎴 Wortschatz SRS',
      tabSchreiben: '✍️ Yazma Antrenörü',
      tabSprechen: '🗣️ Sözlü Teil 2/3',
      hoerenTitle: 'Hören Teil 1: İş yerinde telefon görüşmesi',
      hoerenAudioDesc: 'Orijinal sınav duraklamalarıyla anadili Almanca olan ses kaydı',
      hoerenQuestion: 'Bay Weber’in aramasının ana sebebi nedir?',
      hoerenOptA: 'a) Ekip toplantısını ertelemeyi talep etmek',
      hoerenOptB: 'b) Tedarikçinin hatalı faturasına itiraz etmek (Doğru)',
      hoerenOptC: 'c) Şirketteki yeni çalışma saatleri hakkında bilgi almak',
      wortschatzFrontPrompt: '💡 İstenen Anlam / Bağlam:',
      wortschatzFrontMeaning: 'bir görev için sorumluluğa sahip olmak',
      wortschatzFrontGap: 'Für welche Aufgabenbereiche sind Sie im Betrieb [ _______ ]?',
      wortschatzBackTerm: 'zuständig sein für (+ Akk.)',
      wortschatzBackMeaning: 'bir şeyden sorumlu olmak',
      wortschatzBackExample: 'Frau Weber ist in unserer Abteilung für die Rechnungsprüfung zuständig.',
      wortschatzClickToFlip: 'Kartı çevirmek için tıklayın 🔄',
      schreibenTitle: 'Schreiben: Arızalı ofis eşyaları hakkında şikayet mektubu',
      schreibenPrompt: 'İki hafta önce sipariş ettiğiniz ofis sandalyeleri hasarlı teslim edildi...',
      schreibenPhases: ['1. Konu & Hitap', '2. Yazma Amacı', '3. Kusur Detayı', '4. Süre & Talep'],
      sprechenTitle: 'Sprechen Teil 3: Birlikte Çözüm Bulma',
      sprechenPrompt: 'Durum: Dinlenme odasındaki kahve makinesi aniden bozuldu...',
      sprechenTimer: '⏱️ Hazırlık süresi: 01:30 dk | Konuşma süresi: 03:00 dk',
    },
    comparison: {
      title: 'Bilginize akıllıca yatırım yapın.',
      subtitle: 'Neden Beruf B2+ en avantajlı sınav hazırlık çözümüdür.',
      colFeature: 'Özellik',
      colTutor: 'Özel Öğretmen',
      colBooks: 'Ders Kitapları',
      colApp: 'Beruf B2+ Trainer',
      rowPrice: 'Fiyat',
      rowTutorPrice: '€150 – €250 / ay',
      rowBooksPrice: '€40 – €60 (2 kitap)',
      rowAppPrice: '€14.99’dan başlayan (Tek seferlik)',
      rowAccess: 'Erişilebilirlik',
      rowTutorAccess: 'Haftada sadece 1–2 saat',
      rowBooksAccess: 'Sadece evde kağıt üzerinde',
      rowAppAccess: 'Telefonda & PC’de 7/24',
      rowAudio: 'Ses Kayıtları',
      rowTutorAudio: 'Öğretmene bağlı',
      rowBooksAudio: 'Kullanışsız CD / linkler',
      rowAppAudio: 'Tek tıkla anında ses',
      rowSpeaking: 'Sözlü Sınav (Sprechen)',
      rowTutorSpeaking: 'Sınırlı sayıda konu',
      rowBooksSpeaking: 'Sadece 3–4 örnek',
      rowAppSpeaking: '171 interaktif senaryo',
      rowSrs: 'Kelime SRS Sistemi',
      rowTutorSrs: 'Yok',
      rowBooksSrs: 'Yalnızca sabit liste',
      rowAppSrs: 'Aralıklı tekrar algoritmalı 385 kart',
    },
    pricing: {
      title: 'Size Uygun Planı Seçin',
      subtitle: 'Otomatik yenilenen abonelik yok. Şeffaf tek seferlik erişim.',
      plan1Name: '14 Gün (Hızlı Sprint)',
      plan1Price: '€14.99',
      plan1Period: '14 gün erişim',
      plan1Desc: 'Sınava az zamanı kalanlar ve hızlıca test çözmek isteyenler için.',
      plan2Name: '30 Gün (Full Prep)',
      plan2Badge: '🔥 En Çok Satan',
      plan2Price: '€24.99',
      plan2Period: '30 gün erişim',
      plan2Desc: 'Sakin ve kapsamlı bir sınav hazırlığı için en popüler paket.',
      plan3Name: 'Lifetime (Süresiz)',
      plan3Price: '€49.99',
      plan3Period: 'ömür boyu tek seferlik',
      plan3Desc: 'Tüm 12 teste ve gelecekteki güncellemelere sınırsız ömür boyu erişim.',
      btnStart: '14 Gün Başla',
      btnUnlock: '30 Gün Full Prep Aç',
      btnLifetime: 'Lifetime Erişim Al',
      features1: [
        'Tüm 12 Modelltest (Okuma, Dinleme, Dil Yapıları)',
        'Akıllı tekrarlı 385 Wortschatz kartı',
        'Anadili Almanca olan ses dosyaları',
        'Hata analizi ve istatistikler',
      ],
      features2: [
        'Tüm 12 Tam Modelltest',
        '92 Forumsbeitrag ve mektup konusu',
        'Teil 2 ve 3 için 171 Sprechen senaryosu',
        'İnteraktif Wortschatz SRS Antrenörü',
        'Öncelikli Destek',
      ],
      features3: [
        'Zaman sınırı olmadan ömür boyu erişim',
        'Tüm mevcut ve gelecek bonus testler',
        '92 yazma + 171 konuşma konusu',
        'Akıllı telefonda çevrimdışı PWA desteği',
      ],
      paymentTitle: 'Stripe ile güvenli ödeme (Apple Pay, Google Pay, Visa, Mastercard, PayPal)',
    },
    faq: {
      title: 'Sıkça Sorulan Sorular (FAQ)',
      subtitle: 'Çalışmaya başlamadan önce bilmeniz gereken her şey.',
      q1: 'Testler resmi telc ve BAMF DTB sınavlarına uygun mu?',
      a1: 'Evet, %100. Soru tipleri, süre sınırları, puanlama ve içerikler birebir resmi DTB B2 sınav yönetmeliğine uygundur.',
      q2: 'Nasıl ödeme yapabilirim?',
      a2: 'Ödemeler uluslararası güvenlik standardı Stripe üzerinden yapılır. Kredi kartı, banka kartı, Apple Pay, Google Pay ve PayPal kullanabilirsiniz.',
      q3: 'Uygulama cep telefonunda (iPhone / Android) çalışıyor mu?',
      a3: 'Evet! Platform tüm akıllı telefonlar için tamamen optimize edilmiştir.',
      q4: 'Hören (Dinleme) bölümünde gerçek ses kayıtları var mı?',
      a4: 'Evet, tüm dinleme alıştırmaları resmi sınav duraklamaları ve anadili Almanca olan seslendirmenlerle hazırlanmıştır.',
    },
    footer: {
      leadTitle: 'B2 Beruf sınavını ilk seferde geçin ve sertifikanızı alın',
      leadSubtitle: 'Hemen bugün ücretsiz denemeye başlayın.',
      leadCta: 'Ücretsiz Dene (Demo)',
      rights: '© 2026 Beruf B2+ Trainer. Tüm hakları saklıdır.',
      disclaimer: 'telc gGmbH veya BAMF resmi ürünü değildir. Bireysel sınav hazırlığı için geliştirilmiştir.',
    },
  },
  es: {
    nav: {
      features: 'Ventajas',
      whatInside: 'Contenido',
      howItWorks: 'Cómo funciona',
      pricing: 'Precios',
      faq: 'Preguntas',
      blog: 'Blog',
      ctaDemo: 'Probar Demo',
    },
    hero: {
      preHeadline: '🇩🇪 Preparación para Deutsch-Test für den Beruf B2 (DTB / telc)',
      h1: 'Aprueba el examen B2 Beruf al ',
      h1Highlight: 'primer intento',
      h1After: '. Sin estrés ni memorización inútil.',
      subtitle:
        'La plataforma integral con todos los temas reales: 12 exámenes modelo completos (8 oficiales + 4 bonus DTB), 92 temas de cartas/foros y 171 situaciones orales. Practica online en tu móvil o PC.',
      ctaPrimary: 'Probar gratis (Demo)',
      ctaSecondary: 'Ver todos los planes',
      trustText: 'Formato 100% adaptado a los estándares oficiales de DTB (BAMF / telc)',
      badge1Val: '12',
      badge1Label: 'Exámenes Modelo',
      badge2Val: '92',
      badge2Label: 'Temas de Cartas',
      badge3Val: '171',
      badge3Label: 'Situaciones Orales',
      badge4Val: '385',
      badge4Label: 'Tarjetas SRS Vocabulario',
    },
    pain: {
      title: 'Suspender el examen B2 sale muy caro y retrasa tu vida.',
      card1Title: '❌ Largas listas de espera',
      card1Desc: 'Conseguir una nueva fecha de examen suele tardar de 3 a 6 meses.',
      card2Title: '❌ Tasas de repetición elevadas',
      card2Desc: 'Repetir el examen de tu bolsillo cuesta entre €170 y €230 sin contar cursos extra.',
      card3Title: '❌ Freno a tu carrera profesional',
      card3Desc: 'Sin el certificado B2 Beruf no otorgan la homologación de títulos (Anerkennung) ni contratos indefinidos.',
      conclusion: 'No te la juegues. Domina la estructura del examen hasta el automatismo.',
    },
    inside: {
      title: 'Todo lo necesario para tu preparación en un solo lugar.',
      subtitle: 'Olvídate de PDFs desordenados y costosos libros de €25.',
      item1Title: '🎧 12 Exámenes Modelo Completos',
      item1Desc: 'Comprensión de lectura, auditiva y estructuras con cronómetro y evaluación automática.',
      item2Title: '✍️ 92 Temas de Foros y Cartas',
      item2Desc: 'Temas reales: quejas (Beschwerde), solicitudes y propuestas de mejora con plantillas.',
      item3Title: '🗣 171 Situaciones Orales (Sprechen)',
      item3Desc: '104 temas para Parte 2 (Presentación/Debate) y 67 para Parte 3 (Resolución de problemas laborales).',
      item4Title: '🎮 Vocabulario Interactivo con SRS',
      item4Desc: '385 expresiones fijas con tarjetas Spaced Repetition, oraciones de contexto y pronunciación en audio.',
    },
    preview: {
      title: '¿Cómo funciona tu entrenamiento?',
      subtitle: 'Interfaz moderna e interactiva adaptada para móviles y ordenadores.',
      tabHoeren: '🎧 Hören & Lesen',
      tabWortschatz: '🎴 Vocabulario SRS',
      tabSchreiben: '✍️ Redacción',
      tabSprechen: '🗣️ Examen Oral 2/3',
      hoerenTitle: 'Hören Teil 1: Llamada telefónica de trabajo',
      hoerenAudioDesc: 'Audio grabado por hablantes nativos con pausas reglamentarias',
      hoerenQuestion: '¿Cuál es el motivo principal de la llamada del Sr. Weber?',
      hoerenOptA: 'a) Solicitar aplazar la reunión de equipo',
      hoerenOptB: 'b) Reclamar por una factura incorrecta del proveedor (Correcto)',
      hoerenOptC: 'c) Informarse sobre los nuevos horarios laborales',
      wortschatzFrontPrompt: '💡 Significado / Contexto buscado:',
      wortschatzFrontMeaning: 'tener la responsabilidad / estar a cargo de una tarea',
      wortschatzFrontGap: 'Für welche Aufgabenbereiche sind Sie im Betrieb [ _______ ]?',
      wortschatzBackTerm: 'zuständig sein für (+ Acusativo)',
      wortschatzBackMeaning: 'ser responsable / estar encargado de algo',
      wortschatzBackExample: 'Frau Weber ist in unserer Abteilung für die Rechnungsprüfung zuständig.',
      wortschatzClickToFlip: 'Haz clic para girar la tarjeta 🔄',
      schreibenTitle: 'Schreiben: Carta de queja por material de oficina defectuoso',
      schreibenPrompt: 'Hace dos semanas encargó sillas de oficina que llegaron con desperfectos...',
      schreibenPhases: ['1. Asunto y saludo', '2. Motivo de la carta', '3. Detalles del fallo', '4. Plazo y exigencia'],
      sprechenTitle: 'Sprechen Teil 3: Resolver un problema en equipo',
      sprechenPrompt: 'Situación: Se ha estropeado la cafetera en la sala de descanso de la empresa...',
      sprechenTimer: '⏱️ Tiempo de preparación: 01:30 min | Exposición: 03:00 min',
    },
    comparison: {
      title: 'Invierte con inteligencia en tu futuro.',
      subtitle: 'Por qué Beruf B2+ es la opción más rentable y completa del mercado.',
      colFeature: 'Criterio',
      colTutor: 'Profesor particular',
      colBooks: 'Libros impresos',
      colApp: 'Beruf B2+ Trainer',
      rowPrice: 'Precio',
      rowTutorPrice: '€150 – €250 / mes',
      rowBooksPrice: '€40 – €60 (2 libros)',
      rowAppPrice: 'desde €14.99 (Pago único)',
      rowAccess: 'Disponibilidad',
      rowTutorAccess: 'Solo 1–2 h por semana',
      rowBooksAccess: 'Solo en casa en papel',
      rowAppAccess: '24/7 en móvil y PC',
      rowAudio: 'Audios e interacción',
      rowTutorAudio: 'Depende del profesor',
      rowBooksAudio: 'Incómodos CDs o enlaces',
      rowAppAudio: 'Audio instantáneo con 1 clic',
      rowSpeaking: 'Parte Oral (Sprechen)',
      rowTutorSpeaking: 'Pocos temas por clase',
      rowBooksSpeaking: 'Solo 3–4 ejemplos fijos',
      rowAppSpeaking: '171 situaciones interactivas',
      rowSrs: 'Sistema SRS de palabras',
      rowTutorSrs: 'No tiene',
      rowBooksSrs: 'Listas estáticas',
      rowAppSrs: '385 tarjetas con algoritmo de repetición',
    },
    pricing: {
      title: 'Elige tu plan de preparación',
      subtitle: 'Sin suscripciones recurrentes ni costes ocultos.',
      plan1Name: '14 Días (Sprint Intensivo)',
      plan1Price: '€14.99',
      plan1Period: 'por 14 días de acceso',
      plan1Desc: 'Ideal para el repaso final si tu examen está muy cerca.',
      plan2Name: '30 Días (Full Prep)',
      plan2Badge: '🔥 Más Vendido',
      plan2Price: '€24.99',
      plan2Period: 'por 30 días de acceso',
      plan2Desc: 'El paquete más recomendado para una preparación sólida y tranquila.',
      plan3Name: 'Lifetime (De por vida)',
      plan3Price: '€49.99',
      plan3Period: 'pago único vitalicio',
      plan3Desc: 'Acceso ilimitado de por vida a los 12 exámenes y futuras actualizaciones.',
      btnStart: 'Empezar 14 días',
      btnUnlock: 'Obtener 30 días Full Prep',
      btnLifetime: 'Conseguir acceso Lifetime',
      features1: [
        'Los 12 Exámenes Modelo (Lectura, Escucha, Gramática)',
        '385 tarjetas de vocabulario con repaso inteligente',
        'Archivos de audio de hablantes nativos',
        'Estadísticas de errores',
      ],
      features2: [
        'Los 12 Exámenes Modelo completos',
        '92 temas de cartas y foros con conectores y plantillas',
        '171 situaciones para Sprechen Teil 2 y 3',
        'Entrenador interactivo de vocabulario SRS',
        'Soporte prioritario',
      ],
      features3: [
        'Acceso vitalicio sin límite de tiempo',
        'Todos los exámenes modelo actuales y futuros',
        'Todos los 92 temas de redacción + 171 de expresión oral',
        'Modo PWA sin conexión en el móvil',
      ],
      paymentTitle: 'Pago seguro procesado por Stripe (Apple Pay, Google Pay, Visa, Mastercard, PayPal)',
    },
    faq: {
      title: 'Preguntas Frecuentes (FAQ)',
      subtitle: 'Todo lo que necesitas saber antes de empezar a estudiar.',
      q1: '¿Son compatibles los exámenes con las pruebas oficiales de telc y BAMF DTB?',
      a1: 'Sí, al 100%. Todos los ejercicios, tiempos, formatos y puntuaciones siguen estrictamente el reglamento oficial de la prueba B2 Beruf.',
      q2: '¿Cómo puedo realizar el pago?',
      a2: 'El pago se realiza mediante la plataforma segura Stripe con tarjeta de crédito/débito, Apple Pay, Google Pay o PayPal.',
      q3: '¿Funciona en el móvil (iPhone / Android)?',
      a3: 'Sí, la plataforma está 100% optimizada para pantallas móviles.',
      q4: '¿Incluye audios reales para la parte de Hören?',
      a4: 'Sí, todos los ejercicios de comprensión auditiva cuentan con locutores nativos alemanes y pausas reglamentarias.',
    },
    footer: {
      leadTitle: 'Aprueba tu examen B2 Beruf y consigue tu certificado',
      leadSubtitle: 'Empieza a practicar hoy mismo gratis.',
      leadCta: 'Probar gratis (Demo)',
      rights: '© 2026 Beruf B2+ Trainer. Todos los derechos reservados.',
      disclaimer: 'No es un producto oficial de telc gGmbH ni del BAMF. Diseñado para la preparación autodidacta del examen.',
    },
  },
  ru: {
    nav: {
      features: 'Преимущества',
      whatInside: 'Что внутри',
      howItWorks: 'Как это работает',
      pricing: 'Тарифы',
      faq: 'Вопросы и ответы',
      blog: 'Блог',
      ctaDemo: 'Попробовать Demo',
    },
    hero: {
      preHeadline: '🇩🇪 Подготовка к экзамену Deutsch-Test für den Beruf B2 (DTB / telc)',
      h1: 'Сдай экзамен B2 Beruf с ',
      h1Highlight: 'первого раза',
      h1After: '. Без стресса и лишней зубрёжки.',
      subtitle:
        'Единственная платформа, где собраны все реальные темы экзамена: 12 полных модельтестов (8 оригинальных + 4 бонусных DTB), 92 темы для писем (Forumsbeitrag) и 171 ситуация для устной части. Тренируйся онлайн с телефона или ПК.',
      ctaPrimary: 'Попробовать бесплатно (Demo)',
      ctaSecondary: 'Посмотреть все тарифы',
      trustText: 'Формат заданий на 100% соответствует стандартам реального экзамена DTB (BAMF / telc)',
      badge1Val: '12',
      badge1Label: 'Модельтестов',
      badge2Val: '92',
      badge2Label: 'Темы для писем',
      badge3Val: '171',
      badge3Label: 'Ситуация Sprechen',
      badge4Val: '385',
      badge4Label: 'Слов Wortschatz SRS',
    },
    pain: {
      title: 'Провалить экзамен B2 — это дорого, долго и бьёт по карьере.',
      card1Title: '❌ Очереди на пересдачу',
      card1Desc: 'Ждать новой даты экзамена в языковой школе можно от 3 до 6 месяцев.',
      card2Title: '❌ Потерянные деньги',
      card2Desc: 'Повторный экзамен за свой счёт стоит €170–€230 без учёта репетиторов.',
      card3Title: '❌ Угроза карьере и документам',
      card3Desc: 'Без сертификата B2 Beruf не дают признание диплома (Anerkennung) и постоянный контракт.',
      conclusion: 'Не играй в рулетку. Натренируй формат экзамена до автоматизма.',
    },
    inside: {
      title: 'Всё, что нужно для подготовки — в одном месте.',
      subtitle: 'Больше никаких разрозненных PDF и учебников по €25.',
      item1Title: '🎧 12 Полных Modelltests',
      item1Desc: 'Lesen, Hören и Sprachbausteine по таймеру с автоматическим подсчетом баллов и озвучкой носителями.',
      item2Title: '✍️ 92 темы Forumsbeitrag и писем',
      item2Desc: 'Реальные темы с экзаменов: жалобы (Beschwerde), запросы информации и предложения по улучшению с шаблонами.',
      item3Title: '🗣 171 ситуация для Sprechen',
      item3Desc: '104 темы для Teil 2 (Презентация/Дискуссия) и 67 тем для Teil 3 (Решение проблемы с коллегой).',
      item4Title: '🎮 Интерактивный Wortschatz SRS',
      item4Desc: '385 важнейших устойчивых выражений (NVV) с карточками интервального повторения и озвучкой.',
    },
    preview: {
      title: 'Как проходит твоя тренировка?',
      subtitle: 'Современный интерактивный интерфейс, адаптированный под смартфоны и ноутбуки.',
      tabHoeren: '🎧 Hören & Lesen',
      tabWortschatz: '🎴 Wortschatz SRS',
      tabSchreiben: '✍️ Тренажер писем',
      tabSprechen: '🗣️ Sprechen Teil 2/3',
      hoerenTitle: 'Hören Teil 1: Телефонный разговор на работе',
      hoerenAudioDesc: 'Аудиозапись носителя немецкого языка с официальными паузами',
      hoerenQuestion: 'Какова главная причина звонка господина Вебера?',
      hoerenOptA: 'a) Попросить о переносе командной встречи',
      hoerenOptB: 'b) Пожаловаться на ошибочный счет от поставщика (Правильно)',
      hoerenOptC: 'c) Узнать о новом графике работы компании',
      wortschatzFrontPrompt: '💡 Искомое значение / контекст:',
      wortschatzFrontMeaning: 'нести ответственность за задачу / быть ответственным',
      wortschatzFrontGap: 'Für welche Aufgabenbereiche sind Sie im Betrieb [ _______ ]?',
      wortschatzBackTerm: 'zuständig sein für (+ Akk.)',
      wortschatzBackMeaning: 'быть ответственным за что-либо',
      wortschatzBackExample: 'Frau Weber ist in unserer Abteilung für die Rechnungsprüfung zuständig.',
      wortschatzClickToFlip: 'Нажмите, чтобы перевернуть карточку 🔄',
      schreibenTitle: 'Schreiben: Жалоба на неисправную офисную мебель',
      schreibenPrompt: 'Две недели назад вы заказали офисные кресла, которые доставили с дефектами...',
      schreibenPhases: ['1. Тема и обращение', '2. Причина письма', '3. Описание дефекта', '4. Срок и требования'],
      sprechenTitle: 'Sprechen Teil 3: Совместное решение проблемы',
      sprechenPrompt: 'Ситуация: В комнате отдыха внезапно сломалась кофемашина...',
      sprechenTimer: '⏱️ Время подготовки: 01:30 мин | Ответ: 03:00 мин',
    },
    comparison: {
      title: 'Инвестируй в свои знания с умом.',
      subtitle: 'Почему подготовка с Beruf B2+ — это самое выгодное решение.',
      colFeature: 'Параметр',
      colTutor: 'Репетитор',
      colBooks: 'Бумажные книги',
      colApp: 'Beruf B2+ Trainer',
      rowPrice: 'Стоимость',
      rowTutorPrice: '€150 – €250 / мес.',
      rowBooksPrice: '€40 – €60 (2 книги)',
      rowAppPrice: 'от €14.99 (Разово)',
      rowAccess: 'Доступность',
      rowTutorAccess: 'Только 1–2 ч в неделю',
      rowBooksAccess: 'Только дома на бумаге',
      rowAppAccess: '24/7 с телефона и ПК',
      rowAudio: 'Аудио и интерактив',
      rowTutorAudio: 'Зависит от учителя',
      rowBooksAudio: 'Неудобные CD-диски или ссылки',
      rowAppAudio: 'Мгновенное аудио в 1 клик',
      rowSpeaking: 'Устная часть (Sprechen)',
      rowTutorSpeaking: 'Мало тем за урок',
      rowBooksSpeaking: 'Лишь 3–4 примера',
      rowAppSpeaking: '171 интерактивная ситуация',
      rowSrs: 'Тренажер слов (SRS)',
      rowTutorSrs: 'Нет',
      rowBooksSrs: 'Только список на бумаге',
      rowAppSrs: '385 карточек с интервальным повторением',
    },
    pricing: {
      title: 'Выберите свой тарифный план',
      subtitle: 'Без скрытых подписок. Прозрачный доступ на выбранный срок.',
      plan1Name: '14 дней (Интенсив)',
      plan1Price: '€14.99',
      plan1Period: 'за 14 дней доступа',
      plan1Desc: 'Идеально, если экзамен уже скоро и нужно быстро набить руку на тестах.',
      plan2Name: '30 дней (Full Prep)',
      plan2Badge: '🔥 Хит продаж',
      plan2Price: '€24.99',
      plan2Period: 'за 30 дней доступа',
      plan2Desc: 'Самый популярный выбор для основательной подготовки ко всем частям экзамена.',
      plan3Name: 'Lifetime (Навсегда)',
      plan3Price: '€49.99',
      plan3Period: 'разово навсегда',
      plan3Desc: 'Полный пожизненный доступ ко всем 12 тестам и будущим обновлениям базы.',
      btnStart: 'Начать на 14 дней',
      btnUnlock: 'Получить 30 дней Full Prep',
      btnLifetime: 'Получить Lifetime доступ',
      features1: [
        'Все 12 Modelltests (Lesen, Hören, Sprachbausteine)',
        '385 слов Wortschatz с интервальным повторением',
        'Аудиозаписи носителей языка',
        'Статистика ошибок',
      ],
      features2: [
        'Все 12 полных Modelltests',
        '92 темы Forumsbeitrag и писем с фразами',
        '171 ситуация для Sprechen Teil 2 и 3',
        'Интерактивный Wortschatz SRS тренажер',
        'Приоритетная поддержка',
      ],
      features3: [
        'Пожизненный доступ без ограничения по времени',
        'Все текущие и будущие бонусные тесты',
        'Все 92 темы писем + 171 тема устной части',
        'Офлайн PWA-доступ на смартфоне',
      ],
      paymentTitle: 'Безопасная оплата через Stripe (Apple Pay, Google Pay, Visa, Mastercard, PayPal)',
    },
    faq: {
      title: 'Часто задаваемые вопросы (FAQ)',
      subtitle: 'Ответы на всё, что важно знать перед началом подготовки.',
      q1: 'Подходят ли ваши тесты для экзаменов telc и BAMF DTB?',
      a1: 'Да, на 100%. Все задания, тайминги, шкала баллов и типы вопросов строго соответствуют регламенту Deutsch-Test für den Beruf B2.',
      q2: 'Как я могу оплатить доступ?',
      a2: 'Оплата проходит через международную безопасную систему Stripe любой банковской картой, Apple Pay, Google Pay или PayPal.',
      q3: 'Работает ли сайт на телефоне (iPhone / Android)?',
      a3: 'Да! Платформа полностью адаптирована под любые мобильные устройства.',
      q4: 'Есть ли в тестах настоящие аудиозаписи для части Hören?',
      a4: 'Да. Для всех тестов Hören записаны качественные аудиофайлы с реальными голосами носителей языка и экзаменационными паузами.',
    },
    footer: {
      leadTitle: 'Сдай экзамен B2 Beruf с первого раза и получи сертификат',
      leadSubtitle: 'Начни тренироваться бесплатно прямо сейчас.',
      leadCta: 'Попробовать бесплатно (Demo)',
      rights: '© 2026 Beruf B2+ Trainer. Все права защищены.',
      disclaimer: 'Не является официальным продуктом telc gGmbH или BAMF. Создано для самостоятельной подготовки к экзамену.',
    },
  },
};
