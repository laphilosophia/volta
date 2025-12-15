// ============================================================================
// Input Component
// ============================================================================

import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import React, { forwardRef, useId } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formSizeClasses,
  formSizeToIconSize,
  formVariantClasses,
  iconSizeClasses,
  type FormSize,
  type FormVariant,
} from '../../../utils'

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  type?: InputType
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  size?: FormSize
  variant?: FormVariant
  fullWidth?: boolean
  dataSource?: {
    query: Record<string, unknown>
    schema: Record<string, unknown>
  }
  componentId?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      variant = 'default',
      fullWidth = true,
      className = '',
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation('components')
    const id = useId()
    const [showPassword, setShowPassword] = React.useState(false)

    const inputId = props.id || id
    const hasError = !!error
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    const iconSize = iconSizeClasses[formSizeToIconSize[size]]

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1.5 text-sm font-medium text-(--color-text-primary)"
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <span
              className={`
                absolute left-3 top-1/2 -translate-y-1/2
                text-(--color-text-muted)
                ${iconSize}
              `}
            >
              {leftIcon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={`
              w-full rounded-xs
              text-(--color-text-primary)
              placeholder-(--color-text-muted)
              transition-all duration-200
              outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${formSizeClasses[size]}
              ${formVariantClasses[variant]}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || isPassword ? 'pr-10' : ''}
              ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20' : ''}
            `}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {(rightIcon || isPassword) && (
            <span
              className={`
                absolute right-3 top-1/2 -translate-y-1/2
                text-(--color-text-muted)
                ${iconSize}
              `}
            >
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-0.5 hover:text-(--color-text-secondary) transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className={iconSize} /> : <Eye className={iconSize} />}
                </button>
              ) : (
                rightIcon
              )}
            </span>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 flex items-center gap-1 text-sm text-red-500"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" />
            {error || t('input.required')}
          </p>
        )}

        {/* Hint */}
        {hint && !hasError && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-(--color-text-muted)">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
