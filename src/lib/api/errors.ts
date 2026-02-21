import { NextResponse } from "next/server";

export function notFound(message = "Nie znaleziono") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequest(message = "Nieprawidłowe dane") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function forbidden(message = "Brak dostępu") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function unauthorized(message = "Musisz być zalogowany") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function serverError(message = "Wystąpił błąd serwera") {
  return NextResponse.json({ error: message }, { status: 500 });
}
