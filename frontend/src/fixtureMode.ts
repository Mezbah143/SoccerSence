/** Keep public/static builds fictional. Development defaults to the local UI only,
 * never initiating a provider request until the user clicks Load. */
export type FixtureMode = 'demo' | 'local'
export function initialFixtureMode(isDevelopment: boolean, requestedMode?: unknown): FixtureMode {
  if (!isDevelopment) return 'demo'
  return requestedMode === 'demo' ? 'demo' : 'local'
}
