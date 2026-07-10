import React, { useState } from "react";
import { Container } from "./container";
import { LogoSVG } from "./logo";
import { Heading } from "./heading";
import { SubHeading } from "./subheading";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./button";
import { GoogleIcon, AppleIcon, GithubIcon } from "../landingSettings/icons/general";
import { Link, useNavigate } from "react-router-dom";
import { AuthIllustration } from "./auth-illustration";
import { api } from "../src/utils/api";
import { ArrowRight } from "lucide-react";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      
      // Save token and user details in localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      const searchParams = new URLSearchParams(window.location.search);
      const plan = searchParams.get("plan");
      if (plan && plan !== "FREE") {
        navigate(`/dashboard/chat?plan=${plan}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-h-[calc(100vh-8rem)] py-10 md:py-20">
      <div className="grid grid-cols-1 gap-10 px-4 md:grid-cols-2 md:px-8 lg:gap-40">
        <div>
          <Link to="/">
            <LogoSVG />
          </Link>
          <Heading className="mt-4 text-left lg:text-4xl">
            Welcome back
          </Heading>
          <SubHeading as="p" className="mt-4 max-w-xl text-left">
            Continue building and operating production AI systems from your Cognify workspace.
          </SubHeading>
          
          {error && (
            <div className="mt-4 p-3.5 rounded-xl border border-red-900/30 bg-red-500/10 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-8">
            <div className="flex flex-col">
              <Label className="text-muted-foreground text-[13px] mb-2 font-medium">Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-border focus:border-brand text-foreground bg-surface-2 rounded-lg py-5 px-4"
                placeholder="name@company.com"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col">
              <Label className="text-muted-foreground text-[13px] mb-2 font-medium">Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-border focus:border-brand text-foreground bg-surface-2 rounded-lg py-5 px-4"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between -mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border bg-surface-2 text-brand focus:ring-brand size-4 cursor-pointer" />
                <span className="text-sm text-muted-foreground font-medium">Remember me</span>
              </label>
              <a href="#" className="text-brand text-sm font-medium hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" disabled={loading} className="group w-full py-5 rounded-lg flex items-center justify-center gap-2">
              {loading ? "Signing in..." : (
                <>
                  Continue <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
          <div className="mt-10 text-left">
            <span className="text-[15px] text-muted-foreground font-medium">
              New to Cognify?{" "}
            </span>
            <Link
              to={`/sign-up${window.location.search}`}
              className="text-brand text-[15px] font-medium hover:underline inline-flex items-center gap-1"
            >
              Create your workspace <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <AuthIllustration />
      </div>
    </Container>
  );
};

