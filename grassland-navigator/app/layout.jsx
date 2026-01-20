// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Grassland Resilience Navigator",
  description: "NASA Hackathon MVP for visualizing grassland drought risk",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
