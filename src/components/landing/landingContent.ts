export type LandingLang = 'de' | 'ua' | 'en' | 'tr' | 'es' | 'ru';

export interface LandingTranslation {
  nav: {
    features: string;
    modules: string;
    comparison: string;
    pricing: string;
    faq: string;
    blog: string;
    ctaApp: string;
  };
  hero: {
    badge: string;
    h1Main: string;
    h1Highlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ratingText: string;
    stat1Val: string;
    stat1Label: string;
    stat2Val: string;
    stat2Label: string;
    stat3Val: string;
    stat3Label: string;
    stat4Val: string;
    stat4Label: string;
  };
  pain: {
    title: string;
    subtitle: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    ctaButton: string;
  };
  modules: {
    badge: string;
    title: string;
    subtitle: string;
    card1Title: string;
    card1Desc: string;
    card1Link: string;
    card2Title: string;
    card2Desc: string;
    card2Link: string;
    card3Title: string;
    card3Desc: string;
    card3Link: string;
    card4Title: string;
    card4Desc: string;
    card4Link: string;
    card5Title: string;
    card5Desc: string;
    card5Link: string;
    card6Title: string;
    card6Desc: string;
    card6Link: string;
  };
  comparison: {
    title: string;
    subtitle: string;
    colFeature: string;
    colApp: string;
    colTutor: string;
    colBooks: string;
    rowPrice: string;
    rowAppPrice: string;
    rowTutorPrice: string;
    rowBooksPrice: string;
    rowAccess: string;
    rowAppAccess: string;
    rowTutorAccess: string;
    rowBooksAccess: string;
    rowSim: string;
    rowAppSim: string;
    rowTutorSim: string;
    rowBooksSim: string;
    rowAudio: string;
    rowAppAudio: string;
    rowTutorAudio: string;
    rowBooksAudio: string;
    rowTemplates: string;
    rowAppTemplates: string;
    rowTutorTemplates: string;
    rowBooksTemplates: string;
    rowSrs: string;
    rowAppSrs: string;
    rowTutorSrs: string;
    rowBooksSrs: string;
  };
  pricing: {
    badge: string;
    title: string;
    subtitle: string;
    plan1Name: string;
    plan1Desc: string;
    plan1Price: string;
    plan1Period: string;
    plan2Name: string;
    plan2Badge: string;
    plan2Desc: string;
    plan2Price: string;
    plan2Period: string;
    plan3Name: string;
    plan3Badge: string;
    plan3Desc: string;
    plan3Price: string;
    plan3Period: string;
    plan4Name: string;
    plan4Badge: string;
    plan4Desc: string;
    plan4Price: string;
    plan4OldPrice: string;
    plan4Period: string;
    btnSelect: string;
    btnUnlock: string;
    features: string[];
    featuresLifetime: string[];
    mainCta: string;
    trustSsl: string;
    trustNoSub: string;
  };
  faq: {
    title: string;
    subtitle: string;
    items: Array<{ q: string; a: string }>;
  };
  finalCta: {
    badge: string;
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    desc: string;
    agb: string;
    datenschutz: string;
    cookies: string;
    impressum: string;
    rights: string;
    trust: string;
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
  de: {
    nav: {
      features: 'Vorteile',
      modules: 'Module & Modi',
      comparison: 'Vergleich',
      pricing: 'Preise',
      faq: 'FAQ',
      blog: 'Blog',
      ctaApp: 'Jetzt ausprobieren',
    },
    hero: {
      badge: 'Der interaktive DTB B2-Beruf Prüfungstrainer',
      h1Main: 'Bestehen Sie Ihre B2-Beruf-Prüfung ',
      h1Highlight: 'beim ersten Versuch!',
      subtitle:
        '12 interaktive Prüfungsmodule, echte 130-Minuten-Simulationen mit Timer, 104+ Musterbriefe & Notizen sowie intelligentes Wortschatztraining – 100% offline-fähig auf Smartphone & PC.',
      ctaPrimary: '🚀 Jetzt kostenlos ausprobieren',
      ctaSecondary: '💎 Tarife & Preise ansehen',
      ratingText: '5.0 Sterne von erfolgreichen Prüfungsteilnehmern',
      stat1Val: '12',
      stat1Label: 'DTB-Prüfungsteile',
      stat2Val: '130 Min.',
      stat2Label: 'Original-Countdown',
      stat3Val: '104+',
      stat3Label: 'Musterlösungen Q58',
      stat4Val: '100%',
      stat4Label: 'Offline-fähig (PWA)',
    },
    pain: {
      title: 'Warum über 40% der Teilnehmer beim ersten Versuch scheitern',
      subtitle: 'Die B2-Beruf-Prüfung verlangt nicht nur Grammatik, sondern ein präzises Format- und Zeitmanagement.',
      card1Title: 'Extremer Zeitdruck (57 Fragen)',
      card1Desc:
        '130 Minuten für Lesen, Hören, Schreiben und Sprachbausteine vergehen rasend schnell. Ohne Training des Tempos unter Stoppuhr fehlen am Ende 20–30 Minuten.',
      card2Title: 'Komplexe Schreibformate (Q58)',
      card2Desc:
        'Forenbeiträge, Beschwerdebriefe und Notizen erfordern genaue berufliche Redemittel und eine feste Struktur, die Lehrbücher oft nur oberflächlich vermitteln.',
      card3Title: 'Teure Wiederholungsprüfungen',
      card3Desc:
        'Ein Fehlversuch bedeutet monatelanges Warten auf einen neuen Prüfungstermin, Stress beim Jobcenter und zusätzliche Gebühren von über 180 Euro.',
      ctaButton: '🎯 Entdecken Sie unsere Trainingsmodule & Funktionen',
    },
    modules: {
      badge: 'Umfassendes Prüfungssystem',
      title: 'Alle Trainingsmodi für Ihren Prüfungserfolg',
      subtitle: 'Gezielte Einzelmodul-Übungen, authentische Vollsimulationen, Schreibvorlagen und intelligenter Wortschatz.',
      card1Title: 'Kachel-Training (12 Teile)',
      card1Desc: 'Trainieren Sie jedes Modul separat: Lesen 1–4, Hören 1–4, Schreiben, Sprechen und Sprachbausteine 1 & 2 mit sofortiger Auswertung.',
      card1Link: 'Direkt zum Modul-Training',
      card2Title: 'Prüfungssimulation (1–57)',
      card2Desc: 'Absolvieren Sie alle 57 Prüfungsfragen am Stück unter realen Prüfungsbedingungen mit 130-Minuten-Countdown und Noten-Berechnung.',
      card2Link: 'Zur Prüfungssimulation',
      card3Title: 'Schreibtrainer (Aufgabe 21)',
      card3Desc: '104+ originale Forenbeiträge, Beschwerdebriefe und Notizen mit vollständig ausformulierten B2-Musterlösungen und Wortzähler.',
      card3Link: 'Zum Schreibtrainer',
      card4Title: 'Sprechtrainer (1A, 2 & 3)',
      card4Desc: '67+ Mündliche Prüfungsthemen mit interaktivem Vorbereitungs-Timer, Gong-Signal und strukturierten Formulierungshilfen.',
      card4Link: 'Zum Sprechtrainer',
      card5Title: 'Wortschatz & NVV (SRS)',
      card5Desc: 'Intelligenter Spaced-Repetition-Algorithmus für berufsspezifische Nomen-Verb-Verbindungen, Beispielsätze und Fachbegriffe.',
      card5Link: 'Zum Wortschatztraining',
      card6Title: '100% Offline-App (PWA)',
      card6Desc: 'Installieren Sie die Anwendung auf Ihrem Smartphone (iOS & Android) oder PC und üben Sie im Flugzeug, Zug oder Bus ohne Datenverbrauch.',
      card6Link: 'App-Installation ansehen',
    },
    comparison: {
      title: 'Investieren Sie klug in Ihren Erfolg',
      subtitle: 'Vergleichen Sie die Kosten und Möglichkeiten verschiedener Prüfungsvorbereitungen.',
      colFeature: 'Funktion / Kriterium',
      colApp: '👑 Beruf B2+ Trainer',
      colTutor: 'Privater Nachhilfelehrer',
      colBooks: 'Gedruckte Lehrbücher',
      rowPrice: 'Kosten / Preis',
      rowAppPrice: 'ab 9,99 € (einmalig)',
      rowTutorPrice: '35 – 50 € / Stunde (300+ €)',
      rowBooksPrice: '25 – 40 € pro Buch',
      rowAccess: 'Verfügbarkeit & Flexibilität',
      rowAppAccess: '24/7 unbegrenzt auf Smartphone & PC',
      rowTutorAccess: 'Nur zu festen Terminen',
      rowBooksAccess: 'Nur mit schwerem Buch',
      rowSim: '130-Min. Simulation mit Timer',
      rowAppSim: '✓ Echte Simulation & Auswertung',
      rowTutorSim: 'Nur manuell mit Stoppuhr',
      rowBooksSim: '❌ Keine automatische Auswertung',
      rowAudio: 'Hörverstehen & Audioplayer',
      rowAppAudio: '✓ Interaktiv mit ±5s Sprung & Tempo',
      rowTutorAudio: 'Meist ohne gezielte Audios',
      rowBooksAudio: 'Audio-CDs / QR ohne App',
      rowTemplates: '104+ Muster für Schreiben & Sprechen',
      rowAppTemplates: '✓ Vollständig ausgearbeitet',
      rowTutorTemplates: 'Begrenzte Korrektur weniger Texte',
      rowBooksTemplates: 'Sehr wenige starre Beispiele',
      rowSrs: 'Spaced Repetition Wortschatz',
      rowAppSrs: '✓ Intelligenter SRS-Algorithmus',
      rowTutorSrs: '❌ Kein System',
      rowBooksSrs: '❌ Starre Vokabellisten',
    },
    pricing: {
      badge: 'Transparente Preise',
      title: 'Wählen Sie Ihren passenden Prüfungspass',
      subtitle: 'Einmalige Zahlung für die gewählte Laufzeit. Keine versteckten Kosten und kein automatisches Abonnement.',
      plan1Name: '7 Tage Sprint-Pass',
      plan1Desc: '1 Woche voller Zugriff. Ideal für den schnellen Endspurt vor der Prüfung.',
      plan1Price: '9,99 €',
      plan1Period: 'für 7 Tage',
      plan2Name: '30 Tage Standard-Pass',
      plan2Badge: 'Bestseller',
      plan2Desc: '1 Monat voller Zugriff. Die beliebteste Wahl für eine gründliche Vorbereitung.',
      plan2Price: '15,99 €',
      plan2Period: 'für 30 Tage',
      plan3Name: '90 Tage Kursbegleiter',
      plan3Badge: 'Spart 38%',
      plan3Desc: '3 Monate voller Zugriff. Begleitet Sie durch den gesamten B2-Berufssprachkurs.',
      plan3Price: '29,99 €',
      plan3Period: 'für 90 Tage',
      plan4Name: 'Lebenslanger Pass',
      plan4Badge: 'Aktion: -20%',
      plan4Desc: 'Dauerhafter Zugriff ohne zeitliche Begrenzung bis zum sicheren Bestehen.',
      plan4Price: '39,99 €',
      plan4OldPrice: '49,99 €',
      plan4Period: 'dauerhaft',
      btnSelect: 'Auswählen',
      btnUnlock: 'Jetzt freischalten',
      features: [
        'Voller Zugriff auf alle 12 Prüfungsteile',
        'Unbegrenzte Simulationen mit Timer',
        'Alle 104+ Forenbeiträge & 67+ Sprech-Themen',
        'Vollständiges Wortschatz-Training',
        '100% Offline-fähig (PWA)',
      ],
      featuresLifetime: [
        'Dauerhafter unbegrenzter Zugang',
        'Alle 12 Teile & zukünftige Modelltests',
        'Unbegrenzte Prüfungssimulationen',
        '100% Offline-fähig (PWA)',
      ],
      mainCta: '✨ Tarif in der App wählen & sicher freischalten',
      trustSsl: '256-Bit SSL Verschlüsselung',
      trustNoSub: 'Keine automatische Abo-Verlängerung',
    },
    faq: {
      title: 'Häufig gestellte Fragen (FAQ)',
      subtitle: 'Alles, was Sie über den Beruf B2+ Trainer, die Inhalte und die Nutzung wissen müssen.',
      items: [
        {
          q: 'Wie sind die Audio-Aufnahmen im Hören-Bereich aufgebaut?',
          a: 'Die Hörtexte und Dialoge werden mit modernster, hochpräziser deutscher Sprachsynthese erzeugt. Sie bieten eine glasklare Aussprache und ein realitätsnahes Sprechtempo ohne störende Nebengeräusche für ein optimales Training.',
        },
        {
          q: 'Gibt es ein automatisches Abonnement oder wiederkehrende Kosten?',
          a: 'Nein! Bei uns gibt es keine Abo-Fallen. Jeder Zugang ist ein transparenter Einmalkauf. Ihr Zugang läuft nach der gebuchten Zeit automatisch aus, ohne dass Sie kündigen müssen.',
        },
        {
          q: 'Kann ich den Trainer vor dem Kauf kostenlos ausprobieren?',
          a: 'Ja, absolut! Sie können direkt in die Webanwendung einsteigen und mehrere Prüfungsmodule sofort ohne Anmeldung und ohne Zahlungsdaten kostenlos testen.',
        },
        {
          q: 'Funktioniert die App auch offline ohne Internetverbindung?',
          a: 'Ja! Als moderne Progressive Web App (PWA) kann der Beruf B2+ Trainer direkt auf Ihrem Smartphone (iOS & Android) oder PC installiert werden und funktioniert überall offline.',
        },
        {
          q: 'Entsprechen die Aufgaben dem offiziellen Deutsch-Test für den Beruf B2 (DTB)?',
          a: 'Ja! Alle 12 Module (Lesen 1–4, Hören 1–4, Schreiben, Sprechen, Sprachbausteine 1 & 2), die Punkteverteilung und der 130-Minuten-Ablauf sind exakt an das offizielle DTB-Format angepasst.',
        },
      ],
    },
    finalCta: {
      badge: 'Starten Sie jetzt',
      title: 'Bestehen Sie die B2-Beruf-Prüfung beim ersten Mal!',
      subtitle: 'Schließen Sie sich erfolgreichen Teilnehmern an und bereiten Sie sich ohne Prüfungsangst vor.',
      button: '🚀 Jetzt kostenlos ausprobieren',
    },
    footer: {
      desc: 'Unabhängige digitale Lernplattform zur Vorbereitung auf den DTB B2 Beruf.',
      agb: 'AGB & Widerruf',
      datenschutz: 'Datenschutz',
      cookies: 'Cookies',
      impressum: 'Impressum',
      rights: 'Alle Rechte vorbehalten.',
      trust: '100% DSGVO-konform • Offline-fähig',
    },
  },

  ua: {
    nav: {
      features: 'Переваги',
      modules: 'Модулі та режими',
      comparison: 'Порівняння',
      pricing: 'Тарифи',
      faq: 'Часті запитання',
      blog: 'Блог',
      ctaApp: 'Спробувати зараз',
    },
    hero: {
      badge: 'Інтерактивний тренажер DTB B2 Beruf',
      h1Main: 'Складіть іспит B2 Beruf ',
      h1Highlight: 'з першої спроби!',
      subtitle:
        '12 інтерактивних модулів, реальні 130-хвилинні симуляції з таймером, 104+ зразки листів і нотаток та розумний словник – 100% офлайн на телефоні та ПК.',
      ctaPrimary: '🚀 Спробувати безкоштовно',
      ctaSecondary: '💎 Переглянути тарифи',
      ratingText: '5.0 зірок від успішних випускників',
      stat1Val: '12',
      stat1Label: 'Модулів DTB',
      stat2Val: '130 хв.',
      stat2Label: 'Реальний таймер',
      stat3Val: '104+',
      stat3Label: 'Зразків листів Q58',
      stat4Val: '100%',
      stat4Label: 'Офлайн (PWA)',
    },
    pain: {
      title: 'Чому понад 40% учасників провалюють іспит з першого разу',
      subtitle: 'Іспит B2 Beruf вимагає не лише граматики, а й суворого контролю часу та знання формату.',
      card1Title: 'Шалений дефіцит часу (57 питань)',
      card1Desc:
        '130 хвилин на читання, аудіювання, письмо та мовні елементи пролітають миттєво. Без тренування з секундоміром у кінці не вистачає 20–30 хвилин.',
      card2Title: 'Складні письмові формати (Q58)',
      card2Desc:
        'Повідомлення на форумі, скарги та протоколи вимагають точних сталих фраз (Redemittel) та структури, про яку в підручниках пишуть замало.',
      card3Title: 'Дорогі перездачі іспиту',
      card3Desc:
        'Провал означає місяці очікування нового терміну, стрес із Jobcenter та додаткові витрати понад 180 євро за повторний іспит.',
      ctaButton: '🎯 Відкрити тренувальні модулі та функції',
    },
    modules: {
      badge: 'Повна система підготовки',
      title: 'Усі режими для гарантованого успіху',
      subtitle: 'Окремі вправи по модулях, повні симуляції, готові шаблони листів та інтелектуальний словник.',
      card1Title: 'Тренування за плитками (12 частин)',
      card1Desc: 'Тренуйте кожен модуль окремо: Lesen 1–4, Hören 1–4, Schreiben, Sprechen та Sprachbausteine 1 & 2 з миттєвим поясненням.',
      card1Link: 'До тренування модулів',
      card2Title: 'Симуляція іспиту (1–57)',
      card2Desc: 'Пройдіть усі 57 питань в умовах реального тесту зі 130-хвилинним зворотним відліком та підрахунком балів.',
      card2Link: 'До симуляції іспиту',
      card3Title: 'Тренажер письма (Завдання 21)',
      card3Desc: '104+ реальні теми листів, скарг та нотаток з готовими зразками відповідей B2 та лічильником слів.',
      card3Link: 'До тренажера письма',
      card4Title: 'Тренажер говоріння (1A, 2 & 3)',
      card4Desc: '67+ тем для усної частини з таймером підготовки, сигналом гонгу та чіткими мовними кліше.',
      card4Link: 'До тренажера говоріння',
      card5Title: 'Словник та NVV (SRS)',
      card5Desc: 'Розумний алгоритм інтервального повторення для Nomen-Verb-Verbindungen, прикладів та професійної лексики.',
      card5Link: 'До вивчення слів',
      card6Title: '100% Офлайн-додаток (PWA)',
      card6Desc: 'Встановіть додаток на телефон (iOS/Android) чи ПК і навчайтесь у поїзді чи літаку без інтернету.',
      card6Link: 'Як встановити додаток',
    },
    comparison: {
      title: 'Інвестуйте розумно у свій успіх',
      subtitle: 'Порівняйте вартість та можливості різних варіантів підготовки.',
      colFeature: 'Критерій / Можливість',
      colApp: '👑 Beruf B2+ Trainer',
      colTutor: 'Приватний репетитор',
      colBooks: 'Друковані підручники',
      rowPrice: 'Вартість',
      rowAppPrice: 'від 9,99 € (разово)',
      rowTutorPrice: '35 – 50 € / год (300+ €)',
      rowBooksPrice: '25 – 40 € за книгу',
      rowAccess: 'Доступність і гнучкість',
      rowAppAccess: '24/7 без обмежень на смартфоні й ПК',
      rowTutorAccess: 'Тільки за попереднім записом',
      rowBooksAccess: 'Тільки з важкою книгою',
      rowSim: 'Симуляція 130 хв з таймером',
      rowAppSim: '✓ Автоматична перевірка й бали',
      rowTutorSim: 'Лише вручну з секундоміром',
      rowBooksSim: '❌ Немає автоматичної оцінки',
      rowAudio: 'Аудіювання та плеєр',
      rowAppAudio: '✓ Інтерактивно зі стрибком ±5с і темпом',
      rowTutorAudio: 'Зазвичай без фокусу на аудіо',
      rowBooksAudio: 'CD-диски або QR без софту',
      rowTemplates: '104+ зразки листів і говоріння',
      rowAppTemplates: '✓ Повністю готові тексти',
      rowTutorTemplates: 'Перевірка лише кількох робіт',
      rowBooksTemplates: 'Дуже мало шаблонів',
      rowSrs: 'Інтервальний словник (SRS)',
      rowAppSrs: '✓ Розумний алгоритм повторення',
      rowTutorSrs: '❌ Немає системи',
      rowBooksSrs: '❌ Звичайні списки слів',
    },
    pricing: {
      badge: 'Прозорі ціни',
      title: 'Оберіть зручний для вас тариф',
      subtitle: 'Разова оплата за обраний період. Жодних прихованих платежів та без автоматичного списання.',
      plan1Name: '7 Tage Sprint-Pass',
      plan1Desc: '1 тиждень повного доступу. Ідеально для фінального ривка перед екзаменом.',
      plan1Price: '9,99 €',
      plan1Period: 'на 7 днів',
      plan2Name: '30 Tage Standard-Pass',
      plan2Badge: 'Хіт продажу',
      plan2Desc: '1 місяць повного доступу. Найпопулярніший вибір для ґрунтовної підготовки.',
      plan2Price: '15,99 €',
      plan2Period: 'на 30 днів',
      plan3Name: '90 Tage Kursbegleiter',
      plan3Badge: 'Економія 38%',
      plan3Desc: '3 місяці повного доступу. Супроводжує вас протягом усього мовного курсу B2.',
      plan3Price: '29,99 €',
      plan3Period: 'на 90 днів',
      plan4Name: 'Lebenslanger Pass',
      plan4Badge: 'Знижка -20%',
      plan4Desc: 'Вічний доступ без часових обмежень до успішного складання іспиту.',
      plan4Price: '39,99 €',
      plan4OldPrice: '49,99 €',
      plan4Period: 'назавжди',
      btnSelect: 'Обрати',
      btnUnlock: 'Активувати зараз',
      features: [
        'Повний доступ до всіх 12 модулів',
        'Необмежені симуляції з таймером',
        'Усі 104+ листів та 67+ усних тем',
        'Повний словниковий тренажер (SRS)',
        '100% робота офлайн (PWA)',
      ],
      featuresLifetime: [
        'Вічний необмежений доступ',
        'Усі 12 модулів та майбутні тести',
        'Необмежені симуляції іспиту',
        '100% робота офлайн (PWA)',
      ],
      mainCta: '✨ Обрати тариф у додатку та безпечно оплатити',
      trustSsl: '256-бітне SSL-шифрування',
      trustNoSub: 'Без автоподовження підписки',
    },
    faq: {
      title: 'Часті запитання (FAQ)',
      subtitle: 'Усе, що потрібно знати про тренажер Beruf B2+, контент та використання.',
      items: [
        {
          q: 'Як створені аудіозаписи в розділі Hören?',
          a: 'Аудіодіалоги та тексти згенеровані за допомогою сучасної високоточної німецької синтезаторної мови. Вони забезпечують ідеальну дикцію та природний темп без шумів для ефективного тренування.',
        },
        {
          q: 'Чи є тут автопродовження підписки або приховані платежі?',
          a: 'Ні! Жодних підводних каменів. Кожен доступ — це разова покупка. Після завершення терміну доступ просто припиняється, скасовувати нічого не потрібно.',
        },
        {
          q: 'Чи можу я спробувати тренажер безкоштовно перед покупкою?',
          a: 'Так, звичайно! Ви можете відразу відкрити додаток і протестувати кілька модулів без реєстрації та введення платіжних даних.',
        },
        {
          q: 'Чи працює додаток без інтернету (офлайн)?',
          a: 'Так! Як Progressive Web App (PWA), додаток встановлюється на iPhone, Android або комп’ютер і дозволяє вчитися навіть у літаку чи поїзді.',
        },
        {
          q: 'Чи відповідає контент офіційному формату DTB B2 Beruf?',
          a: 'Так! Усі 12 модулів (Lesen 1–4, Hören 1–4, Schreiben, Sprechen, Sprachbausteine 1 & 2), розбалловка та 130-хвилинний таймер точно відповідають структурі DTB.',
        },
      ],
    },
    finalCta: {
      badge: 'Почніть вже зараз',
      title: 'Складіть іспит B2 Beruf з першої спроби!',
      subtitle: 'Приєднуйтесь до успішних студентів та готуйтеся впевнено без зайвого стресу.',
      button: '🚀 Спробувати безкоштовно',
    },
    footer: {
      desc: 'Незалежна цифрова платформа для підготовки до іспиту DTB B2 Beruf.',
      agb: 'Умови та відмова від повернення',
      datenschutz: 'Конфіденційність',
      cookies: 'Файли cookie',
      impressum: 'Контакти (Impressum)',
      rights: 'Всі права захищені.',
      trust: '100% відповідає DSGVO • Офлайн-режим',
    },
  },

  en: {
    nav: {
      features: 'Features',
      modules: 'Modules & Modes',
      comparison: 'Comparison',
      pricing: 'Pricing',
      faq: 'FAQ',
      blog: 'Blog',
      ctaApp: 'Try Now',
    },
    hero: {
      badge: 'The Interactive DTB B2-Beruf Exam Trainer',
      h1Main: 'Pass Your B2-Beruf Exam ',
      h1Highlight: 'on Your First Attempt!',
      subtitle:
        '12 interactive exam modules, authentic 130-minute simulations with timer, 104+ sample letters & notes, and smart vocabulary training – 100% offline on mobile & PC.',
      ctaPrimary: '🚀 Try for Free',
      ctaSecondary: '💎 View Plans & Pricing',
      ratingText: '5.0 stars from successful exam candidates',
      stat1Val: '12',
      stat1Label: 'DTB Exam Sections',
      stat2Val: '130 Min.',
      stat2Label: 'Original Countdown',
      stat3Val: '104+',
      stat3Label: 'Sample Letters Q58',
      stat4Val: '100%',
      stat4Label: 'Offline Capable (PWA)',
    },
    pain: {
      title: 'Why over 40% of candidates fail on their first try',
      subtitle: 'The B2-Beruf exam tests strict time management and specific formats, not just general grammar.',
      card1Title: 'Extreme Time Pressure (57 Questions)',
      card1Desc:
        '130 minutes for Reading, Listening, Writing, and Language Elements pass fast. Without stopwatch practice, students run out of time.',
      card2Title: 'Complex Writing Tasks (Q58)',
      card2Desc:
        'Forum posts, complaint letters, and meeting notes require strict professional phrases (Redemittel) and layout structures.',
      card3Title: 'Expensive Exam Retakes',
      card3Desc:
        'Failing means months of waiting for a new test date, Jobcenter stress, and additional retake fees over 180 euros.',
      ctaButton: '🎯 Discover Our Training Modules & Features',
    },
    modules: {
      badge: 'Comprehensive Prep System',
      title: 'All Training Modes for Your Exam Success',
      subtitle: 'Targeted module drills, full exam simulations, model letter answers, and smart vocabulary cards.',
      card1Title: 'Tile Practice (12 Sections)',
      card1Desc: 'Practice each module individually: Reading 1–4, Listening 1–4, Writing, Speaking, and Language Elements with instant feedback.',
      card1Link: 'Go to Module Practice',
      card2Title: 'Exam Simulation (1–57)',
      card2Desc: 'Complete all 57 questions under real exam conditions with a 130-minute countdown and automatic score calculation.',
      card2Link: 'Start Exam Simulation',
      card3Title: 'Writing Trainer (Task 21)',
      card3Desc: '104+ authentic forum posts, complaint letters, and notes with fully drafted B2 model solutions and word counter.',
      card3Link: 'Open Writing Trainer',
      card4Title: 'Speaking Trainer (1A, 2 & 3)',
      card4Desc: '67+ Oral exam topics with prep timer, gong audio cue, and structured phrase guidelines.',
      card4Link: 'Open Speaking Trainer',
      card5Title: 'Vocabulary & NVV (SRS)',
      card5Desc: 'Smart Spaced Repetition algorithm for professional Noun-Verb combinations, sample sentences, and business terms.',
      card5Link: 'Open Vocabulary',
      card6Title: '100% Offline App (PWA)',
      card6Desc: 'Install the app on iOS, Android, or PC and study on trains, buses, or flights with zero data consumption.',
      card6Link: 'See App Installation',
    },
    comparison: {
      title: 'Invest Wisely in Your Success',
      subtitle: 'Compare costs and preparation capabilities across different study methods.',
      colFeature: 'Feature / Criterion',
      colApp: '👑 Beruf B2+ Trainer',
      colTutor: 'Private Tutor',
      colBooks: 'Printed Textbooks',
      rowPrice: 'Cost / Price',
      rowAppPrice: 'from €9.99 (one-time)',
      rowTutorPrice: '€35 – €50 / hour (€300+)',
      rowBooksPrice: '€25 – €40 per book',
      rowAccess: 'Availability & Flexibility',
      rowAppAccess: '24/7 unlimited on Phone & PC',
      rowTutorAccess: 'Fixed appointments only',
      rowBooksAccess: 'Heavy books only',
      rowSim: '130-Min. Simulation with Timer',
      rowAppSim: '✓ Real test simulation & scoring',
      rowTutorSim: 'Manual with stopwatch only',
      rowBooksSim: '❌ No automatic scoring',
      rowAudio: 'Listening & Interactive Player',
      rowAppAudio: '✓ Interactive with ±5s skip & speed',
      rowTutorAudio: 'Often lacks audio drill materials',
      rowBooksAudio: 'Audio CDs / QR without app',
      rowTemplates: '104+ Writing & Speaking Models',
      rowAppTemplates: '✓ Fully written B2 solutions',
      rowTutorTemplates: 'Corrects few essays only',
      rowBooksTemplates: 'Very few rigid examples',
      rowSrs: 'Spaced Repetition Vocabulary',
      rowAppSrs: '✓ Smart SRS flashcards',
      rowTutorSrs: '❌ No system',
      rowBooksSrs: '❌ Static word lists',
    },
    pricing: {
      badge: 'Transparent Pricing',
      title: 'Choose Your Exam Prep Pass',
      subtitle: 'One-time payment for the chosen duration. No hidden fees and no automatic renewal.',
      plan1Name: '7-Day Sprint Pass',
      plan1Desc: '1 week full access. Perfect for a quick sprint right before test day.',
      plan1Price: '9.99 €',
      plan1Period: 'for 7 days',
      plan2Name: '30-Day Standard Pass',
      plan2Badge: 'Bestseller',
      plan2Desc: '1 month full access. The most popular choice for thorough preparation.',
      plan2Price: '15.99 €',
      plan2Period: 'for 30 days',
      plan3Name: '90-Day Companion',
      plan3Badge: 'Save 38%',
      plan3Desc: '3 months full access. Guides you through the entire B2 language course.',
      plan3Price: '29.99 €',
      plan3Period: 'for 90 days',
      plan4Name: 'Lifetime Pass',
      plan4Badge: 'Promo: -20%',
      plan4Desc: 'Unlimited lifetime access with no time limits until you pass.',
      plan4Price: '39.99 €',
      plan4OldPrice: '49.99 €',
      plan4Period: 'lifetime',
      btnSelect: 'Select',
      btnUnlock: 'Unlock Now',
      features: [
        'Full access to all 12 exam sections',
        'Unlimited simulations with timer',
        'All 104+ forum posts & 67+ speaking topics',
        'Full vocabulary SRS training',
        '100% offline capable (PWA)',
      ],
      featuresLifetime: [
        'Lifetime unlimited access',
        'All 12 sections & future tests',
        'Unlimited exam simulations',
        '100% offline capable (PWA)',
      ],
      mainCta: '✨ Select Plan in App & Unlock Securely',
      trustSsl: '256-Bit SSL Encryption',
      trustNoSub: 'No automatic subscription renewal',
    },
    faq: {
      title: 'Frequently Asked Questions (FAQ)',
      subtitle: 'Everything you need to know about Beruf B2+ Trainer, content, and offline usage.',
      items: [
        {
          q: 'How are the listening audio tracks generated?',
          a: 'Audio dialogues and texts are produced using state-of-the-art high-clarity German speech synthesis. They offer crystal-clear pronunciation and natural exam pacing without background distortion.',
        },
        {
          q: 'Is there an automatic subscription or hidden fee?',
          a: 'No! There are no subscription traps. Each pass is a one-time purchase that simply expires after the purchased period without any need to cancel.',
        },
        {
          q: 'Can I test the app for free before buying?',
          a: 'Yes, absolutely! You can launch the web app immediately and test multiple exam modules for free with no credit card or account needed.',
        },
        {
          q: 'Does the app work offline without internet?',
          a: 'Yes! As a Progressive Web App (PWA), you can install it on iPhone, Android, or PC to study anywhere offline.',
        },
        {
          q: 'Does it match the official DTB B2 Beruf exam?',
          a: 'Yes! All 12 modules, scoring breakdown, and 130-minute exam timing strictly follow the official DTB test specifications.',
        },
      ],
    },
    finalCta: {
      badge: 'Start Now',
      title: 'Pass the B2-Beruf Exam on Your First Attempt!',
      subtitle: 'Join hundreds of successful candidates and prepare with confidence.',
      button: '🚀 Try for Free',
    },
    footer: {
      desc: 'Independent digital learning platform for DTB B2 Beruf exam preparation.',
      agb: 'Terms & Refund Waiver',
      datenschutz: 'Privacy Policy',
      cookies: 'Cookies',
      impressum: 'Legal Notice (Impressum)',
      rights: 'All rights reserved.',
      trust: '100% GDPR Compliant • Offline Ready',
    },
  },

  tr: {
    nav: {
      features: 'Avantajlar',
      modules: 'Modüller ve Modlar',
      comparison: 'Karşılaştırma',
      pricing: 'Fiyatlar',
      faq: 'SSS',
      blog: 'Blog',
      ctaApp: 'Hemen Dene',
    },
    hero: {
      badge: 'İnteraktif DTB B2-Beruf Sınav Hazırlık Platformu',
      h1Main: 'B2-Beruf Sınavını ',
      h1Highlight: 'İlk Seferde Geçin!',
      subtitle:
        '12 interaktif sınav modülü, zamanlayıcılı 130 dakikalık gerçek denemeler, 104+ örnek mektup ve akıllı kelime ezberleme – Telefonda ve PC\'de %100 çevrimdışı.',
      ctaPrimary: '🚀 Ücretsiz Deneyin',
      ctaSecondary: '💎 Fiyatları İnceleyin',
      ratingText: 'Başarılı sınav adaylarından 5.0 yıldız',
      stat1Val: '12',
      stat1Label: 'DTB Sınav Bölümü',
      stat2Val: '130 Dk.',
      stat2Label: 'Orijinal Sayaç',
      stat3Val: '104+',
      stat3Label: 'Örnek Mektup Q58',
      stat4Val: '%100',
      stat4Label: 'Çevrimdışı (PWA)',
    },
    pain: {
      title: 'Neden adayların %40\'ından fazlası ilk denemede başarısız oluyor?',
      subtitle: 'B2-Beruf sınavı sadece dilbilgisi değil, katı bir zaman yönetimi ve format bilgisi gerektirir.',
      card1Title: 'Aşırı Zaman Baskısı (57 Soru)',
      card1Desc:
        'Okuma, dinleme, yazma ve dil bilgisi için 130 dakika çok hızlı geçer. Kronometreyle pratik yapmayanların sonunda 20–30 dakikası eksik kalır.',
      card2Title: 'Zorlu Yazma Formatları (Q58)',
      card2Desc:
        'Forum yazıları, şikayet mektupları ve notlar, ders kitaplarında az anlatılan kesin kalıp ifadeler (Redemittel) ve net yapı ister.',
      card3Title: 'Pahalı Sınav Tekrarları',
      card3Desc:
        'Başarısız olmak; aylar süren yeni sınav tarihi bekleyişi, Jobcenter stresi ve 180 Euro\'yu aşan tekrar sınav ücreti demektir.',
      ctaButton: '🎯 Eğitim Modüllerimizi ve Özellikleri Keşfedin',
    },
    modules: {
      badge: 'Kapsamlı Sınav Sistemi',
      title: 'Sınav Başarınız İçin Tüm Eğitim Modları',
      subtitle: 'Modül bazlı hedefe yönelik alıştırmalar, tam denemeler, mektup şablonları ve akıllı kelime ezberleme.',
      card1Title: 'Karo Eğitimi (12 Bölüm)',
      card1Desc: 'Her modülü ayrı çalışın: Okuma 1–4, Dinleme 1–4, Yazma, Konuşma ve Dil Bilgisi anında açıklamalarla.',
      card1Link: 'Modül Eğitimine Git',
      card2Title: 'Sınav Simülasyonu (1–57)',
      card2Desc: '57 sorunun tamamını 130 dakikalık geri sayım ve otomatik puanlama ile gerçek sınav koşullarında çözün.',
      card2Link: 'Sınav Simülasyonuna Başla',
      card3Title: 'Yazma Eğitmeni (Görev 21)',
      card3Desc: '104+ orijinal forum konusu, şikayet mektubu ve not için eksiksiz B2 örnek çözümleri ve kelime sayacı.',
      card3Link: 'Yazma Eğitmenini Aç',
      card4Title: 'Konuşma Eğitmeni (1A, 2 & 3)',
      card4Desc: 'Hazırlık sayacı, gong uyarısı ve yapılandırılmış kalıp ifadeler içeren 67+ sözlü sınav konusu.',
      card4Link: 'Konuşma Eğitmenini Aç',
      card5Title: 'Kelime Bilgisi ve NVV (SRS)',
      card5Desc: 'Mesleki Nomen-Verb-Verbindungen, örnek cümleler ve terimler için akıllı aralıklı tekrar algoritması.',
      card5Link: 'Kelime Eğitimini Aç',
      card6Title: '%100 Çevrimdışı Uygulama (PWA)',
      card6Desc: 'Uygulamayı telefonunuza (iOS/Android) veya PC\'ye kurun; trende, uçakta internet olmadan çalışın.',
      card6Link: 'Uygulama Kurulumuna Bak',
    },
    comparison: {
      title: 'Başarınıza Akıllıca Yatırım Yapın',
      subtitle: 'Farklı hazırlık yöntemlerinin maliyetlerini ve imkanlarını karşılaştırın.',
      colFeature: 'Özellik / Kriter',
      colApp: '👑 Beruf B2+ Trainer',
      colTutor: 'Özel Öğretmen',
      colBooks: 'Basılı Kitaplar',
      rowPrice: 'Ücret / Fiyat',
      rowAppPrice: '9,99 €\'dan başlayan (tek seferlik)',
      rowTutorPrice: '35 – 50 € / saat (300+ €)',
      rowBooksPrice: '25 – 40 € / kitap',
      rowAccess: 'Erişilebilirlik ve Esneklik',
      rowAppAccess: 'Telefonda ve PC\'de 7/24 sınırsız',
      rowTutorAccess: 'Yalnızca randevu saatinde',
      rowBooksAccess: 'Yalnızca ağır kitapla',
      rowSim: 'Zamanlayıcılı 130 Dk. Simülasyon',
      rowAppSim: '✓ Gerçek deneme ve otomatik puan',
      rowTutorSim: 'Sadece manuel kronometreyle',
      rowBooksSim: '❌ Otomatik puanlama yok',
      rowAudio: 'Dinleme ve İnteraktif Oynatıcı',
      rowAppAudio: '✓ ±5sn atlama ve hız ayarı',
      rowTutorAudio: 'Genellikle özel ses materyali yok',
      rowBooksAudio: 'Uygulamasız CD / QR kodlar',
      rowTemplates: '104+ Yazma ve Konuşma Şablonu',
      rowAppTemplates: '✓ Tamamen hazır B2 çözümleri',
      rowTutorTemplates: 'Az sayıda metin düzeltmesi',
      rowBooksTemplates: 'Çok az sayıda katı örnek',
      rowSrs: 'Aralıklı Tekrar Kelime Sistemi',
      rowAppSrs: '✓ Akıllı SRS algoritması',
      rowTutorSrs: '❌ Sistem yok',
      rowBooksSrs: '❌ Statik kelime listeleri',
    },
    pricing: {
      badge: 'Şeffaf Fiyatlandırma',
      title: 'Size Uygun Sınav Paketini Seçin',
      subtitle: 'Seçilen süre için tek seferlik ödeme. Gizli ücret ve otomatik abonelik yenilemesi yoktur.',
      plan1Name: '7 Günlük Sprint Paketi',
      plan1Desc: '1 hafta tam erişim. Sınavdan hemen önceki hızlı son tekrar için idealdir.',
      plan1Price: '9,99 €',
      plan1Period: '7 gün için',
      plan2Name: '30 Günlük Standart Paket',
      plan2Badge: 'En Çok Satan',
      plan2Desc: '1 ay tam erişim. Kapsamlı ve stressiz hazırlık için en popüler tercih.',
      plan2Price: '15,99 €',
      plan2Period: '30 gün için',
      plan3Name: '90 Günlük Kurs Rehberi',
      plan3Badge: '%38 Tasarruf',
      plan3Desc: '3 ay tam erişim. Tüm B2 mesleki dil kursunuz boyunca size eşlik eder.',
      plan3Price: '29,99 €',
      plan3Period: '90 gün için',
      plan4Name: 'Ömür Boyu Paket',
      plan4Badge: 'Fırsat: -%20',
      plan4Desc: 'Sınavı geçene kadar süre kısıtlaması olmadan kalıcı ve sınırsız erişim.',
      plan4Price: '39,99 €',
      plan4OldPrice: '49,99 €',
      plan4Period: 'ömür boyu',
      btnSelect: 'Seç',
      btnUnlock: 'Hemen Aç',
      features: [
        '12 sınav bölümünün tamamına erişim',
        'Zamanlayıcılı sınırsız simülasyonlar',
        '104+ forum konusu ve 67+ konuşma kartı',
        'Eksiksiz SRS kelime eğitimi',
        '%100 çevrimdışı kullanım (PWA)',
      ],
      featuresLifetime: [
        'Kalıcı sınırsız erişim',
        'Tüm 12 modül ve gelecekteki denemeler',
        'Sınırsız sınav simülasyonları',
        '%100 çevrimdışı kullanım (PWA)',
      ],
      mainCta: '✨ Uygulamada Paketi Seçin ve Güvenle Açın',
      trustSsl: '256-Bit SSL Şifreleme',
      trustNoSub: 'Otomatik abonelik yenilemesi yok',
    },
    faq: {
      title: 'Sıkça Sorulan Sorular (SSS)',
      subtitle: 'Beruf B2+ Trainer, içerik ve çevrimdışı kullanım hakkında bilmeniz gereken her şey.',
      items: [
        {
          q: 'Dinleme (Hören) ses kayıtları nasıl hazırlandı?',
          a: 'Diyaloglar ve metinler en gelişmiş yüksek netlikteki Almanca konuşma senteziyle üretilmiştir. Arka plan paraziti olmadan kristal netliğinde telaffuz ve sınav temposu sunar.',
        },
        {
          q: 'Otomatik abonelik veya gizli ücret var mı?',
          a: 'Hayır! Abonelik tuzağı yoktur. Her paket tek seferlik bir satın almadır ve süre bitince kendiliğinden sona erer, iptal işlemi gerekmez.',
        },
        {
          q: 'Satın almadan önce ücretsiz deneyebilir miyim?',
          a: 'Evet, kesinlikle! Uygulamayı açıp kayıt olmadan ve kart bilgisi vermeden modülleri ücretsiz test edebilirsiniz.',
        },
        {
          q: 'Uygulama internetsiz (çevrimdışı) çalışır mı?',
          a: 'Evet! Progressive Web App (PWA) olarak iPhone, Android veya PC\'ye yüklenir ve her yerde çevrimdışı çalışır.',
        },
        {
          q: 'Sorular resmi DTB B2 Beruf formatına uygun mu?',
          a: 'Evet! 12 modülün tamamı, puanlama ve 130 dakikalık sınav akışı resmi DTB sınav yapısıyla birebir örtüşür.',
        },
      ],
    },
    finalCta: {
      badge: 'Hemen Başlayın',
      title: 'B2-Beruf Sınavını İlk Seferde Başarıyla Geçin!',
      subtitle: 'Başarılı kursiyerlerin arasına katılın ve sınav stresinden kurtulun.',
      button: '🚀 Ücretsiz Deneyin',
    },
    footer: {
      desc: 'DTB B2 Beruf sınavına hazırlık için bağımsız dijital öğrenme platformu.',
      agb: 'Şartlar ve İade Feragati',
      datenschutz: 'Gizlilik Politikası',
      cookies: 'Çerezler',
      impressum: 'Künye (Impressum)',
      rights: 'Tüm hakları saklıdır.',
      trust: 'GDPR Uyumlu • Çevrimdışı Hazır',
    },
  },

  es: {
    nav: {
      features: 'Ventajas',
      modules: 'Módulos y Modos',
      comparison: 'Comparativa',
      pricing: 'Precios',
      faq: 'Preguntas',
      blog: 'Blog',
      ctaApp: 'Probar Ahora',
    },
    hero: {
      badge: 'El Entrenador Interactivo para el Examen DTB B2-Beruf',
      h1Main: 'Aprueba tu examen B2 Beruf ',
      h1Highlight: 'al primer intento!',
      subtitle:
        '12 módulos de examen interactivos, simulacros reales de 130 min con cronómetro, 104+ cartas modelo y vocabulario inteligente: 100% offline en móvil y PC.',
      ctaPrimary: '🚀 Probar Gratis',
      ctaSecondary: '💎 Ver Planes y Precios',
      ratingText: '5.0 estrellas de candidatos aprobados',
      stat1Val: '12',
      stat1Label: 'Módulos DTB',
      stat2Val: '130 Min.',
      stat2Label: 'Cronómetro Real',
      stat3Val: '104+',
      stat3Label: 'Modelos de Carta Q58',
      stat4Val: '100%',
      stat4Label: 'Offline (PWA)',
    },
    pain: {
      title: 'Por qué más del 40% suspende en el primer intento',
      subtitle: 'El examen B2 Beruf requiere dominar los tiempos y la estructura exacta, no solo gramática.',
      card1Title: 'Presión Extrema de Tiempo (57 Preguntas)',
      card1Desc:
        '130 minutos para lectura, audio, escritura y lenguaje pasan volando. Sin práctica con cronómetro, faltan 20–30 minutos.',
      card2Title: 'Formatos Complejos de Escritura (Q58)',
      card2Desc:
        'Entradas de foro, cartas de queja y actas exigen giros profesionales (Redemittel) y una estructura fija.',
      card3Title: 'Exámenes de Repetición Caros',
      card3Desc:
        'Suspender implica meses de espera, estrés con el Jobcenter y pagar más de 180 € por repetir la prueba.',
      ctaButton: '🎯 Descubre Nuestros Módulos y Funciones',
    },
    modules: {
      badge: 'Sistema Completo de Preparación',
      title: 'Todos los Modos de Entrenamiento para Tu Éxito',
      subtitle: 'Ejercicios modulares, simulacros completos, plantillas de redacción y vocabulario inteligente.',
      card1Title: 'Práctica por Módulos (12 Partes)',
      card1Desc: 'Practica cada módulo por separado: Lectura 1–4, Audio 1–4, Escritura, Expresión Oral y Gramática con corrección inmediata.',
      card1Link: 'Ir al Entrenamiento',
      card2Title: 'Simulación de Examen (1–57)',
      card2Desc: 'Resuelve las 57 preguntas en condiciones reales con cuenta atrás de 130 minutos y puntuación automática.',
      card2Link: 'Iniciar Simulación',
      card3Title: 'Entrenador de Escritura (Tarea 21)',
      card3Desc: '104+ temas originales de foros, reclamaciones y notas con soluciones redactadas en nivel B2 y contador de palabras.',
      card3Link: 'Abrir Escritura',
      card4Title: 'Entrenador Oral (1A, 2 & 3)',
      card4Desc: '67+ temas orales con cronómetro de preparación, señal de gong y pautas de frases estructuradas.',
      card4Link: 'Abrir Expresión Oral',
      card5Title: 'Vocabulario y NVV (SRS)',
      card5Desc: 'Algoritmo inteligente de repetición espaciada para combinaciones verbo-sustantivo y términos profesionales.',
      card5Link: 'Abrir Vocabulario',
      card6Title: 'App 100% Offline (PWA)',
      card6Desc: 'Instala la aplicación en tu móvil (iOS/Android) o PC y estudia en el tren, avión o autobús sin gastar datos.',
      card6Link: 'Ver Instalación',
    },
    comparison: {
      title: 'Invierte Inteligentemente en Tu Éxito',
      subtitle: 'Compara costes y ventajas de las diferentes formas de preparar el examen.',
      colFeature: 'Característica / Criterio',
      colApp: '👑 Beruf B2+ Trainer',
      colTutor: 'Profesor Particular',
      colBooks: 'Libros Impresos',
      rowPrice: 'Coste / Precio',
      rowAppPrice: 'desde 9,99 € (pago único)',
      rowTutorPrice: '35 – 50 € / hora (300+ €)',
      rowBooksPrice: '25 – 40 € por libro',
      rowAccess: 'Disponibilidad y Flexibilidad',
      rowAppAccess: '24/7 ilimitado en móvil y PC',
      rowTutorAccess: 'Solo con cita previa',
      rowBooksAccess: 'Solo con libros pesados',
      rowSim: 'Simulación 130 min con cronómetro',
      rowAppSim: '✓ Simulación real y nota automática',
      rowTutorSim: 'Solo manual con cronómetro',
      rowBooksSim: '❌ Sin corrección automática',
      rowAudio: 'Comprensión Auditiva y Reproductor',
      rowAppAudio: '✓ Interactivo con salto ±5s y velocidad',
      rowTutorAudio: 'A menudo sin material auditivo',
      rowBooksAudio: 'CDs / códigos QR sin app',
      rowTemplates: '104+ Modelos de Carta y Habla',
      rowAppTemplates: '✓ Textos modelo B2 completos',
      rowTutorTemplates: 'Corrección de pocos textos',
      rowBooksTemplates: 'Muy pocos ejemplos rígidos',
      rowSrs: 'Vocabulario con Repetición Espaciada',
      rowAppSrs: '✓ Algoritmo SRS inteligente',
      rowTutorSrs: '❌ Sin sistema',
      rowBooksSrs: '❌ Listas estáticas de palabras',
    },
    pricing: {
      badge: 'Precios Transparentes',
      title: 'Elige Tu Pase de Preparación',
      subtitle: 'Pago único por el periodo elegido. Sin costes ocultos y sin suscripciones automáticas.',
      plan1Name: 'Pase Sprint 7 Días',
      plan1Desc: '1 semana de acceso total. Ideal para el repaso final antes del examen.',
      plan1Price: '9,99 €',
      plan1Period: 'por 7 días',
      plan2Name: 'Pase Estándar 30 Días',
      plan2Badge: 'Más Vendido',
      plan2Desc: '1 mes de acceso total. La opción más popular para una preparación sólida.',
      plan2Price: '15,99 €',
      plan2Period: 'por 30 días',
      plan3Name: 'Guía de Curso 90 Días',
      plan3Badge: 'Ahorro 38%',
      plan3Desc: '3 meses de acceso total. Te acompaña durante todo tu curso oficial B2.',
      plan3Price: '29,99 €',
      plan3Period: 'por 90 días',
      plan4Name: 'Pase de por Vida',
      plan4Badge: 'Oferta: -20%',
      plan4Desc: 'Acceso ilimitado y permanente sin límites de tiempo hasta que apruebes.',
      plan4Price: '39,99 €',
      plan4OldPrice: '49,99 €',
      plan4Period: 'ilimitado',
      btnSelect: 'Seleccionar',
      btnUnlock: 'Activar Ahora',
      features: [
        'Acceso total a las 12 partes del examen',
        'Simulacros ilimitados con cronómetro',
        '104+ cartas de muestra y 67+ temas orales',
        'Entrenamiento completo de vocabulario SRS',
        '100% utilizable offline (PWA)',
      ],
      featuresLifetime: [
        'Acceso permanente ilimitado',
        'Los 12 módulos y futuros exámenes',
        'Simulacros de examen ilimitados',
        '100% utilizable offline (PWA)',
      ],
      mainCta: '✨ Seleccionar Plan en la App y Desbloquear',
      trustSsl: 'Encriptación SSL de 256 bits',
      trustNoSub: 'Sin renovación automática de suscripción',
    },
    faq: {
      title: 'Preguntas Frecuentes (FAQ)',
      subtitle: 'Todo lo que necesitas saber sobre Beruf B2+ Trainer y su uso offline.',
      items: [
        {
          q: '¿Cómo se grabaron los audios de comprensión auditiva?',
          a: 'Los audios y diálogos se generan con síntesis de voz en alemán de máxima precisión. Ofrecen pronunciación nítida y velocidad de examen real sin ruidos molestos.',
        },
        {
          q: '¿Hay suscripciones automáticas o cobros ocultos?',
          a: '¡No! No hay trampas. Cada pase es una compra única que expira automáticamente sin necesidad de cancelar nada.',
        },
        {
          q: '¿Puedo probar la app gratis antes de comprar?',
          a: '¡Sí, por supuesto! Puedes entrar a la aplicación web y probar varios módulos de inmediato sin registrarte ni ingresar tarjetas.',
        },
        {
          q: '¿La app funciona sin conexión a internet (offline)?',
          a: '¡Sí! Al ser una Progressive Web App (PWA), puedes instalarla en iPhone, Android o PC y estudiar offline donde quieras.',
        },
        {
          q: '¿El contenido coincide con el examen oficial DTB B2?',
          a: '¡Sí! Los 12 módulos, la puntuación y el tiempo de 130 minutos siguen exactamente el formato oficial del DTB.',
        },
      ],
    },
    finalCta: {
      badge: 'Empieza Ahora',
      title: '¡Aprueba el Examen B2 Beruf al Primer Intento!',
      subtitle: 'Únete a cientos de aprobados y prepárate sin miedo al examen.',
      button: '🚀 Probar Gratis',
    },
    footer: {
      desc: 'Plataforma digital independiente para la preparación del examen DTB B2 Beruf.',
      agb: 'Términos y Renuncia de Desistimiento',
      datenschutz: 'Política de Privacidad',
      cookies: 'Cookies',
      impressum: 'Aviso Legal (Impressum)',
      rights: 'Todos los derechos reservados.',
      trust: '100% compatible con RGPD • Modo Offline',
    },
  },

  ru: {
    nav: {
      features: 'Преимущества',
      modules: 'Модули и режимы',
      comparison: 'Сравнение',
      pricing: 'Тарифы',
      faq: 'Частые вопросы',
      blog: 'Блог',
      ctaApp: 'Попробовать',
    },
    hero: {
      badge: 'Интерактивный тренажер DTB B2 Beruf',
      h1Main: 'Сдайте экзамен B2 Beruf ',
      h1Highlight: 'с первой попытки!',
      subtitle:
        '12 интерактивных модулей, настоящие 130-минутные симуляции с таймером, 104+ примера писем и заметок, умный словарь – 100% офлайн на телефоне и ПК.',
      ctaPrimary: '🚀 Попробовать бесплатно',
      ctaSecondary: '💎 Посмотреть тарифы',
      ratingText: '5.0 звезд от успешно сдавших кандидатов',
      stat1Val: '12',
      stat1Label: 'Модулей DTB',
      stat2Val: '130 мин.',
      stat2Label: 'Оригинальный таймер',
      stat3Val: '104+',
      stat3Label: 'Примеров писем Q58',
      stat4Val: '100%',
      stat4Label: 'Офлайн (PWA)',
    },
    pain: {
      title: 'Почему более 40% кандидатов проваливают экзамен с первого раза',
      subtitle: 'Экзамен B2 Beruf требует не только знания грамматики, но и строгого тайм-менеджмента и формата.',
      card1Title: 'Жесткий дефицит времени (57 вопросов)',
      card1Desc:
        '130 минут на чтение, аудирование, письмо и языковые элементы пролетают мгновенно. Без тренировки на скорость не хватает 20–30 минут.',
      card2Title: 'Сложные форматы письма (Q58)',
      card2Desc:
        'Посты на форуме, жалобы и протоколы требуют четких устойчивых выражений (Redemittel) и строгой структуры.',
      card3Title: 'Дорогие пересдачи экзамена',
      card3Desc:
        'Провал означает месяцы ожидания нового термина, стресс в Jobcenter и дополнительные расходы более 180 евро.',
      ctaButton: '🎯 Посмотреть обучающие модули и функции',
    },
    modules: {
      badge: 'Комплексная система подготовки',
      title: 'Все режимы для гарантированного успеха',
      subtitle: 'Целевые тренировки по модулям, полные симуляции, образцы писем и умный словарь.',
      card1Title: 'Тренировка по плиткам (12 частей)',
      card1Desc: 'Тренируйте каждый модуль отдельно: Чтение 1–4, Аудирование 1–4, Письмо, Говорение и Языковые элементы с пояснениями.',
      card1Link: 'К тренировке модулей',
      card2Title: 'Симуляция экзамена (1–57)',
      card2Desc: 'Пройдите все 57 вопросов в реальных условиях со 130-минутным таймером и автоматическим подсчетом баллов.',
      card2Link: 'К симуляции экзамена',
      card3Title: 'Тренажер письма (Задание 21)',
      card3Desc: '104+ реальные темы писем, жалоб и заметок с готовыми образцами ответов уровня B2 и счетчиком слов.',
      card3Link: 'К тренажеру письма',
      card4Title: 'Тренажер говорения (1A, 2 & 3)',
      card4Desc: '67+ устных тем с таймером подготовки, сигналом гонга и структурированными речевыми клише.',
      card4Link: 'К тренажеру говорения',
      card5Title: 'Словарь и NVV (SRS)',
      card5Desc: 'Алгоритм интервального повторения для Nomen-Verb-Verbindungen, примеров и профессиональной лексики.',
      card5Link: 'К изучению слов',
      card6Title: '100% Офлайн-приложение (PWA)',
      card6Desc: 'Установите приложение на телефон (iOS/Android) или ПК и учитесь в поезде или самолете без интернета.',
      card6Link: 'Как установить приложение',
    },
    comparison: {
      title: 'Инвестируйте разумно в свой результат',
      subtitle: 'Сравните стоимость и возможности различных способов подготовки к экзамену.',
      colFeature: 'Критерий / Возможность',
      colApp: '👑 Beruf B2+ Trainer',
      colTutor: 'Репетитор',
      colBooks: 'Печатные учебники',
      rowPrice: 'Стоимость',
      rowAppPrice: 'от 9,99 € (разово)',
      rowTutorPrice: '35 – 50 € / час (300+ €)',
      rowBooksPrice: '25 – 40 € за книгу',
      rowAccess: 'Доступность и гибкость',
      rowAppAccess: '24/7 без ограничений на телефоне и ПК',
      rowTutorAccess: 'Только по расписанию',
      rowBooksAccess: 'Только с тяжелой книгой',
      rowSim: '130-мин. симуляция с таймером',
      rowAppSim: '✓ Реальный тест и автоматический балл',
      rowTutorSim: 'Только вручную с секундомером',
      rowBooksSim: '❌ Нет автоматической оценки',
      rowAudio: 'Аудирование и плеер',
      rowAppAudio: '✓ Интерактивно с перемоткой ±5с и темпом',
      rowTutorAudio: 'Обычно без фокуса на аудио',
      rowBooksAudio: 'CD-диски или QR без софта',
      rowTemplates: '104+ образца для письма и речи',
      rowAppTemplates: '✓ Полностью готовые тексты B2',
      rowTutorTemplates: 'Проверка лишь пары текстов',
      rowBooksTemplates: 'Очень мало шаблонных примеров',
      rowSrs: 'Интервальный словарь (SRS)',
      rowAppSrs: '✓ Умный алгоритм повторения',
      rowTutorSrs: '❌ Нет системы',
      rowBooksSrs: '❌ Обычные списки слов',
    },
    pricing: {
      badge: 'Прозрачные цены',
      title: 'Выберите подходящий тариф подготовки',
      subtitle: 'Разовая оплата за выбранный период. Без скрытых платежей и без автоматических списаний.',
      plan1Name: '7 Tage Sprint-Pass',
      plan1Desc: '1 неделя полного доступа. Идеально для финального повторения перед экзаменом.',
      plan1Price: '9,99 €',
      plan1Period: 'на 7 дней',
      plan2Name: '30 Tage Standard-Pass',
      plan2Badge: 'Хит продаж',
      plan2Desc: '1 месяц полного доступа. Самый популярный выбор для основательной подготовки.',
      plan2Price: '15,99 €',
      plan2Period: 'на 30 дней',
      plan3Name: '90 Tage Kursbegleiter',
      plan3Badge: 'Экономия 38%',
      plan3Desc: '3 месяца полного доступа. Сопровождает вас на протяжении всего языкового курса B2.',
      plan3Price: '29,99 €',
      plan3Period: 'на 90 дней',
      plan4Name: 'Lebenslanger Pass',
      plan4Badge: 'Скидка -20%',
      plan4Desc: 'Бессрочный доступ без ограничений по времени до успешной сдачи экзамена.',
      plan4Price: '39,99 €',
      plan4OldPrice: '49,99 €',
      plan4Period: 'навсегда',
      btnSelect: 'Выбрать',
      btnUnlock: 'Открыть доступ',
      features: [
        'Полный доступ ко всем 12 модулям',
        'Неограниченные симуляции с таймером',
        'Все 104+ тем писем и 67+ устных тем',
        'Полный тренажер словаря (SRS)',
        '100% работа офлайн (PWA)',
      ],
      featuresLifetime: [
        'Бессрочный неограниченный доступ',
        'Все 12 модулей и будущие тесты',
        'Неограниченные симуляции экзамена',
        '100% работа офлайн (PWA)',
      ],
      mainCta: '✨ Выбрать тариф в приложении и безопасно оплатить',
      trustSsl: '256-битное SSL шифрование',
      trustNoSub: 'Без автопродления подписки',
    },
    faq: {
      title: 'Частые вопросы (FAQ)',
      subtitle: 'Все, что нужно знать о тренажере Beruf B2+, контенте и работе офлайн.',
      items: [
        {
          q: 'Как записаны аудио в разделе Hören?',
          a: 'Аудиодиалоги и тексты созданы с помощью высокоточной немецкой синтезированной речи. Они обеспечивают кристальную четкость дикции и естественный темп экзамена без посторонних шумов.',
        },
        {
          q: 'Есть ли здесь автопродление подписки или скрытые списания?',
          a: 'Нет! Никаких скрытых условий. Каждый доступ — это разовая покупка. По окончании срока доступ просто закрывается, отменять ничего не нужно.',
        },
        {
          q: 'Могу ли я попробовать тренажер бесплатно перед покупкой?',
          a: 'Да, конечно! Вы можете сразу открыть приложение и бесплатно протестировать несколько модулей без регистрации и ввода карт.',
        },
        {
          q: 'Работает ли приложение без интернета (офлайн)?',
          a: 'Да! Как Progressive Web App (PWA), приложение устанавливается на iPhone, Android или ПК и позволяет учиться даже в самолете.',
        },
        {
          q: 'Соответствуют ли задания официальному формату DTB B2?',
          a: 'Да! Все 12 модулей (Lesen 1–4, Hören 1–4, Schreiben, Sprechen, Sprachbausteine 1 & 2), баллы и 130-минутный таймер полностью соответствуют структуре DTB.',
        },
      ],
    },
    finalCta: {
      badge: 'Начните прямо сейчас',
      title: 'Сдайте экзамен B2 Beruf с первой попытки!',
      subtitle: 'Присоединяйтесь к успешным кандидатам и готовьтесь уверенно без стресса.',
      button: '🚀 Попробовать бесплатно',
    },
    footer: {
      desc: 'Независимая цифровая платформа для подготовки к экзамену DTB B2 Beruf.',
      agb: 'Условия и отказ от возврата',
      datenschutz: 'Конфиденциальность',
      cookies: 'Файлы cookie',
      impressum: 'Контакты (Impressum)',
      rights: 'Все права защищены.',
      trust: '100% соответствует DSGVO • Офлайн-режим',
    },
  },
};
