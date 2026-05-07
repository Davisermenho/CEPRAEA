import { cleanupCoach, readCoachContext } from './coachProvisioning'

export default async function globalTeardown() {
  await cleanupCoach(readCoachContext())
}
