import { PrismaClient, UserType, EventType, EventStatus, BookingMode, BookingStatus, TransactionType, TransactionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.event.deleteMany();
  await prisma.hostFollow.deleteMany();
  await prisma.hostProfile.deleteMany();
  await prisma.guestProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  // ============================================
  // USERS
  // ============================================

  // User 1: Guest only
  const guest1 = await prisma.user.create({
    data: {
      email: "guest@seated.pl",
      passwordHash,
      userType: UserType.GUEST,
      emailVerified: new Date(),
      ageVerified: true,
      language: "pl",
      guestProfile: {
        create: {
          firstName: "Jan",
          lastName: "Kowalski",
          bio: "Foodie z Wrocławia, uwielbiam kuchnię włoską i japońską.",
          dietaryRestrictions: ["vegetarian-friendly"],
          allergies: ["orzechy"],
          xp: 150,
        },
      },
    },
  });

  // User 2: Host (individual)
  const host1 = await prisma.user.create({
    data: {
      email: "host@seated.pl",
      passwordHash,
      userType: UserType.HOST,
      emailVerified: new Date(),
      ageVerified: true,
      language: "pl",
      hostProfile: {
        create: {
          businessName: "Anna Kowalska",
          description: "Pasjonatka kuchni włoskiej z 15-letnim doświadczeniem. Uwielbiam dzielić się moimi przepisami rodzinnymi z Toskanii.",
          phoneNumber: "+48 600 100 200",
          city: "Wrocław",
          neighborhood: "Stare Miasto",
          cuisineSpecialties: ["Kuchnia włoska", "Pasta", "Desery"],
          verified: true,
          responseRate: 98,
          responseTime: 1,
          onboardingPaid: true,
        },
      },
    },
  });

  // User 3: Host+Guest (can switch modes)
  const hostGuest = await prisma.user.create({
    data: {
      email: "both@seated.pl",
      passwordHash,
      userType: UserType.HOST,
      emailVerified: new Date(),
      ageVerified: true,
      language: "pl",
      guestProfile: {
        create: {
          firstName: "Karolina",
          lastName: "Wiśniewska",
          bio: "Mistrzyni sushi, ale też uwielbiam chodzić na kolacje u innych hostów!",
          dietaryRestrictions: [],
          allergies: [],
          xp: 320,
        },
      },
      hostProfile: {
        create: {
          businessName: "Sushi by Karolina",
          description: "Mistrzyni sushi z wieloletnim doświadczeniem w restauracjach japońskich. Każdy kurs to podróż do Japonii.",
          phoneNumber: "+48 600 300 400",
          city: "Wrocław",
          neighborhood: "Nadodrze",
          cuisineSpecialties: ["Kuchnia japońska", "Sushi", "Ramen"],
          verified: true,
          responseRate: 95,
          responseTime: 2,
          onboardingPaid: true,
        },
      },
    },
  });

  // User 4: Another guest
  const guest2 = await prisma.user.create({
    data: {
      email: "maria@example.com",
      passwordHash,
      userType: UserType.GUEST,
      emailVerified: new Date(),
      ageVerified: true,
      language: "pl",
      guestProfile: {
        create: {
          firstName: "Maria",
          lastName: "Nowak",
          bio: "Pasjonatka kulinarnych przygód i degustacji win.",
          dietaryRestrictions: ["gluten-free"],
          allergies: [],
          xp: 80,
        },
      },
    },
  });

  // Fetch profiles for relations
  const host1Profile = await prisma.hostProfile.findUnique({ where: { userId: host1.id } });
  const hostGuestProfile = await prisma.hostProfile.findUnique({ where: { userId: hostGuest.id } });

  if (!host1Profile || !hostGuestProfile) throw new Error("Host profiles not found");

  // ============================================
  // EVENTS
  // ============================================

  // Event 1: Published, upcoming (host1)
  const event1 = await prisma.event.create({
    data: {
      hostId: host1Profile.id,
      title: "Wieczór z pastą domową",
      slug: "wieczor-z-pasta-domowa",
      description: "Dołącz do mnie na wieczór pełen włoskich smaków! Wspólnie przygotujemy świeżą pastę od podstaw, a potem zasiądziemy do wspólnej kolacji z winem.",
      eventType: EventType.SUPPER_CLUB,
      cuisineTags: ["Kuchnia włoska", "Pasta", "Wino"],
      images: ["/images/events/pasta-1.jpg", "/images/events/pasta-2.jpg"],
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
      startTime: "19:00",
      duration: 180,
      locationPublic: "Stare Miasto, Wrocław",
      locationFull: "ul. Świdnicka 15/3, 50-066 Wrocław",
      price: 15000, // 150 PLN in grosze
      capacity: 8,
      spotsLeft: 4,
      menuDescription: "**Antipasti:** Bruschetta z pomidorami i bazylią\n**Primo:** Tagliatelle z sosem bolognese (opcja wegetariańska: z grzybami leśnymi)\n**Secondo:** Saltimbocca alla Romana\n**Dolce:** Panna cotta z malinami",
      dietaryOptions: ["vegetarian", "gluten-free-possible"],
      byob: true,
      ageRequired: true,
      dressCode: "Smart casual",
      whatToBring: "Fartuch (mamy zapasowe, ale lepiej mieć swój!)",
      bookingMode: BookingMode.MANUAL,
      cancellationPolicy: "Bezpłatna rezygnacja do 48h przed eventem. Po tym terminie zwrot 50%.",
      status: EventStatus.PUBLISHED,
      featured: true,
      viewCount: 245,
    },
  });

  // Event 2: Published, upcoming (host1)
  const event2 = await prisma.event.create({
    data: {
      hostId: host1Profile.id,
      title: "Pizza napoletańska — warsztaty",
      slug: "pizza-napoletanska-warsztaty",
      description: "Naucz się robić prawdziwą pizzę napoletańską! Ciasto na 72h fermentacji, sos z San Marzano i mozzarella fior di latte.",
      eventType: EventType.COOKING_CLASS,
      cuisineTags: ["Kuchnia włoska", "Pizza"],
      images: ["/images/events/pizza-1.jpg"],
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
      startTime: "17:00",
      duration: 240,
      locationPublic: "Stare Miasto, Wrocław",
      locationFull: "ul. Świdnicka 15/3, 50-066 Wrocław",
      price: 18000, // 180 PLN
      capacity: 6,
      spotsLeft: 6,
      menuDescription: "Każdy uczestnik przygotuje 2 pizze do zjedzenia na miejscu + 1 na wynos.\n\nSmaki: Margherita, Diavola, Quattro Formaggi, Prosciutto e Rucola.",
      dietaryOptions: ["vegetarian"],
      byob: false,
      ageRequired: false,
      bookingMode: BookingMode.MANUAL,
      status: EventStatus.PUBLISHED,
      viewCount: 128,
    },
  });

  // Event 3: Published, upcoming (hostGuest - Karolina)
  const event3 = await prisma.event.create({
    data: {
      hostId: hostGuestProfile.id,
      title: "Sushi masterclass — od podstaw do perfekcji",
      slug: "sushi-masterclass",
      description: "Pełny kurs sushi — od przygotowania ryżu po zaawansowane techniki. Nauczysz się robić nigiri, maki i uramaki jak prawdziwy itamae.",
      eventType: EventType.COOKING_CLASS,
      cuisineTags: ["Kuchnia japońska", "Sushi"],
      images: ["/images/events/sushi-1.jpg", "/images/events/sushi-2.jpg"],
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // +10 days
      startTime: "18:00",
      duration: 210,
      locationPublic: "Nadodrze, Wrocław",
      locationFull: "ul. Łąkowa 8/2, 50-345 Wrocław",
      price: 22000, // 220 PLN
      capacity: 6,
      spotsLeft: 3,
      menuDescription: "**Przygotujemy wspólnie:**\n- Nigiri z łososiem i tuńczykiem\n- Maki z awokado i ogórkiem\n- Uramaki California Roll\n- Temaki z krewetką\n\nWszystko ze świeżych składników + zupa miso na start.",
      dietaryOptions: ["pescatarian"],
      byob: true,
      ageRequired: false,
      bookingMode: BookingMode.MANUAL,
      cancellationPolicy: "Pełny zwrot do 72h przed wydarzeniem.",
      status: EventStatus.PUBLISHED,
      featured: true,
      viewCount: 189,
    },
  });

  // Event 4: Completed (host1)
  const event4 = await prisma.event.create({
    data: {
      hostId: host1Profile.id,
      title: "Tiramisu i inne włoskie desery",
      slug: "tiramisu-wloskie-desery",
      description: "Wieczór poświęcony włoskim deserom — tiramisu, panna cotta, cannoli i affogato.",
      eventType: EventType.COOKING_CLASS,
      cuisineTags: ["Kuchnia włoska", "Desery"],
      images: ["/images/events/tiramisu-1.jpg"],
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // -14 days (past)
      startTime: "18:00",
      duration: 150,
      locationPublic: "Stare Miasto, Wrocław",
      locationFull: "ul. Świdnicka 15/3, 50-066 Wrocław",
      price: 12000, // 120 PLN
      capacity: 8,
      spotsLeft: 0,
      menuDescription: "Tiramisu klasyczne, Panna cotta z owocami, Cannoli siciliani, Affogato al caffè",
      dietaryOptions: ["vegetarian"],
      byob: false,
      ageRequired: false,
      bookingMode: BookingMode.MANUAL,
      status: EventStatus.COMPLETED,
      viewCount: 312,
    },
  });

  // Event 5: Draft (host1)
  const event5 = await prisma.event.create({
    data: {
      hostId: host1Profile.id,
      title: "Kolacja degustacyjna — jesienne smaki Toskanii",
      slug: "kolacja-degustacyjna-jesien-toskanii",
      description: "5-daniowa kolacja inspirowana jesiennymi smakami Toskanii. Truffle, porcini, dziczyzna i chianti.",
      eventType: EventType.CHEFS_TABLE,
      cuisineTags: ["Kuchnia włoska", "Fine dining"],
      images: [],
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      startTime: "19:30",
      duration: 240,
      locationPublic: "Stare Miasto, Wrocław",
      locationFull: "ul. Świdnicka 15/3, 50-066 Wrocław",
      price: 35000, // 350 PLN
      capacity: 6,
      spotsLeft: 6,
      menuDescription: "Menu w przygotowaniu...",
      dietaryOptions: [],
      byob: false,
      ageRequired: true,
      bookingMode: BookingMode.MANUAL,
      status: EventStatus.DRAFT,
      viewCount: 0,
    },
  });

  // Event 6: Cancelled (hostGuest)
  const event6 = await prisma.event.create({
    data: {
      hostId: hostGuestProfile.id,
      title: "Ramen od zera",
      slug: "ramen-od-zera",
      description: "Całodniowe warsztaty ramen — bulion gotujemy od rana!",
      eventType: EventType.COOKING_CLASS,
      cuisineTags: ["Kuchnia japońska", "Ramen"],
      images: [],
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      startTime: "10:00",
      duration: 480,
      locationPublic: "Nadodrze, Wrocław",
      locationFull: "ul. Łąkowa 8/2, 50-345 Wrocław",
      price: 28000, // 280 PLN
      capacity: 4,
      spotsLeft: 4,
      menuDescription: "Tonkotsu ramen z chashu, ajitsuke tamago i mayu",
      dietaryOptions: [],
      byob: false,
      ageRequired: false,
      bookingMode: BookingMode.MANUAL,
      status: EventStatus.CANCELLED,
      viewCount: 45,
    },
  });

  // ============================================
  // BOOKINGS
  // ============================================

  // Booking 1: guest1 → event1 (APPROVED, paid)
  const booking1 = await prisma.booking.create({
    data: {
      eventId: event1.id,
      guestId: guest1.id,
      ticketCount: 2,
      totalPrice: 30000, // 300 PLN (2 x 150)
      platformFee: 4500, // 15% = 45 PLN
      status: BookingStatus.APPROVED,
      dietaryInfo: "Jedna osoba wegetarianka",
      specialRequests: "Czy jest możliwość bezglutenowej pasty?",
      approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Booking 2: guest2 → event1 (PENDING)
  const booking2 = await prisma.booking.create({
    data: {
      eventId: event1.id,
      guestId: guest2.id,
      ticketCount: 1,
      totalPrice: 15000,
      platformFee: 2250,
      status: BookingStatus.PENDING,
    },
  });

  // Booking 3: hostGuest → event1 (APPROVED) — host attending another host's event
  const booking3 = await prisma.booking.create({
    data: {
      eventId: event1.id,
      guestId: hostGuest.id,
      ticketCount: 1,
      totalPrice: 15000,
      platformFee: 2250,
      status: BookingStatus.APPROVED,
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Booking 4: guest1 → event3 (PENDING)
  const booking4 = await prisma.booking.create({
    data: {
      eventId: event3.id,
      guestId: guest1.id,
      ticketCount: 1,
      totalPrice: 22000,
      platformFee: 3300,
      status: BookingStatus.PENDING,
      dietaryInfo: "Bez orzechów proszę",
      specialRequests: "Czy mogę przyjść 10 minut wcześniej?",
    },
  });

  // Booking 5: guest2 → event3 (APPROVED)
  const booking5 = await prisma.booking.create({
    data: {
      eventId: event3.id,
      guestId: guest2.id,
      ticketCount: 2,
      totalPrice: 44000,
      platformFee: 6600,
      status: BookingStatus.APPROVED,
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Booking 6: guest1 → event4 (COMPLETED — past event)
  const booking6 = await prisma.booking.create({
    data: {
      eventId: event4.id,
      guestId: guest1.id,
      ticketCount: 1,
      totalPrice: 12000,
      platformFee: 1800,
      status: BookingStatus.COMPLETED,
      approvedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  });

  // Booking 7: guest2 → event4 (COMPLETED)
  const booking7 = await prisma.booking.create({
    data: {
      eventId: event4.id,
      guestId: guest2.id,
      ticketCount: 2,
      totalPrice: 24000,
      platformFee: 3600,
      status: BookingStatus.COMPLETED,
      approvedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  });

  // Booking 8: guest1 → event6 (CANCELLED — event was cancelled)
  const booking8 = await prisma.booking.create({
    data: {
      eventId: event6.id,
      guestId: guest1.id,
      ticketCount: 1,
      totalPrice: 28000,
      platformFee: 4200,
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      cancelReason: "Event anulowany przez hosta",
    },
  });

  // Booking 9: guest2 → event2 (PENDING)
  const booking9 = await prisma.booking.create({
    data: {
      eventId: event2.id,
      guestId: guest2.id,
      ticketCount: 1,
      totalPrice: 18000,
      platformFee: 2700,
      status: BookingStatus.PENDING,
    },
  });

  // Booking 10: hostGuest → event4 (COMPLETED)
  const booking10 = await prisma.booking.create({
    data: {
      eventId: event4.id,
      guestId: hostGuest.id,
      ticketCount: 1,
      totalPrice: 12000,
      platformFee: 1800,
      status: BookingStatus.COMPLETED,
      approvedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  });

  // ============================================
  // TRANSACTIONS (for completed/approved bookings)
  // ============================================

  // Payment for booking1
  await prisma.transaction.create({
    data: {
      bookingId: booking1.id,
      type: TransactionType.CHARGE,
      amount: 30000,
      status: TransactionStatus.COMPLETED,
      stripePaymentId: "mock_pi_001",
      processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Payment for booking3
  await prisma.transaction.create({
    data: {
      bookingId: booking3.id,
      type: TransactionType.CHARGE,
      amount: 15000,
      status: TransactionStatus.COMPLETED,
      stripePaymentId: "mock_pi_002",
      processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Payments for completed event4 bookings
  await prisma.transaction.create({
    data: {
      bookingId: booking6.id,
      type: TransactionType.CHARGE,
      amount: 12000,
      status: TransactionStatus.COMPLETED,
      stripePaymentId: "mock_pi_003",
      processedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.transaction.create({
    data: {
      bookingId: booking7.id,
      type: TransactionType.CHARGE,
      amount: 24000,
      status: TransactionStatus.COMPLETED,
      stripePaymentId: "mock_pi_004",
      processedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.transaction.create({
    data: {
      bookingId: booking10.id,
      type: TransactionType.CHARGE,
      amount: 12000,
      status: TransactionStatus.COMPLETED,
      stripePaymentId: "mock_pi_005",
      processedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  });

  // Payment for booking5 (approved sushi class)
  await prisma.transaction.create({
    data: {
      bookingId: booking5.id,
      type: TransactionType.CHARGE,
      amount: 44000,
      status: TransactionStatus.COMPLETED,
      stripePaymentId: "mock_pi_006",
      processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // ============================================
  // REVIEWS (for completed event4)
  // ============================================

  await prisma.review.create({
    data: {
      eventId: event4.id,
      authorId: guest1.id,
      subjectId: host1.id,
      overallRating: 5,
      foodRating: 5,
      communicationRating: 5,
      valueRating: 4,
      ambianceRating: 5,
      text: "Fantastyczny wieczór! Tiramisu było najlepsze jakie jadłem w życiu. Anna jest niesamowitą hostką — ciepła atmosfera, świetne jedzenie i dużo praktycznych wskazówek. Na pewno wrócę!",
      verifiedAttendee: true,
      helpfulCount: 3,
    },
  });

  await prisma.review.create({
    data: {
      eventId: event4.id,
      authorId: guest2.id,
      subjectId: host1.id,
      overallRating: 5,
      foodRating: 5,
      communicationRating: 4,
      valueRating: 5,
      ambianceRating: 5,
      text: "Cudowne doświadczenie! Każdy deser był wyśmienity, a Anna tłumaczyła wszystko krok po kroku. Polecam każdemu miłośnikowi włoskich deserów.",
      verifiedAttendee: true,
      helpfulCount: 1,
    },
  });

  await prisma.review.create({
    data: {
      eventId: event4.id,
      authorId: hostGuest.id,
      subjectId: host1.id,
      overallRating: 4,
      foodRating: 5,
      communicationRating: 4,
      valueRating: 4,
      ambianceRating: 4,
      text: "Jako sama hostka doceniam profesjonalizm Anny. Świetna organizacja i przepyszne desery. Jedyne co bym zmieniła to więcej czasu na część praktyczną.",
      verifiedAttendee: true,
    },
  });

  // ============================================
  // CONVERSATIONS & MESSAGES
  // ============================================

  const conv1 = await prisma.conversation.create({
    data: {
      hostId: host1.id,
      guestId: guest1.id,
      bookingId: booking1.id,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: guest1.id,
      text: "Cześć! Chciałem zapytać czy jest możliwość bezglutenowej wersji pasty? Moja partnerka ma celiakię.",
      isRead: true,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: host1.id,
      text: "Cześć Jan! Oczywiście, mogę przygotować pastę z mąki ryżowej — smakuje prawie identycznie. Bez problemu!",
      isRead: true,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: guest1.id,
      text: "Super, dziękuję! Do zobaczenia w sobotę 😊",
      isRead: false,
    },
  });

  console.log("✅ Seed completed!");
  console.log(`
📊 Created:
  - 4 users (1 guest, 1 host, 1 both, 1 guest)
  - 2 host profiles
  - 3 guest profiles
  - 6 events (3 published, 1 completed, 1 draft, 1 cancelled)
  - 10 bookings (various statuses)
  - 6 transactions
  - 3 reviews
  - 1 conversation with 3 messages

🔑 Login credentials:
  - Guest: guest@seated.pl / password123
  - Host: host@seated.pl / password123
  - Both: both@seated.pl / password123
  - Guest 2: maria@example.com / password123
`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
