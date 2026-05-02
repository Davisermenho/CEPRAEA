import { getSetting, setSetting } from '@/db'
import { hashPin } from '@/lib/auth'

export async function seedDefaults(): Promise<void> {
  const endpointUrl = import.meta.env.VITE_SYNC_ENDPOINT_URL as string | undefined
  const secret = import.meta.env.VITE_SYNC_SECRET as string | undefined
  const defaultPin = import.meta.env.VITE_COACH_DEFAULT_PIN as string | undefined

  if (endpointUrl) {
    const existing = await getSetting<string>('syncEndpointUrl')
    if (!existing) await setSetting('syncEndpointUrl', endpointUrl)
  }
  if (secret) {
    const existing = await getSetting<string>('syncSecret')
    if (!existing) await setSetting('syncSecret', secret)
  }
  if (defaultPin) {
    const existing = await getSetting<string>('pinHash')
    if (!existing) {
      const hash = await hashPin(defaultPin)
      await setSetting('pinHash', hash)
    }
  }
}
