"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, Check, ExternalLink} from "lucide-react"
import { format } from "date-fns"
import axios from "axios"

export default function AdminContestsPage() {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedContest, setSelectedContest] = useState(null)
  const [solutionUrl, setSolutionUrl] = useState("")
  const [successMessage, setSuccessMessage] = useState(null)
  const router = useRouter()


  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (auth !== "true") {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  useEffect(() => {
    const getContests = async () => {
      try {
        setLoading(true)
        const data = await axios.get("http://localhost:3001/contests")
        setContests(data.data)
      } catch (err) {
        setError("Failed to fetch contests")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      getContests()
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/admin")
  }

  const handleSelectContest = (contest) => {
    setSelectedContest(contest)
    setSolutionUrl(contest.solutionUrl || "")
  }

  const handleSaveSolutionUrl = async () => {
    if (!selectedContest) return

    try {

      const updatedContests = contests.map((contest) =>
        contest.id === selectedContest.id ? { ...contest, solutionUrl } : contest,
      )

      setContests(updatedContests)
      setSelectedContest(null)
      setSolutionUrl("")
      setSuccessMessage(`Solution URL updated for ${selectedContest.name}`)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      setError("Failed to update solution URL")
      console.error(err)
    }
  }

  if (!isAuthenticated) {
    return <div className="text-center py-8">Checking authentication...</div>
  }

  if (loading) {
    return <div className="text-center py-8">Loading contests...</div>
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
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Admin Panel - Manage Contests</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-[1fr_400px] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>All Contests</CardTitle>
            <CardDescription>Select a contest to update its solution URL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contest Name</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Solution URL</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contests.map((contest) => (
                      <TableRow key={contest.id} className={selectedContest?.id === contest.id ? "bg-muted/50" : ""}>
                        <TableCell className="font-medium">{contest.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getPlatformColor(contest.platform)}`}>
                            {contest.platform}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(contest.startTime), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {contest.solutionUrl ? (
                            <span className="text-green-600 dark:text-green-400">Set</span>
                          ) : (
                            <span className="text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleSelectContest(contest)}>
                              Edit
                            </Button>
                            {contest.url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={contest.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Visit
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
          </CardContent>
        </Card>

        {selectedContest && (
          <Card>
            <CardHeader>
              <CardTitle>Update Solution URL</CardTitle>
              <CardDescription>
                Editing: <strong>{selectedContest.name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="solutionUrl">Solution URL</Label>
                <Input
                  id="solutionUrl"
                  placeholder="https://youtube.com/..."
                  value={solutionUrl}
                  onChange={(e) => setSolutionUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter a YouTube video or playlist URL with solutions for this contest
                </p>
              </div>

              {solutionUrl && (
                <div className="pt-2">
                  <Label className="mb-2 block">Preview</Label>
                  <Button size="sm" variant="outline" asChild>
                    <a href={solutionUrl} target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-4 w-4 mr-1" />
                      View Solutions
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedContest(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSolutionUrl}>Save Changes</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

