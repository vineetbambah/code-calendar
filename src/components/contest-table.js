"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, ExternalLink, Youtube } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default function ContestTable({
  contests,
  bookmarkedContests,
  toggleBookmark,
  loading,
  error,
  showSolutions,
}) {
  if (loading) {
    return <div className="text-center py-8">Loading contests...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (contests.length === 0) {
    return <div className="text-center py-8">No contests found matching your filters.</div>
  }

  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case "codeforces":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "codechef":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "leetcode":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>
            {contests.length} {showSolutions ? "past" : "upcoming"} contests found
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Contest Name</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contests.map((contest) => (
              <TableRow key={contest.id}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleBookmark(contest.id)}
                    title={bookmarkedContests.includes(contest.id) ? "Remove bookmark" : "Bookmark this contest"}
                  >
                    {bookmarkedContests.includes(contest.id) ? (
                      <BookmarkCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{contest.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getPlatformColor(contest.platform)}`}>
                    {contest.platform}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(contest.startTime), "MMM d, yyyy h:mm a")}</TableCell>
                <TableCell>{contest.duration}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={contest.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit
                      </a>
                    </Button>

                    {showSolutions && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(contest.name + " solutions")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Solutions
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}