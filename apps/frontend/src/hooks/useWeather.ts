import { useState, useEffect } from 'react'

interface WeatherData {
    temperature: number
    feelsLike: number
    condition: string
    description: string
    humidity: number
    windSpeed: number
    city: string
    icon: string
}

export function useWeather(city: string = 'Abidjan') {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo' // User will need to add their API key

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setLoading(true)
                setError(null)

                // If no API key, use fallback data
                if (API_KEY === 'demo') {
                    console.warn('Using demo weather data. Add VITE_OPENWEATHER_API_KEY to .env.local for real data.')
                    setWeather({
                        temperature: 28,
                        feelsLike: 32,
                        condition: 'Clouds',
                        description: 'Partiellement nuageux',
                        humidity: 75,
                        windSpeed: 12,
                        city: 'Abidjan',
                        icon: '02d'
                    })
                    setLoading(false)
                    return
                }

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city},CI&units=metric&lang=fr&appid=${API_KEY}`
                )

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données météo')
                }

                const data = await response.json()

                setWeather({
                    temperature: Math.round(data.main.temp),
                    feelsLike: Math.round(data.main.feels_like),
                    condition: data.weather[0].main,
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                    city: data.name,
                    icon: data.weather[0].icon
                })
            } catch (err) {
                console.error('Weather fetch error:', err)
                setError(err instanceof Error ? err.message : 'Erreur inconnue')
                // Fallback to demo data on error
                setWeather({
                    temperature: 28,
                    feelsLike: 32,
                    condition: 'Clouds',
                    description: 'Partiellement nuageux',
                    humidity: 75,
                    windSpeed: 12,
                    city: 'Abidjan',
                    icon: '02d'
                })
            } finally {
                setLoading(false)
            }
        }

        fetchWeather()

        // Refresh every 10 minutes
        const interval = setInterval(fetchWeather, 10 * 60 * 1000)

        return () => clearInterval(interval)
    }, [city, API_KEY])

    return { weather, loading, error }
}
