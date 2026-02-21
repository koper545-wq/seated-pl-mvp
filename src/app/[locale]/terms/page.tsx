import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          Regulamin serwisu Seated
        </h1>
        <p className="text-stone-500 mb-8">
          Ostatnia aktualizacja: 1 lutego 2025
        </p>

        <div className="prose prose-stone max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              1. Postanowienia ogólne
            </h2>
            <p className="text-stone-600 mb-4">
              Niniejszy regulamin określa zasady korzystania z serwisu Seated
              (dalej: &quot;Serwis&quot;), którego właścicielem jest Seated Sp. z o.o. z
              siedzibą we Wrocławiu, ul. Przykładowa 1, 50-001 Wrocław.
            </p>
            <p className="text-stone-600 mb-4">
              Serwis umożliwia organizację i uczestnictwo w wydarzeniach
              kulinarnych, warsztatach i innych doświadczeniach gastronomicznych.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              2. Definicje
            </h2>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>
                <strong>Użytkownik</strong> - osoba fizyczna, która ukończyła 18
                lat i posiada pełną zdolność do czynności prawnych.
              </li>
              <li>
                <strong>Gość</strong> - Użytkownik uczestniczący w wydarzeniach.
              </li>
              <li>
                <strong>Host</strong> - Użytkownik organizujący wydarzenia
                kulinarne.
              </li>
              <li>
                <strong>Wydarzenie</strong> - doświadczenie kulinarne organizowane
                przez Hosta.
              </li>
              <li>
                <strong>Rezerwacja</strong> - zamówienie miejsca na Wydarzeniu.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              3. Rejestracja i konto
            </h2>
            <p className="text-stone-600 mb-4">
              Korzystanie z Serwisu wymaga utworzenia konta. Użytkownik zobowiązuje
              się do podania prawdziwych danych osobowych i ich aktualizacji w
              razie zmian.
            </p>
            <p className="text-stone-600 mb-4">
              Użytkownik odpowiada za bezpieczeństwo swojego hasła i nie powinien
              udostępniać danych logowania osobom trzecim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              4. Rezerwacje i płatności
            </h2>
            <p className="text-stone-600 mb-4">
              Rezerwacja jest wiążąca po dokonaniu płatności. Płatności są
              przetwarzane przez zewnętrznego operatora płatności.
            </p>
            <p className="text-stone-600 mb-4">
              Ceny wydarzeń są podane w złotych polskich (PLN) i zawierają
              wszystkie podatki. Serwis pobiera prowizję od każdej transakcji.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              5. Anulowanie i zwroty
            </h2>
            <p className="text-stone-600 mb-4">
              Gość może anulować rezerwację i otrzymać pełny zwrot do 48 godzin
              przed wydarzeniem. Po tym terminie zwrot nie przysługuje.
            </p>
            <p className="text-stone-600 mb-4">
              W przypadku odwołania wydarzenia przez Hosta, Gość otrzymuje pełny
              zwrot wpłaconej kwoty.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              6. Obowiązki Hosta
            </h2>
            <p className="text-stone-600 mb-4">Host zobowiązuje się do:</p>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>
                Organizacji wydarzeń zgodnie z opisem i w bezpiecznych warunkach
              </li>
              <li>
                Posiadania wymaganych zezwoleń i certyfikatów sanitarnych (jeśli
                dotyczy)
              </li>
              <li>Informowania o alergenach obecnych w serwowanych potrawach</li>
              <li>Przestrzegania przepisów prawa, w tym przepisów BHP i HACCP</li>
              <li>Ubezpieczenia swojej działalności (zalecane)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              7. Obowiązki Gościa
            </h2>
            <p className="text-stone-600 mb-4">Gość zobowiązuje się do:</p>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>Punktualnego przybycia na wydarzenie</li>
              <li>Poinformowania Hosta o alergiach pokarmowych</li>
              <li>Szanowania mienia Hosta i innych uczestników</li>
              <li>Kulturalnego zachowania podczas wydarzenia</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              8. Odpowiedzialność
            </h2>
            <p className="text-stone-600 mb-4">
              Serwis pełni rolę platformy łączącej Hostów z Gośćmi. Serwis nie jest
              stroną umowy między Hostem a Gościem i nie ponosi odpowiedzialności
              za przebieg wydarzeń.
            </p>
            <p className="text-stone-600 mb-4">
              Użytkownicy korzystają z Serwisu na własne ryzyko. Serwis nie
              odpowiada za szkody wynikające z uczestnictwa w wydarzeniach.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              9. Własność intelektualna
            </h2>
            <p className="text-stone-600 mb-4">
              Wszystkie treści w Serwisie, w tym logo, grafiki i teksty, są
              chronione prawem autorskim. Kopiowanie i rozpowszechnianie bez zgody
              jest zabronione.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              10. Zmiany regulaminu
            </h2>
            <p className="text-stone-600 mb-4">
              Serwis zastrzega sobie prawo do zmiany regulaminu. O zmianach
              Użytkownicy będą informowani drogą e-mailową z 14-dniowym
              wyprzedzeniem.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              11. Kontakt
            </h2>
            <p className="text-stone-600">
              W przypadku pytań dotyczących regulaminu prosimy o kontakt:
            </p>
            <p className="text-stone-600 mt-2">
              E-mail:{" "}
              <a
                href="mailto:kontakt@seated.pl"
                className="text-amber-600 hover:underline"
              >
                kontakt@seated.pl
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-stone-500">
            Zapoznaj się również z naszą{" "}
            <Link href="/privacy" className="text-amber-600 hover:underline">
              Polityką Prywatności
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
