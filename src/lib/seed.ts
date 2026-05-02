import { setSetting } from '@/db'
import { hashPin } from '@/lib/auth'

export async function seedDefaults(): Promise<void> {
  const endpointUrl = import.meta.env.VITE_SYNC_ENDPOINT_URL as string | undefined
  const secret = import.meta.env.VITE_SYNC_SECRET as string | undefined
  const defaultPin = import.meta.env.VITE_COACH_DEFAULT_PIN as string | undefined

  // Sempre sobrescreve com os valores das env vars para garantir consistência
  // entre dispositivos. Mudanças de configuração chegam via Vercel.
  if (endpointUrl) await setSetting('syncEndpointUrl', endpointUrl)
  if (secret) await setSetting('syncSecret', secret)
  if (defaultPin) {
    const hash = await hashPin(defaultPin)
    await setSetting('pinHash', hash)
  }
}
