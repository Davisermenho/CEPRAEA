import { provisionCoach, readCoachContext } from './coachProvisioning'

export default async function globalSetup() {
  await provisionCoach(readCoachContext())
}
