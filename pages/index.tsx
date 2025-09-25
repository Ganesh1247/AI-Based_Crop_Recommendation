import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with Suspense/lazy and window usage in components
const RootApp = dynamic(() => import('../App'), { ssr: false });

export default function HomePage() {
  return <RootApp />;
}


