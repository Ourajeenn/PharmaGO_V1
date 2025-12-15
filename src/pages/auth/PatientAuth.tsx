import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function PatientAuth() {
  const navigate = useNavigate()
  const { signUp, signIn } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  // Sign Up
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')

  // Sign In
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Inscription en cours...')

    try {
      const { error } = await signUp(email, password, {
        name,
        email,
        phone,
        role: 'patient'
      })

      if (error) throw error

      setMessage('✅ Inscription réussie ! Vérifiez votre email.')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (error: any) {
      setMessage('❌ Erreur: ' + error.message)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Connexion en cours...')

    try {
      const { error } = await signIn(loginEmail, loginPassword)
      if (error) throw error

      setMessage('✅ Connexion réussie !')
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (error: any) {
      setMessage('❌ Erreur: ' + error.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(to bottom right, #EFF6FF, #F0FDF4)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '32px',
        position: 'relative',
        zIndex: 100
      }}>
        <button
          onClick={() => window.history.back()}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          ← Retour
        </button>

        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '8px',
          color: '#1E40AF'
        }}>
          {isSignUp ? 'Inscription Patient' : 'Connexion Patient'}
        </h1>

        <p style={{
          textAlign: 'center',
          color: '#6B7280',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          {isSignUp ? 'Créez votre compte PharmaGo' : 'Accédez à votre espace'}
        </p>

        {message && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '6px',
            background: message.includes('✅') ? '#D1FAE5' : '#FEE2E2',
            color: message.includes('✅') ? '#065F46' : '#991B1B',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        {isSignUp ? (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Nom complet *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom complet"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Téléphone *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+225 XX XX XX XX"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Mot de passe *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#1E40AF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              S'inscrire
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '8px' }}>
              <span style={{ color: '#6B7280' }}>Déjà un compte ? </span>
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1E40AF',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '14px'
                }}
              >
                Se connecter
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#1E40AF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Se connecter
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '8px' }}>
              <span style={{ color: '#6B7280' }}>Pas de compte ? </span>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1E40AF',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '14px'
                }}
              >
                S'inscrire
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}