/**
 * @captify/{{APP_SLUG}}/services - Server-side exports
 *
 * Contains configuration and any server-side services for the {{APP_SLUG}} application.
 */

// Export configuration for platform discovery
export { config } from "../config";

// Export types (add your types here)
// export type * from "../types";

// Service implementation
export const services = {
  use(_serviceName: string) {
    // Add your local services here if needed
    // Most operations should proxy to platform
    return null;
  }
};
