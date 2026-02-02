import s from "./SettingsPage.module.scss"
import { useState } from "react"
import { useUser } from "../hooks/useUser"
import { useSources } from "../hooks/useSources"
import Button from "./Button"
import { FaArrowDown, FaArrowUp } from "react-icons/fa"

export default function SettingsPage() {
    const { user, loading, updateTargets, isUpdatingTargets } = useUser()
    const { sources, saveConfig, isLoading: sourcesLoading } = useSources()
    
    // Calorie targets state
    const [minCalories, setMinCalories] = useState<string>(user?.min_calories?.toString() || "")
    const [maxCalories, setMaxCalories] = useState<string>(user?.max_calories?.toString() || "")
    const [targetsError, setTargetsError] = useState<string | null>(null)
    const [targetsSuccess, setTargetsSuccess] = useState(false)
    
    // Sources state
    const [sourceConfigs, setSourceConfigs] = useState<Record<string, Record<string, string>>>({})
    const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null)
    const [sourceSuccess, setSourceSuccess] = useState<string | null>(null)

    async function handleSaveTargets() {
        setTargetsError(null)
        setTargetsSuccess(false)
        
        const min = minCalories === "" ? null : parseInt(minCalories, 10)
        const max = maxCalories === "" ? null : parseInt(maxCalories, 10)
        
        if (min !== null && isNaN(min)) {
            setTargetsError("Min calories must be a number")
            return
        }
        
        if (max !== null && isNaN(max)) {
            setTargetsError("Max calories must be a number")
            return
        }
        
        if (min !== null && max !== null && min > max) {
            setTargetsError("Min calories cannot be greater than max calories")
            return
        }
        
        const result = await updateTargets({ min_calories: min, max_calories: max })
        
        if (result) {
            setTargetsSuccess(true)
            setTimeout(() => setTargetsSuccess(false), 3000)
        }
    }

    async function handleSaveSourceConfig(sourceId: string) {
        setSourceSuccess(null)
        await saveConfig({ sourceId, config: sourceConfigs[sourceId] || {} })
        setSourceSuccess(sourceId)
        setTimeout(() => setSourceSuccess(null), 3000)
    }

    if (loading || sourcesLoading) {
        return <div className={s.SettingsPage}>Loading...</div>
    }

    return (
        <div className={s.SettingsPage}>
            <h1>Settings</h1>
            
            {/* Calorie Targets Section */}
            <section className={s.section}>
                <h2>Calorie Targets</h2>
                <p className={s.description}>
                    Set your daily calorie target range. The progress bar on the home page will show 
                    how close you are to your targets.
                </p>
                
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
                    
                    {targetsError && <div className={s.error}>{targetsError}</div>}
                    {targetsSuccess && <div className={s.success}>Targets saved successfully!</div>}
                    
                    <Button onClick={handleSaveTargets} disabled={isUpdatingTargets}>
                        {isUpdatingTargets ? "Saving..." : "Save Targets"}
                    </Button>
                </div>
                
                <div className={s.help}>
                    <ul>
                        <li><strong>Minimum:</strong> The least calories you want to consume</li>
                        <li><strong>Maximum:</strong> The most calories you want to consume</li>
                    </ul>
                    <p>Leave fields empty to disable the target range display.</p>
                </div>
            </section>
            
            {/* Sources Configuration Section */}
            <section className={s.section}>
                <h2>Food Sources</h2>
                <p className={s.description}>
                    Configure external food data sources for searching nutritional information.
                </p>
                
                <div className={s.sources_list}>
                    {Array.isArray(sources) && sources.map(source => (
                        <div key={source.id} className={s.source_item}>
                            <div
                                className={s.source_header}
                                onClick={() => setExpandedSourceId(expandedSourceId === source.id ? null : source.id)}
                            >
                                <div>
                                    <strong>{source.name}</strong> 
                                    <span className={s.status}>{source.isReady ? '✅ Ready' : '❌ Not configured'}</span>
                                    <p className={s.source_description}>{source.description}</p>
                                </div>
                                <Button unstyled>
                                    {expandedSourceId === source.id ? <FaArrowUp /> : <FaArrowDown />}
                                </Button>
                            </div>

                            {expandedSourceId === source.id && (
                                <div className={s.source_content}>
                                    {source.fields.map(field => (
                                        <label key={field.key}>
                                            {field.label}
                                            <input
                                                type={field.type}
                                                value={sourceConfigs[source.id]?.[field.key] || ''}
                                                onChange={e => setSourceConfigs({
                                                    ...sourceConfigs,
                                                    [source.id]: {
                                                        ...(sourceConfigs[source.id] || {}),
                                                        [field.key]: e.target.value
                                                    }
                                                })}
                                            />
                                        </label>
                                    ))}
                                    {sourceSuccess === source.id && (
                                        <div className={s.success}>Configuration saved!</div>
                                    )}
                                    <Button onClick={() => handleSaveSourceConfig(source.id)}>
                                        Save Configuration
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
