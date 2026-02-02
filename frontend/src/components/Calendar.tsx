import s from "./Calendar.module.scss"
import { useState } from "react"
import { useMonthData } from "../hooks/useMonthData"
import { useUser } from "../hooks/useUser"
import dayjs from "dayjs"
import Button from "./Button"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(dayjs())
    const { monthData, loading } = useMonthData(currentDate.year(), currentDate.month() + 1)
    const { user } = useUser()

    const year = currentDate.year()
    const month = currentDate.month() // 0-indexed
    
    // Get first day of month and number of days
    const firstDayOfMonth = dayjs(`${year}-${month + 1}-01`)
    const daysInMonth = firstDayOfMonth.daysInMonth()
    const startDayOfWeek = firstDayOfMonth.day() // 0 = Sunday

    // Create calendar grid (6 weeks x 7 days)
    const calendarDays: (number | null)[] = []
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i)
    }

    // Fill remaining cells to complete 6 rows
    const remainingCells = 42 - calendarDays.length
    for (let i = 0; i < remainingCells; i++) {
        calendarDays.push(null)
    }

    // Helper to get day data
    function getDayData(day: number) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return monthData?.days.find(d => d.date === dateStr)
    }

    // Helper to determine day status
    function getDayStatus(day: number): 'no-data' | 'under' | 'in-range' | 'over' {
        const dayData = getDayData(day)
        
        if (!dayData || dayData.total_calories === 0) {
            return 'no-data'
        }

        const effectiveCalories = dayData.total_calories - (dayData.workout_calories || 0)
        const min = user?.min_calories
        const max = user?.max_calories

        // If no targets set, just show if there's data
        if (min === null && max === null) {
            return effectiveCalories > 0 ? 'in-range' : 'no-data'
        }

        // Use target range if available
        const actualMin = min ?? 0
        const actualMax = max ?? actualMin

        if (effectiveCalories < actualMin) {
            return 'under'
        } else if (effectiveCalories <= actualMax) {
            return 'in-range'
        } else {
            return 'over'
        }
    }

    function previousMonth() {
        setCurrentDate(currentDate.subtract(1, 'month'))
    }

    function nextMonth() {
        setCurrentDate(currentDate.add(1, 'month'))
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className={s.Calendar}>
            <header className={s.header}>
                <Button onClick={previousMonth} unstyled>
                    <FaChevronLeft />
                </Button>
                <h2>{currentDate.format('MMMM YYYY')}</h2>
                <Button onClick={nextMonth} unstyled>
                    <FaChevronRight />
                </Button>
            </header>

            {loading && <div className={s.loading}>Loading...</div>}

            <div className={s.calendar_grid}>
                {/* Week day headers */}
                {weekDays.map(day => (
                    <div key={day} className={s.weekday_header}>{day}</div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className={s.empty_day} />
                    }

                    const status = getDayStatus(day)
                    const dayData = getDayData(day)

                    return (
                        <div 
                            key={day} 
                            className={`${s.day} ${s[status]}`}
                            title={dayData ? `${dayData.total_calories} cal${dayData.workout_calories ? ` (-${dayData.workout_calories} workout)` : ''}` : 'No data'}
                        >
                            <span className={s.day_number}>{day}</span>
                            {dayData && dayData.total_calories > 0 && (
                                <span className={s.day_calories}>
                                    {Math.round(dayData.total_calories - (dayData.workout_calories || 0))}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className={s.legend}>
                <div className={s.legend_item}>
                    <div className={`${s.legend_color} ${s['no-data']}`} />
                    <span>No data</span>
                </div>
                {user?.min_calories !== null && user?.max_calories !== null && (
                    <>
                        <div className={s.legend_item}>
                            <div className={`${s.legend_color} ${s.under}`} />
                            <span>Under target</span>
                        </div>
                        <div className={s.legend_item}>
                            <div className={`${s.legend_color} ${s['in-range']}`} />
                            <span>In target</span>
                        </div>
                        <div className={s.legend_item}>
                            <div className={`${s.legend_color} ${s.over}`} />
                            <span>Over target</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
