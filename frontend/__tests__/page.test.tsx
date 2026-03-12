import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../app/page'

describe('Home Page', () => {
  it('renders the Synapse logo', () => {
    render(<Home />)
    expect(screen.getByText('Synapse')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Home />)
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Use Cases')).toBeInTheDocument()
  })

  it('renders hero heading', () => {
    render(<Home />)
    expect(screen.getByText(/where ideas/i)).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(<Home />)
    expect(screen.getByText(/save anything from anywhere/i)).toBeInTheDocument()
  })

  it('renders use case sections', () => {
    render(<Home />)
    expect(screen.getByText(/for creators/i)).toBeInTheDocument()
    expect(screen.getByText(/for researchers/i)).toBeInTheDocument()
    expect(screen.getByText(/for students/i)).toBeInTheDocument()
  })
})
