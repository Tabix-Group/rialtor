"use client";
import Navigation from '../components/Navigation';

export default function LayoutWithNav({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
