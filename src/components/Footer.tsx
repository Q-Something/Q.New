
import { Link } from "react-router-dom";
import { Book } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Book className="h-6 w-6 text-qlearn-purple" />
              <span className="font-bold text-xl">Q.Learn</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering students through shared knowledge, collaborative learning, and community-driven resources.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="font-medium">Tools</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/q-ai" className="text-sm text-muted-foreground hover:text-foreground">
                    Q.Ai
                  </Link>
                </li>
                <li>
                  <Link to="/q-material" className="text-sm text-muted-foreground hover:text-foreground">
                    Q.Material
                  </Link>
                </li>
                <li>
                  <Link to="/q-spark" className="text-sm text-muted-foreground hover:text-foreground">
                    Q.Spark
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Account</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/discover" className="text-sm text-muted-foreground hover:text-foreground">
                    Discover
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Q.Something. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Instagram</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Discord</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-discord"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 7.2c3.7-1 5.8-1 8.5 0"/><path d="M7.5 16.8c3.7 1 5.8 1 8.5 0"/><path d="M15.5 17 17 20l2-2 4 1-3-4"/><path d="M8.5 17 7 20l-2-2-4 1 3-4"/><path d="M12 22c-3.03 0-5.8-.88-7.5-2.25L4 18"/><path d="M12 22c3.03 0 5.8-.88 7.5-2.25l.5-1.75"/><path d="M12 2c3.03 0 5.8.88 7.5 2.25l.5 1.75"/><path d="M12 2C8.97 2 6.2 2.88 4.5 4.25L4 6"/><path d="m8 22 4-10 4 10"/></svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Twitter</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
