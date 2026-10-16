import { useState, useEffect } from 'react'

type Platform = 'ios' | 'android' | 'base'
type Appearance = 'light' | 'dark'

interface TelegramTheme {
  platform: Platform
  appearance: Appearance
}

export function useTelegramTheme(): TelegramTheme {
  const [platform, setPlatform] = useState<Platform>('base')
  const [appearance, setAppearance] = useState<Appearance>('light')

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    if (!tg) {
      // Development fallback
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setAppearance(isDark ? 'dark' : 'light')
      return
    }

    // Detect platform
    const detectedPlatform = tg.platform
    if (detectedPlatform === 'ios' || detectedPlatform === 'macos') {
      setPlatform('ios')
    } else if (detectedPlatform === 'android') {
      setPlatform('android')
    } else {
      setPlatform('base')
    }

    // Detect theme
    setAppearance(tg.colorScheme === 'dark' ? 'dark' : 'light')

    // Listen for theme changes
    const handleThemeChange = () => {
      setAppearance(tg.colorScheme === 'dark' ? 'dark' : 'light')
    }

    tg.onEvent?.('themeChanged', handleThemeChange)

    return () => {
      tg.offEvent?.('themeChanged', handleThemeChange)
    }
  }, [])

  return { platform, appearance }
}
