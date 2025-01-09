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
import { processImage } from "@/lib/faceRecognition"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function CameraAttendance() {
  const searchParams = useSearchParams()
  const section = searchParams.get('section')
  const dateParam = searchParams.get('date')
  const { toast } = useToast()

  const [students, setStudents] = useState([])
  const [showCamera, setShowCamera] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [showFrames, setShowFrames] = useState(false)
  const webcamRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    if (section && STUDENTS_BY_SECTION[section]) {
      setStudents(STUDENTS_BY_SECTION[section].map(student => ({
        ...student,
        isPresent: false
      })))
    }
  }, [section])

  const handleImageError = (error) => {
    console.error('Error processing image:', error)
    toast({
      title: "Error",
      description: "Failed to process image. Please try again with a clearer photo.",
      variant: "destructive"
    })
    setProcessing(false)
  }

  const processUploadedImage = async (imageUrl) => {
    if (!imageUrl) {
      handleImageError(new Error('No image provided'))
      return
    }

    setProcessing(true)
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = imageUrl
      })
      
      const updatedStudents = await processImage(img, students)
      setStudents(updatedStudents)
      
      const presentCount = updatedStudents.filter(s => s.isPresent).length
      toast({
        title: "Attendance Marked",
        description: `Found ${presentCount} students in the image`
      })
    } catch (error) {
      handleImageError(error)
    } finally {
      setProcessing(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const imageData = e.target?.result
        if (typeof imageData !== 'string') {
          throw new Error('Invalid image data')
        }
        setUploadedImage(imageData)
        await processUploadedImage(imageData)
      } catch (error) {
        handleImageError(error)
      }
    }
    
    reader.onerror = () => handleImageError(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  }

  const capture = useCallback(async () => {
    try {
      const imageSrc = webcamRef.current?.getScreenshot()
      if (!imageSrc) {
        throw new Error('Failed to capture photo')
      }
      setUploadedImage(imageSrc)
      setShowCamera(false)
      await processUploadedImage(imageSrc)
    } catch (error) {
      handleImageError(error)
    }
  }, [])

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
        <h1 className="text-2xl font-bold">Camera Attendance</h1>
        <Link href="/teacher/dashboard">
          <Button variant="outline" size="sm">Back</Button>
        </Link>
      </div>

      {showCamera ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
              />
              {showFrames && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
              )}
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex gap-4">
                <Button 
                  className="w-full" 
                  onClick={capture}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Capture Photo'}
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => setShowCamera(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowFrames(!showFrames)}
              >
                {showFrames ? 'Hide Face Frames' : 'Show Face Frames'}
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
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent cursor-pointer",
                processing && "opacity-50"
              )}
              onClick={() => !processing && fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <div className="relative">
                  <img 
                    ref={imageRef}
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  {showFrames && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
                  )}
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to upload or drag and drop photos here
                  </p>
                </>
              )}
              {processing && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                  <p>Processing image...</p>
                </div>
              )}
            </div>

            <div className="text-center">
              <p>OR</p>
            </div>

            <Button 
              className="w-full" 
              variant="outline" 
              onClick={() => setShowCamera(true)}
              disabled={processing}
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>

            {uploadedImage && (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowFrames(!showFrames)}
              >
                {showFrames ? 'Hide Face Frames' : 'Show Face Frames'}
              </Button>
            )}
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
      </div>

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
