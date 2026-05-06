"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { User } from "./types"
import { fetchAuthMe } from "./api"
import { getCognitoLoginUrl } from "./cognito"

interface AuthContextType {
  user: User | null
  /** True while checking stored token on load */
  isLoading: boolean
  login: () => void
  logout: () => void
  isAuthenticated: boolean
  cognitoConfigured: boolean
  /** User is in the Cognito `admin` group (takes precedence over `customer` for role checks). */
  isAdmin: boolean
  /** User is in the Cognito `customer` group. */
  isCustomer: boolean
  /**
   * Can call customer-protected APIs (`require_customer`). Admins are always allowed
   * by the API even without the customer group.
   */
  canUseCustomerFeatures: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function clearStoredTokens() {
  if (typeof window === "undefined") return
  localStorage.removeItem("access_token")
  localStorage.removeItem("id_token")
  localStorage.removeItem("refresh_token")
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cognitoConfigured, setCognitoConfigured] = useState(false)

  useEffect(() => {
    setCognitoConfigured(Boolean(getCognitoLoginUrl()))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (typeof window === "undefined") {
        return
      }
      if (!localStorage.getItem("access_token")) {
        if (!cancelled) {
          setUser(null)
          setIsLoading(false)
        }
        return
      }

      const me = await fetchAuthMe()
      if (cancelled) {
        return
      }

      if (me) {
        setUser(me)
      } else {
        clearStoredTokens()
        setUser(null)
      }
      setIsLoading(false)
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(() => {
    const url = getCognitoLoginUrl()
    if (url) {
      window.location.href = url
    }
  }, [])

  const logout = useCallback(() => {
    clearStoredTokens()
    setUser(null)
  }, [])

  const groups = user?.groups ?? []
  const isAdmin = groups.includes("admin")
  const isCustomer = groups.includes("customer")
  const canUseCustomerFeatures = isAdmin || isCustomer

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        cognitoConfigured,
        isAdmin,
        isCustomer,
        canUseCustomerFeatures,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
