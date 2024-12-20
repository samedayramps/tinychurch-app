import { useState, useCallback } from 'react'
import { z } from 'zod'
import { useAlerts } from '@/contexts/ui-context'
import { Logger } from '@/lib/logging'
import { LogCategory } from '@/lib/logging-types'

interface UseFormOptions<T> {
  schema: z.ZodType<T>
  onSubmit: (data: T) => Promise<void> | void
  initialValues?: Partial<T>
}

export function useForm<T extends Record<string, any>>({
  schema,
  onSubmit,
  initialValues = {},
}: UseFormOptions<T>) {
  const [values, setValues] = useState<Partial<T>>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addAlert } = useAlerts()

  const handleChange = useCallback((
    field: keyof T,
    value: any
  ) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // Clear error when field is modified
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }, [])

  const validate = useCallback(async () => {
    try {
      await schema.parseAsync(values)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof T] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }, [values, schema])

  const handleSubmit = useCallback(async (
    e?: React.FormEvent
  ) => {
    if (e) {
      e.preventDefault()
    }

    setIsSubmitting(true)
    
    try {
      const isValid = await validate()
      if (!isValid) {
        addAlert({
          type: 'error',
          message: 'Please fix the form errors',
        })
        return
      }

      await onSubmit(values as T)
      
      // Log successful form submission
      Logger.info('Form submitted successfully', LogCategory.UI, {
        formData: process.env.NODE_ENV === 'development' ? values : undefined,
      })
      
    } catch (error) {
      Logger.error('Form submission error', LogCategory.UI, { error })
      addAlert({
        type: 'error',
        message: 'Failed to submit form',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit, addAlert])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
  }
} 