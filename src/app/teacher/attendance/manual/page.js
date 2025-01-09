import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SAMPLE_STUDENTS, SUBJECTS } from "@/constants/data"
import { CheckSquare } from "lucide-react"
import Link from "next/link"

export default function ManualAttendance() {
  return (
    <main className="container max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manual Attendance</h1>
        <Link href="/teacher/dashboard">
          <Button variant="outline" size="sm">Back</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="w-full" variant="outline">
            <CheckSquare className="mr-2 h-4 w-4" />
            Mark All Present
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SAMPLE_STUDENTS.map((student) => (
              <div key={student.id} className="flex items-center space-x-4">
                <Input type="checkbox" className="w-4 h-4" />
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <Button className="w-full" variant="outline">Export as PDF</Button>
            <Button className="w-full" variant="outline">Share on WhatsApp</Button>
            <Button className="w-full">Save Attendance</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
