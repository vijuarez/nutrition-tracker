import { randomUUID } from "crypto"
import bcrypt from "bcrypt"
import { Session } from "./db/schema"

export function uuid() {
    return randomUUID().slice(0, 8)
}

export function unixNow(): number {
    return Date.now()
}

export function hashPassword(password: string): string {
    const hash = bcrypt.hashSync(password, 10)
    return hash
}

export function checkPasswordHash(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash)
}

export function sessionIsValid(session: Session): boolean {
    return session.expires_on > unixNow()
}

export function shuffleCards<T extends { sort: number }>(cards: T[]): void {
    for (let i = cards.length - 1; i >= 0; i--) {
        // Swap this sort value with the sort value of another random card
        const randomIndex = Math.floor(Math.random() * i)
        const anotherRandomCard = cards[randomIndex]
        cards[i].sort = anotherRandomCard.sort
    }
}

export function shuffleArray<T>(array: T[]) {
    var m = array.length, t, i;

    // While there remain elements to shuffle...
    while (m) {

        // Pick a remaining element...
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

export function logZodError(error: any) {
    console.error("❌ Zod Validation Error:", JSON.stringify(error.format(), null, 2))
}

