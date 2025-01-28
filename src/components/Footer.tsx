import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4">
      <div className="container mx-auto text-center">
        <p>© 2025 MyApp. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <Link href="/privacy-policy" className="px-3 py-2 rounded hover:bg-gray-700">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="px-3 py-2 rounded hover:bg-gray-700">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
