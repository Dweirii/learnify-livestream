
import { Container } from '@/components/container';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Suspense } from 'react';


export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex h-full pt-20">
        <Container>
          <Sidebar/>
          {children}
        </Container>
      </div>
    </>
  );
}