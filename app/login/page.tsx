"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useTheme } from "@/app/components/providers";

// Prevent static generation during build time
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { theme } = useTheme();

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Sign in with email and password
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        router.push("/");
        router.refresh();
      } else {
        // Sign up with email and password
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });

        if (error) throw error;
        
        // For now, alert the user, in production you might want to auto-sign in or redirect
        alert("Registration successful! Please check your email for confirmation.");
        setIsLogin(true);
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred");
      console.error("Authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google");
      console.error("Google sign-in error:", error);
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || "Failed to sign in with GitHub");
      console.error("GitHub sign-in error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Animated background */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-blue-600 dark:bg-black flex-col justify-between p-10">
        <BackgroundBeams />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
              <span className="text-blue-600 font-bold text-xl">UI</span>
            </div>
            <span className="ml-3 text-white font-semibold text-xl">UIP Admin</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to UIP Admin</h1>
          <p className="text-blue-100 text-lg">
            Log in to access your account or register for full access to our
            powerful administration tools.
          </p>
        </div>
        
        <div className="relative z-10 text-blue-100 text-sm">
          © {new Date().getFullYear()} UIP Admin. All rights reserved.
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-black">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center justify-center mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600">
              <span className="text-white font-bold text-xl">UI</span>
            </div>
            <span className="ml-3 text-gray-900 dark:text-white font-semibold text-xl">UIP Admin</span>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Sign in to your account or create a new one
              </p>
            </div>
            
            {/* Login/Register tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium ${
                  isLogin
                    ? "text-blue-600 dark:text-white border-b-2 border-blue-600 dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-medium ${
                  !isLogin
                    ? "text-blue-600 dark:text-white border-b-2 border-blue-600 dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Register
              </button>
            </div>
            
            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={handleGithubSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-charcoal hover:bg-gray-50 dark:hover:bg-dark-hover text-gray-800 dark:text-gray-200 disabled:opacity-70"
              >
                <svg className="h-5 w-5" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/>
                </svg>
                <span className="text-sm">GitHub</span>
              </button>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-charcoal hover:bg-gray-50 dark:hover:bg-dark-hover text-gray-800 dark:text-gray-200 disabled:opacity-70"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                </svg>
                <span className="text-sm">Google</span>
              </button>
            </div>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            
            {/* Auth form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-70"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      className="text-xs text-blue-600 dark:text-white hover:text-blue-800 dark:hover:text-gray-300"
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-70"
                />
              </div>
              
              {isLogin && (
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-700 rounded focus:ring-blue-500 disabled:opacity-70"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500 dark:text-gray-400">
                    Remember me
                  </label>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  "Sign in"
                ) : (
                  "Sign up"
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By continuing, you agree to our{" "}
                <a href="#" className="underline text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 