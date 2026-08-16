import React, { useState, useEffect } from 'react';
import { X, Shield, FileText, Cookie, Landmark, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { AppLogo } from '../AppLogo';

export type LegalTab = 'agb' | 'datenschutz' | 'cookies' | 'impressum';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const openLegalModal = (tab: LegalTab = 'agb') => {
  window.dispatchEvent(new CustomEvent('open-legal-modal', { detail: { tab } }));
};

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab = 'agb' }) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const handleOpen = (e: CustomEvent<{ tab?: LegalTab }>) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };
    window.addEventListener('open-legal-modal' as any, handleOpen as any);
    return () => {
      window.removeEventListener('open-legal-modal' as any, handleOpen as any);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <AppLogo size={36} />
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Rechtliche Hinweise & Datenschutz
              </h2>
              <p className="text-[11px] text-slate-500">Beruf B2+ Prüfungstrainer (DTB)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('agb')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'agb'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>AGB & Widerrufsverzicht</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('datenschutz')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'datenschutz'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Datenschutzerklärung (DSGVO)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cookies')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cookies'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cookie className="w-4 h-4" />
            <span>Cookie-Richtlinie</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('impressum')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'impressum'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Impressum</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
          
          {/* TAB 1: AGB & WIDERRUFSBELEHRUNG */}
          {activeTab === 'agb' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                <div className="font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Wichtiger Hinweis zu digitalen Inhalten & Ausschluss von Rückerstattungen</span>
                </div>
                <p className="text-xs text-indigo-800 dark:text-indigo-200">
                  Mit dem Erwerb eines Zugangs oder der Einlösung eines Gutscheincodes stimmen Sie ausdrücklich zu, dass die Bereitstellung der digitalen Inhalte sofort beginnt. Sie bestätigen hiermit Ihre Kenntnis darüber, dass Ihr gesetzliches Widerrufsrecht gemäß § 356 Abs. 5 BGB mit Beginn der Ausführung vollständig erlischt. Es besteht kein Anspruch auf Rückerstattung oder finanzielle Entschädigung.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">§ 1 Geltungsbereich & Vertragsgegenstand</h3>
                <p>
                  1. Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Webanwendung <strong>Beruf B2+ Trainer</strong>.
                </p>
                <p>
                  2. Die Anwendung dient ausschließlich als eigenständige Lern- und Vorbereitungsplattform für den <strong>Deutsch-Test für den Beruf B2 (DTB)</strong>. Sie umfasst 12 interaktive Prüfungsmodule, Prüfungssimulationen mit Timer, Wortschatztraining nach dem Spaced-Repetition-System (SRS), Audiomaterialien und Musterlösungen.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">§ 2 Bereitstellung digitaler Inhalte & Ausschluss des Widerrufsrechts</h3>
                <p>
                  1. <strong>Gesetzlicher Ausschluss nach § 356 Abs. 5 BGB:</strong> Bei Verträgen über die Bereitstellung digitaler Inhalte (wie Prüfungsfragen, Audios, Lösungen und Wortschatz-Datenbanken), die nicht auf einem körperlichen Datenträger geliefert werden, erlischt das 14-tägige Widerrufsrecht vorzeitig, wenn:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  <li>der Nutzer ausdrücklich zugestimmt hat, dass der Anbieter mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnt, und</li>
                  <li>der Nutzer seine Kenntnis darüber bestätigt hat, dass er durch seine Zustimmung mit Beginn der Ausführung des Vertrags sein Widerrufsrecht verliert.</li>
                </ul>
                <p>
                  2. <strong>Keine Rückerstattung / No Refund Policy:</strong> Nach Freischaltung des Zugangs (sei es durch Online-Zahlung oder Gutscheineinlösung) ist eine Rückzahlung, Teilrückerstattung oder Kompensation ausgeschlossen.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">§ 3 Haftungsausschluss & Keine Erfolgsgarantie</h3>
                <p>
                  1. <strong>Beruf B2+ Trainer</strong> ist eine private, unabhängige Bildungsplattform und steht in keiner vertraglichen oder offiziellen Verbindung zu Prüfungsinstitutionen oder Ministerien.
                </p>
                <p>
                  2. Für das tatsächliche Bestehen oder Nichtbestehen einer amtlichen B2-Beruf-Prüfung sowie für Noten und Prüfungsergebnisse wird ausdrücklich <strong>keine Garantie oder Haftung</strong> übernommen.
                </p>
                <p>
                  3. Wir bemühen uns um eine ständige Erreichbarkeit und Fehlerfreiheit der Inhalte. Eine 100%ige unterbrechungsfreie Verfügbarkeit kann jedoch technisch nicht garantiert werden (z. B. bei Wartungsarbeiten oder Störungen bei Cloud-Dienstleistern).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">§ 4 Urheberrecht & Verbot der Weitergabe</h3>
                <p>
                  1. Alle in der App bereitgestellten Übungstexte, Fragen, Audio-Dateien, Algorithmen und Musterlösungen sind urheberrechtlich geschützt.
                </p>
                <p>
                  2. Die Nutzung ist ausschließlich für den persönlichen, nicht-kommerziellen Gebrauch des registrierten Nutzers gestattet. Das Herunterladen von Audioinhalten, automatisiertes Auslesen (Scraping), die Weitergabe der Zugangsdaten an Dritte oder der Weiterverkauf sind strengstens untersagt und führen zur sofortigen Sperrung des Benutzerkontos ohne Entschädigung.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">§ 5 Schlussbestimmungen</h3>
                <p>
                  Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: DATENSCHUTZERKLÄRUNG (DSGVO) */}
          {activeTab === 'datenschutz' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <div className="font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>DSGVO-konforme Datenverarbeitung & Datensparsamkeit</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">
                  Wir erheben nur diejenigen Daten, die für die Bereitstellung des Lerndienstes, der Authentifizierung und der Synchronisation Ihres Lernstands zwingend erforderlich sind. Es findet kein Verkauf von Daten und kein Tracking durch Drittwerber statt.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">1. Verantwortliche Stelle</h3>
                <p>
                  Verantwortlich für die Datenverarbeitung auf dieser Plattform ist der Betreiber von <strong>Beruf B2+ Trainer</strong>. Bei datenschutzrechtlichen Fragen oder zur Ausübung Ihrer Betroffenenrechte können Sie uns jederzeit über die im Impressum angegebenen Kontaktdaten erreichen.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">2. Welche Daten werden erhoben und wofür?</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  <li><strong>Registrierungs- und Kontodaten:</strong> E-Mail-Adresse, Name (Pseudonym möglich), verschlüsseltes Passwort-Hash (über Supabase Auth).</li>
                  <li><strong>Lernfortschritt & Prüfungsergebnisse:</strong> Testergebnisse, absolvierte Modelltests, Spaced-Repetition-Wortschatzkarten, gespeicherte Notizen (zur Synchronisation zwischen Ihren Geräten).</li>
                  <li><strong>Technische Protokolldaten:</strong> IP-Adresse, Browser-Typ, Zeitpunkt des Zugriffs (ausschließlich zur Gewährleistung der IT-Sicherheit und Fehlerbehebung).</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">3. Rechtsgrundlagen der Verarbeitung</h3>
                <p>
                  Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage von:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Zur Erfüllung des Nutzungsvertrags (Bereitstellung des Prüfungstrainers und Speicherung Ihres Lernfortschritts).</li>
                  <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Unser berechtigtes Interesse an der Gewährleistung der Systemsicherheit, Verhinderung von Missbrauch und Optimierung der Plattform.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">4. Hosting & Auftragsverarbeitung (Supabase)</h3>
                <p>
                  Unsere Datenbank- und Authentifizierungsdienste werden über <strong>Supabase Inc.</strong> bereitgestellt. Die Datenübertragung erfolgt ausschließlich verschlüsselt nach aktuellem Stand der Technik (TLS/SSL). Supabase verarbeitet Daten gemäß den Bestimmungen der DSGVO auf gesicherten Servern.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">5. Ihre Rechte als betroffene Person</h3>
                <p>
                  Sie haben nach der DSGVO jederzeit das Recht auf:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  <li><strong>Auskunft (Art. 15 DSGVO):</strong> Über Ihre bei uns gespeicherten personenbezogenen Daten.</li>
                  <li><strong>Berichtigung (Art. 16 DSGVO):</strong> Unrichtiger oder unvollständiger Daten.</li>
                  <li><strong>Löschung (Art. 17 DSGVO):</strong> Vollständige Löschung Ihres Benutzerkontos und aller Lernstände.</li>
                  <li><strong>Einschränkung der Verarbeitung & Datenübertragbarkeit (Art. 18, 20 DSGVO).</strong></li>
                </ul>
              </section>
            </div>
          )}

          {/* TAB 3: COOKIE-RICHTLINIE */}
          {activeTab === 'cookies' && (
            <div className="space-y-6 animate-fadeIn">
              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Verwendung von Cookies & Lokaler Speicher (LocalStorage)</h3>
                <p>
                  Diese Webanwendung verwendet sogenannte <strong>Cookies</strong> sowie den modernen Webstandard <strong>LocalStorage / IndexedDB</strong>, um Ihnen eine komfortable und offline-fähige Nutzung zu ermöglichen.
                </p>
              </section>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>1. Technisch essenzielle Speicherungen (Notwendig)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      Immer aktiv
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Diese Einträge sind für den Betrieb der Anwendung zwingend erforderlich:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <li><strong>Auth-Session:</strong> Hält Sie auf Ihrem Gerät eingeloggt.</li>
                    <li><strong>Theme-Einstellung:</strong> Speichert Ihre Wahl zwischen Hellem und Dunklem Modus (<code>light</code> / <code>dark</code>).</li>
                    <li><strong>Offline-PWA Cache:</strong> Ermöglicht das Lernen im Flugzeug oder ohne Internetverbindung.</li>
                    <li><strong>Lernstand & Testergebnisse:</strong> Lokale Zwischenspeicherung Ihrer Antworten.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>2. Marketing- und Werbe-Cookies</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Nicht verwendet
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Wir setzen <strong>keine</strong> Werbe-Tracker (wie Google Ads, Meta/Facebook Pixel oder Affiliate-Netzwerke) ein. Ihr Lernverhalten wird nicht zu Werbezwecken analysiert.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMPRESSUM */}
          {activeTab === 'impressum' && (
            <div className="space-y-6 animate-fadeIn">
              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</h3>
                <p>
                  <strong>Beruf B2+ Trainer</strong><br />
                  Interaktive Plattform zur Prüfungsvorbereitung (DTB)
                </p>
                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <p><strong>Kontakt & Support:</strong></p>
                  <p>E-Mail: <span className="font-mono text-indigo-600 dark:text-indigo-400">support@beruf-b2-trainer.de</span></p>
                  <p>Webseite: <span className="font-mono">https://beruf-b2-trainer.de</span></p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">EU-Streitschlichtung</h3>
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                  <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    https://ec.europa.eu/consumers/odr <ExternalLink className="w-3 h-3" />
                  </a>.
                </p>
                <p className="text-xs text-slate-500">
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </section>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Stand: August 2026 • Gültig für alle registrierten Nutzer
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow transition-all active:scale-95 cursor-pointer ml-auto"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
