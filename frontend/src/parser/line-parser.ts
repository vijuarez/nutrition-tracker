import { tokenizeLine } from "./tokenizer"

export type ParsedLine = {
    raw: string
    foodName: string | null
    grams: number | null
    override_cal: number | null
    override_cal_100g: number | null
    isSeparator?: boolean
}

/*
Extract info from line:
- amount (if any)
- food name
- calories/100g override (if any)
- calories override (if any)
*/
export function parseLine(text: string): ParsedLine {

    if (text.trim() === "---") {
        return {
            raw: text,
            foodName: null,
            grams: null,
            override_cal: null,
            override_cal_100g: null,
            isSeparator: true,
        }
    }

    let tokens = tokenizeLine(text)
    const foodNameToken = tokens.find(token => token.type === "text")
    const foodName = foodNameToken?.raw_text || null
    // const [foodNameToken, otherTokens] = getFoodName(tokens)
    const numberTokens = tokens.filter(token => token.type === "number")

    // console.log("numberTokens:", numberTokens)

    if (numberTokens.length === 1) {
        const num = numberTokens[0]
        if (num.unit === null)
            return {
                foodName,
                override_cal: null,
                grams: num.value,
                override_cal_100g: null,
                raw: text,
                isSeparator: false,
            }
        if (num.unit === "g")
            return {
                foodName,
                grams: null,
                override_cal: null,
                override_cal_100g: null,
                raw: text,
                isSeparator: false,
            }

        if (num.unit === "c")
            return {
                foodName,
                grams: null,
                override_cal: num.value,
                override_cal_100g: null,
                raw: text,
                isSeparator: false,
            }
    }


    if (numberTokens.length >= 2) {
        /*
        (option 1)
        unitless + unitless -> amount, cal_100g
        unitless + calories -> amount, cal_100g
        amount + unitless   -> amount, cal_100g
        amount + calories   -> amount, cal_100g
        (option 2)
        calories + unitless -> cal_100g, amount
        calories + amount   -> cal_100g, amount
        */

        const [A, B] = numberTokens

        const amountIsLast = A.unit === "c"

        if (amountIsLast) {
            return {
                foodName,
                grams: B.value,
                override_cal: null,
                override_cal_100g: A.value,
                raw: text,
                isSeparator: false,
            }
        }
        else {
            return {
                foodName,
                grams: A.value,
                override_cal: null,
                override_cal_100g: B.value,
                raw: text,
                isSeparator: false,
            }
        }
    }

    // if (numberTokens.length === 0) {
    return {
        raw: text,
        foodName: foodNameToken?.raw_text || null,
        grams: null,
        override_cal: null,
        override_cal_100g: null,
        isSeparator: false,
    }
}

