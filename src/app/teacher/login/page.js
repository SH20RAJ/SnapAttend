import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function TeacherLogin() {
  return (
    <main className="container max-w-lg mx-auto p-4 space-y-4 pt-10">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Login</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="teacher@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
            <Link href="/teacher/dashboard">
              <Button className="w-full">Login</Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
