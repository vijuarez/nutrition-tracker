import s from './Textareas.module.scss'

import { type ParsedLineWithMacros } from '../types'


type Props = {
    loading: boolean
    textareaValue: string
    onChange: (value: string) => void
    parsedLines: ParsedLineWithMacros[]
    showMacros: boolean
}

export default function Textareas({ loading, onChange, textareaValue, parsedLines, showMacros }: Props) {

    // const lines = textareaValue.split("\n")

    const padBottom = textareaValue && !textareaValue.endsWith("\n") && textareaValue !== ""

    return (
        <div className={s.Textareas}>

            <aside>
                {
                    parsedLines.map((line, i) => (
                        <div data-hidden={line.grams === 0 || line.isSeparator} key={i}>
                            {(line.currentFood || line.override_cal) ? Math.round(line.macros.calories) : "?"}
                        </div>
                    ))
                }
            </aside>

            <div className={s.textareas_container}>

                <textarea
                    data-visible={false}
                    value={loading ? "Loading..." : textareaValue}
                    readOnly={loading}
                    disabled={loading}
                    onChange={(e) => onChange(e.target.value)}
                    rows={8}
                    cols={30}
                />

                <div className={s.shadow_textarea}>
                    {
                        parsedLines.map((line, i) => {

                            if (line.isSeparator) {
                                return (
                                    <div key={i} className={s.separator_line}>
                                        <hr />
                                    </div>
                                )
                            }

                            // Show food name, "?", or nothing
                            const perfectMatch = line.currentFood?.name === line.foodName
                            const showNothing = !!line.override_cal_100g || !!line.override_cal || perfectMatch
                            const showFoodName = !showNothing && line.currentFood?.name !== line.foodName
                            const showQuestionMark = !showNothing && !line.currentFood

                            return (
                                <div key={i} data-hidden={line.raw === ""}>
                                    {line.raw || "_"}
                                    {showFoodName && <i>{line.currentFood?.name}</i>}
                                    {showQuestionMark && <i>?</i>}
                                </div>
                            )
                        })
                    }
                    {padBottom && <div data-hidden={true}>_</div>}
                </div>

            </div>

            {/* MACROS COLUMN */}
            <div className={s.macros} data-show={showMacros}>
                <table>
                    <tbody>
                        {
                            parsedLines.filter(line => line.foodName).map(line => (
                                <tr key={line.sort}>
                                    <td>{macroValue(line.macros.calories)}</td>
                                    {/* <td>/</td> */}
                                    <td>{macroValue(line.macros.carbs)}</td>
                                    {/* <td>/</td> */}
                                    <td>{macroValue(line.macros.protein)}</td>
                                    {/* <td>/</td> */}
                                    <td>{macroValue(line.macros.fats)}</td>
                                    {/* <td>/</td> */}
                                    <td>{macroValue(line.macros.fiber)}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>

        </div>
    )
}

function macroValue(value: number): string {
    return value === 0 ? "-" : value.toFixed(0)
}