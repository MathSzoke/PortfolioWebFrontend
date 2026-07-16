import './config/i18n.js';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './Root.tsx';
import FullPageLoader from './components/Loaders/FullPageLoader.jsx';
import { ThemeProvider } from './config/Theme/ThemeProvider.js';
import LanguageLayout from './config/Language/LanguageLayout';
import Home from './pages/Home';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './services/auth';
import AuthLinkedinCallback from "./pages/AuthLinkedinCallback";
import { ChatProvider } from './services/context/ChatContext';

const router = createBrowserRouter([
    { path: '/', element: <Root /> },
    {
        path: '/:lang',
        element: <LanguageLayout />,
        children: [{ index: true, element: <Home /> }],
    },
    {
        path: '/auth/callback/linkedin',
        element: <AuthLinkedinCallback />
    }
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={(import.meta.env as any).VITE_GOOGLE_CLIENT_ID as string}>
            <AuthProvider>
                <ThemeProvider>
                    <ChatProvider>
                        <Suspense fallback={<FullPageLoader />}>
                            <RouterProvider router={router} />
                        </Suspense>
                    </ChatProvider>
                </ThemeProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    </StrictMode>,
);
