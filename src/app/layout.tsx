import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "NutriPet AI",
  description: "Assistente virtual de vendas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}