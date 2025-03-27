"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Github, Mail, Loader2 } from "lucide-react"

export interface AuthFormProps {
  onSubmit?: (event: React.FormEvent, type: "login" | "register" | "reset") => void;
  loading?: boolean;
  onGoogleSignIn?: () => void;
  onGithubSignIn?: () => void;
}

export function AuthForm({ onSubmit, loading = false, onGoogleSignIn, onGithubSignIn }: AuthFormProps) {
  const [isResettingPassword, setIsResettingPassword] = React.useState(false)
  const emailId = React.useId()
  const passwordId = React.useId()
  const nameId = React.useId()
  const confirmPasswordId = React.useId()
  const rememberMeId = React.useId()

  const handleLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit?.(event, "login")
  }

  const handleRegisterSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit?.(event, "register")
  }

  const handleResetSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit?.(event, "reset")
  }

  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-8">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            {isResettingPassword 
              ? "Enter your email to reset your password" 
              : "Sign in to your account or create a new one"}
          </CardDescription>
        </CardHeader>
        
        {isResettingPassword ? (
          <CardContent>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={emailId}>Email</Label>
                <Input 
                  id={emailId} 
                  name="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <Button 
                type="button" 
                variant="link" 
                className="w-full" 
                onClick={() => setIsResettingPassword(false)}
                disabled={loading}
              >
                Back to login
              </Button>
            </form>
          </CardContent>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" disabled={loading}>Login</TabsTrigger>
              <TabsTrigger value="register" disabled={loading}>Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={onGithubSignIn}
                    disabled={loading}
                    type="button"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={onGoogleSignIn}
                    disabled={loading}
                    type="button"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={emailId}>Email</Label>
                    <Input 
                      id={emailId} 
                      name="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={passwordId}>Password</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 text-xs" 
                        onClick={() => setIsResettingPassword(true)}
                        disabled={loading}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input 
                      id={passwordId} 
                      name="password" 
                      type="password" 
                      required 
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id={rememberMeId} disabled={loading} />
                    <Label htmlFor={rememberMeId} className="text-sm font-normal text-gray-500">
                      Remember me
                    </Label>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="register">
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={onGithubSignIn}
                    disabled={loading}
                    type="button"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={onGoogleSignIn}
                    disabled={loading}
                    type="button"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={nameId}>Full Name</Label>
                    <Input 
                      id={nameId} 
                      name="name" 
                      placeholder="John Doe" 
                      required 
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`register-${emailId}`}>Email</Label>
                    <Input 
                      id={`register-${emailId}`} 
                      name="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`register-${passwordId}`}>Password</Label>
                    <Input 
                      id={`register-${passwordId}`} 
                      name="password" 
                      type="password" 
                      required 
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={confirmPasswordId}>Confirm Password</Label>
                    <Input 
                      id={confirmPasswordId} 
                      name="confirmPassword" 
                      type="password" 
                      required 
                      disabled={loading}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        )}
        
        <CardFooter className="flex justify-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-blue-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-blue-600">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 