/**
 * Analyst Service
 * Fetches High Impact economic calendar data from Financial Modeling Prep (FMP).
 */

export interface EconomicEvent {
  event: string;
  date: string;
  country: string;
  impact: string;
  actual: number | null;
  previous: number | null;
  estimate: number | null;
  unit: string;
}

export async function fetchHighImpactEvents(): Promise<EconomicEvent[]> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey || apiKey.includes('your_') || apiKey === 'mock') {

    console.warn("FMP_API_KEY is missing or placeholder. Using mock data.");
    return [
      {
        event: "FOMC Statement",
        date: new Date().toISOString(),
        country: "USA",
        impact: "High",
        actual: null,
        previous: 5.5,
        estimate: 5.5,
        unit: "%"
      },
      {
        event: "Non Farm Payrolls",
        date: new Date(Date.now() + 86400000).toISOString(),
        country: "USA",
        impact: "High",
        actual: null,
        previous: 216000,
        estimate: 185000,
        unit: "Jobs"
      }
    ];
  }


  try {
    // Fetch economic calendar for the next 7 days
    const from = new Date().toISOString().split('T')[0];
    const to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const url = `https://financialmodelingprep.com/api/v3/economic_calendar?from=${from}&to=${to}&apikey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.statusText}`);
    }

    const data: EconomicEvent[] = await response.json();
    
    // Filter for High Impact events
    return data.filter(event => event.impact === 'High');
  } catch (error) {
    console.error("Error fetching analyst data:", error);
    throw new Error("経済カレンダーの取得に失敗しました。");
  }
}
