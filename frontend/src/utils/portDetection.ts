/**
 * Auto-detect which port the backend is running on
 * Tries ports 3001 (main), 3000 (Docker), then 5000-5005 (dev servers)
 */
export async function detectBackendPort(): Promise<string> {
  // Check port 3001 first (primary dev server)
  // Then check 3000 (Docker Compose alternative)
  // Then check 5000-5005 (common dev server ports)
  const portsToTry = [3001, 3000, 5000, 5001, 5002, 5003, 5004, 5005];
  
  for (const port of portsToTry) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      
      if (response.ok) {
        console.log(`✅ Backend detected on port ${port}`);
        return `http://localhost:${port}`;
      }
    } catch (error) {
      // Port didn't respond, try next one
      continue;
    }
  }
  
  // Fallback to port 3001 (main dev server default)
  console.warn('⚠️ Could not detect backend port, using default 3001');
  return 'http://localhost:3001';
}

/**
 * Get the API base URL with automatic port detection
 */
export async function getApiBaseUrl(): Promise<string> {
  // First check if environment variable is set
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Otherwise, auto-detect
  return detectBackendPort();
}
