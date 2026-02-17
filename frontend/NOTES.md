# Fix Notes

## `scheduler` module resolution error

On 2026-02-17, we encountered:
`Module not found: Can't resolve 'scheduler'`

Fixed by:
`pnpm add scheduler`

## `@floating-ui` module resolution error

On 2026-02-17, we encountered:
`Module not found: Can't resolve '@floating-ui/dom'`

Fixed by explicitly installing both dom and react-dom packages:
`pnpm add @floating-ui/dom @floating-ui/react-dom`

Verified with `pnpm build`.
