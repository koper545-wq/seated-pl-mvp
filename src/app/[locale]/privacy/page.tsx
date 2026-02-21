import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć na stronę główną
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-stone-900 mb-2">
          Polityka Prywatności
        </h1>
        <p className="text-stone-500 mb-8">
          Ostatnia aktualizacja: 1 lutego 2025
        </p>

        <div className="prose prose-stone max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              1. Administrator danych
            </h2>
            <p className="text-stone-600 mb-4">
              Administratorem Twoich danych osobowych jest Seated Sp. z o.o. z
              siedzibą we Wrocławiu, ul. Przykładowa 1, 50-001 Wrocław (dalej:
              &quot;Administrator&quot; lub &quot;my&quot;).
            </p>
            <p className="text-stone-600">
              Kontakt z Administratorem:{" "}
              <a
                href="mailto:privacy@seated.pl"
                className="text-amber-600 hover:underline"
              >
                privacy@seated.pl
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              2. Jakie dane zbieramy
            </h2>
            <p className="text-stone-600 mb-4">Zbieramy następujące dane:</p>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>
                <strong>Dane konta:</strong> imię, nazwisko, adres e-mail, numer
                telefonu, zdjęcie profilowe
              </li>
              <li>
                <strong>Dane płatnicze:</strong> dane karty płatniczej (przechowywane
                przez operatora płatności)
              </li>
              <li>
                <strong>Dane rezerwacji:</strong> historia rezerwacji, preferencje
                żywieniowe, alergie
              </li>
              <li>
                <strong>Dane techniczne:</strong> adres IP, typ przeglądarki, system
                operacyjny, dane o urządzeniu
              </li>
              <li>
                <strong>Dane lokalizacyjne:</strong> przybliżona lokalizacja (za Twoją
                zgodą)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              3. Cele przetwarzania
            </h2>
            <p className="text-stone-600 mb-4">Twoje dane przetwarzamy w celu:</p>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>Realizacji usług - rezerwacji i organizacji wydarzeń</li>
              <li>Obsługi płatności i księgowości</li>
              <li>Komunikacji dotyczącej rezerwacji i wydarzeń</li>
              <li>Wysyłki newslettera (za Twoją zgodą)</li>
              <li>Personalizacji treści i rekomendacji</li>
              <li>Zapewnienia bezpieczeństwa serwisu</li>
              <li>Analizy statystycznej i ulepszania usług</li>
              <li>Dochodzenia roszczeń i obrony przed roszczeniami</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              4. Podstawy prawne przetwarzania
            </h2>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>
                <strong>Wykonanie umowy</strong> (art. 6 ust. 1 lit. b RODO) - dla
                realizacji usług
              </li>
              <li>
                <strong>Zgoda</strong> (art. 6 ust. 1 lit. a RODO) - dla marketingu i
                newslettera
              </li>
              <li>
                <strong>Prawnie uzasadniony interes</strong> (art. 6 ust. 1 lit. f
                RODO) - dla analityki i bezpieczeństwa
              </li>
              <li>
                <strong>Obowiązek prawny</strong> (art. 6 ust. 1 lit. c RODO) - dla
                celów podatkowych
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              5. Udostępnianie danych
            </h2>
            <p className="text-stone-600 mb-4">
              Twoje dane mogą być udostępniane:
            </p>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>
                <strong>Hostom</strong> - w zakresie niezbędnym do realizacji
                rezerwacji (imię, numer telefonu, preferencje żywieniowe)
              </li>
              <li>
                <strong>Operatorom płatności</strong> - do przetwarzania transakcji
              </li>
              <li>
                <strong>Dostawcom usług IT</strong> - hosting, analityka, e-mail
              </li>
              <li>
                <strong>Organom państwowym</strong> - gdy wymagają tego przepisy
                prawa
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              6. Okres przechowywania
            </h2>
            <p className="text-stone-600 mb-4">Dane przechowujemy przez:</p>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>
                <strong>Dane konta:</strong> do czasu usunięcia konta + 30 dni
              </li>
              <li>
                <strong>Dane rezerwacji:</strong> 5 lat od zakończenia roku
                podatkowego (wymóg prawny)
              </li>
              <li>
                <strong>Dane marketingowe:</strong> do wycofania zgody
              </li>
              <li>
                <strong>Dane analityczne:</strong> 26 miesięcy
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              7. Twoje prawa
            </h2>
            <p className="text-stone-600 mb-4">Przysługują Ci następujące prawa:</p>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>
                <strong>Prawo dostępu</strong> - możesz uzyskać kopię swoich danych
              </li>
              <li>
                <strong>Prawo do sprostowania</strong> - możesz poprawić nieprawidłowe
                dane
              </li>
              <li>
                <strong>Prawo do usunięcia</strong> - możesz żądać usunięcia danych
                (&quot;prawo do bycia zapomnianym&quot;)
              </li>
              <li>
                <strong>Prawo do ograniczenia</strong> - możesz ograniczyć
                przetwarzanie
              </li>
              <li>
                <strong>Prawo do przenoszenia</strong> - możesz otrzymać dane w
                formacie do przeniesienia
              </li>
              <li>
                <strong>Prawo do sprzeciwu</strong> - możesz sprzeciwić się
                przetwarzaniu w celach marketingowych
              </li>
              <li>
                <strong>Prawo do wycofania zgody</strong> - w każdej chwili, bez
                wpływu na legalność wcześniejszego przetwarzania
              </li>
            </ul>
            <p className="text-stone-600 mt-4">
              Aby skorzystać z praw, skontaktuj się z nami:{" "}
              <a
                href="mailto:privacy@seated.pl"
                className="text-amber-600 hover:underline"
              >
                privacy@seated.pl
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              8. Pliki cookies
            </h2>
            <p className="text-stone-600 mb-4">Używamy następujących cookies:</p>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>
                <strong>Niezbędne:</strong> do działania serwisu (sesja, autoryzacja)
              </li>
              <li>
                <strong>Funkcjonalne:</strong> do zapamiętywania preferencji
              </li>
              <li>
                <strong>Analityczne:</strong> do analizy ruchu (Google Analytics)
              </li>
              <li>
                <strong>Marketingowe:</strong> do personalizacji reklam (za zgodą)
              </li>
            </ul>
            <p className="text-stone-600 mt-4">
              Możesz zarządzać cookies w ustawieniach przeglądarki.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              9. Bezpieczeństwo
            </h2>
            <p className="text-stone-600 mb-4">
              Stosujemy odpowiednie środki techniczne i organizacyjne, w tym:
            </p>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>Szyfrowanie danych (SSL/TLS)</li>
              <li>Regularne kopie zapasowe</li>
              <li>Kontrolę dostępu do danych</li>
              <li>Szkolenia pracowników</li>
              <li>Monitorowanie bezpieczeństwa</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              10. Transfer danych
            </h2>
            <p className="text-stone-600">
              Niektóre usługi mogą przekazywać dane poza EOG (np. Google). W takim
              przypadku stosujemy standardowe klauzule umowne zatwierdzone przez
              Komisję Europejską lub inne odpowiednie zabezpieczenia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              11. Skargi
            </h2>
            <p className="text-stone-600">
              Jeśli uważasz, że przetwarzanie Twoich danych narusza przepisy RODO,
              masz prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych
              (ul. Stawki 2, 00-193 Warszawa).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              12. Zmiany polityki
            </h2>
            <p className="text-stone-600">
              Możemy aktualizować tę politykę. O istotnych zmianach poinformujemy
              Cię e-mailem lub poprzez powiadomienie w serwisie.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-stone-500">
            Zapoznaj się również z naszym{" "}
            <Link href="/terms" className="text-amber-600 hover:underline">
              Regulaminem
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
