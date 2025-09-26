"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Progress } from "../../components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import {
  sanitizeUSPhone,
  formatUSPhone,
  coerceDate,
  toISODateStringLocal,
  isNotFuture,
  isWithinYears,
} from "../../lib/utils"

// Zod schema with proper validation using lib/utils helpers
const dogLicenseSchema = z.object({
  ownerName: z
    .string()
    .min(2, "Owner name must be at least 2 characters")
    .max(100, "Owner name must be less than 100 characters"),

  ownerAddress: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be less than 200 characters"),

  ownerPhone: z.string().refine((val) => {
    const result = sanitizeUSPhone(val)
    return result.ok
  }, "Enter a valid US phone number (10 digits; area code cannot start with 0 or 1)"),

  dogName: z.string().min(1, "Dog name is required").max(50, "Dog name must be less than 50 characters"),

  dogBreed: z
    .string()
    .min(2, "Dog breed must be at least 2 characters")
    .max(50, "Dog breed must be less than 50 characters"),

  dogAge: z.string().refine((val) => {
    const num = Number(val)
    return !isNaN(num) && num > 0 && num <= 30
  }, "Dog age must be a positive number between 1 and 30"),

  vaccinationDate: z
    .string()
    .refine((val) => {
      const date = coerceDate(val)
      return date !== null
    }, "Please enter a valid date")
    .refine((val) => {
      const date = coerceDate(val)
      return date && isNotFuture(date)
    }, "Vaccination date cannot be in the future")
    .refine((val) => {
      const date = coerceDate(val)
      return date && isWithinYears(date, 3)
    }, "Vaccination must be within the last 3 years"),
})

type DogLicenseForm = z.infer<typeof dogLicenseSchema>

const STEPS = [
  { id: 1, title: "Owner Information", description: "Tell us about yourself" },
  { id: 2, title: "Dog Information", description: "Tell us about your dog" },
  { id: 3, title: "Vaccination Info", description: "Vaccination details" },
  { id: 4, title: "Review & Submit", description: "Review your application" },
]

export default function NewApplication() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isClient, setIsClient] = useState(false)

  const form = useForm<DogLicenseForm>({
    resolver: zodResolver(dogLicenseSchema),
    defaultValues: {
      ownerName: "",
      ownerAddress: "",
      ownerPhone: "",
      dogName: "",
      dogBreed: "",
      dogAge: "",
      vaccinationDate: "",
    },
    mode: "onChange",
  })

  // Handle client-side mounting to avoid localStorage SSR issues
  useEffect(() => {
    setIsClient(true)

    // Load saved data from localStorage if available
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("dogLicenseApplication")
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          form.reset(parsedData)
          toast.info("Restored your previous application data")
        } catch (error) {
          console.error("Error loading saved data:", error)
        }
      }
    }
  }, [form])

  // Save form data to localStorage whenever form values change
  useEffect(() => {
    if (!isClient) return

    const subscription = form.watch((data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("dogLicenseApplication", JSON.stringify(data))
      }
    })

    return () => subscription.unsubscribe()
  }, [form, isClient])

  const generateApplicationId = (): string => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `DOG-${timestamp}-${random}`.toUpperCase()
  }

  const onSubmit = (data: DogLicenseForm) => {
    if (!isClient) return

    try {
      const applicationId = generateApplicationId()
      const applicationData = {
        ...data,
        applicationId,
        submittedAt: new Date().toISOString(),
        status: "submitted",
      }

      // Save to localStorage for tracking
      if (typeof window !== "undefined") {
        const existingApplications = JSON.parse(localStorage.getItem("dogLicenseApplications") || "[]")
        existingApplications.push(applicationData)
        localStorage.setItem("dogLicenseApplications", JSON.stringify(existingApplications))

        // Clear the draft
        localStorage.removeItem("dogLicenseApplication")
      }

      toast.success(`Application submitted successfully! Your application ID is: ${applicationId}`)

      // Reset form and go back to step 1
      form.reset()
      setCurrentStep(1)
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("Failed to submit application. Please try again.")
    }
  }

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fieldsToValidate)

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    } else {
      toast.error("Please fix the errors before continuing")
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const getFieldsForStep = (step: number): (keyof DogLicenseForm)[] => {
    switch (step) {
      case 1:
        return ["ownerName", "ownerAddress", "ownerPhone"]
      case 2:
        return ["dogName", "dogBreed", "dogAge"]
      case 3:
        return ["vaccinationDate"]
      default:
        return []
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Loading Application Form...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Dog License Application</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${step.id <= currentStep ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? "bg-blue-600 text-white"
                      : step.id === currentStep
                        ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Owner Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormDescription>Enter your full legal name as it appears on your ID</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ownerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Residential Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full address" {...field} />
                          </FormControl>
                          <FormDescription>Include street address, city, state, and ZIP code</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ownerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(555) 123-4567"
                              {...field}
                              onChange={(e) => {
                                const result = sanitizeUSPhone(e.target.value)
                                if (result.ok) {
                                  field.onChange(formatUSPhone(result.digits))
                                } else {
                                  field.onChange(e.target.value)
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>Enter a valid US phone number</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Dog Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="dogName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dog's Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your dog's name" {...field} />
                          </FormControl>
                          <FormDescription>What do you call your dog?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dogBreed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dog's Breed *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Golden Retriever, Mixed Breed" {...field} />
                          </FormControl>
                          <FormDescription>Enter the breed or "Mixed Breed" if unsure</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dogAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dog's Age (years) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter age in years" min="1" max="30" {...field} />
                          </FormControl>
                          <FormDescription>How old is your dog in years?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Vaccination Information */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="vaccinationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Rabies Vaccination Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} max={toISODateStringLocal(new Date())} />
                          </FormControl>
                          <FormDescription>
                            When was your dog last vaccinated for rabies? Must be within the last 3 years.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Review Your Application
                    </h3>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Owner Name:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{form.getValues("ownerName")}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Address:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{form.getValues("ownerAddress")}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{form.getValues("ownerPhone")}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Dog Name:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{form.getValues("dogName")}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Dog Breed:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{form.getValues("dogBreed")}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Dog Age:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{form.getValues("dogAge")} years</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Vaccination Date:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{form.getValues("vaccinationDate")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button type="button" onClick={nextStep} className="flex items-center">
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" className="flex items-center bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4 mr-2" />
                      Submit Application
                    </Button>
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
