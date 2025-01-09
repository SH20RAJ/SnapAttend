'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { STUDENTS_BY_SECTION } from "@/constants/data"
import { Download, Share } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from "react"
import { jsPDF } from "jspdf"
import { formatDate, createPDFContent } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

function ManualAttendanceContent() {
  const searchParams = useSearchParams()
  const section = searchParams.get('section')
  const dateParam = searchParams.get('date')
  const { toast } = useToast()

  const [students, setStudents] = useState([])

  useEffect(() => {
    if (section && STUDENTS_BY_SECTION[section]) {
      setStudents(STUDENTS_BY_SECTION[section].map(student => ({
        ...student,
        isPresent: false
      })))
    }
  }, [section])

  const handleTogglePresent = (studentId) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, isPresent: !student.isPresent }
        : student
    ))
  }

  const handleToggleAll = (present) => {
    setStudents(students.map(student => ({
      ...student,
      isPresent: present
    })))
  }

  const exportToPDF = () => {
    const pdf = new jsPDF()
    const content = createPDFContent(students, section, dateParam)
    
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
    
    return pdf
  }

  const downloadPDF = () => {
    try {
      const pdf = exportToPDF()
      pdf.save(`attendance-${section}-${formatDate(dateParam)}.pdf`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      })
    }
  }

  const shareOnWhatsApp = async () => {
    try {
      const pdf = exportToPDF()
      const pdfBlob = pdf.output('blob')
      const pdfFile = new File([pdfBlob], `attendance-${section}-${formatDate(dateParam)}.pdf`, { type: 'application/pdf' })
      
      const present = students.filter(s => s.isPresent).length
      const message = `Attendance Report for Section ${section} on ${formatDate(dateParam)}
Present: ${present}/${students.length} students`
      
      if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            text: message,
            title: 'Attendance Report'
          })
        } catch (error) {
          if (error.name !== 'AbortError') {
            throw error
          }
        }
      } else {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share attendance. Please try again.",
        variant: "destructive"
      })
    }
  }

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
          <CardTitle>Attendance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 mb-4">
            <p><strong>Date:</strong> {formatDate(dateParam)}</p>
            <p><strong>Section:</strong> {section}</p>
          </div>

          <div className="flex gap-2 mb-4">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleToggleAll(true)}
            >
              Mark All Present
            </Button>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleToggleAll(false)}
            >
              Mark All Absent
            </Button>
          </div>

          <div className="space-y-2">
            {students.map((student) => (
              <div 
                key={student.id} 
                className={cn(
                  "flex items-center space-x-4 p-2 rounded-lg cursor-pointer hover:bg-accent",
                  student.isPresent && "bg-accent/50"
                )}
                onClick={() => handleTogglePresent(student.id)}
              >
                <Input 
                  type="checkbox" 
                  className="w-4 h-4" 
                  checked={student.isPresent}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleTogglePresent(student.id)
                  }}
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

      <div className="grid gap-4">
        <Button onClick={downloadPDF} variant="outline">
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

export default function ManualAttendance() {
  return (
    <Suspense fallback={
      <div className="container max-w-lg mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent rounded w-1/3"></div>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-accent rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ManualAttendanceContent />
    </Suspense>
  )
}
