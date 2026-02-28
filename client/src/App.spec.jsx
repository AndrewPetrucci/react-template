import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

describe('React app', () => {
  it('loads and renders (React is loaded)', async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    const heading = await screen.findByRole('heading', { name: 'React Redux PostgreSQL' })
    expect(heading).toBeInTheDocument()
  })
})
