'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'

// ─── Team Logo Abbreviations ──────────────────────────────────────────

const TEAM_ABBRS: Record<string, Record<string, string>> = {
  NBA: {
    'Atlanta Hawks': 'atl', 'Boston Celtics': 'bos', 'Brooklyn Nets': 'bkn',
    'Charlotte Hornets': 'cha', 'Chicago Bulls': 'chi', 'Cleveland Cavaliers': 'cle',
    'Dallas Mavericks': 'dal', 'Denver Nuggets': 'den', 'Detroit Pistons': 'det',
    'Golden State Warriors': 'gs', 'Houston Rockets': 'hou', 'Indiana Pacers': 'ind',
    'LA Clippers': 'lac', 'Los Angeles Lakers': 'lal', 'Memphis Grizzlies': 'mem',
    'Miami Heat': 'mia', 'Milwaukee Bucks': 'mil', 'Minnesota Timberwolves': 'min',
    'New Orleans Pelicans': 'no', 'New York Knicks': 'ny', 'Oklahoma City Thunder': 'okc',
    'Orlando Magic': 'orl', 'Philadelphia 76ers': 'phi', 'Phoenix Suns': 'phx',
    'Portland Trail Blazers': 'por', 'Sacramento Kings': 'sac', 'San Antonio Spurs': 'sa',
    'Toronto Raptors': 'tor', 'Utah Jazz': 'uta', 'Washington Wizards': 'wsh',
  },
  NFL: {
    'Arizona Cardinals': 'ari', 'Atlanta Falcons': 'atl', 'Baltimore Ravens': 'bal',
    'Buffalo Bills': 'buf', 'Carolina Panthers': 'car', 'Chicago Bears': 'chi',
    'Cincinnati Bengals': 'cin', 'Cleveland Browns': 'cle', 'Dallas Cowboys': 'dal',
    'Denver Broncos': 'den', 'Detroit Lions': 'det', 'Green Bay Packers': 'gb',
    'Houston Texans': 'hou', 'Indianapolis Colts': 'ind', 'Jacksonville Jaguars': 'jax',
    'Kansas City Chiefs': 'kc', 'Las Vegas Raiders': 'lv', 'Los Angeles Chargers': 'lac',
    'Los Angeles Rams': 'lar', 'Miami Dolphins': 'mia', 'Minnesota Vikings': 'min',
    'New England Patriots': 'ne', 'New Orleans Saints': 'no', 'New York Giants': 'nyg',
    'New York Jets': 'nyj', 'Philadelphia Eagles': 'phi', 'Pittsburgh Steelers': 'pit',
    'San Francisco 49ers': 'sf', 'Seattle Seahawks': 'sea', 'Tampa Bay Buccaneers': 'tb',
    'Tennessee Titans': 'ten', 'Washington Commanders': 'wsh',
  },
  MLB: {
    'Arizona Diamondbacks': 'ari', 'Atlanta Braves': 'atl', 'Baltimore Orioles': 'bal',
    'Boston Red Sox': 'bos', 'Chicago Cubs': 'chc', 'Chicago White Sox': 'chw',
    'Cincinnati Reds': 'cin', 'Cleveland Guardians': 'cle', 'Colorado Rockies': 'col',
    'Detroit Tigers': 'det', 'Houston Astros': 'hou', 'Kansas City Royals': 'kc',
    'Los Angeles Angels': 'laa', 'Los Angeles Dodgers': 'lad', 'Miami Marlins': 'mia',
    'Milwaukee Brewers': 'mil', 'Minnesota Twins': 'min', 'New York Mets': 'nym',
    'New York Yankees': 'nyy', 'Oakland Athletics': 'oak', 'Philadelphia Phillies': 'phi',
    'Pittsburgh Pirates': 'pit', 'San Diego Padres': 'sd', 'San Francisco Giants': 'sf',
    'Seattle Mariners': 'sea', 'St. Louis Cardinals': 'stl', 'Tampa Bay Rays': 'tb',
    'Texas Rangers': 'tex', 'Toronto Blue Jays': 'tor', 'Washington Nationals': 'wsh',
  },
  NHL: {
    'Anaheim Ducks': 'ana', 'Arizona Coyotes': 'ari', 'Boston Bruins': 'bos',
    'Buffalo Sabres': 'buf', 'Calgary Flames': 'cgy', 'Carolina Hurricanes': 'car',
    'Chicago Blackhawks': 'chi', 'Colorado Avalanche': 'col', 'Columbus Blue Jackets': 'cbj',
    'Dallas Stars': 'dal', 'Detroit Red Wings': 'det', 'Edmonton Oilers': 'edm',
    'Florida Panthers': 'fla', 'Los Angeles Kings': 'la', 'Minnesota Wild': 'min',
    'Montreal Canadiens': 'mtl', 'Nashville Predators': 'nsh', 'New Jersey Devils': 'nj',
    'New York Islanders': 'nyi', 'New York Rangers': 'nyr', 'Ottawa Senators': 'ott',
    'Philadelphia Flyers': 'phi', 'Pittsburgh Penguins': 'pit', 'San Jose Sharks': 'sj',
    'Seattle Kraken': 'sea', 'St. Louis Blues': 'stl', 'Tampa Bay Lightning': 'tb',
    'Toronto Maple Leafs': 'tor', 'Utah Hockey Club': 'uta', 'Vancouver Canucks': 'van',
    'Vegas Golden Knights': 'vgk', 'Washington Capitals': 'wsh',
  },
}

function getTeamLogoUrl(sport: string, teamName: string): string {
  const abbr = TEAM_ABBRS[sport]?.[teamName]
  if (!abbr) return ''
  const league = sport.toLowerCase()
  return `https://a.espncdn.com/i/teamlogos/${league}/500/${abbr}.png`
}

const SPORT_SUB_CATEGORIES: Record<string, string> = {
  NBA: 'Basketball Breaks',
  NFL: 'Football Breaks',
  MLB: 'Baseball Breaks',
  NHL: 'Hockey Breaks',
}

const SHIPPING_PROFILES = [
  '0-1 oz', '1-3 oz', '4-7 oz', '8-11 oz', '12-15 oz',
  '1 lb', '1-2 lbs', '2-3 lbs', '3-4 lbs', '4-6 lbs',
]

// ─── Team Data ─────────────────────────────────────────────────────────

const TEAMS: Record<string, string[]> = {
  NBA: [
    'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
    'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
    'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
    'LA Clippers', 'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat',
    'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks',
    'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns',
    'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors',
    'Utah Jazz', 'Washington Wizards',
  ],
  NFL: [
    'Arizona Cardinals', 'Atlanta Falcons', 'Baltimore Ravens', 'Buffalo Bills',
    'Carolina Panthers', 'Chicago Bears', 'Cincinnati Bengals', 'Cleveland Browns',
    'Dallas Cowboys', 'Denver Broncos', 'Detroit Lions', 'Green Bay Packers',
    'Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars', 'Kansas City Chiefs',
    'Las Vegas Raiders', 'Los Angeles Chargers', 'Los Angeles Rams', 'Miami Dolphins',
    'Minnesota Vikings', 'New England Patriots', 'New Orleans Saints', 'New York Giants',
    'New York Jets', 'Philadelphia Eagles', 'Pittsburgh Steelers', 'San Francisco 49ers',
    'Seattle Seahawks', 'Tampa Bay Buccaneers', 'Tennessee Titans', 'Washington Commanders',
  ],
  MLB: [
    'Arizona Diamondbacks', 'Atlanta Braves', 'Baltimore Orioles', 'Boston Red Sox',
    'Chicago Cubs', 'Chicago White Sox', 'Cincinnati Reds', 'Cleveland Guardians',
    'Colorado Rockies', 'Detroit Tigers', 'Houston Astros', 'Kansas City Royals',
    'Los Angeles Angels', 'Los Angeles Dodgers', 'Miami Marlins', 'Milwaukee Brewers',
    'Minnesota Twins', 'New York Mets', 'New York Yankees', 'Oakland Athletics',
    'Philadelphia Phillies', 'Pittsburgh Pirates', 'San Diego Padres', 'San Francisco Giants',
    'Seattle Mariners', 'St. Louis Cardinals', 'Tampa Bay Rays', 'Texas Rangers',
    'Toronto Blue Jays', 'Washington Nationals',
  ],
  NHL: [
    'Anaheim Ducks', 'Arizona Coyotes', 'Boston Bruins', 'Buffalo Sabres',
    'Calgary Flames', 'Carolina Hurricanes', 'Chicago Blackhawks', 'Colorado Avalanche',
    'Columbus Blue Jackets', 'Dallas Stars', 'Detroit Red Wings', 'Edmonton Oilers',
    'Florida Panthers', 'Los Angeles Kings', 'Minnesota Wild', 'Montreal Canadiens',
    'Nashville Predators', 'New Jersey Devils', 'New York Islanders', 'New York Rangers',
    'Ottawa Senators', 'Philadelphia Flyers', 'Pittsburgh Penguins', 'San Jose Sharks',
    'Seattle Kraken', 'St. Louis Blues', 'Tampa Bay Lightning', 'Toronto Maple Leafs',
    'Utah Hockey Club', 'Vancouver Canucks', 'Vegas Golden Knights', 'Washington Capitals',
  ],
}

const SPORTS = ['NBA', 'NFL', 'MLB', 'NHL', 'UFC'] as const
type Sport = (typeof SPORTS)[number]

interface PlatformOption {
  key: string
  label: string
  rate: number
}

const PLATFORMS: PlatformOption[] = [
  { key: 'whatnot', label: 'Whatnot (10.9%)', rate: 0.109 },
  { key: 'none', label: 'No Fee', rate: 0 },
  { key: 'custom', label: 'Custom', rate: 0 },
]

const MARGIN_PRESETS = [0, 10, 15, 20, 25, 30]

interface TeamEntry {
  name: string
  price: number
  locked: boolean
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// ─── Lock Icons ────────────────────────────────────────────────────────

function LockIcon({ locked }: { locked: boolean }) {
  if (locked) {
    return (
      <svg className="h-4 w-4 text-gold-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
      </svg>
    )
  }
  return (
    <svg className="h-4 w-4 text-cage-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 01-1.5 0V6.75a3.75 3.75 0 00-7.5 0v3h1.5a3 3 0 013 3v6.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-6.75a3 3 0 013-3h8.25v-3c0-2.9 2.35-5.25 5.25-5.25z" />
    </svg>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function PYTCalculatorPage() {
  const [cogs, setCogs] = useState('')
  const [sport, setSport] = useState<Sport | ''>('')
  const [marginInput, setMarginInput] = useState('')
  const [activeMargin, setActiveMargin] = useState<number | null>(null)
  const [platformKey, setPlatformKey] = useState('whatnot')
  const [customFeeRate, setCustomFeeRate] = useState('')
  const [teams, setTeams] = useState<TeamEntry[]>([])
  const [copied, setCopied] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const cogsNum = parseFloat(cogs) || 0
  const margin = activeMargin ?? (parseFloat(marginInput) || 0)
  const selectedPlatform = PLATFORMS.find((p) => p.key === platformKey) ?? PLATFORMS[0]
  const feeRate = platformKey === 'custom'
    ? (parseFloat(customFeeRate) || 0) / 100
    : selectedPlatform.rate
  const teamCount = teams.length

  // ── Derived calculations ──────────────────────────────────────────────

  const perOrderFee = 0.30
  const totalOrderFees = teamCount * perOrderFee

  const targetRevenue = useMemo(() => {
    if (cogsNum <= 0 || !sport || sport === 'UFC' || feeRate >= 1) return 0
    return ((cogsNum + totalOrderFees) / (1 - feeRate)) * (1 + margin / 100)
  }, [cogsNum, sport, feeRate, margin, totalOrderFees])

  const basePrice = useMemo(() => {
    if (teamCount === 0 || targetRevenue <= 0) return 0
    return Math.ceil(targetRevenue / teamCount)
  }, [targetRevenue, teamCount])

  // ── Initialize teams when sport changes ───────────────────────────────

  const handleSportChange = useCallback(
    (newSport: Sport | '') => {
      setSport(newSport)
      if (!newSport || newSport === 'UFC') {
        setTeams([])
        return
      }
      const sportTeams = TEAMS[newSport] || []
      setTeams(sportTeams.map((name) => ({ name, price: 0, locked: false })))
    },
    []
  )

  // Recalculate unlocked prices whenever targetRevenue or teams change
  const teamsWithPrices = useMemo(() => {
    if (teams.length === 0 || targetRevenue <= 0) return teams
    const lockedSum = teams.reduce((s, t) => s + (t.locked ? t.price : 0), 0)
    const unlockedCount = teams.filter((t) => !t.locked).length
    const remaining = targetRevenue - lockedSum
    const unlockedPrice = unlockedCount > 0 ? Math.ceil(remaining / unlockedCount) : 0
    return teams.map((t) => (t.locked ? { ...t, price: Math.round(t.price) } : { ...t, price: unlockedPrice }))
  }, [teams, targetRevenue])

  const lockedSum = useMemo(
    () => teams.reduce((s, t) => s + (t.locked ? t.price : 0), 0),
    [teams]
  )
  const budgetExceeded = lockedSum > targetRevenue && targetRevenue > 0

  // ── Team handlers ─────────────────────────────────────────────────────

  const toggleLock = useCallback(
    (idx: number) => {
      setTeams((prev) => {
        const next = [...prev]
        const team = next[idx]
        if (!team.locked) {
          // Locking — keep current displayed price
          const displayed = teamsWithPrices[idx]?.price ?? basePrice
          next[idx] = { ...team, locked: true, price: displayed }
        } else {
          next[idx] = { ...team, locked: false, price: 0 }
        }
        return next
      })
    },
    [teamsWithPrices, basePrice]
  )

  const setTeamPrice = useCallback((idx: number, value: string) => {
    const numVal = parseFloat(value) || 0
    setTeams((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], price: numVal, locked: true }
      return next
    })
  }, [])

  // ── Summary calculations ──────────────────────────────────────────────

  const summary = useMemo(() => {
    if (teamsWithPrices.length === 0 || targetRevenue <= 0) return null
    const totalRev = teamsWithPrices.reduce((s, t) => s + t.price, 0)
    const platformFee = totalRev * feeRate
    const orderFees = teamsWithPrices.length * perOrderFee
    const netRevenue = totalRev - platformFee - orderFees
    const profit = netRevenue - cogsNum
    const actualMargin = cogsNum > 0 ? ((profit / cogsNum) * 100) : 0
    const avgPrice = totalRev / teamsWithPrices.length
    let highest = teamsWithPrices[0]
    let lowest = teamsWithPrices[0]
    for (const t of teamsWithPrices) {
      if (t.price > highest.price) highest = t
      if (t.price < lowest.price) lowest = t
    }
    return { totalRev, platformFee, orderFees, netRevenue, profit, actualMargin, avgPrice, highest, lowest }
  }, [teamsWithPrices, targetRevenue, feeRate, cogsNum])

  // ── Copy to clipboard ─────────────────────────────────────────────────

  const copyPrices = useCallback(() => {
    if (teamsWithPrices.length === 0 || !sport) return

    // Sort by price descending
    const sorted = [...teamsWithPrices].sort((a, b) => b.price - a.price)

    // Group teams with same price
    const unique: { price: number; names: string[] }[] = []
    for (const t of sorted) {
      const roundedPrice = Math.round(t.price)
      const existing = unique.find((u) => Math.abs(u.price - roundedPrice) < 0.005)
      if (existing) {
        existing.names.push(t.name)
      } else {
        unique.push({ price: roundedPrice, names: [t.name] })
      }
    }

    let text = `${sport} PYT Break - ${fmt(cogsNum)} COGS\n`
    for (const group of unique) {
      if (group.names.length <= 3) {
        for (const name of group.names) {
          text += `${name}: ${fmt(group.price)}\n`
        }
      } else {
        text += `...all other teams (${group.names.length}): ${fmt(group.price)}\n`
      }
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [teamsWithPrices, sport, cogsNum])

  // ── Reset ─────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setCogs('')
    setSport('')
    setMarginInput('')
    setActiveMargin(null)
    setPlatformKey('whatnot')
    setCustomFeeRate('')
    setTeams([])
    setCopied(false)
    setShowExportModal(false)
  }, [])

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">PYT Spot Price Calculator</h1>
        <p className="mt-1 text-sm text-cage-400">
          Calculate tiered team pricing for Pick Your Team breaks
        </p>
      </div>

      {/* Step 1: Setup */}
      <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cage-400">
          Break Setup
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total COGS */}
          <div>
            <label htmlFor="pyt-cogs" className="mb-1.5 block text-xs font-medium text-cage-400">
              Total COGS
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cage-500">$</span>
              <input
                id="pyt-cogs"
                type="number"
                min={0}
                step={0.01}
                value={cogs}
                onChange={(e) => setCogs(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-cage-600 bg-dark-700 py-2.5 pl-7 pr-3 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>
          </div>

          {/* Sport */}
          <div>
            <label htmlFor="pyt-sport" className="mb-1.5 block text-xs font-medium text-cage-400">
              Sport
            </label>
            <select
              id="pyt-sport"
              value={sport}
              onChange={(e) => handleSportChange(e.target.value as Sport | '')}
              className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2.5 text-sm text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            >
              <option value="">Select sport...</option>
              {SPORTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="mb-1.5 block text-xs font-medium text-cage-400">
              Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPlatformKey(p.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    platformKey === p.key
                      ? 'bg-gold-500 text-dark-950'
                      : 'border border-cage-600 bg-dark-700 text-cage-300 hover:border-gold-500/50 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {platformKey === 'custom' && (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-sm text-cage-400">Fee:</span>
                <div className="relative w-28">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={customFeeRate}
                    onChange={(e) => setCustomFeeRate(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 pr-8 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cage-500">%</span>
                </div>
              </div>
            )}
          </div>

          {/* Target Margin */}
          <div>
            <label htmlFor="pyt-margin" className="mb-1.5 block text-xs font-medium text-cage-400">
              Target Margin
            </label>
            <div className="relative">
              <input
                id="pyt-margin"
                type="number"
                min={0}
                max={500}
                step={1}
                value={activeMargin !== null ? '' : marginInput}
                onChange={(e) => {
                  setMarginInput(e.target.value)
                  setActiveMargin(null)
                }}
                placeholder={activeMargin !== null ? `${activeMargin}` : '0'}
                className="w-full rounded-lg border border-cage-600 bg-dark-700 py-2.5 pl-3 pr-8 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cage-500">%</span>
            </div>
          </div>
        </div>

        {/* Margin presets */}
        <div className="mt-3 flex flex-wrap gap-2">
          {MARGIN_PRESETS.map((pct) => (
            <button
              key={pct}
              onClick={() => {
                setActiveMargin(pct)
                setMarginInput('')
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeMargin === pct
                  ? 'bg-gold-500 text-dark-950'
                  : 'border border-cage-600 bg-dark-700 text-cage-300 hover:border-gold-500/50 hover:text-white'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Target summary footer */}
        {targetRevenue > 0 && sport !== 'UFC' && (
          <div className="border-t border-blood-900/20 pt-3 mt-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-cage-400">Target Revenue:</span>
                <span className="text-sm font-bold tabular-nums text-white">{fmt(targetRevenue)}</span>
              </div>
              <span className="hidden sm:inline text-cage-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-cage-400">Base:</span>
                <span className="text-sm font-bold tabular-nums text-white">{fmt(basePrice)}/team</span>
              </div>
              <span className="hidden sm:inline text-cage-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-cage-400">Teams:</span>
                <span className="text-sm font-bold text-white">{teamCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UFC message */}
      {sport === 'UFC' && (
        <div className="rounded-xl border border-gold-500/30 bg-gold-500/5 p-6 mb-6 text-center">
          <p className="text-sm font-medium text-gold-400">
            UFC breaks don&apos;t use PYT format
          </p>
          <p className="mt-1 text-xs text-cage-400">
            Use the regular Spot Calculator for UFC random or personal breaks
          </p>
        </div>
      )}

      {/* Step 3: Team Price Grid */}
      {teamsWithPrices.length > 0 && targetRevenue > 0 && (
        <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-cage-400">
                Team Prices
              </h2>
              <div className="group relative">
                <button
                  type="button"
                  className="flex h-4 w-4 items-center justify-center rounded-full border border-cage-600 text-[10px] font-medium leading-none text-cage-500 transition-colors hover:border-cage-400 hover:text-cage-300"
                  aria-label="How team pricing works"
                >
                  ?
                </button>
                <div className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 w-64 rounded-lg border border-cage-700 bg-dark-800 p-3 text-xs leading-relaxed text-cage-400 opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                  Set individual team prices by clicking on a team&apos;s price field. When you change a price and click away, it locks automatically. Locked teams keep their price while unlocked teams auto-balance to hit your target revenue. Click the lock icon to unlock a team.
                </div>
              </div>
            </div>
            <span className="text-xs text-cage-500">
              {teams.filter((t) => t.locked).length} locked
            </span>
          </div>

          {/* Budget warning */}
          {budgetExceeded && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400">
              Locked team prices exceed target revenue by{' '}
              {fmt(lockedSum - targetRevenue)}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teamsWithPrices.map((team, idx) => (
              <div
                key={team.name}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                  team.locked
                    ? 'border-gold-500/30 bg-gold-500/5'
                    : 'border-cage-700/50 bg-dark-800/50'
                }`}
              >
                {sport && getTeamLogoUrl(sport, team.name) && (
                  <img
                    src={getTeamLogoUrl(sport, team.name)}
                    alt=""
                    className="h-4 w-4 object-contain flex-shrink-0"
                    loading="lazy"
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-white" title={team.name}>
                  {team.name}
                </span>
                <div className="relative w-20 flex-shrink-0">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-cage-500">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={Math.round(team.price) || ''}
                    onChange={(e) => setTeamPrice(idx, e.target.value)}
                    onBlur={() => {
                      if (team.price > 0 && !team.locked) {
                        toggleLock(idx)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur()
                      }
                    }}
                    className="w-full rounded border border-cage-600 bg-dark-700 py-1 pl-5 pr-1 text-right text-xs tabular-nums text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    aria-label={`Price for ${team.name}`}
                  />
                </div>
                <button
                  onClick={() => toggleLock(idx)}
                  className="flex-shrink-0 rounded p-1 transition-colors hover:bg-dark-700"
                  aria-label={team.locked ? `Unlock ${team.name}` : `Lock ${team.name}`}
                  title={team.locked ? 'Unlock price' : 'Lock price'}
                >
                  <LockIcon locked={team.locked} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Summary */}
      {summary && (
        <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md mb-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cage-400">
            Break Summary
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <div className="rounded-lg border border-cage-700/40 bg-dark-800/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-cage-500">Total Revenue</span>
              <p className="text-lg font-bold tabular-nums text-white">{fmt(summary.totalRev)}</p>
            </div>
            <div className="rounded-lg border border-cage-700/40 bg-dark-800/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-cage-500">Total COGS</span>
              <p className="text-lg font-bold tabular-nums text-white">{fmt(cogsNum)}</p>
            </div>
            <div className="rounded-lg border border-cage-700/40 bg-dark-800/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-cage-500">Total Fees</span>
              <p className="text-lg font-bold tabular-nums text-red-400">{fmt(summary.platformFee + summary.orderFees)}</p>
              <span className="text-[9px] text-cage-500">Platform + order fees incl.</span>
            </div>
            <div className="rounded-lg border border-cage-700/40 bg-dark-800/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-cage-500">Net Revenue</span>
              <p className="text-lg font-bold tabular-nums text-white">{fmt(summary.netRevenue)}</p>
            </div>
            <div className={`rounded-lg border p-3 ${
              summary.profit >= 0
                ? 'border-green-500/20 bg-green-500/5'
                : 'border-red-500/20 bg-red-500/5'
            }`}>
              <span className="text-[10px] uppercase tracking-wider text-cage-500">Profit</span>
              <p className={`text-lg font-bold tabular-nums ${
                summary.profit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {fmt(summary.profit)}
              </p>
            </div>
            <div className={`rounded-lg border p-3 ${
              summary.actualMargin >= 0
                ? 'border-green-500/20 bg-green-500/5'
                : 'border-red-500/20 bg-red-500/5'
            }`}>
              <span className="text-[10px] uppercase tracking-wider text-cage-500">Margin</span>
              <p className={`text-lg font-bold tabular-nums ${
                summary.actualMargin >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {summary.actualMargin.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border border-cage-700/40 bg-dark-800/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-cage-500">Avg Spot Price</span>
              <p className="text-lg font-bold tabular-nums text-white">{fmt(summary.avgPrice)}</p>
            </div>
            <div className="sm:col-span-4 flex justify-center gap-4">
              <div className="flex-1 max-w-xs rounded-lg border border-gold-500/20 bg-gold-500/5 p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-cage-500">Highest</span>
                <p className="truncate text-xs font-medium text-gold-400" title={summary.highest.name}>
                  {summary.highest.name}
                </p>
                <p className="text-lg font-bold tabular-nums text-white">{fmt(summary.highest.price)}</p>
              </div>
              <div className="flex-1 max-w-xs rounded-lg border border-cage-700/40 bg-dark-800/50 p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-cage-500">Lowest</span>
                <p className="truncate text-xs font-medium text-cage-400" title={summary.lowest.name}>
                  {summary.lowest.name}
                </p>
                <p className="text-lg font-bold tabular-nums text-white">{fmt(summary.lowest.price)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-cage-600 bg-dark-700 px-4 py-2 text-sm font-medium text-cage-300 transition-colors hover:border-cage-500 hover:text-white"
        >
          Reset All
        </button>

        {teamsWithPrices.length > 0 && targetRevenue > 0 && (
          <button
            onClick={copyPrices}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-gold-500 text-dark-950 hover:bg-gold-400'
            }`}
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy Prices
              </>
            )}
          </button>
        )}

        {teamsWithPrices.length > 0 && targetRevenue > 0 && sport && sport !== 'UFC' && (
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/20 hover:text-gold-300"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export to Whatnot
          </button>
        )}
      </div>

      {/* Whatnot Export Modal */}
      {showExportModal && sport && sport !== 'UFC' && (
        <WhatnotExportModal
          sport={sport}
          teams={teamsWithPrices}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  )
}

// ─── Whatnot Export Modal ──────────────────────────────────────────────

function WhatnotExportModal({
  sport,
  teams,
  onClose,
}: {
  sport: string
  teams: TeamEntry[]
  onClose: () => void
}) {
  const [description, setDescription] = useState(`${sport} PYT Break`)
  const [shippingProfile, setShippingProfile] = useState('1-3 oz')
  const [listingType, setListingType] = useState('Buy it Now')
  const [offerable, setOfferable] = useState('FALSE')
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  const downloadCSV = () => {
    const sorted = [...teams].sort((a, b) => b.price - a.price)
    const subCategory = SPORT_SUB_CATEGORIES[sport] || 'Sports Card Breaks'

    const headers = [
      'Category', 'Sub Category', 'Title', 'Description', 'Quantity', 'Type',
      'Price', 'Shipping Profile', 'Offerable', 'Hazmat', 'Condition',
      'Cost Per Item', 'SKU', 'Image URL 1',
    ]

    const rows = sorted.map((team) => {
      const logoUrl = getTeamLogoUrl(sport, team.name)
      return [
        'Sports Cards',
        subCategory,
        team.name,
        description,
        '1',
        listingType,
        String(Math.round(team.price)),
        shippingProfile,
        offerable,
        'Not Hazmat',
        '',
        '',
        '',
        logoUrl,
      ]
    })

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => {
          // Escape cells that contain commas or quotes
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        }).join(',')
      )
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const today = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `${sport}_PYT_whatnot_${today}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    onClose()
  }

  const selectClass =
    'w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2.5 text-sm text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500'
  const labelClass = 'mb-1.5 block text-xs font-medium text-cage-400'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="mt-20 w-full max-w-md rounded-xl border border-blood-900/40 bg-dark-950 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Export to Whatnot CSV</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-cage-400 transition-colors hover:text-white"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <label htmlFor="export-desc" className={labelClass}>Description</label>
            <input
              id="export-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>

          {/* Shipping Profile */}
          <div>
            <label htmlFor="export-shipping" className={labelClass}>Shipping Profile</label>
            <select
              id="export-shipping"
              value={shippingProfile}
              onChange={(e) => setShippingProfile(e.target.value)}
              className={selectClass}
            >
              {SHIPPING_PROFILES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label htmlFor="export-type" className={labelClass}>Type</label>
            <select
              id="export-type"
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className={selectClass}
            >
              <option value="Buy it Now">Buy it Now</option>
              <option value="Auction">Auction</option>
            </select>
          </div>

          {/* Offerable */}
          <div>
            <label htmlFor="export-offerable" className={labelClass}>Offerable</label>
            <select
              id="export-offerable"
              value={offerable}
              onChange={(e) => setOfferable(e.target.value)}
              className={selectClass}
            >
              <option value="FALSE">FALSE</option>
              <option value="TRUE">TRUE</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        <p className="mt-4 text-xs text-cage-400">
          Exporting {teams.length} team spots
        </p>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-cage-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={downloadCSV}
            className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-bold text-dark-950 transition-colors hover:bg-gold-400"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  )
}
