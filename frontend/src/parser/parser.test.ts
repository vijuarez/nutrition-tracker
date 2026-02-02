import { expect, test } from "vitest"
import { tokenizeLine } from "./tokenizer"
import { parseLine } from "./line-parser"


test("test", () => {
    const examples = [
        "30 dark chocolate 300c",
        "30 chocolate 400",
        "120 banana",
        "50c nuts",
    ]

    for (const text of examples) {
        const tokens = tokenizeLine(text)
        console.log(text, "-->", tokens)
    }

    // expect().toBe(1)
})

test("separator", () => {
    const res = parseLine("---")
    expect(res.isSeparator).toBe(true)
    expect(res.foodName).toBe(null)
})

test("separator with whitespace", () => {
    const res1 = parseLine("  ---  ")
    expect(res1.isSeparator).toBe(true)
    expect(res1.foodName).toBe(null)
    
    const res2 = parseLine("--- ")
    expect(res2.isSeparator).toBe(true)
    
    const res3 = parseLine(" ---")
    expect(res3.isSeparator).toBe(true)
})

test("not a separator", () => {
    // These should NOT be treated as separators
    const res1 = parseLine("---foo")
    expect(res1.isSeparator).toBeFalsy()
    
    const res2 = parseLine("foo---")
    expect(res2.isSeparator).toBeFalsy()
    
    const res3 = parseLine("- - -")
    expect(res3.isSeparator).toBeFalsy()
})

/*
30 dark chocolate 300c

find amount -> 30
chocolate 300c

find name -> "dark chocolate"

*/