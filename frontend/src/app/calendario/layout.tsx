import LayoutWithNav from '../LayoutWithNav';

export default function CalendarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutWithNav>{children}</LayoutWithNav>;
}