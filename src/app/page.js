import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container max-w-lg mx-auto p-4 space-y-4 pt-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">SnapAttend</h1>
        <p className="text-muted-foreground">AI-powered attendance system</p>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Teacher Login</CardTitle>
            <CardDescription>Access attendance management system</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/teacher/login">
              <Button className="w-full">Login as Teacher</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Login</CardTitle>
            <CardDescription>View your attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
