import type { Modelltest, ForumsbeitragTopic, PromoCode } from '../types';

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'BETA2026',
    durationDays: 30,
    maxUses: 50,
    usedCount: 3,
    createdDate: '2026-08-01',
    usedByEmails: ['demo@user.de'],
    active: true
  },
  {
    id: 'promo-2',
    code: 'BERUFPRO',
    durationDays: 60,
    maxUses: 100,
    usedCount: 12,
    createdDate: '2026-08-05',
    usedByEmails: [],
    active: true
  }
];

export const INITIAL_FORUMSBEITRAG_TOPICS: ForumsbeitragTopic[] = [
  {
    id: 'fb-1',
    title: 'Homeoffice vs. Präsenzarbeit im Betrieb',
    promptText: 'In einem Online-Forum für Weiterbildung im Beruf diskutieren Beschäftigte über das Thema "Homeoffice und Präsenzkultur". Schreiben Sie einen Forenbeitrag dazu. Äußern Sie Ihre Meinung, nennen Sie Vor- und Nachteile von Homeoffice und machen Sie Vorschläge für eine ausgewogene Lösung im Betriebsalltag.',
    isPremium: false
  },
  {
    id: 'fb-2',
    title: 'Weiterbildung auf eigene Kosten oder Betriebsvereinbarung?',
    promptText: 'In einem Diskussionsforum geht es um die Frage, wer berufliche Fortbildungen bezahlen sollte: Arbeitnehmer oder Arbeitgeber? Nehmen Sie Stellung zu den Vor- und Nachteilen von betrieblicher Weiterbildung und schildern Sie Ihre eigenen Erfahrungen.',
    isPremium: true
  }
];

export const INITIAL_SPRECHEN_TOPICS = {
  sprecher1AQuestions: [
    {
      id: 'sp1a-1',
      title: '1. Beruflicher Werdegang & Abschluss',
      promptText: 'Stellen Sie Ihren bisherigen beruflichen Werdegang, Ihre Ausbildung und Ihre Abschlüsse strukturiert vor.'
    },
    {
      id: 'sp1a-2',
      title: '2. Bisherige Berufserfahrung & Schwerpunkte',
      promptText: 'Berichten Sie über Ihre wichtigsten praktischen Berufserfahrungen und Ihre fachlichen Schwerpunkte.'
    },
    {
      id: 'sp1a-3',
      title: '3. Aktuelle Tätigkeit oder Weiterbildung',
      promptText: 'Beschreiben Sie Ihre derzeitige berufliche Rolle, Ihre Aufgaben im Betrieb oder Ihre laufende Sprach-/Fortbildungsmaßnahme.'
    },
    {
      id: 'sp1a-4',
      title: '4. Zukünftige berufliche Pläne in Deutschland',
      promptText: 'Erläutern Sie Ihre Karriereziele und in welchem Arbeitsfeld Sie in Deutschland zukünftig arbeiten möchten.'
    },
    {
      id: 'sp1a-5',
      title: '5. Hauptaufgaben im Berufsalltag',
      promptText: 'Welche konkreten Aufgaben führen Sie in Ihrem Berufsfeld am häufigsten durch und wie organisieren Sie Ihren Arbeitstag?'
    },
    {
      id: 'sp1a-6',
      title: '6. Zusammenarbeit mit Kollegen & Kunden',
      promptText: 'Wie gestalten Sie die Kommunikation und Teamarbeit mit Kolleginnen, Vorgesetzten und Kunden im Betrieb?'
    },
    {
      id: 'sp1a-7',
      title: '7. Besondere Kenntnisse (Sprachen, EDV & Systeme)',
      promptText: 'Welche Zusatzqualifikationen, Sprachkenntnisse, Zertifikate oder EDV-Kenntnisse bringen Sie für den Beruf mit?'
    },
    {
      id: 'sp1a-8',
      title: '8. Herausforderungen & persönliche Motivation',
      promptText: 'Was motiviert Sie in Ihrem Beruf besonders und wie gehen Sie mit herausfordernden Situationen am Arbeitsplatz um?'
    }
  ],
  sprecher2Topics: [
    {
      id: 'sp2-1',
      title: 'Einführung von Zeiterfassungs-Apps im Betrieb',
      promptText: 'Ihr Betrieb plant die Einführung einer mobilen App zur Zeiterfassung. Sie und Ihr Gesprächspartner sollen ein kurzes Statement dazu abgeben und Vor- und Nachteile abwägen. (Präsentationszeit: 3 Min.)'
    },
    {
      id: 'sp2-2',
      title: 'Nachhaltigkeit und Müllvermeidung in der Firma',
      promptText: 'In Ihrer Abteilung soll Plastikmüll reduziert werden. Äußern Sie Vorschläge zu wiederverwendbaren Behältern, papierlosem Büro und Energiesparmaßnahmen.'
    }
  ],
  sprecher3Situations: [
    {
      id: 'sp3-1',
      title: 'Organisation des Betriebsausflugs im Sommer',
      promptText: 'Sie und Ihre Kollegin / Ihr Kollege sollen den jährlichen Betriebsausflug für 30 Personen organisieren. Planen Sie gemeinsam: Termin, Zielort, Budget, Verpflegung und Programm bei schlechtem Wetter. (Diskussionszeit: 2 Min.)'
    },
    {
      id: 'sp3-2',
      title: 'Vorbereitung des Messestandes für die Fachmesse',
      promptText: 'Ihr Unternehmen nimmt nächsten Monat an einer Branchenmesse teil. Besprechen Sie mit Ihrem Partner die Aufgabenverteilung: Standaufbau, Infomaterialien, Dienstplan für Standbetreuung und Catering.'
    }
  ]
};

export const INITIAL_MODELLTESTS: Modelltest[] = [
  {
    id: 'mt-1',
    title: 'Modelltest 1: Basis Beruf B2',
    description: 'Vollständiger Standard-Modelltest mit allen Teilen für Training und Prüfungsmodus.',
    isPremium: false,
    variants: {
      lesen_1: [
        {
          id: 'l1-v1',
          title: 'Lesen Teil 1 - Stellenangebote & Betriebe',
          textBlock: `Suchen Sie für die folgenden Personen (1–5) die passende Anzeige (A–H).\n\n1. Hr. Becker sucht einen Ausbildungsplatz im Bereich Logistik und Lagerhaltung mit guten Übernahmechancen.\n2. Fr. Klein möchte berufsbegleitend eine Weiterbildung im Qualitätsmanagement im Gesundheitswesen absolvieren.\n3. Hr. Novak ist ausgebildeter Elektriker und sucht eine Vollzeitstelle im Schichtdienst mit attraktiver Zulage.\n4. Fr. Weber sucht eine Teilzeitstelle im Büromanagement (ca. 20 Std./Woche) nahe dem Stadtzentrum.\n5. Hr. Yilmaz interessiert sich für ein Praktikum im Vertrieb von erneuerbaren Energien.`,
          headingsBlock: `A. Elektro-Fachbetrieb Bauer: Stellenangebot für Industrieelektriker m/w/d im 3-Schicht-System, hervorragende Zuschläge.\nB. Logistik-Zentrum Nord: Ausbildungsplatz zur Fachkraft für Lagerlogistik ab September, hohe Übernahmequote.\nC. Büro-Service Schmidt: Kaufmännische Assistentin in Teilzeit (18–22 Std.), Zentrale Lage am Hbf.\nD. Medizinisches Schulungszentrum: Berufsbegleitendes Zertifikat QM im Krankenhaus und Pflegebereich.\nE. Green-Energy GmbH: Praktikumsplatz im Kundenvertrieb von Solar- und Windkraftanlagen für Einsteiger.\nF. IT-Consulting Müller: Junior Software-Entwickler in Vollzeit gesucht.\nG. Hotel Residenz: Auszubildende zum Hotelfachmann gesucht.\nH. Fahrschule Express: Ausbildung zum Berufskraftfahrer.`,
          correctAnswers: { "1": "B", "2": "D", "3": "A", "4": "C", "5": "E" }
        }
      ],
      lesen_2: [
        {
          id: 'l2-v1',
          title: 'Lesen Teil 2 - Betr. Arbeitsmedizin & Sicherheitsvorschriften',
          text1: `Abschnitt A: Betriebsärztliche Vorsorgeuntersuchungen\nGemäß ArbSchG ist der Arbeitgeber verpflichtet, allen Angestellten an Bildschirmarbeitsplätzen alle 3 Jahre eine kostenfreie betriebsärztliche Untersuchung der Augen anzubieten. Die Teilnahme ist freiwillig, wird jedoch vom Betriebsrat dringend empfohlen. Termine können im Intranet gebucht werden.`,
          q6Text: 'Die Teilnahme an der betriebsärztlichen Augenuntersuchung ist für Mitarbeiter an Bildschirmarbeitsplätzen verpflichtend.',
          q6Correct: 'falsch',
          q7: {
            questionText: 'Wer trägt die Kosten für die Vorsorgeuntersuchung der Augen?',
            options: ['Der Arbeitnehmer selbst', 'Der Arbeitgeber vollständig', 'Die gesetzliche Krankenkasse'],
            correctIndex: 1
          },
          text2: `Abschnitt B: Brandschutz und Evakuierungsübung\nAm Donnerstag, den 14. Oktober, findet um 10:30 Uhr eine unangemeldete Räumungsübung im Hauptgebäude statt. Alle Mitarbeiter müssen beim Erklingen des Alarmsignals unverzüglich das Gebäude über die ausgeschilderten Notausgänge verlassen und sich am Sammelpunkt Parkplatz Süd einfinden. Aufzüge dürfen keinesfalls benutzt werden.`,
          q8Text: 'Im Falle eines Feueralarms dürfen die Aufzüge zur schnellen Evakuierung genutzt werden.',
          q8Correct: 'falsch',
          q9: {
            questionText: 'Wie müssen sich Mitarbeiter im Alarmfall verhalten?',
            options: [
              'Mit dem Aufzug schnell ins Erdgeschoss fahren',
              'Am Arbeitsplatz auf weitere Anweisungen warten',
              'Über Notausgänge zum Sammelplatz Parkplatz Süd gehen'
            ],
            correctIndex: 2
          }
        }
      ],
      lesen_3: [
        {
          id: 'l3-v1',
          title: 'Lesen Teil 3 - Richtlinien für Dienstreisen',
          text1: `Text A: Flug- und Bahnreisen\nInlandsreisen unter 4 Stunden Fahrzeit sind bevorzugt mit der Deutschen Bahn (2. Klasse) zu absolvieren. Flüge innerhalb Deutschlands werden nur bei dringenden Terminen und vorheriger schriftlicher Genehmigung der Abteilungsleitung erstattet.`,
          text2: `Text B: Spesen und Verpflegungspauschalen\nBei Abwesenheit von mehr als 8 Stunden beträgt die tägliche Verpflegungspauschale 14 Euro. Bewirtungsbelege für Geschäftsessen mit Kunden müssen den Anlass sowie die Namen aller Teilnehmer enthalten.`,
          optionsAtoF: `A. Bahnreisen 2. Klasse sind für Kurzstrecken zu bevorzugen.\nB. Hotelübernachtungen bis 150€ bedürfen keiner Genehmigung.\nC. Verpflegungspauschale steht erst ab 8 Stunden Abwesenheit zu.\nD. Taxifahrten werden ohne Beleg immer bis 50€ erstattet.\nE. Inlandsflüge sind grundsätzlich ohne Erlaubnis gestattet.\nF. Geschäftsessen erfordern die Angabe von Teilnehmern und Anlass.`,
          correctAnswers: { "10": "A", "11": "C", "12": "F", "13": "X" }
        }
      ],
      lesen_4: [
        {
          id: 'l4-v1',
          title: 'Lesen Teil 4 - Protokoll Abteilungsbesprechung',
          protocolText: `Protokoll der Abteilungsbesprechung Marketing & Vertrieb vom 05.05.2026\nAnwesend: Hr. Weber (Leitung), Fr. Becker, Hr. Rossi.\n1. Rückblick Quartal 1: Der Umsatz im Bereich Digital Marketing stieg um 12% im Vergleich zum Vorjahr.\n2. Neue Software-Einführung: Ab Juni wird die Software CRM-Pro installiert. Schulungen finden in der letzten Mai-Woche statt.\n3. Urlaubsplanung Sommer: Urlaubsanträge für Juli/August sind bis spätestens 15. Mai beim Abteilungsleiter einzureichen.`,
          questions: [
            {
              id: 14,
              questionText: 'Wie entwickelte sich der Umsatz im 1. Quartal im Digital Marketing?',
              options: ['Er fiel um 12%', 'Er stieg um 12%', 'Er blieb unverändert'],
              correctIndex: 1
            },
            {
              id: 15,
              questionText: 'Wann beginnen die Schulungen für die neue Software CRM-Pro?',
              options: ['Anfang Juni', 'Ende Mai', 'Mitte Juli'],
              correctIndex: 1
            },
            {
              id: 16,
              questionText: 'Bis wann müssen Sommerurlaubsanträge eingereicht werden?',
              options: ['Bis 15. Mai', 'Bis Ende Juni', 'Bis 01. Juli'],
              correctIndex: 0
            },
            {
              id: 17,
              questionText: 'Wer leitete die Abteilungsbesprechung?',
              options: ['Fr. Becker', 'Hr. Rossi', 'Hr. Weber'],
              correctIndex: 2
            },
            {
              id: 18,
              questionText: 'Welches Thema wird im Protokoll bezüglich CRM-Pro behandelt?',
              options: ['Die Absage der Einführung', 'Die Schulung und Installation', 'Der Kauf eines Konkurrenzprodukts'],
              correctIndex: 1
            }
          ]
        }
      ],
      lesen_schreiben: [
        {
          id: 'ls-v1',
          title: 'Lesen und Schreiben - Reklamation Lieferverzögerung',
          emailsText: `E-Mail 1: Von: Kundenservice TechnicGmbH <service@technic.de>\nAn: Fr. Schneider <schneider@buero-design.de>\nBetreff: Lieferverzögerung Bestellt-Nr. 88492\nSehr geehrte Frau Schneider, leider verzögert sich die Lieferung der bestellten 10 Ergonomie-Bürostühle um voraussichtlich 3 Wochen aufgrund von Rohstoffengpässen beim Hersteller. Wir bitten um Ihr Verständnis.\n\nE-Mail 2: Von: Fr. Schneider\nSehr geehrte Damen und Herren, wir haben die Bürostühle für unsere Neueröffnung am 01. Juni fest eingeplant. Eine Verzögerung von 3 Wochen ist für uns inakzeptabel...`,
          questions: [
            {
              id: 19,
              questionText: 'Warum verzögert sich die Lieferung der Bürostühle?',
              options: ['Wegen Transportschaden', 'Wegen Rohstoffmangel beim Produzenten', 'Wegen falscher Adresse'],
              correctIndex: 1
            },
            {
              id: 20,
              questionText: 'Wie reagiert Frau Schneider auf die Ankündigung?',
              options: ['Sie akzeptiert die Verzögerung problemlos', 'Sie storniert die Bestellung sofort ohne Frist', 'Sie weist darauf hin, dass die Stühle für die Eröffnung am 01. Juni benötigt werden'],
              correctIndex: 2
            }
          ],
          beschwerdeTopicText: `Schreiben Sie eine förmliche Beschwerde (Frage 21) an die TechnicGmbH. Verlangen Sie eine Teillieferung von Leihstühlen bis zum 25. Mai oder drohen Sie mit dem Rücktritt vom Kaufvertrag und Geltendmachung von Schadensersatz.`
        }
      ],
      hoeren_1: [
        {
          id: 'h1-v1',
          title: 'Hören Teil 1 - Durchsagen & Kurznachrichten',
          scriptText1: `**Sprachnachricht 1 (Fragen 22–23):**\nHallo Frau Hoffmann, hier spricht Thomas vom Fuhrpark. Der Dienstwagen VW Passat steht frisch gereinigt auf Stellplatz 12. Die Schlüssel liegen beim Empfang.`,
          scriptText2: `**Sprachnachricht 2 (Fragen 24–25):**\nGuten Tag, hier ist die Personalabteilung. Wir erinnern alle Kolleginnen und Kollegen an die Abgabe der Stundenzettel für diesen Monat bis morgen 12 Uhr.`,
          scriptText3: `**Sprachnachricht 3 (Fragen 26–27):**\nHallo Herr Becker, hier ist die IT-Abteilung. Die Wartungsarbeiten am Server finden heute Abend ab 20 Uhr statt. Bitte speichern Sie alle Dokumente rechtzeitig.`,
          questions: [
            { id: 22, type: 'richtig_falsch', questionText: 'Der Dienstwagen steht auf Stellplatz 12 bereit.', correct: 'richtig' },
            { id: 23, type: 'choice', questionText: 'Wo befinden sich die Autoschlüssel?', options: ['Beim Fuhrparkleiter', 'Beim Empfang', 'Im Fahrzeug'], correct: 1 },
            { id: 24, type: 'richtig_falsch', questionText: 'Die Stundenzettel müssen erst nächste Woche abgegeben werden.', correct: 'falsch' },
            { id: 25, type: 'choice', questionText: 'Bis wie viel Uhr müssen die Stundenzettel vorliegen?', options: ['Bis 10 Uhr', 'Bis 12 Uhr morgen', 'Bis 17 Uhr heute'], correct: 1 },
            { id: 26, type: 'richtig_falsch', questionText: 'Die Wartungsarbeiten am Server finden erst nächste Woche statt.', correct: 'falsch' },
            { id: 27, type: 'choice', questionText: 'Ab wie viel Uhr beginnen die Wartungsarbeiten?', options: ['Ab 18 Uhr', 'Ab 20 Uhr heute Abend', 'Ab 22 Uhr'], correct: 1 }
          ]
        }
      ],
      hoeren_2: [
        {
          id: 'h2-v1',
          title: 'Hören Teil 2 - Dienstleistungsgespräche',
          scriptText: `Sie hören vier kurze Gespräche im Firmenalltag (28–31).\nGespräch 28: Kunde möchte einen Drucker mieten statt kaufen.\nGespräch 29: Kollege fragt nach IT-Support für Passwort-Reset.\nGespräch 30: Fr. Klein reserviert einen Konferenzraum mit Beamer.\nGespräch 31: Hr. Schulz bestellt Verpflegung für Workshop.`,
          optionsAtoF: `A. IT-Helpdesk Anforderung Passwort-Reset\nB. Buchung Konferenzraum mit Medientechnik\nC. Mietanfrage für Büro-Drucker\nD. Bestellung von Catering & Getränken\nE. Beschwerde über defekte Kaffeemaschine\nF. Urlaubsantrag Einreichung`,
          correctAnswers: { "28": "C", "29": "A", "30": "B", "31": "D" }
        }
      ],
      hoeren_3: [
        {
          id: 'h3-v1',
          title: 'Hören Teil 3 - Informationsgespräch im Betrieb',
          scriptText: `Sie hören ein Gespräch zwischen Frau Bauer (Projektleiterin) und Herrn Wagner (IT-Leiter) über den Wechsel auf Cloud-Speicher. Herr Wagner erklärt, dass die Datenverarbeitung auf europäischen Servern DSGVO-konform erfolgt. Die Umstellung erfolgt am Wochenende, um den Betriebsablauf nicht zu stören.`,
          questions: [
            { id: 32, questionText: 'Worüber sprechen Frau Bauer und Herr Wagner?', options: ['Kündigung eines Lieferanten', 'Umstellung auf Cloud-Speicher', 'Kauf neuer Firmenhandys'], correctIndex: 1 },
            { id: 33, questionText: 'Wo befinden sich die Server des neuen Anbieters?', options: ['In den USA', 'In Europa (DSGVO-konform)', 'In Asien'], correctIndex: 1 },
            { id: 34, questionText: 'Wann wird die technische Umstellung durchgeführt?', options: ['Am Wochenende', 'Montagfrüh während des Betriebs', 'Während des Sommerurlaubs'], correctIndex: 0 },
            { id: 35, questionText: 'Was ist das Hauptziel des Termins?', options: ['Mitarbeiter zu entlassen', 'Den Rechnerwechsel abzustimmen', 'Ausfallzeiten im Betrieb zu vermeiden'], correctIndex: 2 }
          ]
        }
      ],
      hoeren_4: [
        {
          id: 'h4-v1',
          title: 'Hören Teil 4 - Experteninterview Arbeitswelten',
          scriptText: `Im Radiointerview spricht Arbeitspsychologin Dr. Meier über "Resilienz im Berufsalltag". Sie erklärt, dass regelmäßige Mikropausen von 2–3 Minuten die Konzentration nachhaltig steigern. Zudem betont sie die Bedeutung von klarer Kommunikation in Führungsebenen.`,
          questions: [
            { id: 36, questionText: 'Welchen Beruf übt Dr. Meier aus?', options: ['Betriebswirtin', 'Arbeitspsychologin', 'Sicherheitsingenieurin'], correctIndex: 1 },
            { id: 37, questionText: 'Wie lange sollten Mikropausen Dr. Meier zufolge dauern?', options: ['2–3 Minuten', '15 Minuten', 'Eine Stunde'], correctIndex: 0 },
            { id: 38, questionText: 'Welcher Effekt wird durch Mikropausen erzielt?', options: ['Steigerung der Arbeitszeit', 'Nachhaltige Konzentrationssteigerung', 'Verringerung des Gehalts'], correctIndex: 1 },
            { id: 39, questionText: 'Was wird bezüglich der Führungsebene betont?', options: ['Klare Kommunikation', 'Mehr Überstunden', 'Weniger Meetings'], correctIndex: 0 },
            { id: 40, questionText: 'Welches Gesamtthema hat das Interview?', options: ['Finanzplanung', 'Resilienz im Berufsalltag', 'Gewerkschaftsarbeit'], correctIndex: 1 }
          ]
        }
      ],
      hoeren_schreiben: [
        {
          id: 'hs-v1',
          title: 'Hören und Schreiben - Telefonnotiz Kundenanruf',
          scriptText: `Guten Tag, hier ist Martin Steiner von der Transport-Logistik AG. Ich rufe an bezüglich unseres Angebots für die Palettenlieferung nach Hamburg. Wir müssen den Liefertermin vom 12. auf den 14. Mai verschieben. Bitte rufen Sie mich unter 0172-5559821 zurück.`,
          q41Correct: 'a',
          fields: [
            { label: 'Name des Anrufers', key: 'name' },
            { label: 'Telefonnummer für Rückruf', key: 'phone' },
            { label: 'Grund & Grundinformationen', key: 'info' },
            { label: 'Zu erledigen (Aktion)', key: 'todo' }
          ]
        }
      ],
      sprachbausteine_1: [
        {
          id: 'sb1-v1',
          title: 'Sprachbausteine Teil 1 - Anschreiben Bewerbung & Firmenpost',
          textWithGaps: `Sehr [46] Damen und Herren,\n\nhiermit bewerbe ich mich auf die von Ihnen [47] Stelle als kaufmännischer Sachbearbeiter im Innendienst. Durch meine mehrjährige Berufserfahrung [48] ich über fundierte Kenntnisse im ERP-System SAP sowie in der Kundenbetreuung.\n\nIch stehe Ihnen ab dem 01. Juli zur [49] und freue mich über die [50] zu einem persönlichen Vorstellungsgespräch.\n\nMit [51] Grüßen`,
          correctAnswers: {
            46: 'geehrte',
            47: 'ausgeschriebene',
            48: 'verfüge',
            49: 'Verfügung',
            50: 'Einladung',
            51: 'freundlichen'
          },
          extraDistractors: ['geehrter', 'gesuchte', 'besitze', 'Möglichkeit', 'herzlichen', 'Bewerbung']
        }
      ],
      sprachbausteine_2: [
        {
          id: 'sb2-v1',
          title: 'Sprachbausteine Teil 2 - Betriebsmitteilung Arbeitssicherheit',
          textWithGaps: `An alle Mitarbeiterinnen und Mitarbeiter,\n\naus gegebenem Anlass weisen wir [52] hin, dass das Tragen von Sicherheitsschuhen in den Lagerhallen [53] vorgeschrieben ist. Personen ohne entsprechende Schutzkleidung [54] den Bereich ab sofort nicht mehr betreten.\n\nWir bitten Sie, diese Regelung strikt zu [55], um Arbeitsunfälle zu [56]. Bei Fragen wenden Sie sich bitte an die Sicherheitsbeauftragten [57] Abteilungsleitung.`,
          questions: [
            { id: 52, questionText: 'Lücke 52', options: ['darauf', 'daran', 'darüber'], correctIndex: 0 },
            { id: 53, questionText: 'Lücke 53', options: ['zwingend', 'gelegentlich', 'freiwillig'], correctIndex: 0 },
            { id: 54, questionText: 'Lücke 54', options: ['dürfen', 'sollen', 'wollen'], correctIndex: 0 },
            { id: 55, questionText: 'Lücke 55', options: ['beachten', 'übergehen', 'vergessen'], correctIndex: 0 },
            { id: 56, questionText: 'Lücke 56', options: ['vermeiden', 'erhöhen', 'verursachen'], correctIndex: 0 },
            { id: 57, questionText: 'Lücke 57', options: ['oder', 'aber', 'denn'], correctIndex: 0 }
          ]
        }
      ]
    }
  },
  {
    id: 'mt-2',
    title: 'Modelltest 2: Examen Pro (Premium)',
    description: 'Exklusiver Premium-Modelltest mit vertieften Prüfungsaufgaben aus Echttests.',
    isPremium: true,
    variants: {
      lesen_1: [
        {
          id: 'l1-v2',
          title: 'Lesen Teil 1 (Premium) - IT & Maschinenbau Stellen',
          textBlock: `Suchen Sie für die Personen (1–5) die passende Anzeige (A–H).\n\n1. Fr. Franke sucht Ausbildungsplatz als Mechatronikerin.\n2. Hr. Schulz sucht Weiterbildung im Datenschutz DSGVO.\n3. Fr. Kaya möchte remote als Texterin in Teilzeit arbeiten.\n4. Hr. Lenz sucht Ingenieursstelle in der Automatisierungstechnik.\n5. Fr. Wagner sucht Praktikum im Personalwesen HR.`,
          headingsBlock: `A. TechAuto AG: Ingenieur Automatisierungstechnik Vollzeit.\nB. Akademia Data: Schulung Datenschutzbeauftragter DSGVO.\nC. Maschinenbau Schulze: Ausbildungsplatz Mechatroniker m/w/d.\nD. Content-Media: Remote Texter/in Teilzeit 20 Std.\nE. People-Services: Praktikum HR Recruiting & Personal.\nF. Catering GmbH: Servicekraft in Vollzeit.\nG. Logistik Pro: Lkw-Fahrer Fernverkehr.\nH. Buchhaltung 24: Bilanzbuchhalter gesucht.`,
          correctAnswers: { "1": "C", "2": "B", "3": "D", "4": "A", "5": "E" }
        }
      ],
      lesen_2: [],
      lesen_3: [],
      lesen_4: [],
      lesen_schreiben: [],
      hoeren_1: [],
      hoeren_2: [],
      hoeren_3: [],
      hoeren_4: [],
      hoeren_schreiben: [],
      sprachbausteine_1: [],
      sprachbausteine_2: []
    }
  }
];
