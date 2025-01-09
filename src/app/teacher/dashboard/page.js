import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SECTIONS } from "@/constants/data"
import { CalendarIcon, Camera, ClipboardList } from "lucide-react"
import Link from "next/link"

export default function TeacherDashboard() {
  return (
    <main className="container max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <Link href="/">
          <Button variant="outline" size="sm">Logout</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Take Attendance</CardTitle>
          <CardDescription>Select date and section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="w-full">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Select Date
            </Button>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((section) => (
                  <SelectItem key={section} value={section}>
                    Section {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            <Link href="/teacher/attendance/camera">
              <Button className="w-full h-24 text-lg" variant="outline">
                <Camera className="mr-2 h-6 w-6" />
                Start Camera Attendance
              </Button>
            </Link>

            <Link href="/teacher/attendance/manual">
              <Button className="w-full h-24 text-lg" variant="outline">
                <ClipboardList className="mr-2 h-6 w-6" />
                Manual Attendance
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
