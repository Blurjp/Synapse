import { render, screen } from '@testing-library/react'

const Card = ({ 
  title, 
  description, 
  icon,
  className = ''
}: {
  title: string
  description: string
  icon?: React.ReactNode
  className?: string
}) => {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}

describe('Card Component', () => {
  it('renders title and description', () => {
    render(<Card title="Test Card" description="Test description" />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(
      <Card 
        title="Card with Icon" 
        description="Description"
        icon={<span data-testid="card-icon">Icon</span>}
      />
    )
    expect(screen.getByTestId('card-icon')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Card title="Test" description="Test" className="custom-card" />
    )
    expect(container.firstChild).toHaveClass('custom-card')
  })
})
