"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import ContestTable from "./contest-table"
import ThemeToggle from "./theme-toggle"
import { fetchContests } from "@/lib/api.jsx"

export default function ContestTracker() {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookmarkedContests, setBookmarkedContests] = useState([])
  const [filters, setFilters] = useState({
    platform: {
      codeforces: true,
      codechef: true,
      leetcode: true,
    },
    dateRange: {
      from: undefined,
      to: undefined,
    },
  })

  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedContests")
    if (savedBookmarks) {
      setBookmarkedContests(JSON.parse(savedBookmarks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("bookmarkedContests", JSON.stringify(bookmarkedContests))
  }, [bookmarkedContests])

  useEffect(() => {
    const getContests = async () => {
      try {
        setLoading(true)
        const data = await fetchContests()
        setContests(data)
      } catch (err) {
        setError("Failed to fetch contests. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    getContests()
  }, [])

  const toggleBookmark = (contestId) => {
    setBookmarkedContests((prev) => {
      if (prev.includes(contestId)) {
        return prev.filter((id) => id !== contestId)
      } else {
        return [...prev, contestId]
      }
    })
  }

  const handlePlatformChange = (platform) => {
    setFilters((prev) => ({
      ...prev,
      platform: {
        ...prev.platform,
        [platform]: !prev.platform[platform],
      },
    }))
  }

  const handleDateChange = (range) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        from: range.from,
        to: range.to,
      },
    }))
  }

  const filterContests = (contests, upcoming) => {
    const now = new Date()

    return contests.filter((contest) => {
      // Filter by upcoming/past
      const contestDate = new Date(contest.startTime)
      const isUpcoming = contestDate > now
      if (upcoming !== isUpcoming) return false

      // Filter by platform
      if (!filters.platform[contest.platform]) return false

      // Filter by search term
      if (filters.search && !contest.name.toLowerCase().includes(filters.search.toLowerCase())) return false

      // Filter by date range
      if (filters.dateRange.from && contestDate < filters.dateRange.from) return false
      if (filters.dateRange.to) {
        const endOfDay = new Date(filters.dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        if (contestDate > endOfDay) return false
      }

      return true
    })
  }

  const upcomingContests = filterContests(contests, true)
  const pastContests = filterContests(contests, false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-x-2">
            <Label className="mr-2">Platforms:</Label>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="codeforces"
                  checked={filters.platform.codeforces}
                  onCheckedChange={() => handlePlatformChange("codeforces")}
                />
                <Label htmlFor="codeforces">Codeforces</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="codechef"
                  checked={filters.platform.codechef}
                  onCheckedChange={() => handlePlatformChange("codechef")}
                />
                <Label htmlFor="codechef">CodeChef</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leetcode"
                  checked={filters.platform.leetcode}
                  onCheckedChange={() => handlePlatformChange("leetcode")}
                />
                <Label htmlFor="leetcode">LeetCode</Label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y")} - {format(filters.dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                "Pick a date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              selected={{
                from: filters.dateRange.from,
                to: filters.dateRange.to,
              }}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <div className="hidden md:block">
        <ThemeToggle />
        </div> 
      </div>
      </div>

      

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Contests</TabsTrigger>
          <TabsTrigger value="past">Past Contests</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <ContestTable
            contests={upcomingContests}
            bookmarkedContests={bookmarkedContests}
            toggleBookmark={toggleBookmark}
            loading={loading}
            error={error}
            showSolutions={false}
          />
        </TabsContent>
        <TabsContent value="past">
          <ContestTable
            contests={pastContests}
            bookmarkedContests={bookmarkedContests}
            toggleBookmark={toggleBookmark}
            loading={loading}
            error={error}
            showSolutions={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

