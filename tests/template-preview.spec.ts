import { test, expect } from '@playwright/test'

// Smoke test for /try?t=<template>, the public no-auth template preview
// page (see src/app/try/page.tsx + TemplateCanvas.tsx). This is the page
// used earlier to catch the classic2 "black on live, updated locally"
// mismatch — these tests exist to catch that class of bug automatically
// instead of by eyeballing a screenshot.
//
// Add a new line here whenever a new template (t1, t2, t3...) is added,
// so every template gets a baseline "does it even render" check.

const TEMPLATES = [
  { param: 't1', name: 'Classic (The Consultant)' },
  { param: 't2', name: 'The Night Clinic' },
]

test.describe('Template preview page (/try)', () => {
  for (const { param, name } of TEMPLATES) {
    test(`${name} (${param}) renders without error`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      const response = await page.goto(`/try?t=${param}`)
      expect(response?.status()).toBeLessThan(400)

      // "Edit details" is part of the shared preview chrome rendered for
      // every template, regardless of theme — a reliable sign the page
      // mounted correctly rather than showing an error boundary.
      await expect(page.getByText('Edit details')).toBeVisible()

      // Fail loudly on uncaught client errors (e.g. the kind of hydration
      // mismatch we hit manually earlier) rather than letting them pass
      // silently just because the page technically responded 200.
      expect(errors, `Uncaught client errors on ${param}: ${errors.join(', ')}`).toEqual([])
    })
  }
})
