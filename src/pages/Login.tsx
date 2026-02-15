import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  /* ✅ Auto redirect if already logged in */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isRegister
        ? "http://localhost:5000/api/users/register"
        : "http://localhost:5000/api/users/login";

      const bodyData = isRegister
        ? { name, email: username, password }
        : { email: username, password };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      /* ✅ Register Success */
      if (isRegister) {
        toast.success("Registration successful. Please login.");
        setIsRegister(false);
        setName("");
        setPassword("");
        return;
      }

      /* ✅ Login Success */
      login(data.token); // update context
      toast.success("Login successful");
      navigate("/dashboard");

    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isRegister ? "Create Account" : "Gold Vault Login"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {isRegister && (
              <div>
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading
                ? "Please wait..."
                : isRegister
                ? "Register"
                : "Login"}
            </Button>
          </form>

          <p className="text-center mt-4 text-sm">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button
              className="ml-2 text-blue-500 font-semibold"
              type="button"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
