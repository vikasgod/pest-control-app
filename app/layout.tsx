import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata={title:'Pestora — Safe Home. Healthy Life.',description:'Modern pest control booking and CRM platform'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className="scroll-smooth"><body className="bg-[#fbfdfb] font-sans text-[#0b2630]">{children}</body></html>}
