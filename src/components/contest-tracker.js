"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import ContestTable from "./contest-table";
import axios from "axios";

export default function ContestTracker() {
  const [contests, setContests] = useState([]); // Fix SSR issue (null avoids hydration error)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedContests, setBookmarkedContests] = useState([]);


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
  });

  // ✅ Correct API fetching
  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3001/contests");
        setContests(res.data);
      } catch (err) {
        setError("Failed to fetch contests. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContests(); // ✅ Call the function inside useEffect
  }, []);

  // ✅ Load bookmarked contests from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedContests");
    if (savedBookmarks) {
      setBookmarkedContests(JSON.parse(savedBookmarks));
    }
  }, []);

  // ✅ Save bookmarks to localStorage
  useEffect(() => {
    if (bookmarkedContests.length > 0) {
      localStorage.setItem("bookmarkedContests", JSON.stringify(bookmarkedContests));
    }
  }, [bookmarkedContests]);

  const toggleBookmark = (contestId) => {
    setBookmarkedContests((prev) => {
      if (prev.includes(contestId)) {
        return prev.filter((id) => id !== contestId);
      } else {
        return [...prev, contestId];
      }
    });
  };

  const handlePlatformChange = (platform) => {
    setFilters((prev) => ({
      ...prev,
      platform: {
        ...prev.platform,
        [platform]: !prev.platform[platform],
      },
    }));
  };

  const handleDateChange = (range) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        from: range.from,
        to: range.to,
      },
    }));
  };

  const filterContests = (contests, upcoming) => {
    if (!contests) return []; // ✅ Prevents hydration issues

    const now = new Date();

    return contests.filter((contest) => {
      const contestDate = new Date(contest.startTime);
      const isUpcoming = contestDate > now;
      if (upcoming !== isUpcoming) return false;

      if (!filters.platform[contest.platform]) return false;

      if (filters.dateRange.from && contestDate < filters.dateRange.from) return false;
      if (filters.dateRange.to) {
        const endOfDay = new Date(filters.dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        if (contestDate > endOfDay) return false;
      }

      return true;
    });
  };
  const getBookmarkedContests = () => {
    if (!contests || contests.length === 0 || !bookmarkedContests.length) {
      return [];
    }
    return contests.filter((contest) => bookmarkedContests.includes(contest.id));
  };
  const upcomingContests = filterContests(contests, true);
  const pastContests = filterContests(contests, false);
  const bookmarkedContestsList = getBookmarkedContests()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-x-2">
            <Label className="mr-2">Platforms:</Label>
            <div className="flex flex-wrap gap-2">
              {["codeforces", "codechef", "leetcode"].map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform}
                    checked={filters.platform[platform]}
                    onCheckedChange={() => handlePlatformChange(platform)}
                  />
                  <Label htmlFor={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  `${format(filters.dateRange.from, "LLL dd, y")} - ${format(filters.dateRange.to, "LLL dd, y")}`
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
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Contests</TabsTrigger>
          <TabsTrigger value="past">Past Contests</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked Contests</TabsTrigger>
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
        <TabsContent value="bookmarked">
          <ContestTable
            contests={bookmarkedContestsList}
            bookmarkedContests={bookmarkedContests}
            toggleBookmark={toggleBookmark}
            loading={loading}
            error={error}
            showSolutions={true}
            emptyMessage="You haven't bookmarked any contests yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
