
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface AdminLoginFormProps {
  onLogin: () => void;
}
const adminUser = "AKAMAKANAKA";
const adminPassword = "ISTIUSTINAMASTI"; 

export function AdminLoginForm({ onLogin }: AdminLoginFormProps) {
  const [adminUsername, setAdminUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (adminUsername === adminUser && password === adminPassword) {
      onLogin();
      localStorage.setItem("admin-auth", "yes");
      toast.success("Admin login successful");
    } else {
      toast.error("Invalid username or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">Username</label>
            <Input
              id="username"
              type="text"
              autoFocus
              placeholder="Enter username"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Admin Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>Login</Button>
          {/* <p className="text-xs text-center text-muted-foreground mt-4">
            Use username "admin" and password "admin123" (demo)
          </p> */}
        </CardContent>
      </Card>
    </div>
  );
}
