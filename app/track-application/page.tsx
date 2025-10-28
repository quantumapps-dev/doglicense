"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Search, Calendar, CheckCircle, Dog, User, MapPin, Phone } from "lucide-react"
import { toast } from "sonner"

interface DogLicenseApplication {
  trackingNumber: string
  submittedAt: string
  status: string
  ownerFirstName: string
  ownerLastName: string
  ownerAddress: string
  ownerCity: string
  ownerZipCode: string
  ownerPhone: string
  dogName: string
  dogBreed: string
  dogAge: number
  dogColor: string
  dogGender: string
  spayedNeutered: string
}

export default function TrackApplication() {
  const [applicationId, setApplicationId] = useState("")
  const [application, setApplication] = useState<DogLicenseApplication | null>(null)
  const [isSearched, setIsSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  const searchApplication = () => {
    if (!applicationId.trim() || !isMounted) {
      toast.error("Please enter a tracking number")
      return
    }

    setIsLoading(true)
    setIsSearched(true)

    // Simulate API call delay
    setTimeout(() => {
      try {
        console.log("[v0] Searching for tracking number:", applicationId.trim())

        // Get all applications from localStorage
        const storedApplications = localStorage.getItem("dogLicenseApplications")
        console.log("[v0] Retrieved from localStorage:", storedApplications)

        if (storedApplications) {
          const applications: DogLicenseApplication[] = JSON.parse(storedApplications)
          console.log("[v0] Parsed applications:", applications)

          // Find the application with matching tracking number
          const foundApplication = applications.find(
            (app) => app.trackingNumber.toUpperCase() === applicationId.trim().toUpperCase(),
          )

          console.log("[v0] Found application:", foundApplication)

          if (foundApplication) {
            setApplication(foundApplication)
            toast.success("Application found!")
          } else {
            setApplication(null)
            toast.error("Application not found")
          }
        } else {
          console.log("[v0] No applications found in localStorage")
          setApplication(null)
          toast.error("No applications found")
        }
      } catch (error) {
        console.error("[v0] Error reading from localStorage:", error)
        setApplication(null)
        toast.error("Error retrieving application")
      }
      setIsLoading(false)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchApplication()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Track Your Dog License Application</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enter your tracking number to check the status and details of your application.
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Find Your Application</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Enter your unique tracking number below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="e.g., DOG-XXXXXXXXX-XXXXX"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-center text-lg py-6 border-2 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading || !isMounted}
              />
            </div>
            <Button
              onClick={searchApplication}
              disabled={isLoading || !applicationId.trim() || !isMounted}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Track Application
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isSearched && (
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">Searching for your application...</p>
                </div>
              ) : application ? (
                <div className="space-y-6">
                  {/* Application Found - Status Badge */}
                  <div className="border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Found</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Tracking Number:{" "}
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            {application.trackingNumber}
                          </span>
                        </p>
                      </div>
                      <Badge className="bg-green-600 text-white border-0 px-4 py-2 text-base">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {application.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted: {formatDate(application.submittedAt)}</span>
                    </div>
                  </div>

                  {/* Owner Information */}
                  <Card className="border-2 border-gray-200 dark:border-gray-700">
                    <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                      <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        Owner Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                          <p className="text-base text-gray-900 dark:text-white">
                            {application.ownerFirstName} {application.ownerLastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                          <p className="text-base text-gray-900 dark:text-white flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {application.ownerPhone}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Address</p>
                          <p className="text-base text-gray-900 dark:text-white flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                            <span>
                              {application.ownerAddress}
                              <br />
                              {application.ownerCity}, {application.ownerZipCode}
                            </span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dog Information */}
                  <Card className="border-2 border-gray-200 dark:border-gray-700">
                    <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                      <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
                        <Dog className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        Dog Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Dog's Name</p>
                          <p className="text-base text-gray-900 dark:text-white font-semibold">{application.dogName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Breed</p>
                          <p className="text-base text-gray-900 dark:text-white">{application.dogBreed}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Age</p>
                          <p className="text-base text-gray-900 dark:text-white">
                            {application.dogAge} {application.dogAge === 1 ? "year" : "years"} old
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Gender</p>
                          <p className="text-base text-gray-900 dark:text-white">{application.dogGender}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Color/Markings</p>
                          <p className="text-base text-gray-900 dark:text-white">{application.dogColor}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Spayed/Neutered</p>
                          <p className="text-base text-gray-900 dark:text-white">{application.spayedNeutered}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Information */}
                  <Card className="border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">Application Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Application Submitted</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {formatDate(application.submittedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Under Review</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Pending</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">License Issued</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Pending</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Note:</strong> Your application has been successfully submitted and is currently being
                          processed. You will be notified once your dog license has been approved and issued.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Application Not Found</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                    We couldn't find an application with tracking number "{applicationId}".
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2 max-w-md mx-auto">
                    <p className="font-semibold">Please check:</p>
                    <ul className="list-disc list-inside space-y-2 text-left">
                      <li>The tracking number is entered correctly</li>
                      <li>The application was submitted on this device and browser</li>
                      <li>Your browser's local storage hasn't been cleared</li>
                      <li>The tracking number format matches the one provided after submission</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        {!isSearched && (
          <Card className="mt-8 shadow-xl border-0 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
              <p className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Tracking numbers are generated automatically when you submit a new dog license application</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Make sure you're using the same browser and device where you submitted your application</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Save your tracking number in a safe place for future reference</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>If you can't find your tracking number, you may need to submit a new application</span>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
