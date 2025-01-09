'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { STUDENTS_BY_SECTION, SUBJECTS } from "@/constants/data"
import { CheckSquare, Download, Share } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from "react"
import { jsPDF } from "jspdf"
import { formatDate, createPDFContent } from "@/lib/utils"

export default function ManualAttendance() {
  const searchParams = useSearchParams()
  const section = searchParams.get('section')
  const dateParam = searchParams.get('date')
  const [subject, setSubject] = useState("")
  const [students, setStudents] = useState([])

  useEffect(() => {
    if (section && STUDENTS_BY_SECTION[section]) {
      setStudents(STUDENTS_BY_SECTION[section].map(student => ({
        ...student,
        isPresent: false
      })))
    }
  }, [section])

  const handleMarkAllPresent = () => {
    setStudents(students.map(student => ({
      ...student,
      isPresent: true
    })))
  }

  const handleTogglePresent = (studentId) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, isPresent: !student.isPresent }
        : student
    ))
  }

  const exportToPDF = () => {
    const pdf = new jsPDF()
    const content = createPDFContent(students, section, dateParam, subject)
    
    // Set title
    pdf.setFontSize(16)
    pdf.text('Attendance Report', 105, 15, { align: 'center' })
    
    // Add summary
    let y = 30
    content.summary.forEach(([label, value]) => {
      pdf.setFontSize(10)
      pdf.text(`${label} ${value}`, 20, y)
      y += 7
    })
    
    // Add table header
    y += 10
    pdf.setFillColor(240, 240, 240)
    pdf.rect(20, y - 5, 170, 8, 'F')
    content.header[0].forEach((text, i) => {
      pdf.text(text, i === 0 ? 25 : i === 1 ? 60 : 150, y)
    })
    
    // Add table body
    y += 10
    content.body.forEach((row, index) => {
      const isGray = index % 2 === 0
      if (isGray) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(20, y - 5, 170, 8, 'F')
      }
      row.forEach((text, i) => {
        pdf.text(text, i === 0 ? 25 : i === 1 ? 60 : 150, y)
      })
      y += 8
    })
    
    pdf.save(`attendance-${section}-${formatDate(dateParam)}.pdf`)
  }

  const shareOnWhatsApp = () => {
    const present = students.filter(s => s.isPresent).length
    const message = `Attendance Report for Section ${section} on ${formatDate(dateParam)}
Subject: ${subject || 'N/A'}
Present: ${present}/${students.length} students`
    
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <main className="container max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manual Attendance</h1>
        <Link href="/teacher/dashboard">
          <Button variant="outline" size="sm">Back</Button>
        </Link>
      </div>

      <div id="attendance-content">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <p><strong>Date:</strong> {formatDate(dateParam)}</p>
              <p><strong>Section:</strong> {section}</p>
            </div>
            <Select value={subject} onValueChange={setSubject}>
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

            <Button className="w-full" variant="outline" onClick={handleMarkAllPresent}>
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
            <div className="space-y-2">
              {students.map((student) => (
                <div 
                  key={student.id} 
                  className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer hover:bg-accent ${
                    student.isPresent ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => handleTogglePresent(student.id)}
                >
                  <Input 
                    type="checkbox" 
                    className="w-4 h-4" 
                    checked={student.isPresent}
                    onChange={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Button onClick={exportToPDF} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </Button>
        <Button onClick={shareOnWhatsApp} variant="outline">
          <Share className="mr-2 h-4 w-4" />
          Share on WhatsApp
        </Button>
      </div>
    </main>
  )
}
