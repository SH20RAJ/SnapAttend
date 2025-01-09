import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) return ''
  return format(new Date(date), 'dd/MM/yyyy')
}

export function createPDFContent(students, section, date, subject) {
  const present = students.filter(s => s.isPresent).length
  const absent = students.length - present
  
  return {
    header: [
      ['Roll No.', 'Name', 'Status']
    ],
    body: students.map(student => [
      student.rollNumber,
      student.name,
      student.isPresent ? 'Present' : 'Absent'
    ]),
    summary: [
      ['Date:', formatDate(date)],
      ['Section:', section],
      ['Subject:', subject || 'N/A'],
      ['Total Students:', students.length.toString()],
      ['Present:', present.toString()],
      ['Absent:', absent.toString()]
    ]
  }
}
