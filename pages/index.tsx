import { useAuth } from '@frontegg/nextjs';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Knowledge Base App</h1>
      <p>Upload documents and ask questions with AI</p>
      <a href="/account/login">
        <button style={{ padding: '10px 20px', fontSize: '16px' }}>
          Get Started
        </button>
      </a>
    </div>
  );
}