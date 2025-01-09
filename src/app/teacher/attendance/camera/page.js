import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SAMPLE_STUDENTS } from "@/constants/data"
import { Camera, Upload } from "lucide-react"
import Link from "next/link"

export default function CameraAttendance() {
  return (
    <main className="container max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Camera Attendance</h1>
        <Link href="/teacher/dashboard">
          <Button variant="outline" size="sm">Back</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent cursor-pointer"
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Click to upload or drag and drop photos here
            </p>
          </div>

          <div className="text-center">
            <p>OR</p>
          </div>

          <Button className="w-full" variant="outline">
            <Camera className="mr-2 h-4 w-4" />
            Take Photo
          </Button>

          <Button className="w-full">Run Analysis</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Results</CardTitle>
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
