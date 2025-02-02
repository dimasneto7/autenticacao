'use client'

import { logout } from '@/actions/logout'
import { useCurrentUser } from '@/hooks/use-current-user'

const SettingsPage = () => {
  const user = useCurrentUser()

  const onClick = () => {
    logout()
  }

  return (
    <div className="bg-white px-7 py-3 rounded-md">
      <button type="submit" onClick={onClick}>
        Sair
      </button>
    </div>
  )
}

export default SettingsPage
