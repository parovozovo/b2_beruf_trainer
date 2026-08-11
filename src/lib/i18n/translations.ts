export type Language = 'de' | 'uk' | 'en';

export interface Translations {
  // Navigation
  navHome: string;
  navExams: string;
  navResults: string;
  navAdmin: string;
  navLogin: string;
  navSignOut: string;
  
  // Hero section
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  startRandomBtn: string;
  startRandomSub: string;
  overviewBtn: string;
  overviewSub: string;

  // Features
  featSplitTitle: string;
  featSplitDesc: string;
  featSprachTitle: string;
  featSprachDesc: string;
  featTimerTitle: string;
  featTimerDesc: string;

  // Exam interface
  leseverstehen: string;
  sprachbausteine: string;
  hoerverstehen: string;
  teil: string;
  aufgabe: string;
  von: string;
  zeitverbleibend: string;
  abgeschlossen: string;
  pruefungAbgeben: string;
  pruefungNeuStarten: string;
  ergebnis: string;
  punkte: string;
  ausgewaehlt: string;
  waehlen: string;
  ueberschriftWaehlen: string;
  moeglicheUeberschriften: string;
  zuordnungDurchfuehren: string;
  fragenAntworten: string;
  beantwortet: string;
  richtig: string;
  falsch: string;
  soll: string;
  richtigeAntwort: string;
  luecke: string;
  lueckenAusgefuellt: string;
  wiedergaben: string;
  maxWiedergaben: string;
  audioAbspielen: string;
  audioSpielt: string;
  wiedergabelimitErreicht: string;
  aussagenBewerten: string;
  zurueck: string;
  weiter: string;
  textLesen: string;
  fragenBeantworten: string;
  quickPeekText: string;
  close: string;
  showTranslation: string;
  hideTranslation: string;
  explanation: string;
  pwaInstallTitle: string;
  pwaInstallDesc: string;
  pwaInstallBtn: string;

  // Auth & Paywall
  premiumBadge: string;
  freeBadge: string;
  premiumRequired: string;
  paywallTitle: string;
  paywallDesc: string;
  promoCodePlaceholder: string;
  redeemBtn: string;
  redeeming: string;
  signInTitle: string;
  signUpTitle: string;
  googleSignIn: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  signInBtn: string;
  signUpBtn: string;
  noAccount: string;
  hasAccount: string;

  // Game Modes & Stats (Phase 3)
  trainingModeTitle: string;
  trainingModeSub: string;
  trainingModeDesc: string;
  simulationModeTitle: string;
  simulationModeSub: string;
  simulationModeDesc: string;
  teaserBadge: string;
  fullSimTitle: string;
  startSimulationBtn: string;
  trainingStatsTitle: string;
  statsDashboardTitle: string;
  resetStatsBtn: string;
  completedSimulationsTitle: string;
  accuracyPercentage: string;
  noSimulationsYet: string;
  resetStatsSuccess: string;
}

export const translations: Record<Language, Translations> = {
  de: {
    navHome: 'Startseite',
    navExams: 'Modelltests',
    navResults: 'Ergebnisse',
    navAdmin: 'Admin',
    navLogin: 'Anmelden',
    navSignOut: 'Abmelden',
    heroBadge: 'Interaktiver telc B2 Beruf Prüfungssimulator',
    heroTitle1: 'Prüfungssimulator',
    heroTitle2: 'telc B2 Beruf',
    heroDesc: 'Bereiten Sie sich unter realistischen Bedingungen auf die telc B2 Beruf Prüfung vor: Zeitlimit, Lesetexte, Sprachbausteine und Hörverstehen.',
    startRandomBtn: 'Zufällige Prüfung starten',
    startRandomSub: 'Task-Bank Generator',
    overviewBtn: 'Prüfungsübersicht',
    overviewSub: 'Modelltests',
    featSplitTitle: 'Leseverstehen Dual-View',
    featSplitDesc: 'Optimierte mobile & desktop Ansicht für Lesetexte, Zuordnungen und Multiple-Choice.',
    featSprachTitle: 'Interaktive Sprachbausteine',
    featSprachDesc: 'Inline Dropdowns & Touch-Auswahl direkt im Fließtext mit sofortiger Auswertung.',
    featTimerTitle: 'Realitätsnah & Timer',
    featTimerDesc: '45-Minuten-Zeitlimit mit automatischer Abgabe und Auswertung aller 8 Prüfungsteile.',
    leseverstehen: 'Leseverstehen',
    sprachbausteine: 'Sprachbausteine',
    hoerverstehen: 'Hörverstehen',
    teil: 'Teil',
    aufgabe: 'Aufgabe',
    von: 'von',
    zeitverbleibend: 'Zeit verbleibend',
    abgeschlossen: 'Abgeschlossen',
    pruefungAbgeben: 'Prüfung abgeben',
    pruefungNeuStarten: 'Neu starten',
    ergebnis: 'Prüfung ausgewertet!',
    punkte: 'Punkt(e)',
    ausgewaehlt: 'Ausgewählt',
    waehlen: 'Wählen',
    ueberschriftWaehlen: '-- Überschrift wählen --',
    moeglicheUeberschriften: 'Mögliche Überschriften',
    zuordnungDurchfuehren: 'Zuordnung durchführen',
    fragenAntworten: 'Fragen & Antworten',
    beantwortet: 'beantwortet',
    richtig: 'Richtig',
    falsch: 'Falsch',
    soll: 'Soll',
    richtigeAntwort: 'Richtige Antwort',
    luecke: 'Lücke',
    lueckenAusgefuellt: 'Lücken ausgefüllt',
    wiedergaben: 'Wiedergaben',
    maxWiedergaben: 'Maximal abspielbar laut Prüfungsordnung',
    audioAbspielen: 'Audio abspielen',
    audioSpielt: 'Audio wird abgespielt...',
    wiedergabelimitErreicht: 'Wiedergabelimit erreicht',
    aussagenBewerten: 'Aussagen bewerten (Richtig / Falsch)',
    zurueck: 'Zurück',
    weiter: 'Weiter',
    textLesen: 'Text lesen 📖',
    fragenBeantworten: 'Fragen beantworten ❓',
    quickPeekText: 'Text anzeigen 👁️',
    close: 'Schließen',
    showTranslation: 'Переклад 🌐',
    hideTranslation: 'Сховати переклад 🌐',
    explanation: 'Пояснення / Порада 💡',
    pwaInstallTitle: 'Als App installieren',
    pwaInstallDesc: 'Fügen Sie den Prüfungssimulator zum Startbildschirm hinzu für den besten Zugriff.',
    pwaInstallBtn: 'Installieren',
    premiumBadge: 'PREMIUM',
    freeBadge: 'KOSTENLOS',
    premiumRequired: 'Premium erforderlich',
    paywallTitle: 'Freischaltung erforderlich',
    paywallDesc: 'Dieser Modelltest ist ein Premium-Set. Bitte geben Sie Ihren Aktivierungscode ein, um Premium freizuschalten.',
    promoCodePlaceholder: 'Geben Sie den Promo-Code ein',
    redeemBtn: 'Code einlösen',
    redeeming: 'Wird überprüft...',
    signInTitle: 'Anmelden bei telc B2 Beruf',
    signUpTitle: 'Konto erstellen',
    googleSignIn: 'Mit Google anmelden',
    emailPlaceholder: 'E-Mail-Adresse',
    passwordPlaceholder: 'Passwort',
    signInBtn: 'Anmelden',
    signUpBtn: 'Registrieren',
    noAccount: 'Noch kein Konto? Registrieren',
    hasAccount: 'Bereits ein Konto? Anmelden',
    trainingModeTitle: 'Modus: Einzel-Training',
    trainingModeSub: 'Gezieltes Üben nach Prüfungsteilen',
    trainingModeDesc: 'Wählen Sie einen spezifischen Teil (1-12) aus. Antworten werden direkt ausgewertet.',
    simulationModeTitle: 'Modus: Komplett-Simultation',
    simulationModeSub: 'Realistische Prüfung 1-57 Fragen',
    simulationModeDesc: 'Zufällige Auswahl je 1 Variante pro Teil. Inklusive Premium-Teaser für alle Nutzer!',
    teaserBadge: 'FREE TEASER PREVIEW',
    fullSimTitle: 'Volle Prüfungssimulation starten',
    startSimulationBtn: 'Simulation Jetzt Starten',
    trainingStatsTitle: 'Trainings-Statistik nach Prüfungsteil',
    statsDashboardTitle: 'Ihre Prüfungs-Statistiken',
    resetStatsBtn: 'Statistiken zurücksetzen',
    completedSimulationsTitle: 'Abgeschlossene Komplett-Prüfungen',
    accuracyPercentage: 'Erfolgsquote',
    noSimulationsYet: 'Noch keine vollständige Prüfungssimulation absolviert.',
    resetStatsSuccess: 'Statistiken erfolgreich zurückgesetzt!',
  },
  uk: {
    navHome: 'Головна',
    navExams: 'Тести',
    navResults: 'Результати',
    navAdmin: 'Адмін',
    navLogin: 'Увійти',
    navSignOut: 'Вийти',
    heroBadge: 'Інтерактивний симулятор іспиту telc B2 Beruf',
    heroTitle1: 'Симулятор іспиту',
    heroTitle2: 'telc B2 Beruf',
    heroDesc: 'Готуйтеся до іспиту telc B2 Beruf у реалістичних умовах: таймер, читання, мовні елементи та аудіювання.',
    startRandomBtn: 'Почати випадковий тест',
    startRandomSub: 'Генератор з бази завдань',
    overviewBtn: 'Огляд тестувань',
    overviewSub: 'Модельні тести',
    featSplitTitle: 'Подвійний перегляд читання',
    featSplitDesc: 'Зручний мобільний та десктопний режим для текстів, сортування та відповідей.',
    featSprachTitle: 'Інтерактивні Sprachbausteine',
    featSprachDesc: 'Вставка слів та граматичних форм прямо в текст з миттєвою перевіркою.',
    featTimerTitle: 'Таймер реального часу',
    featTimerDesc: 'Реальний 45-хвилинний відлік часу з автоматичною здачею та оцінюванням 8 частин.',
    leseverstehen: 'Читання',
    sprachbausteine: 'Мовні елементи',
    hoerverstehen: 'Аудіювання',
    teil: 'Частина',
    aufgabe: 'Завдання',
    von: 'з',
    zeitverbleibend: 'Часу залишилось',
    abgeschlossen: 'Завершено',
    pruefungAbgeben: 'Здати іспит',
    pruefungNeuStarten: 'Пройти знову',
    ergebnis: 'Іспит перевірено!',
    punkte: 'балів',
    ausgewaehlt: 'Обрано',
    waehlen: 'Обрати',
    ueberschriftWaehlen: '-- Оберіть заголовок --',
    moeglicheUeberschriften: 'Можливі заголовки',
    zuordnungDurchfuehren: 'Виконай відповідність',
    fragenAntworten: 'Запитання та відповіді',
    beantwortet: 'відповіли',
    richtig: 'Правильно',
    falsch: 'Неправильно',
    soll: 'Має бути',
    richtigeAntwort: 'Правильна відповідь',
    luecke: 'Пропуск',
    lueckenAusgefuellt: 'пропусків заповнено',
    wiedergaben: 'Прослуховувань',
    maxWiedergaben: 'Максимум прослуховувань за правилами',
    audioAbspielen: 'Слухати аудіо',
    audioSpielt: 'Аудіо грає...',
    wiedergabelimitErreicht: 'Ліміт прослуховувань досягнуто',
    aussagenBewerten: 'Оцініть твердження (Правильно / Неправильно)',
    zurueck: 'Назад',
    weiter: 'Далі',
    textLesen: 'Читати текст 📖',
    fragenBeantworten: 'Відповідати ❓',
    quickPeekText: 'Швидкий перегляд 👁️',
    close: 'Закрити',
    showTranslation: 'Переклад 🌐',
    hideTranslation: 'Сховати переклад 🌐',
    explanation: 'Пояснення / Порада 💡',
    pwaInstallTitle: 'Встановити як додаток',
    pwaInstallDesc: 'Додайте симулятор на головний екран для швидкого доступу.',
    pwaInstallBtn: 'Встановити',
    premiumBadge: 'PREMIUM',
    freeBadge: 'БЕЗКОШТОВНО',
    premiumRequired: 'Потрібен Преміум',
    paywallTitle: 'Необхідна активація',
    paywallDesc: 'Цей модельний тест доступний у Premium. Введіть свій промокод для розблокування.',
    promoCodePlaceholder: 'Введіть промокод',
    redeemBtn: 'Активувати код',
    redeeming: 'Перевірка...',
    signInTitle: 'Вхід у telc B2 Beruf',
    signUpTitle: 'Створити акаунт',
    googleSignIn: 'Увійти через Google',
    emailPlaceholder: 'Електронна пошта',
    passwordPlaceholder: 'Пароль',
    signInBtn: 'Увійти',
    signUpBtn: 'Зареєструватися',
    noAccount: 'Немає акаунту? Зареєструватися',
    hasAccount: 'Вже є акаунт? Увійти',
    trainingModeTitle: 'Режим: Тренування',
    trainingModeSub: 'Окремі теми та частини',
    trainingModeDesc: 'Обирайте будь-яку частину (1-12). Відповіді оцінюються одразу.',
    simulationModeTitle: 'Режим: Симуляція Іспиту',
    simulationModeSub: 'Повний тест 1-57 питань',
    simulationModeDesc: 'Випадковий вибір по 1 варіанту на кожен Teil. Включає преміум-тизер для всіх!',
    teaserBadge: 'FREE TEASER PREVIEW',
    fullSimTitle: 'Почати повну симуляцію іспиту',
    startSimulationBtn: 'Розпочати Іспит Зараз',
    trainingStatsTitle: 'Статистика тренувань по частинах',
    statsDashboardTitle: 'Ваша статистика іспитів',
    resetStatsBtn: 'Скинути статистику',
    completedSimulationsTitle: 'Завершені симуляції іспитів',
    accuracyPercentage: 'Успішність',
    noSimulationsYet: 'Ще немає завершених повних симуляцій іспиту.',
    resetStatsSuccess: 'Статистику успішно скинуто!',
  },
  en: {
    navHome: 'Home',
    navExams: 'Model Exams',
    navResults: 'Results',
    navAdmin: 'Admin',
    navLogin: 'Sign In',
    navSignOut: 'Sign Out',
    heroBadge: 'Interactive telc B2 Beruf Exam Simulator',
    heroTitle1: 'Exam Simulator',
    heroTitle2: 'telc B2 Beruf',
    heroDesc: 'Prepare for the telc B2 Beruf exam under realistic conditions: official timer, split reading views, language elements, and audio comprehension.',
    startRandomBtn: 'Start Random Exam',
    startRandomSub: 'Task Bank Generator',
    overviewBtn: 'Exam Overview',
    overviewSub: 'Model Tests',
    featSplitTitle: 'Reading Dual-View',
    featSplitDesc: 'Optimized mobile & desktop views for text reading and matching/multiple choice.',
    featSprachTitle: 'Interactive Sprachbausteine',
    featSprachDesc: 'Inline drop-downs and mobile selectors inside paragraph texts with real-time feedback.',
    featTimerTitle: 'Realistic Timer',
    featTimerDesc: '45-minute countdown with automatic submission and detailed score breakdown for all 8 parts.',
    leseverstehen: 'Reading Comprehension',
    sprachbausteine: 'Language Elements',
    hoerverstehen: 'Listening Comprehension',
    teil: 'Part',
    aufgabe: 'Task',
    von: 'of',
    zeitverbleibend: 'Time Remaining',
    abgeschlossen: 'Completed',
    pruefungAbgeben: 'Submit Exam',
    pruefungNeuStarten: 'Restart Exam',
    ergebnis: 'Exam Evaluated!',
    punkte: 'point(s)',
    ausgewaehlt: 'Selected',
    waehlen: 'Select',
    ueberschriftWaehlen: '-- Select Heading --',
    moeglicheUeberschriften: 'Available Headings',
    zuordnungDurchfuehren: 'Perform Matching',
    fragenAntworten: 'Questions & Answers',
    beantwortet: 'answered',
    richtig: 'Correct',
    falsch: 'Incorrect',
    soll: 'Expected',
    richtigeAntwort: 'Correct Answer',
    luecke: 'Gap',
    lueckenAusgefuellt: 'gaps filled',
    wiedergaben: 'Plays',
    maxWiedergaben: 'Maximum plays allowed by exam rules',
    audioAbspielen: 'Play Audio',
    audioSpielt: 'Playing audio...',
    wiedergabelimitErreicht: 'Play limit reached',
    aussagenBewerten: 'Evaluate Statements (True / False)',
    zurueck: 'Back',
    weiter: 'Next',
    textLesen: 'Read Text 📖',
    fragenBeantworten: 'Answer Questions ❓',
    quickPeekText: 'Quick Peek 👁️',
    close: 'Close',
    showTranslation: 'Translation 🌐',
    hideTranslation: 'Hide Translation 🌐',
    explanation: 'Explanation / Tip 💡',
    pwaInstallTitle: 'Install as App',
    pwaInstallDesc: 'Add the exam simulator to your home screen for fast access.',
    pwaInstallBtn: 'Install',
    premiumBadge: 'PREMIUM',
    freeBadge: 'FREE',
    premiumRequired: 'Premium Required',
    paywallTitle: 'Premium Unlock Required',
    paywallDesc: 'This model test is a Premium set. Please enter your promo code to unlock Premium access.',
    promoCodePlaceholder: 'Enter promo code',
    redeemBtn: 'Redeem Code',
    redeeming: 'Verifying...',
    signInTitle: 'Sign In to telc B2 Beruf',
    signUpTitle: 'Create Account',
    googleSignIn: 'Sign in with Google',
    emailPlaceholder: 'Email address',
    passwordPlaceholder: 'Password',
    signInBtn: 'Sign In',
    signUpBtn: 'Sign Up',
    noAccount: "Don't have an account? Sign Up",
    hasAccount: 'Already have an account? Sign In',
    trainingModeTitle: 'Mode: Single Training',
    trainingModeSub: 'Practice specific exam parts',
    trainingModeDesc: 'Select any part (1-12). Answers are evaluated instantly.',
    simulationModeTitle: 'Mode: Full Exam Simulation',
    simulationModeSub: 'Realistic exam Q1-57',
    simulationModeDesc: 'Randomly picks 1 variant per Teil. Includes free premium teaser for all users!',
    teaserBadge: 'FREE TEASER PREVIEW',
    fullSimTitle: 'Start Full Exam Simulation',
    startSimulationBtn: 'Start Exam Now',
    trainingStatsTitle: 'Training Statistics per Part',
    statsDashboardTitle: 'Your Exam Statistics',
    resetStatsBtn: 'Reset Statistics',
    completedSimulationsTitle: 'Completed Full Exam Simulations',
    accuracyPercentage: 'Accuracy Rate',
    noSimulationsYet: 'No completed full exam simulations yet.',
    resetStatsSuccess: 'Statistics successfully reset!',
  },
};
