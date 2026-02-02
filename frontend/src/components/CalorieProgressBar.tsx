import s from "./CalorieProgressBar.module.scss"

type Props = {
    totalCalories: number
    workoutCalories: number
    minCalories: number | null
    maxCalories: number | null
}

export default function CalorieProgressBar({ 
    totalCalories, 
    workoutCalories, 
    minCalories, 
    maxCalories 
}: Props) {
    // If no targets are set, show simple display
    if (minCalories === null && maxCalories === null) {
        return (
            <div className={s.CalorieProgressBar}>
                <h1>{Math.round(totalCalories - workoutCalories)} Calories</h1>
            </div>
        )
    }

    // Effective calories after workout adjustment
    const effectiveCalories = Math.max(0, totalCalories - workoutCalories)
    
    // Use default values if targets not set
    const min = minCalories ?? 0
    const max = maxCalories ?? Math.max(min, effectiveCalories)
    
    // Calculate bar dimensions
    const range = max - min
    const targetRangeWidth = range > 0 ? (range / max) * 100 : 0
    
    // Calculate food bar (what's actually consumed)
    // The bar represents calories from 0 to max (or more if exceeded)
    const displayMax = Math.max(max, effectiveCalories)
    const foodPercentage = displayMax > 0 ? (effectiveCalories / displayMax) * 100 : 0
    
    // Calculate workout extension (how much the bar extends due to exercise)
    // Workout calories effectively give you more budget
    const workoutPercentage = displayMax > 0 ? (workoutCalories / displayMax) * 100 : 0
    
    // Calculate target range position
    const minPercentage = displayMax > 0 ? (min / displayMax) * 100 : 0
    const maxPercentage = displayMax > 0 ? (max / displayMax) * 100 : 0
    
    // Determine status color
    let statusColor = "gray"
    let statusText = ""
    
    if (effectiveCalories === 0) {
        statusColor = "gray"
        statusText = "No data"
    } else if (effectiveCalories < min) {
        statusColor = "#ffc107" // Yellow - under target
        statusText = "Under target"
    } else if (effectiveCalories <= max) {
        statusColor = "#28a745" // Green - in target
        statusText = "On target"
    } else {
        statusColor = "#dc3545" // Red - over target
        statusText = "Over target"
    }

    return (
        <div className={s.CalorieProgressBar}>
            <div className={s.header}>
                <h1>{Math.round(effectiveCalories)} Calories</h1>
                <span className={s.status} style={{ color: statusColor }}>{statusText}</span>
            </div>
            
            <div className={s.progress_container}>
                {/* Background track */}
                <div className={s.track}>
                    {/* Target range markers */}
                    {minCalories !== null && (
                        <div 
                            className={s.target_marker} 
                            style={{ left: `${minPercentage}%` }}
                            title={`Min: ${minCalories} cal`}
                        />
                    )}
                    {maxCalories !== null && (
                        <div 
                            className={s.target_marker} 
                            style={{ left: `${maxPercentage}%` }}
                            title={`Max: ${maxCalories} cal`}
                        />
                    )}
                    
                    {/* Target range zone */}
                    {minCalories !== null && maxCalories !== null && (
                        <div 
                            className={s.target_zone}
                            style={{ 
                                left: `${minPercentage}%`, 
                                width: `${maxPercentage - minPercentage}%` 
                            }}
                        />
                    )}
                    
                    {/* Workout extension (left side) */}
                    {workoutCalories > 0 && (
                        <div 
                            className={s.workout_bar}
                            style={{ width: `${workoutPercentage}%` }}
                        />
                    )}
                    
                    {/* Food calories bar */}
                    <div 
                        className={s.food_bar}
                        style={{ 
                            width: `${foodPercentage}%`,
                            marginLeft: workoutCalories > 0 ? `${workoutPercentage}%` : 0
                        }}
                    />
                </div>
            </div>
            
            <div className={s.legend}>
                {workoutCalories > 0 && (
                    <span className={s.workout_legend}>
                        Workout: +{Math.round(workoutCalories)} cal
                    </span>
                )}
                {minCalories !== null && maxCalories !== null && (
                    <span className={s.target_legend}>
                        Target: {minCalories}-{maxCalories} cal
                    </span>
                )}
            </div>
        </div>
    )
}
