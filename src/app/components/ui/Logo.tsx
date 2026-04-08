import React from 'react'

type LogoProps = {
  className?: string
  imgClassName?: string
  size?: number | string
  withBackground?: boolean
  alt?: string
}

export default function Logo({
  className = '',
  imgClassName = '',
  size = 64,
  withBackground = false,
  alt = 'BIUST Logo',
}: LogoProps) {
  const dimension = typeof size === 'number' ? `${size}px` : size

  if (withBackground) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl overflow-hidden bg-white shadow-lg shadow-primary/20 ${className}`}
        style={{ width: dimension, height: dimension }}
      >
        <img
          src="/BIUST-logo (1).svg"
          alt={alt}
          className={`w-full h-full object-contain p-1 ${imgClassName}`}
        />
      </div>
    )
  }

  return (
    <img
      src="/BIUST-logo (1).svg"
      alt={alt}
      className={`object-contain ${className} ${imgClassName}`}
      style={{ width: dimension, height: dimension }}
    />
  )
}