export interface FetchOptions {
  endpoint: string
  mockData: any[]
  errorMessage?: string
}

const API_BASE_URL = "https://api-molino.tera.ar"

export async function fetchWithFallback<T>({ endpoint, mockData, errorMessage }: FetchOptions): Promise<{
  data: T[]
  usingMockData: boolean
  connectionError: boolean
}> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    console.log("[v0] Attempting to fetch from:", url)

    const response = await fetch(url)
    console.log("[v0] Response status:", response.status)

    if (response.ok) {
      const data = await response.json()
      console.log("[v0] Received data:", data)
      return {
        data,
        usingMockData: false,
        connectionError: false,
      }
    } else {
      console.log("[v0] Response not ok, using mock data")
      return {
        data: mockData,
        usingMockData: true,
        connectionError: false,
      }
    }
  } catch (error) {
    console.error("[v0] Fetch failed, using mock data:", error.message)
    return {
      data: mockData,
      usingMockData: true,
      connectionError: false,
    }
  }
}
