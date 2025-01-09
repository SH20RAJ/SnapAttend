'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { STUDENTS_BY_SECTION } from "@/constants/data"
import { Camera, Download, Share, Upload } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import { jsPDF } from "jspdf"
import { formatDate, createPDFContent } from "@/lib/utils"

export default function CameraAttendance() {
  const searchParams = useSearchParams()
  const section = searchParams.get('section')
  const dateParam = searchParams.get('date')

  const [students, setStudents] = useState([])
  const [showCamera, setShowCamera] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const webcamRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (section && STUDENTS_BY_SECTION[section]) {
      setStudents(STUDENTS_BY_SECTION[section].map(student => ({
        ...student,
        isPresent: false
      })))
    }
  }, [section])

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result)
        // In a real app, this would process the image for facial recognition
        // For now, we'll just show a random selection of present students
        setStudents(students.map(student => ({
          ...student,
          isPresent: Math.random() > 0.3 // 70% chance of being present
        })))
      }
      reader.readAsDataURL(file)
    }
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setUploadedImage(imageSrc)
      // In a real app, this would process the image for facial recognition
      // For now, we'll just show a random selection of present students
      setStudents(students.map(student => ({
        ...student,
        isPresent: Math.random() > 0.3 // 70% chance of being present
      })))
      setShowCamera(false)
    }
  }, [students])

  const handleTogglePresent = (studentId) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, isPresent: !student.isPresent }
        : student
    ))
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
    
    pdf.save(`attendance-${section}-${formatDate(dateParam)}.pdf`)
  }

  const shareOnWhatsApp = () => {
    const present = students.filter(s => s.isPresent).length
    const message = `Attendance Report for Section ${section} on ${formatDate(dateParam)}
Present: ${present}/${students.length} students`
    
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <main className="container max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Camera Attendance</h1>
        <Link href="/teacher/dashboard">
          <Button variant="outline" size="sm">Back</Button>
        </Link>
      </div>

      {showCamera ? (
        <Card>
          <CardContent className="p-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
            />
            <div className="mt-4 flex gap-4">
              <Button className="w-full" onClick={capture}>
                Capture Photo
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setShowCamera(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upload Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="max-h-48 mx-auto rounded-lg"
                />
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to upload or drag and drop photos here
                  </p>
                </>
              )}
            </div>

            <div className="text-center">
              <p>OR</p>
            </div>

            <Button className="w-full" variant="outline" onClick={() => setShowCamera(true)}>
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </CardContent>
        </Card>
      )}

      <div id="attendance-content">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 mb-4">
              <p><strong>Date:</strong> {formatDate(dateParam)}</p>
              <p><strong>Section:</strong> {section}</p>
            </div>
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
