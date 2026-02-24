# Brief dla prawnika — Platforma Seated.pl

## Cel dokumentu

Niniejszy brief opisuje platformę Seated.pl w sposób pozwalający prawnikowi zrozumieć model biznesowy, role uczestników, przepływy finansowe oraz zidentyfikować obszary wymagające uregulowania prawnego (regulaminy, umowy, polityki).

---

## 1. Czym jest Seated.pl?

Seated.pl to **dwustronna platforma marketplace** łącząca:
- **Hostów** (organizatorów wydarzeń kulinarnych) z
- **Gośćmi** (uczestnikami wydarzeń)

Platforma umożliwia organizację i rezerwację **prywatnych wydarzeń kulinarnych** — kolacji w prywatnych domach (supper clubs), warsztatów gotowania, degustacji win, pop-upów gastronomicznych, doświadczeń farmowych itp.

**Operator:** Seated Sp. z o.o., Wrocław (w trakcie zakładania)
**Rynek docelowy:** Wrocław (start), potem cała Polska
**Język platformy:** polski

---

## 2. Role użytkowników

### 2.1 Gość (Guest)
- Osoba fizyczna, min. 18 lat
- Przegląda wydarzenia, rezerwuje miejsca, płaci online
- Po wydarzeniu wystawia recenzję hostowi
- Może anulować rezerwację (zasady poniżej)

### 2.2 Host (organizator)
Dwa podtypy:
- **Host indywidualny** — osoba prywatna organizująca wydarzenia we własnym domu/lokalu
- **Host restauracyjny** — restauracja/firma gastronomiczna organizująca specjalne wydarzenia

Host przechodzi **proces weryfikacji** przed dopuszczeniem na platformę:
1. Wypełnia formularz zgłoszeniowy (dane osobowe/firmowe, adres, doświadczenie kulinarne, specjalizacje kuchni, zdjęcia)
2. Platforma weryfikuje zgłoszenie w ciągu 48h
3. Rozmowa weryfikacyjna
4. Zatwierdzenie przez admina → host może tworzyć wydarzenia

**Dane zbierane od hosta:**
- Imię, nazwisko (lub nazwa firmy), email, telefon
- Adres (ulica, miasto, kod pocztowy, dzielnica)
- NIP (opcjonalnie)
- Specjalizacje kuchni, typy wydarzeń, opis/bio
- Zdjęcia profilowe i kulinarne
- Dane bankowe do wypłat (numer konta)
- Dostępność terminowa

### 2.3 Administrator
- Zarządza platformą, weryfikuje hostów, moderuje treści
- Zatwierdza/odrzuca aplikacje hostów i nowe wydarzenia
- Zarządza użytkownikami (zawieszenie, ban)

---

## 3. Typy wydarzeń

Platforma obsługuje 8 kategorii:
1. **Supper Club** — prywatne kolacje/obiady
2. **Chef's Table** — ekskluzywne doświadczenia kulinarne
3. **Pop-up** — tymczasowe wydarzenia gastronomiczne
4. **Warsztaty gotowania** — edukacyjne warsztaty kulinarne
5. **Degustacje** — degustacje win, piwa, whisky itp.
6. **Active Food** — jedzenie + aktywność (np. gotowanie + joga)
7. **Farm Experience** — doświadczenia farm-to-table
8. **Kolaboracja z restauracją** — współpraca z restauracjami

---

## 4. Model biznesowy i przepływ finansowy

### 4.1 Prowizja platformy
- **15% od każdej transakcji** (stała stawka)
- Host ustala cenę wydarzenia
- Gość płaci pełną cenę
- Platforma pobiera 15% prowizji, host otrzymuje 85%

### 4.2 Przykład przepływu finansowego
```
Cena wydarzenia:        200 PLN
Gość płaci:             200 PLN
Prowizja Seated (15%):   30 PLN
Host otrzymuje (85%):   170 PLN
```

### 4.3 Przepływ płatności
1. Gość rezerwuje wydarzenie
2. Host zatwierdza rezerwację (tryb manualny) lub automatyczne zatwierdzenie (tryb instant)
3. Po zatwierdzeniu gość otrzymuje email z **linkiem do płatności** (deadline: 24h)
4. Gość płaci kartą przez **Stripe** (zewnętrzny procesor płatności)
5. Płatność potwierdzona → rezerwacja aktywna
6. Po zakończeniu wydarzenia → wypłata na konto hosta w ciągu **3 dni roboczych**

### 4.4 Typy transakcji
- **CHARGE** — pobranie płatności od gościa
- **REFUND** — zwrot pieniędzy
- **PAYOUT** — wypłata dla hosta

---

## 5. Proces rezerwacji

### 5.1 Dwa tryby rezerwacji
- **Instant** — automatyczne zatwierdzenie, natychmiastowa rezerwacja
- **Manual** — host ma 48h na zatwierdzenie/odrzucenie rezerwacji

### 5.2 Statusy rezerwacji
```
PENDING → APPROVED → COMPLETED
                  ↘ CANCELLED
         → DECLINED
         → CANCELLED
         → NO_SHOW (gość nie przyszedł)
```

### 5.3 Polityka anulowania
- **Gość anuluje 48h+ przed wydarzeniem** → pełny zwrot
- **Gość anuluje poniżej 48h** → brak zwrotu
- **Host anuluje** → automatyczny pełny zwrot dla gościa
- **No-show gościa** → brak zwrotu (host zachowuje płatność)

### 5.4 Lista oczekujących (Waitlist)
- Gdy wszystkie miejsca zajęte, gość może dołączyć do listy oczekujących
- Gdy miejsce się zwolni → powiadomienie email z **12h oknem na rezerwację**
- Po upływie 12h → miejsce przechodzi do kolejnej osoby

---

## 6. System recenzji

- Gość może wystawić recenzję hostowi po zakończeniu wydarzenia
- Host może wystawić recenzję gościowi
- Ocena: 1-5 gwiazdek + kategorie (jedzenie, komunikacja, wartość, atmosfera)
- Host może odpowiedzieć na recenzję
- Możliwość zgłoszenia nieprawidłowej recenzji do moderacji

---

## 7. Dane osobowe i GDPR

### 7.1 Dane zbierane
- **Dane konta:** imię, nazwisko, email, telefon, data urodzenia
- **Dane hosta:** + adres, NIP, dane bankowe, zdjęcia
- **Dane rezerwacji:** historia rezerwacji, preferencje dietetyczne, alergie
- **Dane techniczne:** IP, cookies, dane urządzenia

### 7.2 Udostępnianie danych
- **Gość → Host:** imię, telefon, alergie/diety (niezbędne do realizacji wydarzenia)
- **Host → Gość:** nazwa firmy, opis, lokalizacja publiczna (dzielnica)
- **Pełny adres wydarzenia** → ujawniany gościowi dopiero po zatwierdzeniu rezerwacji
- **Procesor płatności (Stripe):** dane transakcyjne

### 7.3 Istniejąca dokumentacja GDPR
- Polityka prywatności (po polsku, na stronie)
- Wskazanie administratora danych: Seated Sp. z o.o.
- Kategorie danych, cele przetwarzania, okresy retencji
- Prawa użytkowników (dostęp, sprostowanie, usunięcie, przenoszenie)
- UODO jako organ nadzorczy

---

## 8. Istniejąca dokumentacja prawna (na stronie)

### Regulamin (Terms)
- Data: 1 lutego 2025
- Zawiera: definicje, zasady rezerwacji, płatności, obowiązki hostów i gości
- Platforma pozycjonuje się jako **pośrednik/marketplace** — nie jest stroną umowy między hostem a gościem
- Wymóg 18+ lat
- Obowiązek hosta: zgodność z BHP/HACCP, ujawnianie alergenów, zalecenie ubezpieczenia
- 14 dni na zmiany regulaminu

### Polityka prywatności
- Zgodna z RODO
- Retencja: dane konta 30 dni po usunięciu, rezerwacje 5 lat podatkowych
- Kontakt: privacy@seated.pl

---

## 9. Komunikacja emailowa (transakcyjna)

Platforma wysyła 15 typów emaili, w tym:
- Potwierdzenie rezerwacji, zatwierdzenie/odrzucenie, przypomnienia
- Potwierdzenie płatności z rozbiciem na prowizję (15%) i zarobek hosta (85%)
- Powiadomienia o liście oczekujących (12h okno)
- Status aplikacji hosta (otrzymanie, zatwierdzenie)
- System zgłoszeń i moderacji

**Kluczowe terminy w emailach:**
- 48h na decyzję hosta (zatwierdzenie rezerwacji)
- 24h na płatność gościa
- 12h okno z listy oczekujących
- 3 dni robocze na wypłatę dla hosta

---

## 10. Problemy prawne do rozwiązania

### 🔴 PILNE (przed startem)

#### 10.1 Umowa z hostem (Host Agreement)
Brak formalnej umowy regulującej relację platforma-host. Potrzebna umowa obejmująca:
- Warunki współpracy i prowizję (15%)
- Obowiązki hosta (bezpieczeństwo żywności, ubezpieczenie, licencje)
- Warunki weryfikacji i zatwierdzania
- Zasady wypłat (3 dni robocze, dane bankowe)
- Zasady zawieszenia/usunięcia konta hosta
- Odpowiedzialność za szkody (kto odpowiada za zatrucia pokarmowe?)
- Klauzula poufności danych gości
- Zobowiązanie hosta do przestrzegania prawa (działalność nierejestrowana vs firma vs restauracja)

#### 10.2 Status prawny hosta
Kluczowe pytanie: **Czy host indywidualny prowadzi działalność gospodarczą?**
- Próg działalności nierejestrowanej: do 75% minimalnego wynagrodzenia/miesiąc (w 2025: ~3226 PLN)
- Czy platforma musi weryfikować, czy host nie przekracza tego progu?
- Jakie obowiązki podatkowe ma host? (PIT? VAT?)
- Czy platforma jest zobowiązana do raportowania dochodów hostów? (DAC7?)

#### 10.3 Bezpieczeństwo żywności (HACCP/Sanepid)
- Prywatne osoby gotujące w domu — czy wymaga to zgłoszenia do Sanepidu?
- Czy platforma ponosi odpowiedzialność pośrednią za bezpieczeństwo żywności?
- Wymagania sanitarne dla różnych typów wydarzeń
- Kwestia ubezpieczenia OC hosta — obowiązkowe czy zalecane?

#### 10.4 Regulamin — uzupełnienia
- Mechanizm rozstrzygania sporów (mediacja/arbitraż)
- Limit odpowiedzialności platformy (kwota w PLN/EUR)
- Procedura reklamacyjna
- Prawo odstąpienia od umowy zawartej na odległość (ustawa o prawach konsumenta)
- Force majeure (odwołanie wydarzenia z przyczyn niezależnych)

### 🟡 WAŻNE (do dopracowania)

#### 10.5 Ochrona konsumenta
- Czy gość ma 14-dniowe prawo odstąpienia od umowy? (usługi turystyczne/gastronomiczne — wyjątek w art. 38 pkt 12 ustawy o prawach konsumenta?)
- Obowiązki informacyjne wobec konsumenta przed zawarciem umowy
- Formularz odstąpienia od umowy

#### 10.6 KYC / AML
- Weryfikacja tożsamości hostów przed wypłatami
- Przeciwdziałanie praniu pieniędzy — obowiązki platformy
- Czy Stripe obsługuje KYC za nas, czy musimy sami?

#### 10.7 DAC7 — obowiązek raportowania
- Od 2024 r. platformy cyfrowe muszą raportować dane sprzedawców (hostów) do urzędów skarbowych
- Dotyczy platform łączących sprzedawców z kupującymi
- Wymaga: NIP/PESEL hosta, dane adresowe, przychody

#### 10.8 Ubezpieczenie platformy
- OC platformy jako pośrednika
- Ubezpieczenie cyber (wyciek danych)
- Ubezpieczenie od odpowiedzialności za produkt (żywność)

### 🟢 DO ROZWAŻENIA (przyszłość)

#### 10.9 Umowa powierzenia przetwarzania danych (DPA)
- Z procesorami danych: Stripe, Supabase (hosting DB), Vercel (hosting), Resend (emailing)
- Wymagana przez RODO Art. 28

#### 10.10 Regulamin dla hostów restauracyjnych
- Oddzielne warunki dla B2B (restauracja) vs B2C (osoba prywatna)?
- Faktury VAT za prowizję platformy

#### 10.11 System zgłoszeń / moderacji
- Procedura obsługi zgłoszeń i skarg
- Polityka antydyskryminacyjna
- Ochrona przed nękaniem/niewłaściwym zachowaniem

#### 10.12 Własność intelektualna
- Licencja na treści zamieszczane przez hostów (zdjęcia, opisy)
- Ochrona marki Seated.pl
- Polityka DMCA / Notice & Takedown

---

## 11. Dokumenty do przygotowania

### Lista umów i dokumentów potrzebnych przed startem:

| # | Dokument | Priorytet | Opis |
|---|----------|-----------|------|
| 1 | **Regulamin platformy** (aktualizacja) | 🔴 | Uzupełnić o procedurę reklamacji, rozstrzyganie sporów, limit odpowiedzialności |
| 2 | **Umowa z hostem indywidualnym** | 🔴 | Warunki współpracy, prowizja, odpowiedzialność, bezpieczeństwo żywności |
| 3 | **Umowa z hostem restauracyjnym** | 🔴 | Warunki B2B, fakturowanie prowizji, VAT |
| 4 | **Polityka prywatności** (aktualizacja) | 🟡 | Doprecyzować DPA, breach notification |
| 5 | **Formularz odstąpienia od umowy** | 🟡 | Jeśli wymagany przez prawo konsumenckie |
| 6 | **Polityka bezpieczeństwa żywności** | 🟡 | Wymogi dla hostów, disclaimer platformy |
| 7 | **Umowy DPA** (powierzenie danych) | 🟡 | Ze Stripe, Supabase, Vercel, Resend |
| 8 | **Procedura KYC hostów** | 🟡 | Weryfikacja tożsamości przed wypłatami |
| 9 | **Polityka DAC7** | 🟡 | Raportowanie dochodów hostów do US |
| 10 | **Polityka moderacji treści** | 🟢 | Zasady recenzji, zgłoszeń, dyskryminacji |

---

## 12. Pytania do prawnika

1. **Czy osoba prywatna gotująca w domu na supper clubie musi mieć pozwolenie Sanepidu?** Jakie regulacje sanitarne dotyczą takich wydarzeń?

2. **Czy platforma ponosi odpowiedzialność za zatrucia pokarmowe** u gości wydarzeń organizowanych przez hostów?

3. **Czy gość-konsument ma prawo do 14-dniowego odstąpienia od umowy** na wydarzenie kulinarne? (wyjątek: usługi związane z wydarzeniami kulturalnymi/rozrywkowymi, art. 38 pkt 12)

4. **Jaki status prawny powinien mieć host indywidualny?** Działalność nierejestrowana? Czy platforma musi weryfikować przekroczenie progu?

5. **Czy prowizja 15% wymaga wystawiania faktury** przez platformę hostowi? Kwestie VAT.

6. **Czy podlegamy obowiązkowi DAC7?** Jeśli tak — od jakiego momentu i jakie dane musimy zbierać?

7. **Czy potrzebujemy licencji KNF/KIP** jako pośrednik w płatnościach? (Stripe jest procesorem, ale my pośredniczymy)

8. **Ubezpieczenie OC** — czy platforma powinna wymagać od hostów posiadania polisy OC? Czy platforma sama potrzebuje takiej polisy?

---

## 13. Stack technologiczny (dla kontekstu)

- Aplikacja webowa (Next.js / React)
- Baza danych: PostgreSQL na Supabase (serwery EU — Frankfurt)
- Płatności: Stripe (planowane)
- Hosting: Vercel (serwery USA, planowane przeniesienie na serwery polskie home.pl)
- Email: Resend (transakcyjny)
- Przechowywanie zdjęć: Supabase Storage (EU)

**Uwaga dot. GDPR:** Vercel (hosting) ma serwery w USA — potencjalny problem z transferem danych do USA. Planujemy migrację na serwery polskie (home.pl).

---

## Kontakt

**Platforma:** Seated.pl
**Email:** kontakt@seated.pl
**Email (prywatność):** privacy@seated.pl
**Lokalizacja:** Wrocław, Polska
