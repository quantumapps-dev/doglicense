"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  ownerFirstName: z.string().min(2, "First name must be at least 2 characters"),
  ownerLastName: z.string().min(2, "Last name must be at least 2 characters"),
  ownerAddress: z.string().min(5, "Address must be at least 5 characters"),
  ownerCity: z.string().min(2, "City must be at least 2 characters"),
  ownerZipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
  ownerPhone: z.string().regex(/^[\d\s\-$$$$]+$/, "Please enter a valid phone number"),
  dogName: z.string().min(2, "Dog name must be at least 2 characters"),
  dogBreed: z.string().min(2, "Breed must be at least 2 characters"),
  dogAge: z.coerce.number().positive("Age must be a positive number"),
  dogColor: z.string().min(2, "Color must be at least 2 characters"),
  dogGender: z.enum(["Male", "Female"], {
    required_error: "Please select a gender",
  }),
  spayedNeutered: z.enum(["Yes", "No"], {
    required_error: "Please select an option",
  }),
})

type FormData = z.infer<typeof formSchema>

const STEPS = [
  {
    title: "Owner Information",
    description: "Please provide your contact details",
    fields: ["ownerFirstName", "ownerLastName", "ownerAddress", "ownerCity", "ownerZipCode", "ownerPhone"] as const,
  },
  {
    title: "Dog Information",
    description: "Tell us about your dog",
    fields: ["dogName", "dogBreed", "dogAge", "dogColor", "dogGender", "spayedNeutered"] as const,
  },
]

function generateTrackingNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `DOG-${timestamp}-${random}`.toUpperCase()
}

export default function NewApplication() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerFirstName: "",
      ownerLastName: "",
      ownerAddress: "",
      ownerCity: "",
      ownerZipCode: "",
      ownerPhone: "",
      dogName: "",
      dogBreed: "",
      dogAge: 0,
      dogColor: "",
      dogGender: undefined,
      spayedNeutered: undefined,
    },
    mode: "onChange",
  })

  const currentStepFields = STEPS[currentStep].fields

  const validateCurrentStep = async () => {
    const fieldsToValidate = currentStepFields as unknown as (keyof FormData)[]
    const isValid = await form.trigger(fieldsToValidate)
    return isValid
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    } else {
      toast.error("Please fill in all required fields correctly")
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const onSubmit = async (data: FormData) => {
    if (!isMounted) return

    try {
      const newTrackingNumber = generateTrackingNumber()

      // Save to localStorage
      const application = {
        ...data,
        trackingNumber: newTrackingNumber,
        status: "Pending",
        submittedAt: new Date().toISOString(),
      }

      // Get existing applications
      const existingApplications = localStorage.getItem("dogLicenseApplications")
      const applications = existingApplications ? JSON.parse(existingApplications) : []

      // Add new application
      applications.push(application)
      localStorage.setItem("dogLicenseApplications", JSON.stringify(applications))

      setTrackingNumber(newTrackingNumber)
      setIsSubmitted(true)
      toast.success("Application submitted successfully!")
    } catch (error) {
      console.error("[v0] Error saving application:", error)
      toast.error("Failed to submit application. Please try again.")
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                Application Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Your dog license application has been received
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Tracking Number</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{trackingNumber}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Please save this number to track your application status
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">What happens next?</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Your application will be reviewed within 3-5 business days</li>
                  <li>You will receive an email confirmation shortly</li>
                  <li>Use your tracking number to check application status</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setIsSubmitted(false)
                    setCurrentStep(0)
                    form.reset()
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Submit Another Application
                </Button>
                <Button onClick={() => (window.location.href = "/track-application")} className="flex-1">
                  Track Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dog License Application</h1>
          <p className="text-gray-600 dark:text-gray-300">Complete the form below to apply for a dog license</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      index <= currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
                    )}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={cn(
                      "text-sm mt-2 text-center",
                      index <= currentStep
                        ? "text-gray-900 dark:text-white font-medium"
                        : "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-1 flex-1 mx-4 rounded transition-colors",
                      index < currentStep ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">{STEPS[currentStep].title}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {STEPS[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ownerFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ownerLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="ownerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ownerCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ownerZipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="ownerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dogName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dog Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Buddy" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dogBreed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breed</FormLabel>
                            <FormControl>
                              <Input placeholder="Golden Retriever" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dogAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age (years)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="3" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dogColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color/Markings</FormLabel>
                            <FormControl>
                              <Input placeholder="Golden" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dogGender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="spayedNeutered"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spayed/Neutered</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < STEPS.length - 1 ? (
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit">Submit Application</Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
