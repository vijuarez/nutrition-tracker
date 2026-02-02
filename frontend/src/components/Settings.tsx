import s from "./Settings.module.scss"
import { useState, useEffect } from "react"
import { useUser } from "../hooks/useUser"
import Button from "./Button"

type Props = {
    onClose?: () => void
}

export default function Settings({ onClose }: Props) {
    const { user, loading, updateTargets, isUpdatingTargets } = useUser()
    const [minCalories, setMinCalories] = useState<string>("")
    const [maxCalories, setMaxCalories] = useState<string>("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            setMinCalories(user.min_calories?.toString() || "")
            setMaxCalories(user.max_calories?.toString() || "")
        }
    }, [user])

    async function handleSave() {
        setError(null)
        
        const min = minCalories === "" ? null : parseInt(minCalories, 10)
        const max = maxCalories === "" ? null : parseInt(maxCalories, 10)
        
        // Validation
        if (min !== null && isNaN(min)) {
            setError("Min calories must be a number")
            return
        }
        
        if (max !== null && isNaN(max)) {
            setError("Max calories must be a number")
            return
        }
        
        if (min !== null && max !== null && min > max) {
            setError("Min calories cannot be greater than max calories")
            return
        }
        
        await updateTargets({ min_calories: min, max_calories: max })
        
        if (onClose) {
            onClose()
        }
    }

    if (loading) {
        return <div className={s.Settings}>Loading...</div>
    }

    return (
        <div className={s.Settings}>
            <h2>Calorie Targets</h2>
            
            <div className={s.form}>
                <label>
                    <span>Minimum calories</span>
                    <input
                        type="number"
                        value={minCalories}
                        onChange={(e) => setMinCalories(e.target.value)}
                        placeholder="e.g., 1800"
                        min="0"
                    />
                </label>
                
                <label>
                    <span>Maximum calories</span>
                    <input
                        type="number"
                        value={maxCalories}
                        onChange={(e) => setMaxCalories(e.target.value)}
                        placeholder="e.g., 2200"
                        min="0"
                    />
                </label>
                
                {error && <div className={s.error}>{error}</div>}
                
                <div className={s.buttons}>
                    <Button onClick={handleSave} disabled={isUpdatingTargets}>
                        {isUpdatingTargets ? "Saving..." : "Save"}
                    </Button>
                    {onClose && (
                        <Button onClick={onClose}>
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
            
            <div className={s.help}>
                <p>Set your daily calorie target range:</p>
                <ul>
                    <li><strong>Minimum:</strong> The least calories you want to consume</li>
                    <li><strong>Maximum:</strong> The most calories you want to consume</li>
                </ul>
                <p>Leave fields empty to disable the target range display.</p>
            </div>
        </div>
    )
}
