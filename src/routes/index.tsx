import {
  createBrowserRouter,
} from 'react-router-dom'

import { ProtectedRoute } from '../components/ProtectedRoute'
import { HomePage } from '../pages/home'
import { LoginPage } from '../pages/login'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
])
