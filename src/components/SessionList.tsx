import React, { useState } from 'react'
import { Clock, Phone, User, DollarSign, TrendingUp, ShoppingCart, Coffee, Droplets, Cookie, X, CheckCircle } from 'lucide-react'
import type { SessionWithDetails } from '../types'

interface Product {
  id: string
  name: string
  price: number
  icon: React.ReactNode
  category: 'drinks' | 'snacks' | 'extras'
}

interface SessionProduct {
  product: Product
  quantity: number
}

interface SessionWithProducts extends SessionWithDetails {
  products?: SessionProduct[]
}

interface SessionListProps {
  sessions: SessionWithDetails[]
  onRefresh: () => void
  loading?: boolean
}

interface POSModalProps {
  session: SessionWithProducts | null
  isOpen: boolean
  onClose: () => void
  onUpdateProducts: (sessionId: string, products: SessionProduct[]) => void
}

const AVAILABLE_PRODUCTS: Product[] = [
  {
    id: 'water',
    name: 'Water',
    price: 2,
    icon: <Droplets size={20} />,
    category: 'drinks'
  },
  {
    id: 'juice',
    name: 'Fresh Juice',
    price: 3,
    icon: <Coffee size={20} />,
    category: 'drinks'
  },
  {
    id: 'soda',
    name: 'Soda',
    price: 2.5,
    icon: <Coffee size={20} />,
    category: 'drinks'
  },
  {
    id: 'cookies',
    name: 'Cookies',
    price: 4,
    icon: <Cookie size={20} />,
    category: 'snacks'
  },
  {
    id: 'chips',
    name: 'Chips',
    price: 3.5,
    icon: <Cookie size={20} />,
    category: 'snacks'
  },
  {
    id: 'sandwich',
    name: 'Sandwich',
    price: 6,
    icon: <Cookie size={20} />,
    category: 'snacks'
  },
  {
    id: 'combo',
    name: 'Snack Combo',
    price: 8,
    icon: <ShoppingCart size={20} />,
    category: 'extras'
  },
  {
    id: 'birthday',
    name: 'Birthday Package',
    price: 15,
    icon: <ShoppingCart size={20} />,
    category: 'extras'
  }
]

const SessionList: React.FC<SessionListProps> = ({ sessions }) => {
  const [selectedSession, setSelectedSession] = useState<SessionWithProducts | null>(null)
  const [isPOSOpen, setIsPOSOpen] = useState(false)
  const [sessionProducts, setSessionProducts] = useState<Record<string, SessionProduct[]>>({
    // Mock data - some sessions already have products
    'session-1': [
      { product: AVAILABLE_PRODUCTS[0], quantity: 2 }, // Water x2
      { product: AVAILABLE_PRODUCTS[3], quantity: 1 }  // Cookies x1
    ],
    'session-3': [
      { product: AVAILABLE_PRODUCTS[1], quantity: 1 }, // Juice x1
      { product: AVAILABLE_PRODUCTS[6], quantity: 1 }  // Combo x1
    ]
  })

  // Convert sessions to include products
  const sessionsWithProducts: SessionWithProducts[] = sessions.map(session => ({
    ...session,
    products: sessionProducts[session.id] || []
  }))

  const insideSessions = sessionsWithProducts.filter(s => s.status === 'inside')
  const outsideSessions = sessionsWithProducts.filter(s => s.status === 'outside')

  // Calculate statistics including products
  const totalRevenue = sessionsWithProducts.reduce((sum, session) => {
    const sessionRevenue = (session.tariff_plan.price || 0)
    const productsRevenue = (session.products || []).reduce((pSum, sp) => 
      pSum + (sp.product.price * sp.quantity), 0)
    return sum + sessionRevenue + productsRevenue
  }, 0)

  const averageSessionTime = sessions.length > 0 
    ? sessions.reduce((sum, session) => {
        const duration = new Date().getTime() - new Date(session.start_time).getTime()
        return sum + duration
      }, 0) / sessions.length / (1000 * 60) // in minutes
    : 0

  const handleSessionClick = (session: SessionWithProducts) => {
    setSelectedSession(session)
    setIsPOSOpen(true)
  }

  const handleClosePOS = () => {
    setIsPOSOpen(false)
    setSelectedSession(null)
  }

  const handleUpdateProducts = (sessionId: string, products: SessionProduct[]) => {
    setSessionProducts(prev => ({
      ...prev,
      [sessionId]: products
    }))
  }

  return (
    <div className="session-list">
      {/* Summary panel */}
      <div className="summary-panel">
        <div className="summary-cards">
          <div className="summary-card revenue">
            <div className="summary-icon">
              <DollarSign size={18} />
            </div>
            <div className="summary-info">
              <div className="summary-value">${totalRevenue.toFixed(2)}</div>
              <div className="summary-label">Today's Revenue</div>
            </div>
          </div>
          
          <div className="summary-card visitors">
            <div className="summary-icon">
              <User size={18} />
            </div>
            <div className="summary-info">
              <div className="summary-value">{sessions.length}</div>
              <div className="summary-label">Total Visitors</div>
            </div>
          </div>
          
          <div className="summary-card active">
            <div className="summary-icon">
              <TrendingUp size={18} />
            </div>
            <div className="summary-info">
              <div className="summary-value">{insideSessions.length}</div>
              <div className="summary-label">Currently Inside</div>
            </div>
          </div>
          
          <div className="summary-card time">
            <div className="summary-icon">
              <Clock size={18} />
            </div>
            <div className="summary-info">
              <div className="summary-value">{Math.round(averageSessionTime)}m</div>
              <div className="summary-label">Avg. Session</div>
            </div>
          </div>
        </div>
      </div>

      {/* Inside visitors section */}
      {insideSessions.length > 0 && (
        <div className="session-section">
          <div className="section-header">
            <h3>👶 Currently Inside ({insideSessions.length})</h3>
          </div>
          <div className="sessions-grid">
            {insideSessions.map((session) => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onClick={() => handleSessionClick(session)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Outside visitors section */}
      {outsideSessions.length > 0 && (
        <div className="session-section">
          <div className="section-header">
            <h3>🚪 Recently Left ({outsideSessions.length})</h3>
          </div>
          <div className="sessions-grid">
            {outsideSessions.map((session) => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onClick={() => handleSessionClick(session)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <User size={48} />
          </div>
          <p>No active sessions</p>
          <span>Visitors will appear here when they check in</span>
        </div>
      )}

      {/* POS Modal */}
      <POSModal
        session={selectedSession}
        isOpen={isPOSOpen}
        onClose={handleClosePOS}
        onUpdateProducts={handleUpdateProducts}
      />
    </div>
  )
}

const SessionCard: React.FC<{ 
  session: SessionWithProducts
  onClick: () => void
}> = ({ session, onClick }) => {
  const formatDuration = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `tel:${session.parent.phone}`
  }

  const getDurationColor = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60)
    
    if (diffHours > 4) return 'duration-long'
    if (diffHours > 2) return 'duration-medium'
    return 'duration-short'
  }

  const productsTotal = (session.products || []).reduce((sum, sp) => 
    sum + (sp.product.price * sp.quantity), 0)
  const hasProducts = (session.products || []).length > 0

  return (
    <div 
      className={`session-card status-${session.status} ${hasProducts ? 'has-products' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="card-header">
        <div className="child-info">
          <div className="child-avatar">
            <User size={24} />
          </div>
          <div className="child-details">
            <div className="child-name">{session.child.name || 'Child'}</div>
            <div className="bracelet-code">Bracelet: {session.bracelet.bracelet_code}</div>
          </div>
        </div>
        <div className="card-actions">
          <div className={`status-indicator ${session.status}`}></div>
          {hasProducts && (
            <div className="products-indicator">
              <ShoppingCart size={14} />
              <span>{session.products?.length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="time-section">
          <div className="time-item">
            <span>Started:</span>
            <span>{formatTime(session.start_time)}</span>
          </div>
          <div className="time-item">
            <span>Duration:</span>
            <span className={`duration-badge ${getDurationColor(session.start_time)}`}>
              {formatDuration(session.start_time)}
            </span>
          </div>
        </div>

        <div className="parent-section">
          <span className="parent-name">{session.parent.name}</span>
          <button 
            className="call-button"
            onClick={handleCall}
            title={`Call ${session.parent.name}`}
          >
            <Phone size={14} />
            <span>Call</span>
          </button>
        </div>

        <div className="tariff-section">
          <div className="tariff-info">
            <div className="tariff-name">{session.tariff_plan.name}</div>
            <div className="tariff-duration">{Math.floor((session.tariff_plan.duration_minutes || 120) / 60)}h</div>
          </div>
          <div className="tariff-price">
            ${session.tariff_plan.price}
            {hasProducts && (
              <div className="products-total">+${productsTotal.toFixed(2)}</div>
            )}
          </div>
        </div>

        {hasProducts && (
          <div className="products-preview">
            <div className="products-list">
              {session.products?.slice(0, 3).map((sp, index) => (
                <div key={index} className="product-item">
                  <span className="product-icon">{sp.product.icon}</span>
                  <span className="product-name">{sp.product.name}</span>
                  <span className="product-quantity">x{sp.quantity}</span>
                </div>
              ))}
              {(session.products?.length || 0) > 3 && (
                <div className="more-products">+{(session.products?.length || 0) - 3} more</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="session-status">
          <div className={`status-text ${session.status}`}>
            {session.status === 'inside' ? 'Inside' : 'Outside'}
          </div>
        </div>
        <div className="pos-hint">
          <ShoppingCart size={14} />
          <span>Click for POS</span>
        </div>
      </div>
    </div>
  )
}

const POSModal: React.FC<POSModalProps> = ({ 
  session, 
  isOpen, 
  onClose, 
  onUpdateProducts 
}) => {
  const [currentProducts, setCurrentProducts] = useState<SessionProduct[]>([])

  React.useEffect(() => {
    if (session) {
      setCurrentProducts(session.products || [])
    }
  }, [session])

  if (!isOpen || !session) return null

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return { hours: diffHours, minutes: diffMinutes }
  }

  const duration = formatDuration(session.start_time)
  const sessionTotal = session.tariff_plan.price || 0
  const productsTotal = currentProducts.reduce((sum, sp) => sum + (sp.product.price * sp.quantity), 0)
  const grandTotal = sessionTotal + productsTotal

  const addProduct = (product: Product) => {
    setCurrentProducts(prev => {
      const existing = prev.find(sp => sp.product.id === product.id)
      if (existing) {
        return prev.map(sp => 
          sp.product.id === product.id 
            ? { ...sp, quantity: sp.quantity + 1 }
            : sp
        )
      } else {
        return [...prev, { product, quantity: 1 }]
      }
    })
  }

  const removeProduct = (productId: string) => {
    setCurrentProducts(prev => {
      const existing = prev.find(sp => sp.product.id === productId)
      if (existing && existing.quantity > 1) {
        return prev.map(sp => 
          sp.product.id === productId 
            ? { ...sp, quantity: sp.quantity - 1 }
            : sp
        )
      } else {
        return prev.filter(sp => sp.product.id !== productId)
      }
    })
  }

  const deleteProduct = (productId: string) => {
    setCurrentProducts(prev => prev.filter(sp => sp.product.id !== productId))
  }

  const handleSave = () => {
    onUpdateProducts(session.id, currentProducts)
    onClose()
  }

  const productsByCategory = AVAILABLE_PRODUCTS.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = []
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <ShoppingCart size={24} />
            <div>
              <h3>POS - {session.child.name || 'Child'}</h3>
              <span className="modal-subtitle">Add products to order</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} title="Close POS">
            <X size={24} />
          </button>
        </div>

        <div className="pos-content">
          {/* Session Info */}
          <div className="session-info">
            <div className="session-details">
              <div className="detail">
                <span>Bracelet:</span>
                <span>{session.bracelet.bracelet_code}</span>
              </div>
              <div className="detail">
                <span>Duration:</span>
                <span>{duration.hours > 0 ? `${duration.hours}h ` : ''}{duration.minutes}m</span>
              </div>
              <div className="detail">
                <span>Parent:</span>
                <span>{session.parent.name}</span>
              </div>
            </div>
            <div className="session-totals">
              <div className="total-line">
                <span>Session:</span>
                <span>${sessionTotal.toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Products:</span>
                <span>${productsTotal.toFixed(2)}</span>
              </div>
              <div className="total-line grand-total">
                <span>Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pos-main">
            {/* Products Menu */}
            <div className="products-menu">
              <h4>Available Products</h4>
              
              {Object.entries(productsByCategory).map(([category, products]) => (
                <div key={category} className="product-category">
                  <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                  <div className="products-grid">
                    {products.map(product => (
                      <button
                        key={product.id}
                        className="product-btn"
                        onClick={() => addProduct(product)}
                      >
                        <div className="product-icon">{product.icon}</div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-price">${product.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Order */}
            <div className="current-order">
              <h4>Current Order</h4>
              
              {currentProducts.length === 0 ? (
                <div className="empty-order">
                  <ShoppingCart size={32} />
                  <p>No products added</p>
                  <span>Select products from the menu</span>
                </div>
              ) : (
                <div className="order-items">
                  {currentProducts.map((sp, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-icon">{sp.product.icon}</span>
                        <div className="item-details">
                          <div className="item-name">{sp.product.name}</div>
                          <div className="item-price">${sp.product.price} each</div>
                        </div>
                      </div>
                      
                      <div className="item-controls">
                        <button 
                          className="qty-btn decrease"
                          onClick={() => removeProduct(sp.product.id)}
                          title="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="quantity">{sp.quantity}</span>
                        <button 
                          className="qty-btn increase"
                          onClick={() => addProduct(sp.product)}
                          title="Increase quantity"
                        >
                          +
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => deleteProduct(sp.product.id)}
                          title="Remove product"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="item-total">
                        ${(sp.product.price * sp.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="action-btn secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="action-btn primary"
            onClick={handleSave}
          >
            <CheckCircle size={16} />
            Save Order (${grandTotal.toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionList 